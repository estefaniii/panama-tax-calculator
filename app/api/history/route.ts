import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Configuración de caché para APIs dinámicas
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Tipos TypeScript para mejor autocompletado
interface TaxCalculation {
	id: number;
	income: number;
	tax: number;
	calculation_date: string;
}

// GET - Obtener historial con paginación
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const limit = Number(searchParams.get('limit')) || 20;
	const offset = Number(searchParams.get('offset')) || 0;

	const client = await pool.connect();

	try {
		// Verificamos primero si la tabla existe
		const tableExists = await client.query(
			`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tax_calculations'
      )`,
		);

		if (!tableExists.rows[0].exists) {
			return NextResponse.json(
				{ error: 'La tabla de historial no existe' },
				{ status: 404 },
			);
		}

		// Obtenemos los datos con paginación
		const result = await client.query<TaxCalculation>(
			`SELECT id, income, tax, calculation_date 
       FROM tax_calculations 
       ORDER BY calculation_date DESC 
       LIMIT $1 OFFSET $2`,
			[limit, offset],
		);

		// Obtenemos el conteo total para paginación
		const countResult = await client.query(
			'SELECT COUNT(*) FROM tax_calculations',
		);

		return NextResponse.json({
			data: result.rows,
			total: Number(countResult.rows[0].count),
			limit,
			offset,
		});
	} catch (error) {
		console.error('Error fetching history:', error);
		return NextResponse.json(
			{
				error: 'Error al obtener el historial',
				details: String(error),
			},
			{ status: 500 },
		);
	} finally {
		client.release();
	}
}

// POST - Guardar nuevo cálculo con validación
export async function POST(request: Request) {
	let client;

	try {
		const { income, tax } = await request.json();

		// Validación de datos
		if (
			typeof income !== 'number' ||
			typeof tax !== 'number' ||
			income < 0 ||
			tax < 0
		) {
			return NextResponse.json(
				{ error: 'Datos de ingreso o impuesto inválidos' },
				{ status: 400 },
			);
		}

		client = await pool.connect();
		await client.query('BEGIN'); // Iniciamos transacción

		const result = await client.query<TaxCalculation>(
			`INSERT INTO tax_calculations (income, tax) 
       VALUES ($1, $2) 
       RETURNING id, income, tax, calculation_date`,
			[income, tax],
		);

		await client.query('COMMIT'); // Confirmamos transacción

		return NextResponse.json(result.rows[0], { status: 201 });
	} catch (error) {
		if (client) {
			await client.query('ROLLBACK'); // Revertimos en caso de error
		}
		console.error('Error saving calculation:', error);
		return NextResponse.json(
			{
				error: 'Error al guardar el cálculo',
				details: String(error),
			},
			{ status: 500 },
		);
	} finally {
		if (client) {
			client.release();
		}
	}
}

// DELETE - Limpiar historial con confirmación
export async function DELETE(request: Request) {
	const client = await pool.connect();

	try {
		// Verificamos si hay registros antes de borrar
		const countResult = await client.query(
			'SELECT COUNT(*) FROM tax_calculations',
		);
		const count = Number(countResult.rows[0].count);

		if (count === 0) {
			return NextResponse.json(
				{ message: 'El historial ya está vacío' },
				{ status: 200 },
			);
		}

		await client.query('BEGIN');
		await client.query('DELETE FROM tax_calculations');
		await client.query('COMMIT');

		return NextResponse.json({
			message: 'Historial eliminado',
			deletedCount: count,
		});
	} catch (error) {
		await client.query('ROLLBACK');
		console.error('Error clearing history:', error);
		return NextResponse.json(
			{
				error: 'Error al limpiar el historial',
				details: String(error),
			},
			{ status: 500 },
		);
	} finally {
		client.release();
	}
}
