// lib/db.ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as schema from './schema';

// Configuración para WebSockets (mejor rendimiento en serverless)
if (process.env.NODE_ENV === 'development') {
	neonConfig.webSocketConstructor = WebSocket;
	neonConfig.useSecureWebSocket = false;
	neonConfig.pipelineTLS = false;
	neonConfig.pipelineConnect = 'password';
}

// Configuración del pool de conexiones
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	max: 10, // Número máximo de conexiones
	idleTimeoutMillis: 30000, // Tiempo máximo de inactividad
	connectionTimeoutMillis: 5000, // Tiempo máximo para establecer conexión
	ssl: {
		rejectUnauthorized: false, // Necesario para Neon
	},
});

// Configuración de Drizzle ORM (opcional pero recomendado)
export const db = drizzle(pool, { schema });

// Función para verificar la conexión
export async function checkConnection() {
	const client = await pool.connect();
	try {
		await client.query('SELECT 1');
		console.log('✅ Conexión a Neon PostgreSQL establecida');
		return true;
	} catch (error) {
		console.error('❌ Error de conexión a Neon:', error);
		return false;
	} finally {
		client.release();
	}
}

// Migraciones automáticas (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
	(async () => {
		try {
			await migrate(db, {
				migrationsFolder: './migrations',
			});
			console.log('✅ Migraciones aplicadas correctamente');
		} catch (error) {
			console.error('❌ Error aplicando migraciones:', error);
		}
	})();
}

// Exporta el pool directamente para consultas SQL crudas
export default pool;
