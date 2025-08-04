import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

export const PORT = process.env.PORT || 4000;
