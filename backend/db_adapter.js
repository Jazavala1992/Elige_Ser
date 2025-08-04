import { pool } from './db.js';

/**
 * Adaptador simple para consultas PostgreSQL
 * Reemplaza el adaptador anterior que manejaba MySQL/PostgreSQL
 */
export const queryAdapter = async (query, params = []) => {
    try {
        const result = await pool.query(query, params);
        return result.rows;
    } catch (error) {
        console.error('Error en queryAdapter:', error);
        throw error;
    }
};

export default queryAdapter;
