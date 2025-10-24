const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
    user: process.env.DB_USER || 'YOUR_POSTGRES_USER',  // ⚠️ CHANGE THIS
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'YOUR_DATABASE_NAME',  // ⚠️ CHANGE THIS
    password: process.env.DB_PASSWORD || 'YOUR_POSTGRES_PASSWORD',  // ⚠️ CHANGE THIS   
    port: process.env.DB_PORT || 5432, // THIS MUST BE THE SAME
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error', err.stack);
    } else {
        console.log('Database connected successfully');
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
