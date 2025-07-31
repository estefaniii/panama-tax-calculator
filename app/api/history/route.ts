import { NextResponse } from 'next/server';
import { PoolClient, QueryResult } from 'pg'; // Importar tipos de pg
import pool from '@/lib/db';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 100;
const QUERY_TIMEOUT = 5000; // 5 segundos timeout

interface CustomQueryResult {
	rows: any[];
	rowCount: number;
	duration?: number;
}

async function executeQueryWithRetry(
	query: string,
	params?: any[],
	attempt = 0,
): Promise<CustomQueryResult> {
	if (attempt >= MAX_RETRIES) {
		throw new Error(
			`Max retries (${MAX_RETRIES}) exceeded for query: ${query}`,
		);
	}

	const startTime = Date.now();
	let client: PoolClient | undefined;

	try {
		// Intento de conexión con timeout
		const connectPromise = pool.connect();
		client = await Promise.race<PoolClient>([
			connectPromise,
			new Promise<never>((_, reject) =>
				setTimeout(
					() => reject(new Error('Connection timeout')),
					QUERY_TIMEOUT,
				),
			),
		]);

		// Ejecutar consulta con timeout
		const queryPromise = client.query(query, params);
		const result: QueryResult = await Promise.race<QueryResult>([
			queryPromise,
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT),
			),
		]);

		return {
			rows: result.rows,
			rowCount: result.rowCount || 0, // Asegurar que rowCount sea número
			duration: Date.now() - startTime,
		};
	} catch (error) {
		const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
		console.error(
			`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
			error,
		);

		await new Promise((resolve) => setTimeout(resolve, delay));
		return executeQueryWithRetry(query, params, attempt + 1);
	} finally {
		if (client) {
			try {
				client.release();
			} catch (releaseError) {
				console.error('Error releasing client:', releaseError);
			}
		}
	}
}

export async function GET() {
	try {
		const result = await executeQueryWithRetry(
			`SELECT id, income, tax, calculation_date 
       FROM tax_calculations 
       ORDER BY calculation_date DESC 
       LIMIT 20`,
		);

		return NextResponse.json({
			status: 'success',
			data: result.rows,
			meta: {
				count: result.rowCount,
				durationMs: result.duration,
			},
		});
	} catch (error) {
		console.error('GET /api/history error:', error);

		return NextResponse.json(
			{
				status: 'error',
				message: 'Failed to fetch history',
				error: error instanceof Error ? error.message : 'Unknown error',
				suggestion: 'Check database connection and try again later',
			},
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const { income, tax } = await request.json();

		// Validación robusta de entrada
		if (
			typeof income !== 'number' ||
			isNaN(income) ||
			typeof tax !== 'number' ||
			isNaN(tax)
		) {
			return NextResponse.json(
				{
					status: 'error',
					message: 'Invalid input data',
					details: 'Income and tax must be valid numbers',
				},
				{ status: 400 },
			);
		}

		const result = await executeQueryWithRetry(
			`INSERT INTO tax_calculations (income, tax) 
       VALUES ($1, $2)
       RETURNING id, income, tax, calculation_date`,
			[income, tax],
		);

		if (result.rowCount === 0) {
			throw new Error('No rows inserted');
		}

		return NextResponse.json(
			{
				status: 'success',
				data: result.rows[0],
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error('POST /api/history error:', error);

		return NextResponse.json(
			{
				status: 'error',
				message: 'Failed to save calculation',
				error: error instanceof Error ? error.message : 'Database error',
				suggestion: 'Verify your data and try again',
			},
			{ status: 500 },
		);
	}
}
