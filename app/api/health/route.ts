import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
	try {
		if (process.env.DATABASE_URL) {
			const client = await pool.connect();

			// Test with a simple query
			await client.query('SELECT 1');

			// Try to create table if it doesn't exist
			await client.query(`
        CREATE TABLE IF NOT EXISTS tax_calculations (
          id SERIAL PRIMARY KEY,
          income DECIMAL(12, 2) NOT NULL,
          tax DECIMAL(12, 2) NOT NULL,
          calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

			client.release();

			return NextResponse.json({
				status: 'connected',
				database: 'neon_postgresql',
				message: 'Database connected and initialized',
			});
		} else {
			return NextResponse.json(
				{
					status: 'demo_mode',
					message: 'No database configured - using temporary storage',
				},
				{ status: 200 },
			);
		}
	} catch (error) {
		console.error('Database health check failed:', error);
		return NextResponse.json(
			{
				status: 'disconnected',
				error: error instanceof Error ? error.message : 'Unknown error',
				message: 'Database connection failed - using temporary storage',
			},
			{ status: 200 },
		); // Return 200 so app continues to work
	}
}
