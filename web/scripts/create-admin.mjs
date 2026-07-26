#!/usr/bin/env node
/**
 * Buat akun admin pertama.
 * Penggunaan: node scripts/create-admin.mjs email@domain.com password123
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}

const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const hash = await bcrypt.hash(password, 12);
await pool.query(
  `INSERT INTO users (email, password_hash, peran)
   VALUES ($1, $2, 'admin')
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
  [email.toLowerCase().trim(), hash]
);

console.log(`✓ Akun admin "${email}" berhasil dibuat/diperbarui.`);
await pool.end();
