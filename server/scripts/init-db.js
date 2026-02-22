import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, '../src/db/schema.sql');
const dbPath = path.join(__dirname, '../data/grantflow.db');

import { mkdirSync } from 'fs';
mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
const schema = readFileSync(schemaPath, 'utf-8');
db.exec(schema);
db.close();
console.log('Database initialized at', dbPath);
