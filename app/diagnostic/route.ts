import { NextResponse } from 'next/server';
import { diagnoseConnection, verifyDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
	const startTime = Date.now();

	// Ejecutar diagnósticos en paralelo
	const [connectionDiagnostic, dbVerification] = await Promise.all([
		diagnoseConnection(),
		verifyDatabase(),
	]);

	const duration = Date.now() - startTime;

	if (!connectionDiagnostic.ok || !dbVerification.ok) {
		return NextResponse.json(
			{
				status: 'error',
				connection: connectionDiagnostic,
				database: dbVerification,
				durationMs: duration,
				environment: process.env.NODE_ENV,
				timestamp: new Date().toISOString(),
				suggestions: [
					'Check database connection string',
					'Verify database server is running',
					'Check network connectivity',
					'Review database logs for errors',
				],
			},
			{ status: 500 },
		);
	}

	return NextResponse.json({
		status: 'healthy',
		connection: connectionDiagnostic,
		database: dbVerification,
		durationMs: duration,
		environment: process.env.NODE_ENV,
		timestamp: new Date().toISOString(),
	});
}
