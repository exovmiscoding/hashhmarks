import { readFile } from 'node:fs/promises';
import { db } from '../api/_lib/db.mjs';

const sql = await readFile(new URL('../schema.sql', import.meta.url), 'utf8');
await db().query(sql);
console.log('schema applied');
await db().end();
