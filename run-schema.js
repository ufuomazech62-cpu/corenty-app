const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://neondb_owner:npg_JXJXJXJX@ep-super-salad-aqu2fjus-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

async function runSchema() {
  console.log('Connecting to database...');
  const sql = neon(DATABASE_URL);

  console.log('Reading schema file...');
  const schemaPath = path.join(__dirname, 'api', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('Executing schema...');
  try {
    await sql(schema);
    console.log('✅ Schema executed successfully!');
  } catch (error) {
    console.error('❌ Error executing schema:', error.message);
    process.exit(1);
  }
}

runSchema();
