import bcrypt from 'bcryptjs';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'zeal' });

const users = await pool.query('SELECT id, name, password_hash FROM users');
for (const u of users.rows) {
  try {
    const ok = await bcrypt.compare('Rahasia123!', u.password_hash);
    if (!ok) {
      const hash = await bcrypt.hash('Rahasia123!', 12);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, u.id]);
      console.log('✅ Updated:', u.name);
    } else {
      console.log('✔️  OK:', u.name);
    }
  } catch(e) {
    const hash = await bcrypt.hash('Rahasia123!', 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, u.id]);
    console.log('🔧 Fixed invalid hash for:', u.name);
  }
}
await pool.end();
console.log('\n🎉 Semua password hash sudah valid! Login dengan: Rahasia123!');
