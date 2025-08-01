// Adaptador PostgreSQL para Render - Solo PostgreSQL v2.0 con timeout
import { pool as pgPool } from './db_postgres.js';

console.log('🔧 Database adapter initialized for: POSTGRES');

let pool = pgPool;
let queryAdapter = {
    // Adaptador para PostgreSQL con timeout
    query: async (sql, params = []) => {
        const timeoutMs = 10000; // 10 segundos timeout
        
        try {
            // Convertir placeholders de ? a $1, $2, etc.
            let pgSql = sql;
            if (params.length > 0) {
                params.forEach((_, index) => {
                    pgSql = pgSql.replace('?', `$${index + 1}`);
                });
            }
            
            console.log('🔍 Executing query:', pgSql.substring(0, 100), '...', 'with params:', params);
            
            // Crear promise con timeout
            const queryPromise = pool.query(pgSql, params);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Query timeout after 10 seconds')), timeoutMs)
            );
            
            const result = await Promise.race([queryPromise, timeoutPromise]);
            console.log('✅ Query result:', result.rows.length, 'rows');
            
            return [result.rows]; // Formato compatible con mysql2
        } catch (error) {
            console.error('❌ Query error:', error.message);
            throw error;
        }
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
