import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sql = neon(process.env.DATABASE_URL);

async function runSchema() {
  try {
    console.log('Reading schema file...');
    const schemaPath = join(__dirname, 'api', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    console.log('Executing schema...');
    await sql(schema);
    console.log('Schema executed successfully!');
  } catch (error) {
    console.error('Error executing schema:', error);
    process.exit(1);
  }
}

runSchema();
