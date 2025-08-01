import {createPool} from 'mysql2/promise';

export const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: 'J.zavala1992',
    database: 'ElijeSer',
});

