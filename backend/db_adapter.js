// Adaptador universal para MySQL y PostgreSQL
import { pool as mysqlPool } from './db.js';
import { pool as pgPool } from './db_postgres.js';

const DB_TYPE = process.env.DB_TYPE || 'mysql'; // 'mysql' o 'postgres'

let pool;
let queryAdapter;

if (DB_TYPE === 'postgres') {
  pool = pgPool;
  queryAdapter = {
    // Adaptador para PostgreSQL
    query: async (sql, params = []) => {
      // Convertir placeholders de ? a $1, $2, etc.
      let pgSql = sql;
      if (params.length > 0) {
        params.forEach((_, index) => {
          pgSql = pgSql.replace('?', `$${index + 1}`);
        });
      }
      
      const result = await pool.query(pgSql, params);
      return [result.rows]; // Formato compatible con mysql2
    },
    
    // Convertir consultas específicas de MySQL a PostgreSQL
    convertQuery: (sql) => {
      return sql
        .replace(/`/g, '"') // Cambiar backticks por comillas dobles
        .replace(/AUTO_INCREMENT/gi, 'SERIAL')
        .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
        .replace(/LIMIT (\d+)/gi, 'LIMIT $1');
    }
  };
} else {
  pool = mysqlPool;
  queryAdapter = {
    // Adaptador para MySQL (sin cambios)
    query: async (sql, params = []) => {
      return await pool.query(sql, params);
    },
    
    convertQuery: (sql) => sql // Sin conversión para MySQL
  };
}

console.log(`🔧 Database adapter initialized for: ${DB_TYPE.toUpperCase()}`);

export { pool, queryAdapter, DB_TYPE };
