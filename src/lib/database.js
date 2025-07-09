import { Pool } from 'pg';

// Database configuration
const dbConfig = {
  development: {
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'moneyapp',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '12345',
  },
  production: {
    host: process.env.PGHOST || '137.184.109.21',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'moneyapp',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'P@ssw0rd',
  }
};

// Determine environment
const environment = process.env.NODE_ENV || 'development';
const config = dbConfig[environment];

// Create connection pool
const pool = new Pool({
  ...config,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Database connection utility class
class Database {
  constructor() {
    this.pool = pool;
  }

  // Execute a query with parameters
  async query(text, params = []) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      // Log query performance in development
      if (environment === 'development') {
        console.log('Database Query:', {
          query: text,
          duration: `${duration}ms`,
          rows: result.rowCount
        });
      }
      
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Execute a transaction
  async transaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get a single record
  async findOne(table, conditions = {}, columns = '*') {
    const whereClause = Object.keys(conditions).length > 0 
      ? `WHERE ${Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`).join(' AND ')}`
      : '';
    
    const query = `SELECT ${columns} FROM ${table} ${whereClause} LIMIT 1`;
    const values = Object.values(conditions);
    
    const result = await this.query(query, values);
    return result.rows[0] || null;
  }

  // Get multiple records
  async findMany(table, conditions = {}, options = {}) {
    const { orderBy = '', limit = '', offset = '', columns = '*' } = options;
    
    const whereClause = Object.keys(conditions).length > 0 
      ? `WHERE ${Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`).join(' AND ')}`
      : '';
    
    const orderClause = orderBy ? `ORDER BY ${orderBy}` : '';
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const offsetClause = offset ? `OFFSET ${offset}` : '';
    
    const query = `SELECT ${columns} FROM ${table} ${whereClause} ${orderClause} ${limitClause} ${offsetClause}`.trim();
    const values = Object.values(conditions);
    
    const result = await this.query(query, values);
    return result.rows;
  }

  // Insert a record
  async insert(table, data) {
    const columns = Object.keys(data);
    const placeholders = columns.map((_, index) => `$${index + 1}`);
    const values = Object.values(data);
    
    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await this.query(query, values);
    return result.rows[0];
  }

  // Update a record
  async update(table, id, data) {
    const columns = Object.keys(data);
    const setClause = columns.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(data)];
    
    const query = `
      UPDATE ${table}
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.query(query, values);
    return result.rows[0];
  }

  // Delete a record
  async delete(table, id) {
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  // Close the database connection
  async close() {
    await this.pool.end();
  }

  // Test database connection
  async testConnection() {
    try {
      const result = await this.query('SELECT NOW() as current_time');
      console.log('Database connection successful:', result.rows[0]);
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }
}

// Create a single instance to export
const db = new Database();

export default db;

// Export specific methods for convenience
export const { query, transaction, findOne, findMany, insert, update, delete: deleteRecord } = db;