#!/usr/bin/env node
// Push generated data to Neon PostgreSQL
// Run: node push-to-neon.js
// Requires: npm install pg dotenv (from repo root)

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '..', '.env') });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error('DATABASE_URL not set in .env'); process.exit(1); }

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to Neon');

  const sqlPath = path.join(__dirname, 'postgres.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split on semicolons, filter empty statements
  const statements = sql.split(/;\s*\n/).filter(s => s.trim().length > 5);
  console.log(`Total statements: ${statements.length}`);

  let done = 0;
  let errors = 0;
  for (const stmt of statements) {
    try {
      await client.query(stmt);
      done++;
      if (done % 100 === 0) process.stdout.write(`  ${done}/${statements.length} statements...\r`);
    } catch (err) {
      errors++;
      if (errors <= 5) console.error(`\nError at statement ${done + 1}: ${err.message.slice(0, 120)}`);
    }
  }

  // Verify row counts
  console.log(`\n  Executed ${done} statements (${errors} errors)\n`);
  const tables = [
    'companies', 'persons', 'themes', 'use_cases', 'features', 'improvements',
    'deals', 'deal_stage_history', 'calls', 'call_attendees', 'raw_inputs',
    'subscriptions', 'satisfaction_scores'
  ];
  for (const t of tables) {
    try {
      const res = await client.query(`SELECT COUNT(*) FROM ${t}`);
      console.log(`  ${t}: ${res.rows[0].count} rows`);
    } catch (e) {
      console.log(`  ${t}: ERROR — ${e.message.slice(0, 80)}`);
    }
  }

  await client.end();
  console.log('\nDone.');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
