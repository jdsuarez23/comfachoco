/**
 * Database Configuration and Connection Pool
 * SQL Server connection using mssql driver
 */

const sql = require('mssql');
require('dotenv').config();

// SQL Server configuration
// Connecting to default instance (MSSQLSERVER) on localhost:1433
const config = {
    server: 'localhost',
    port: 1433,
    database: process.env.DB_DATABASE || 'ComfachocoLeaveDB',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'Jdsuarez23',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Connection pool
let pool = null;

/**
 * Get database connection pool
 * Creates pool if it doesn't exist
 */
async function getPool() {
    if (!pool) {
        try {
            pool = await sql.connect(config);
            console.log('✓ Connected to SQL Server database');
            return pool;
        } catch (err) {
            console.error('✗ Database connection failed:', err.message);
            throw err;
        }
    }
    return pool;
}

/**
 * Execute a query with parameters
 * @param {string} query - SQL query
 * @param {object} params - Query parameters
 */
async function executeQuery(query, params = {}) {
    try {
        const pool = await getPool();
        const request = pool.request();

        // Add parameters to request
        Object.keys(params).forEach(key => {
            request.input(key, params[key]);
        });

        const result = await request.query(query);
        return result;
    } catch (err) {
        console.error('Query execution error:', err.message);
        throw err;
    }
}

/**
 * Close database connection
 */
async function closePool() {
    if (pool) {
        await pool.close();
        pool = null;
        console.log('Database connection closed');
    }
}

// Handle application termination
process.on('SIGINT', async () => {
    await closePool();
    process.exit(0);
});

module.exports = {
    sql,
    getPool,
    executeQuery,
    closePool
};
