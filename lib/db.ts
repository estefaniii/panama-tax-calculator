import { Pool, neonConfig, PoolClient } from '@neondatabase/serverless';
import { WebSocket } from 'ws';
import { PoolConfig } from 'pg';

// Verificación mejorada de variables de entorno
if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not defined in environment variables');
}

// Configuración optimizada del pool de conexiones
const poolConfig: PoolConfig = {
	connectionString: process.env.DATABASE_URL,

	// Configuración SSL mejorada
	ssl:
		process.env.NODE_ENV === 'production'
			? {
					rejectUnauthorized: true,
					ca: process.env.DB_SSL_CA, // Opcional: para certificados personalizados
			  }
			: false,

	// Tamaño del pool
	max: process.env.NODE_ENV === 'production' ? 10 : 5, // Más conexiones en producción
	min: 2, // Mejor mantener al menos 2 conexiones

	// Timeouts
	idleTimeoutMillis: 30000, // 30 segundos
	connectionTimeoutMillis: 10000, // 10 segundos para conexión inicial

	// Opciones avanzadas
	allowExitOnIdle: false, // Mejor mantener como false para evitar problemas
	application_name: 'tax-calculator-app', // Identificador útil para monitoreo

	// Configuración específica para entornos serverless
	...(process.env.VERCEL_ENV && {
		max: 5,
		idleTimeoutMillis: 60000,
		connectionTimeoutMillis: 8000,
	}),
};

const pool = new Pool(poolConfig);

// Función mejorada para verificar la base de datos
export async function verifyDatabase() {
	const client = await pool.connect();
	try {
		const results = await Promise.all([
			client.query('SELECT NOW() as db_time'),
			client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'tax_calculations'
        ) as table_exists
      `),
			client.query('SELECT COUNT(*) FROM tax_calculations'),
		]);

		return {
			ok: true,
			dbTime: results[0].rows[0].db_time,
			tableExists: results[1].rows[0].table_exists,
			recordCount: parseInt(results[2].rows[0].count, 10),
			poolStatus: {
				totalCount: pool.totalCount,
				idleCount: pool.idleCount,
				waitingCount: pool.waitingCount,
			},
		};
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			poolStatus: {
				totalCount: pool.totalCount,
				idleCount: pool.idleCount,
				waitingCount: pool.waitingCount,
			},
		};
	} finally {
		client.release();
	}
}

// Función de diagnóstico mejorada
export async function diagnoseConnection() {
	try {
		const start = Date.now();
		const client = await pool.connect();
		const connectTime = Date.now() - start;

		try {
			const pingStart = Date.now();
			const ping = await client.query('SELECT 1 as test');
			const pingTime = Date.now() - pingStart;

			return {
				ok: true,
				connectTimeMs: connectTime,
				pingTimeMs: pingTime,
				poolStatus: {
					totalCount: pool.totalCount,
					idleCount: pool.idleCount,
					waitingCount: pool.waitingCount,
				},
			};
		} finally {
			client.release();
		}
	} catch (error) {
		return {
			ok: false,
			error:
				error instanceof Error ? error.message : 'Unknown connection error',
			poolStatus: {
				totalCount: pool.totalCount,
				idleCount: pool.idleCount,
				waitingCount: pool.waitingCount,
			},
		};
	}
}

// Monitoreo del pool de conexiones
pool.on('connect', (client: PoolClient) => {
	console.log('[DB] Client connected');
});

pool.on('acquire', (client: PoolClient) => {
	console.log('[DB] Client acquired');
});

pool.on('remove', (client: PoolClient) => {
	console.log('[DB] Client removed');
});

pool.on('error', (err: Error, client: PoolClient) => {
	console.error('[DB] Unexpected error on idle client', err);
});

export default pool;
