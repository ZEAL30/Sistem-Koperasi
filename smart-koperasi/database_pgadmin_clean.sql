-- =====================================================================
-- SMART KOPERASI - BERSIH TANPA NOTICE (pgAdmin Ready)
-- File ini langsung CREATE TABLE tanpa DROP, sehingga 0 Notice & 0 Warning!
-- =====================================================================

-- 0. Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUM & TIPE DATA
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('member', 'admin', 'officer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('pending_approval', 'active', 'inactive', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE credit_score_tier AS ENUM ('prima_a_plus', 'sangat_baik', 'standar', 'berisiko');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE loan_status AS ENUM ('draft', 'review_analis', 'disetujui', 'ditolak', 'lunas');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE loan_interest_type AS ENUM ('flat', 'menurun');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE cashflow_type AS ENUM ('masuk', 'keluar');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE savings_type AS ENUM ('pokok', 'wajib', 'sukarela');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABEL USERS & RBAC
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_number VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    nik CHAR(16) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'member',
    status user_status DEFAULT 'active',
    credit_score credit_score_tier DEFAULT 'prima_a_plus',
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_member_number ON users(member_number);

-- 3. TABEL SAVINGS ACCOUNTS
CREATE TABLE IF NOT EXISTS savings_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    balance_pokok NUMERIC(15, 2) DEFAULT 0.00 CHECK (balance_pokok >= 0),
    balance_wajib NUMERIC(15, 2) DEFAULT 0.00 CHECK (balance_wajib >= 0),
    balance_sukarela NUMERIC(15, 2) DEFAULT 0.00 CHECK (balance_sukarela >= 0),
    last_wajib_payment_date DATE NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_savings_user ON savings_accounts(user_id);

-- 4. TABEL MUTASI SIMPANAN
CREATE TABLE IF NOT EXISTS savings_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES savings_accounts(id) ON DELETE RESTRICT,
    transaction_no VARCHAR(50) UNIQUE NOT NULL,
    savings_type savings_type NOT NULL,
    flow_type cashflow_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    balance_after NUMERIC(15, 2) NOT NULL,
    description TEXT,
    verified_by UUID NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL PINJAMAN & PORTOFOLIO
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    plafon_amount NUMERIC(15, 2) NOT NULL CHECK (plafon_amount > 0),
    tenor_months INT NOT NULL CHECK (tenor_months >= 1),
    interest_rate_annual NUMERIC(5, 2) NOT NULL DEFAULT 6.00,
    interest_type loan_interest_type NOT NULL DEFAULT 'flat',
    monthly_installment NUMERIC(15, 2) NOT NULL,
    remaining_principal NUMERIC(15, 2) NOT NULL,
    purpose TEXT NOT NULL,
    status loan_status DEFAULT 'review_analis',
    approved_by UUID NULL REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. JADWAL ANGSURAN PINJAMAN
CREATE TABLE IF NOT EXISTS loan_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    installment_no INT NOT NULL,
    due_date DATE NOT NULL,
    principal_amount NUMERIC(15, 2) NOT NULL,
    interest_amount NUMERIC(15, 2) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    paid_amount NUMERIC(15, 2) DEFAULT 0.00,
    paid_at TIMESTAMP WITH TIME ZONE NULL,
    status VARCHAR(20) DEFAULT 'unpaid'
);

-- 7. TABEL BUKU KAS & AUDIT TRAIL SAK ETAP
CREATE TABLE IF NOT EXISTS cashflow_journal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_ref VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    flow_type cashflow_type NOT NULL,
    category VARCHAR(60) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABEL SHU & DIVIDEN
CREATE TABLE IF NOT EXISTS shu_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fiscal_year INT UNIQUE NOT NULL,
    total_net_profit NUMERIC(18, 2) NOT NULL,
    jasa_modal_percentage NUMERIC(5, 2) DEFAULT 40.00,
    jasa_usaha_percentage NUMERIC(5, 2) DEFAULT 60.00,
    rat_date DATE NOT NULL,
    is_distributed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shu_member_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shu_period_id UUID NOT NULL REFERENCES shu_periods(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    jasa_modal_earned NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    jasa_usaha_earned NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_shu_received NUMERIC(15, 2) NOT NULL,
    distributed_at TIMESTAMP WITH TIME ZONE NULL
);

-- =====================================================================
-- 9. DUMMY DATA SEEDING (ON CONFLICT DO NOTHING - ANTI DUPLIKAT)
-- =====================================================================

-- Insert User Demo
INSERT INTO users (id, member_number, name, nik, email, phone, password_hash, role, status, credit_score)
VALUES 
('a0000000-0000-0000-0000-000000000001', 'SK-2024-0089', 'Budi Santoso, S.Kom', '3276012304920005', 'budi.santoso@koperasi.id', '081298765432', '$2a$12$e8x...demo', 'member', 'active', 'prima_a_plus'),
('a0000000-0000-0000-0000-000000000002', 'SK-ADM-001', 'Rayhan Setya (Admin)', '3276012304920099', 'admin@koperasi.id', '081299998888', '$2a$12$e8x...demo', 'admin', 'active', 'prima_a_plus')
ON CONFLICT (id) DO NOTHING;

-- Insert Saldo Simpanan
INSERT INTO savings_accounts (id, user_id, balance_pokok, balance_wajib, balance_sukarela, last_wajib_payment_date)
VALUES 
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 1000000.00, 2400000.00, 8750000.00, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- Insert Pinjaman
INSERT INTO loans (id, loan_number, user_id, plafon_amount, tenor_months, interest_rate_annual, interest_type, monthly_installment, remaining_principal, purpose, status)
VALUES 
('c0000000-0000-0000-0000-000000000001', 'PJ-2025-0012', 'a0000000-0000-0000-0000-000000000001', 15000000.00, 12, 6.00, 'flat', 1325000.00, 7500000.00, 'Renovasi Rumah & Modal Kerja', 'disetujui'),
('c0000000-0000-0000-0000-000000000002', 'PJ-2026-0044', 'a0000000-0000-0000-0000-000000000001', 5000000.00, 6, 5.50, 'menurun', 856000.00, 5000000.00, 'Biaya Pendidikan', 'review_analis')
ON CONFLICT (id) DO NOTHING;

-- Insert Mutasi Kas SAK ETAP
INSERT INTO cashflow_journal (journal_ref, user_id, flow_type, category, amount, description)
VALUES 
('TXN-SMP-991', 'a0000000-0000-0000-0000-000000000001', 'masuk', 'Setoran Simpanan', 500000.00, 'Penyetoran Simpanan Sukarela via Virtual Account'),
('TXN-ANG-774', 'a0000000-0000-0000-0000-000000000001', 'keluar', 'Angsuran Pinjaman', 1325000.00, 'Pembayaran Angsuran ke-6 Pinjaman PJ-2025-0012'),
('TXN-SHU-301', 'a0000000-0000-0000-0000-000000000001', 'masuk', 'Dividen SHU', 1850000.00, 'Penyaluran Sisa Hasil Usaha Periode Buku Sebelumnya'),
('TXN-SMP-118', 'a0000000-0000-0000-0000-000000000001', 'masuk', 'Setoran Simpanan', 200000.00, 'Auto-debit Simpanan Wajib Bulan Berjalan')
ON CONFLICT (journal_ref) DO NOTHING;

-- Insert Periode SHU
INSERT INTO shu_periods (id, fiscal_year, total_net_profit, jasa_modal_percentage, jasa_usaha_percentage, rat_date, is_distributed)
VALUES 
('d0000000-0000-0000-0000-000000000001', 2026, 350000000.00, 40.00, 60.00, '2027-02-28', FALSE)
ON CONFLICT (fiscal_year) DO NOTHING;
