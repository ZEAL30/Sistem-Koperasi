-- =====================================================================
-- SMART KOPERASI - DATABASE SCHEMA (PostgreSQL / MySQL Compatible)
-- Arsitektur: RBAC, Mutasi Simpanan, Pinjaman, Buku Kas & Dividen SHU
-- Kepatuhan: SAK ETAP & Permenkop UKM
-- Penanggung Jawab Backend: Ghania Syafika
-- =====================================================================

-- 1. ENUM & CUSTOM TYPES (Khusus PostgreSQL)
CREATE TYPE user_role AS ENUM ('member', 'admin', 'officer');
CREATE TYPE user_status AS ENUM ('pending_approval', 'active', 'inactive', 'suspended');
CREATE TYPE credit_score_tier AS ENUM ('prima_a_plus', 'sangat_baik', 'standar', 'berisiko');
CREATE TYPE loan_status AS ENUM ('draft', 'review_analis', 'disetujui', 'ditolak', 'lunas');
CREATE TYPE loan_interest_type AS ENUM ('flat', 'menurun');
CREATE TYPE cashflow_type AS ENUM ('masuk', 'keluar');
CREATE TYPE savings_type AS ENUM ('pokok', 'wajib', 'sukarela');

-- 2. TABEL USERS & OTENTIKASI
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_number VARCHAR(32) UNIQUE NOT NULL, -- Contoh: SK-2024-0089
    name VARCHAR(150) NOT NULL,
    nik CHAR(16) UNIQUE NOT NULL, -- 16 digit KTP
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Argon2id / BCrypt salt 12
    role user_role DEFAULT 'member',
    status user_status DEFAULT 'pending_approval',
    credit_score credit_score_tier DEFAULT 'standar',
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_member_number ON users(member_number);
CREATE INDEX idx_users_nik ON users(nik);

-- 3. TABEL SIMPANAN (SAVINGS)
CREATE TABLE savings_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    balance_pokok NUMERIC(15, 2) DEFAULT 0.00 CHECK (balance_pokok >= 0),
    balance_wajib NUMERIC(15, 2) DEFAULT 0.00 CHECK (balance_wajib >= 0),
    balance_sukarela NUMERIC(15, 2) DEFAULT 0.00 CHECK (balance_sukarela >= 0),
    last_wajib_payment_date DATE NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_savings_user ON savings_accounts(user_id);

-- 4. TABEL MUTASI SIMPANAN
CREATE TABLE savings_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES savings_accounts(id) ON DELETE RESTRICT,
    transaction_no VARCHAR(50) UNIQUE NOT NULL, -- Ref: TXN-SMP-xxx
    savings_type savings_type NOT NULL,
    flow_type cashflow_type NOT NULL, -- masuk / keluar
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    balance_after NUMERIC(15, 2) NOT NULL,
    description TEXT,
    verified_by UUID NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_savings_tx_account ON savings_transactions(account_id);

-- 5. TABEL PINJAMAN & PORTOFOLIO (LOANS)
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_number VARCHAR(50) UNIQUE NOT NULL, -- Ref: PJ-2025-xxxx
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    plafon_amount NUMERIC(15, 2) NOT NULL CHECK (plafon_amount > 0),
    tenor_months INT NOT NULL CHECK (tenor_months >= 1),
    interest_rate_annual NUMERIC(5, 2) NOT NULL, -- misal: 6.00%
    interest_type loan_interest_type NOT NULL DEFAULT 'flat',
    monthly_installment NUMERIC(15, 2) NOT NULL,
    remaining_principal NUMERIC(15, 2) NOT NULL,
    purpose TEXT NOT NULL,
    status loan_status DEFAULT 'review_analis',
    approved_by UUID NULL REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);

-- 6. JADWAL ANGSURAN PINJAMAN (LOAN INSTALLMENTS SCHEDULE)
CREATE TABLE loan_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    installment_no INT NOT NULL,
    due_date DATE NOT NULL,
    principal_amount NUMERIC(15, 2) NOT NULL,
    interest_amount NUMERIC(15, 2) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    paid_amount NUMERIC(15, 2) DEFAULT 0.00,
    paid_at TIMESTAMP WITH TIME ZONE NULL,
    status VARCHAR(20) DEFAULT 'unpaid' -- unpaid, partial, paid, overdue
);

CREATE INDEX idx_installments_loan ON loan_installments(loan_id);

-- 7. TABEL BUKU KAS & JURNAL UMUM (CASHFLOW AUDIT TRAIL SAK ETAP)
CREATE TABLE cashflow_journal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_ref VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    flow_type cashflow_type NOT NULL, -- masuk / keluar
    category VARCHAR(60) NOT NULL, -- Setoran Simpanan, Pencairan Pinjaman, SHU, Angsuran
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    reference_id UUID NULL, -- ID entitas transaksi sumber (loan_id / savings_tx_id)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cashflow_user ON cashflow_journal(user_id);
CREATE INDEX idx_cashflow_created ON cashflow_journal(created_at);

-- 8. TABEL REKAPITULASI & PERHITUNGAN SHU
CREATE TABLE shu_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fiscal_year INT UNIQUE NOT NULL,
    total_net_profit NUMERIC(18, 2) NOT NULL, -- Total Laba Bersih Koperasi
    jasa_modal_percentage NUMERIC(5, 2) DEFAULT 40.00, -- 40%
    jasa_usaha_percentage NUMERIC(5, 2) DEFAULT 60.00, -- 60%
    rat_date DATE NOT NULL,
    is_distributed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shu_member_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shu_period_id UUID NOT NULL REFERENCES shu_periods(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    jasa_modal_earned NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    jasa_usaha_earned NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_shu_received NUMERIC(15, 2) NOT NULL,
    distributed_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX idx_shu_dist_user ON shu_member_distributions(user_id);
CREATE INDEX idx_shu_dist_period ON shu_member_distributions(shu_period_id);
