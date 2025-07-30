import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Obtener historial
export async function GET() {
	try {
		const client = await pool.connect();
		const result = await client.query(
			'SELECT id, income, tax, calculation_date FROM tax_calculations ORDER BY calculation_date DESC LIMIT 20',
		);
		client.release();
		return NextResponse.json(result.rows);
	} catch (error) {
		console.error('Error fetching history:', error);
		return NextResponse.json([], { status: 500 });
	}
}

// POST - Guardar nuevo cálculo
export async function POST(request: Request) {
	try {
		const { income, tax } = await request.json();
		const client = await pool.connect();
		const result = await client.query(
			'INSERT INTO tax_calculations (income, tax, calculation_date) VALUES ($1, $2, NOW()) RETURNING id, income, tax, calculation_date',
			[income, tax],
		);
		client.release();
		return NextResponse.json(result.rows[0], { status: 201 });
	} catch (error) {
		console.error('Error saving calculation:', error);
		return NextResponse.json(
			{ error: 'Error saving calculation' },
			{ status: 500 },
		);
	}
}

// DELETE - Limpiar historial
export async function DELETE() {
	try {
		const client = await pool.connect();
		await client.query('DELETE FROM tax_calculations');
		client.release();
		return NextResponse.json({ message: 'History cleared' });
	} catch (error) {
		console.error('Error clearing history:', error);
		return NextResponse.json(
			{ error: 'Error clearing history' },
			{ status: 500 },
		);
	}
}
