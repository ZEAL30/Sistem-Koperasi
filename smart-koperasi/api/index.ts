import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Konfigurasi Pool PostgreSQL ke database Supabase / Neon / Local
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'zeal',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

// Helper untuk mendapatkan user_id dari request query / header
function getRequestedUserId(req: express.Request): string | null {
  return (req.query.userId as string) || (req.headers['x-user-id'] as string) || null;
}

// Endpoint Diagnostik Koneksi Database Supabase
app.get('/api/health', async (_req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW() as current_time, COUNT(*)::int as total_users FROM users');
    res.json({
      status: 'ok',
      database: 'connected',
      time: dbRes.rows[0].current_time,
      total_users: dbRes.rows[0].total_users,
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: err.message,
      code: err.code,
    });
  }
});

// 1. Endpoint Login (Autentikasi langsung ke PostgreSQL 'zeal')
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password, role } = req.body;
  try {
    const result = await pool.query(
      `SELECT id, member_number as "memberNumber", name, nik, email, phone, role, status as "membershipStatus", 
              to_char(created_at, 'DD Month YYYY') as "joinDate", credit_score as "creditScore", 
              failed_login_attempts, password_hash
       FROM users 
       WHERE (email = $1 OR member_number = $1)
       LIMIT 1`,
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email atau Nomor Anggota tidak ditemukan di database.' });
    }

    const row = result.rows[0];

    // Filter role jika diminta
    if (role && row.role !== role) {
      return res.status(403).json({ error: `Akun ini terdaftar sebagai ${row.role}, bukan ${role}.` });
    }

    // Verifikasi password menggunakan bcrypt
    const passwordMatch = await bcrypt.compare(password, row.password_hash);
    if (!passwordMatch) {
      await pool.query('UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1', [row.id]);
      return res.status(401).json({ error: 'Kata sandi salah. Silakan coba lagi.' });
    }

    // Reset failed login attempts
    await pool.query('UPDATE users SET failed_login_attempts = 0 WHERE id = $1', [row.id]);

    // Hapus password_hash dari response
    const { password_hash, failed_login_attempts, ...safeRow } = row;

    const user = {
      ...safeRow,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    res.json({ success: true, user });
  } catch (err: any) {
    console.error('Error saat login:', err);
    res.status(500).json({ error: `Database Error: ${err.message}` });
  }
});

// 2. Endpoint Registrasi Anggota Baru (Simpan langsung ke PostgreSQL 'zeal')
app.post('/api/auth/register', async (req, res) => {
  const { name, nik, email, phone, password, role = 'member' } = req.body;
  try {
    // Hash password sebelum disimpan ke database
    const saltRounds = 12;
    const defaultPassword = password || 'Koperasi2026!';
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    const memberNum = `SK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const userRes = await pool.query(
      `INSERT INTO users (member_number, name, nik, email, phone, password_hash, role, status, credit_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', 'prima_a_plus')
       RETURNING id, member_number as "memberNumber", name, nik, email, phone, role, status as "membershipStatus", 
                 to_char(created_at, 'DD Month YYYY') as "joinDate", credit_score as "creditScore"`,
      [memberNum, name, nik, email, phone, hashedPassword, role]
    );

    const newUser = userRes.rows[0];

    // Buat akun simpanan untuk user baru (Simpanan Wajib mulai dari 0 sampai disetor)
    await pool.query(
      `INSERT INTO savings_accounts (user_id, balance_pokok, balance_wajib, balance_sukarela, last_wajib_payment_date)
       VALUES ($1, 1000000.00, 0.00, 0.00, CURRENT_DATE)
       ON CONFLICT (user_id) DO NOTHING`,
      [newUser.id]
    );

    // Catat mutasi simpanan pokok user ini
    await pool.query(
      `INSERT INTO cashflow_journal (journal_ref, user_id, flow_type, category, amount, description)
       VALUES ($1, $2, 'masuk', 'Setoran Simpanan', 1000000.00, 'Penyetoran Simpanan Pokok Anggota Baru')`,
      [`TXN-SMP-${Math.floor(100 + Math.random() * 900)}`, newUser.id]
    );

    res.json({
      success: true,
      user: {
        ...newUser,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// In-memory OTP storage for password recovery
const otpStore: Record<string, { code: string; expiresAt: number; verified: boolean }> = {};

// 2a. Request OTP Pemulihan Password
app.post('/api/auth/forgot-password/send-otp', async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Email atau Nomor Anggota wajib diisi.' });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, member_number as "memberNumber", email, phone 
       FROM users 
       WHERE email = $1 OR member_number = $1 
       LIMIT 1`,
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Akun dengan Email atau Nomor Anggota tersebut tidak ditemukan.' });
    }

    const user = result.rows[0];
    const code = '749281';
    const expiresAt = Date.now() + 15 * 60 * 1000;

    otpStore[user.email] = { code, expiresAt, verified: false };
    otpStore[user.memberNumber] = { code, expiresAt, verified: false };

    const rawPhone = user.phone || '081234567890';
    const maskedPhone = rawPhone.length > 7 
      ? `${rawPhone.slice(0, 4)}****${rawPhone.slice(-4)}`
      : '+62 812-****-4590';

    res.json({
      success: true,
      message: 'Kode OTP verifikasi berhasil dikirimkan.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        memberNumber: user.memberNumber,
        phone: user.phone,
        maskedPhone
      },
      demoCode: code
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2b. Verifikasi OTP
app.post('/api/auth/forgot-password/verify-otp', async (req, res) => {
  const { identifier, otp } = req.body;
  if (!identifier || !otp) {
    return res.status(400).json({ error: 'Identifier dan kode OTP wajib diisi.' });
  }

  const record = otpStore[identifier];
  if (!record) {
    return res.status(400).json({ error: 'Sesi OTP tidak ditemukan atau sudah kedaluwarsa. Silakan minta kode baru.' });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[identifier];
    return res.status(400).json({ error: 'Kode OTP telah kedaluwarsa. Silakan kirim ulang kode baru.' });
  }

  if (record.code !== otp.trim()) {
    return res.status(400).json({ error: 'Kode OTP yang dimasukkan tidak cocok. Silakan periksa kembali.' });
  }

  record.verified = true;
  res.json({
    success: true,
    message: 'Kode OTP valid dan berhasil diverifikasi.'
  });
});

// 2c. Reset Password
app.post('/api/auth/forgot-password/reset', async (req, res) => {
  const { identifier, newPassword } = req.body;
  if (!identifier || !newPassword) {
    return res.status(400).json({ error: 'Identifier dan kata sandi baru wajib diisi.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Kata sandi baru minimal 8 karakter.' });
  }

  const record = otpStore[identifier];
  if (!record || !record.verified) {
    return res.status(403).json({ error: 'Verifikasi OTP belum selesai atau sesi tidak sah.' });
  }

  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updateRes = await pool.query(
      `UPDATE users 
       SET password_hash = $1, failed_login_attempts = 0, updated_at = CURRENT_TIMESTAMP 
       WHERE email = $2 OR member_number = $2 
       RETURNING id, name, email, member_number as "memberNumber"`,
      [hashedPassword, identifier]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Akun tidak ditemukan untuk diperbarui.' });
    }

    delete otpStore[identifier];

    res.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui di database.',
      user: updateRes.rows[0]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Saldo Simpanan
app.get('/api/savings', async (req, res) => {
  const userId = getRequestedUserId(req);
  try {
    let query = `SELECT balance_pokok as pokok, balance_wajib as wajib, balance_sukarela as sukarela, user_id 
                 FROM savings_accounts`;
    const params: any[] = [];
    if (userId) {
      query += ` WHERE user_id = $1`;
      params.push(userId);
    }
    query += ` LIMIT 1`;

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.json({ pokok: 0, wajib: 0, sukarela: 0, total: 0, wajibStatusBulanIni: 'Belum Dibayar' });
    }
    const row = result.rows[0];
    const pokok = Number(row.pokok);
    const wajib = Number(row.wajib);
    const sukarela = Number(row.sukarela);
    res.json({
      pokok,
      wajib,
      sukarela,
      total: pokok + wajib + sukarela,
      wajibStatusBulanIni: wajib > 0 ? 'Lunas' : 'Belum Dibayar'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Setor Simpanan
app.post('/api/savings/deposit', async (req, res) => {
  const { amount, category, userId } = req.body;
  try {
    const colToUpdate = category === 'wajib' ? 'balance_wajib' : 'balance_sukarela';
    
    let targetUserId = userId;
    if (!targetUserId) {
      const uRes = await pool.query(`SELECT id FROM users LIMIT 1`);
      targetUserId = uRes.rows[0]?.id;
    }

    await pool.query(
      `UPDATE savings_accounts SET ${colToUpdate} = ${colToUpdate} + $1 WHERE user_id = $2`,
      [amount, targetUserId]
    );

    await pool.query(
      `INSERT INTO cashflow_journal (journal_ref, user_id, flow_type, category, amount, description) 
       VALUES ($1, $2, 'masuk', 'Setoran Simpanan', $3, $4)`,
      [`TXN-SMP-${Math.floor(100 + Math.random() * 900)}`, targetUserId, amount, `Penyetoran Simpanan ${category}`]
    );

    res.json({ success: true, message: 'Penyetoran berhasil disimpan ke database!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Daftar Pinjaman
app.get('/api/loans', async (req, res) => {
  const userId = getRequestedUserId(req);
  try {
    let query = `SELECT id, loan_number as "loanNumber", plafon_amount as amount, tenor_months as "tenorMonths", 
                        interest_rate_annual as "interestRate", interest_type as "interestType", 
                        monthly_installment as "monthlyInstallment", remaining_principal as "remainingPrincipal", 
                        '25 November 2026' as "nextDueDate", purpose, status, 
                        to_char(created_at, 'DD TMonth YYYY') as "dateApplied" 
                 FROM loans`;
    const params: any[] = [];
    if (userId) {
      query += ` WHERE user_id = $1`;
      params.push(userId);
    }
    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    const formatted = result.rows.map(r => ({
      ...r,
      amount: Number(r.amount),
      interestRate: Number(r.interestRate),
      monthlyInstallment: Number(r.monthlyInstallment),
      remainingPrincipal: Number(r.remainingPrincipal),
      status: r.status === 'disetujui' ? 'Disetujui' : 'Verifikasi Analis'
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Ajukan Pinjaman
app.post('/api/loans', async (req, res) => {
  const { amount, tenorMonths, interestRate, interestType, monthlyInstallment, purpose, userId } = req.body;
  try {
    let targetUserId = userId;
    if (!targetUserId) {
      const uRes = await pool.query(`SELECT id FROM users LIMIT 1`);
      targetUserId = uRes.rows[0]?.id;
    }

    const loanNum = `PJ-2026-0${Math.floor(100 + Math.random() * 900)}`;
    const result = await pool.query(
      `INSERT INTO loans (loan_number, user_id, plafon_amount, tenor_months, interest_rate_annual, 
                          interest_type, monthly_installment, remaining_principal, purpose, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $3, $8, 'review_analis') 
       RETURNING id, loan_number as "loanNumber"`,
      [loanNum, targetUserId, amount, tenorMonths, interestRate, interestType, monthlyInstallment, purpose]
    );
    res.json({ success: true, loan: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Hapus Pinjaman
app.delete('/api/loans/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM loans WHERE id = $1', [id]);
    res.json({ success: true, message: 'Pinjaman berhasil dibatalkan dari database' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Mutasi Kas
app.get('/api/cashflow', async (req, res) => {
  const userId = getRequestedUserId(req);
  try {
    let query = `SELECT id, to_char(created_at, 'DD Mon YYYY, HH24:MI') as date, flow_type as type, 
                        category, amount, journal_ref as "referenceNo", description, 'Berhasil' as status 
                 FROM cashflow_journal`;
    const params: any[] = [];
    if (userId) {
      query += ` WHERE user_id = $1`;
      params.push(userId);
    }
    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    const formatted = result.rows.map(r => ({
      ...r,
      amount: Number(r.amount)
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. SHU
app.get('/api/shu', async (req, res) => {
  const userId = getRequestedUserId(req);
  try {
    const periodRes = await pool.query(
      `SELECT fiscal_year as year, total_net_profit as "totalNetProfit", 
              jasa_modal_percentage as "jasaModalPct", jasa_usaha_percentage as "jasaUsahaPct", 
              to_char(rat_date, 'TMonth YYYY') as "ratDateEstimated" 
       FROM shu_periods LIMIT 1`
    );

    if (periodRes.rows.length === 0) {
      return res.json({ totalEstimatedShu: 0, jasaModal: 0, jasaUsaha: 0, ratDateEstimated: 'Februari 2027', year: 2026 });
    }

    const period = periodRes.rows[0];
    const totalProfit = Number(period.totalNetProfit);

    let userSavings = 0;
    if (userId) {
      const sRes = await pool.query(`SELECT (balance_pokok + balance_wajib + balance_sukarela) as total FROM savings_accounts WHERE user_id = $1`, [userId]);
      userSavings = Number(sRes.rows[0]?.total || 0);
    }

    const jasaModal = Math.round((totalProfit * 0.40) * (userSavings > 0 ? userSavings / 1200000000 : 0.005));
    const jasaUsaha = Math.round((totalProfit * 0.60) * 0.003);
    const totalEstimatedShu = jasaModal + jasaUsaha;

    res.json({
      totalEstimatedShu: totalEstimatedShu > 0 ? totalEstimatedShu : 2450000,
      jasaModal: jasaModal > 0 ? jasaModal : 1470000,
      jasaUsaha: jasaUsaha > 0 ? jasaUsaha : 980000,
      ratDateEstimated: period.ratDateEstimated || 'Februari 2027',
      year: period.year
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. [ADMIN] Members
app.get('/api/admin/members', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.member_number as "memberNumber", u.name, u.email, u.phone,
        u.role, u.status as "membershipStatus", u.credit_score as "creditScore",
        to_char(u.created_at, 'DD Mon YYYY') as "joinDate",
        COALESCE(sa.balance_pokok + sa.balance_wajib + sa.balance_sukarela, 0) as "totalSavings",
        (SELECT COUNT(*) FROM loans l WHERE l.user_id = u.id AND l.status = 'disetujui') as "activeLoans"
      FROM users u
      LEFT JOIN savings_accounts sa ON sa.user_id = u.id
      ORDER BY u.created_at DESC
    `);
    const formatted = result.rows.map(r => ({
      ...r,
      totalSavings: Number(r.totalSavings),
      activeLoans: Number(r.activeLoans),
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. [ADMIN] Loans
app.get('/api/admin/loans', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.id, l.loan_number as "loanNumber", u.name as "memberName",
             l.plafon_amount as amount, l.tenor_months as "tenorMonths",
             l.interest_rate_annual as "interestRate", l.interest_type as "interestType",
             l.monthly_installment as "monthlyInstallment", l.remaining_principal as "remainingPrincipal",
             l.purpose, l.status,
             to_char(l.created_at, 'DD Mon YYYY') as "dateApplied",
             '25 November 2026' as "nextDueDate"
      FROM loans l
      JOIN users u ON u.id = l.user_id
      ORDER BY l.created_at DESC
    `);
    const formatted = result.rows.map(r => ({
      ...r,
      amount: Number(r.amount),
      interestRate: Number(r.interestRate),
      monthlyInstallment: Number(r.monthlyInstallment),
      remainingPrincipal: Number(r.remainingPrincipal),
      status: r.status === 'disetujui' ? 'Disetujui'
        : r.status === 'ditolak' ? 'Ditolak'
        : 'Verifikasi Analis',
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. [ADMIN] Cashflow
app.get('/api/admin/cashflow', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cj.id, to_char(cj.created_at, 'DD Mon YYYY, HH24:MI') as date,
             u.name as "memberName",
             cj.flow_type as type, cj.category, cj.amount,
             cj.journal_ref as "referenceNo", cj.description, 'Berhasil' as status
      FROM cashflow_journal cj
      LEFT JOIN users u ON u.id = cj.user_id
      ORDER BY cj.created_at DESC
    `);
    const formatted = result.rows.map(r => ({ ...r, amount: Number(r.amount) }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. [ADMIN] Report
app.get('/api/admin/report', async (req, res) => {
  try {
    const [usersRes, savingsRes, loansRes, cashRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active FROM users`),
      pool.query(`SELECT COALESCE(SUM(balance_pokok + balance_wajib + balance_sukarela), 0) as total FROM savings_accounts`),
      pool.query(`SELECT COALESCE(SUM(remaining_principal), 0) as total FROM loans WHERE status = 'disetujui'`),
      pool.query(`
        SELECT 
          COALESCE(SUM(amount) FILTER (WHERE flow_type = 'masuk' AND created_at >= date_trunc('month', CURRENT_DATE)), 0) as cash_in,
          COALESCE(SUM(amount) FILTER (WHERE flow_type = 'keluar' AND created_at >= date_trunc('month', CURRENT_DATE)), 0) as cash_out
        FROM cashflow_journal
      `),
    ]);

    res.json({
      totalMembers: Number(usersRes.rows[0].total),
      activeMembers: Number(usersRes.rows[0].active),
      totalSavings: Number(savingsRes.rows[0].total),
      totalLoansOutstanding: Number(loansRes.rows[0].total),
      totalCashInMonth: Number(cashRes.rows[0].cash_in),
      totalCashOutMonth: Number(cashRes.rows[0].cash_out),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 14. [ADMIN] Loan Status Update
app.patch('/api/admin/loans/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['disetujui', 'ditolak'].includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid. Gunakan: disetujui / ditolak' });
  }
  try {
    await pool.query('UPDATE loans SET status = $1 WHERE id = $2', [status, id]);
    if (status === 'disetujui') {
      const loanRes = await pool.query('SELECT user_id, plafon_amount, loan_number FROM loans WHERE id = $1', [id]);
      if (loanRes.rows.length > 0) {
        const { user_id, plafon_amount, loan_number } = loanRes.rows[0];
        await pool.query(
          `INSERT INTO cashflow_journal (journal_ref, user_id, flow_type, category, amount, description)
           VALUES ($1, $2, 'masuk', 'Pencairan Pinjaman', $3, $4)`,
          [`TXN-PCR-${Math.floor(100 + Math.random() * 900)}`, user_id, plafon_amount, `Pencairan Pinjaman ${loan_number}`]
        );
      }
    }
    res.json({ success: true, message: `Pinjaman berhasil ${status === 'disetujui' ? 'disetujui' : 'ditolak'}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
