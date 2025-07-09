import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

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
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Database connection utility class
class Database {
  constructor() {
    this.pool = pool;
  }

  async query(text, params = []) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (environment === 'development') {
        console.log('Database Query:', {
          query: text.substring(0, 100) + '...',
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

  async findOne(table, conditions = {}, columns = '*') {
    const whereClause = Object.keys(conditions).length > 0 
      ? `WHERE ${Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`).join(' AND ')}`
      : '';
    
    const query = `SELECT ${columns} FROM ${table} ${whereClause} LIMIT 1`;
    const values = Object.values(conditions);
    
    const result = await this.query(query, values);
    return result.rows[0] || null;
  }

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

  async delete(table, id) {
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  async close() {
    await this.pool.end();
  }

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

const db = new Database();

export default db;
export const { query, transaction, findOne, findMany, insert, update } = db;