const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const MIGRATIONS_TABLE = 'schema_migrations';

/**
 * Create migrations tracking table if it doesn't exist
 */
async function createMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log(`✓ Migrations table "${MIGRATIONS_TABLE}" ready`);
}

/**
 * Get list of already executed migrations
 */
async function getExecutedMigrations() {
  const result = await pool.query(
    `SELECT filename FROM ${MIGRATIONS_TABLE} ORDER BY id`
  );
  return result.rows.map(row => row.filename);
}

/**
 * Get all migration files from the migrations directory
 */
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log('No migrations directory found');
    return [];
  }

  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
}

/**
 * Run a single migration
 */
async function runMigration(filename) {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  // Split by -- Down to get only the up migration
  const upMigration = sql.split('-- Down')[0];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(upMigration);
    await client.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (filename) VALUES ($1)`,
      [filename]
    );
    await client.query('COMMIT');
    console.log(`✓ Executed migration: ${filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ Failed to execute migration: ${filename}`);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run all pending migrations
 */
async function migrate() {
  try {
    console.log('Starting migrations...\n');

    await createMigrationsTable();

    const executedMigrations = await getExecutedMigrations();
    const allMigrations = getMigrationFiles();

    const pendingMigrations = allMigrations.filter(
      migration => !executedMigrations.includes(migration)
    );

    if (pendingMigrations.length === 0) {
      console.log('✓ No pending migrations');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migration(s)\n`);

    for (const migration of pendingMigrations) {
      await runMigration(migration);
    }

    console.log('\n✓ All migrations completed successfully!');
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Rollback the last migration
 */
async function rollback() {
  try {
    console.log('Starting rollback...\n');

    const executedMigrations = await getExecutedMigrations();

    if (executedMigrations.length === 0) {
      console.log('✓ No migrations to rollback');
      return;
    }

    const lastMigration = executedMigrations[executedMigrations.length - 1];
    const filePath = path.join(MIGRATIONS_DIR, lastMigration);
    const sql = fs.readFileSync(filePath, 'utf8');

    // Get the down migration (everything after -- Down)
    const parts = sql.split('-- Down');
    if (parts.length < 2) {
      throw new Error('Migration file does not contain a down migration');
    }
    const downMigration = parts[1];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(downMigration);
      await client.query(
        `DELETE FROM ${MIGRATIONS_TABLE} WHERE filename = $1`,
        [lastMigration]
      );
      await client.query('COMMIT');
      console.log(`✓ Rolled back migration: ${lastMigration}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`✗ Failed to rollback migration: ${lastMigration}`);
      throw error;
    } finally {
      client.release();
    }

    console.log('\n✓ Rollback completed successfully!');
  } catch (error) {
    console.error('\n✗ Rollback failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// CLI interface
const command = process.argv[2];

if (command === 'up' || !command) {
  migrate().catch(() => process.exit(1));
} else if (command === 'down') {
  rollback().catch(() => process.exit(1));
} else {
  console.log('Usage: node migrate.js [up|down]');
  console.log('  up   - Run all pending migrations (default)');
  console.log('  down - Rollback the last migration');
  process.exit(1);
}
