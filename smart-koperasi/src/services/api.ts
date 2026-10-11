import type { User, SavingsSummary, LoanItem, CashflowTransaction, ShuProjection, AdminMember, GlobalReport } from '../types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Permintaan gagal: status ${res.status}`);
  }
  return res.json();
}

export const apiService = {
  // 1. Login langsung ke PostgreSQL 'zeal'
  login(identifier: string, password: string, role?: string): Promise<{ success: boolean; user: User }> {
    return request<{ success: boolean; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, role }),
    });
  },

  // 2. Registrasi Anggota Baru langsung ke PostgreSQL 'zeal'
  register(data: { name: string; nik: string; email: string; phone: string; password?: string; role?: string }): Promise<{ success: boolean; user: User }> {
    return request<{ success: boolean; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 2a. Kirim Kode OTP Pemulihan Password
  sendRecoveryOtp(identifier: string) {
    return request<{ success: boolean; message: string; user: { id: string; name: string; email: string; memberNumber: string; phone: string; maskedPhone: string }; demoCode?: string }>('/auth/forgot-password/send-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },

  // 2b. Verifikasi Kode OTP
  verifyRecoveryOtp(identifier: string, otp: string) {
    return request<{ success: boolean; message: string }>('/auth/forgot-password/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp }),
    });
  },

  // 2c. Reset Kata Sandi Baru ke PostgreSQL
  resetPassword(identifier: string, newPassword: string, logoutAll?: boolean) {
    return request<{ success: boolean; message: string; user: any }>('/auth/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify({ identifier, newPassword, logoutAll }),
    });
  },

  // 3. Ambil Saldo Simpanan dari Database (sesuai user yang login)
  getSavings(userId?: string): Promise<SavingsSummary> {
    const query = userId ? `?userId=${userId}` : '';
    return request<SavingsSummary>(`/savings${query}`);
  },

  // 4. Setor Simpanan langsung tersimpan ke Database (sesuai user)
  depositSavings(amount: number, category: 'wajib' | 'sukarela', userId?: string) {
    return request<{ success: boolean; message: string }>('/savings/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, category, userId }),
    });
  },

  // 5. Ambil Daftar Pinjaman dari Database (sesuai user / anggota)
  getLoans(userId?: string): Promise<LoanItem[]> {
    const query = userId ? `?userId=${userId}` : '';
    return request<LoanItem[]>(`/loans${query}`);
  },

  // 6. Ajukan Pinjaman Baru langsung tersimpan ke Database (sesuai user)
  applyLoan(loan: {
    amount: number;
    tenorMonths: number;
    interestRate: number;
    interestType: string;
    monthlyInstallment: number;
    purpose: string;
    userId?: string;
  }) {
    return request<{ success: boolean; loan: LoanItem }>('/loans', {
      method: 'POST',
      body: JSON.stringify(loan),
    });
  },

  // 7. Batalkan / Hapus Draf Pinjaman langsung dari Database
  cancelLoan(loanId: string) {
    return request<{ success: boolean }>(`/loans/${loanId}`, {
      method: 'DELETE',
    });
  },

  // 8. Ambil Jurnal Buku Kas SAK ETAP dari Database (sesuai user)
  getCashflow(userId?: string): Promise<CashflowTransaction[]> {
    const query = userId ? `?userId=${userId}` : '';
    return request<CashflowTransaction[]>(`/cashflow${query}`);
  },

  // 9. Ambil Periode Dividen SHU dari Database (sesuai user)
  getShu(userId?: string): Promise<ShuProjection> {
    const query = userId ? `?userId=${userId}` : '';
    return request<ShuProjection>(`/shu${query}`);
  },

  // ─── ADMIN ENDPOINTS ─────────────────────────────────────────────────────

  // 10. [ADMIN] Ambil daftar semua anggota beserta agregat simpanan & pinjaman
  getAdminMembers(): Promise<AdminMember[]> {
    return request<AdminMember[]>('/admin/members');
  },

  // 11. [ADMIN] Ambil semua pinjaman dari semua anggota (+ nama anggota)
  getAllLoans(): Promise<LoanItem[]> {
    return request<LoanItem[]>('/admin/loans');
  },

  // 12. [ADMIN] Ambil semua mutasi kas dari semua anggota (+ nama anggota)
  getAllCashflow(): Promise<CashflowTransaction[]> {
    return request<CashflowTransaction[]>('/admin/cashflow');
  },

  // 13. [ADMIN] Laporan KPI global koperasi
  getGlobalReport(): Promise<GlobalReport> {
    return request<GlobalReport>('/admin/report');
  },

  // 14. [ADMIN/PENGURUS] Update status pinjaman (disetujui / ditolak)
  updateLoanStatus(loanId: string, status: 'disetujui' | 'ditolak') {
    return request<{ success: boolean }>(`/admin/loans/${loanId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

