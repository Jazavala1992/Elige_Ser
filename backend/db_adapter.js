// Adaptador PostgreSQL para Render - Solo PostgreSQL
import { pool as pgPool } from './db_postgres.js';

console.log('🔧 Database adapter initialized for: POSTGRES');

let pool = pgPool;
let queryAdapter = {
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
            .replace(/TINYINT\(1\)/gi, 'BOOLEAN')
            .replace(/DATETIME/gi, 'TIMESTAMP')
            .replace(/VARCHAR\((\d+)\)/gi, 'VARCHAR($1)')
            .replace(/INT\((\d+)\)/gi, 'INTEGER')
            .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
            .replace(/LIMIT (\d+)/gi, 'LIMIT $1');
    }
};

export { queryAdapter, pool };
