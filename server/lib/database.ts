import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { logger } from './logger';

// Lazy initialization variables
let dbInstance: any = null;
let clientInstance: any = null;
let connectionString: string | null = null;

/**
 * Initialize database connection (lazy initialization)
 */
function initializeDatabase(): { db: any; client: any } | null {
  if (dbInstance && clientInstance) {
    return { db: dbInstance, client: clientInstance };
  }

  connectionString = process.env.DATABASE_URL || null;

  if (!connectionString) {
    logger.warn('DATABASE_URL environment variable not set - database features disabled');
    return null;
  }

  try {
    clientInstance = postgres(connectionString);
    dbInstance = drizzle(clientInstance);
    logger.log('Database connection initialized successfully');
    return { db: dbInstance, client: clientInstance };
  } catch (error) {
    logger.error('Database initialization failed:', error);
    return null;
  }
}

/**
 * Get database instance (lazy initialization)
 */
export function getDatabase() {
  const result = initializeDatabase();
  return result?.db || null;
}

/**
 * Get client instance (lazy initialization)
 */
export function getClient() {
  const result = initializeDatabase();
  return result?.client || null;
}

/**
 * Check if database is available
 */
export function isDatabaseAvailable(): boolean {
  return initializeDatabase() !== null;
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  const client = getClient();
  if (!client) {
    logger.warn('Database not available - skipping connection test');
    return false;
  }

  try {
    await client`SELECT 1`;
    logger.log('Database connection test successful');
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Graceful database operations wrapper
 */
export async function withDatabase<T>(
  operation: (db: any) => Promise<T>,
  fallback: T
): Promise<T> {
  const db = getDatabase();
  if (!db) {
    logger.warn('Database unavailable, using fallback value');
    return fallback;
  }

  try {
    return await operation(db);
  } catch (error) {
    logger.error('Database operation failed:', error);
    return fallback;
  }
}
