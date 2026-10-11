// ─────────────────────────────────────────────
// Role & Permission System
// ─────────────────────────────────────────────

export type UserRole = 'member' | 'pengurus' | 'admin';

export type Permission =
  | 'view:overview'
  | 'view:savings'
  | 'view:loans'
  | 'view:cashflow'
  | 'view:shu'
  | 'view:admin_members'    // kelola anggota
  | 'view:admin_loans'      // persetujuan pinjaman global
  | 'view:admin_cashflow'   // buku kas global
  | 'view:admin_reports'    // laporan keuangan koperasi
  | 'action:deposit'        // setor simpanan
  | 'action:apply_loan'     // ajukan pinjaman
  | 'action:approve_loan'   // setujui/tolak pinjaman (pengurus+admin)
  | 'action:manage_members' // tambah/edit anggota
  | 'action:manage_shu';    // kelola periode SHU

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  member: [
    'view:overview',
    'view:savings',
    'view:loans',
    'view:cashflow',
    'view:shu',
    'action:deposit',
    'action:apply_loan',
  ],
  pengurus: [
    'view:overview',
    'view:savings',
    'view:loans',
    'view:cashflow',
    'view:shu',
    'view:admin_members',
    'view:admin_loans',
    'view:admin_cashflow',
    'view:admin_reports',
    'action:deposit',
    'action:apply_loan',
    'action:approve_loan',
    'action:manage_members',
  ],
  admin: [
    'view:overview',
    'view:savings',
    'view:loans',
    'view:cashflow',
    'view:shu',
    'view:admin_members',
    'view:admin_loans',
    'view:admin_cashflow',
    'view:admin_reports',
    'action:deposit',
    'action:apply_loan',
    'action:approve_loan',
    'action:manage_members',
    'action:manage_shu',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

// ─────────────────────────────────────────────
// Data Interfaces
// ─────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  nik: string;
  phone: string;
  memberNumber: string;
  role: UserRole;
  membershipStatus: 'Aktif' | 'Pending Approval' | 'Nonaktif' | string;
  joinDate: string;
  creditScore: 'prima_a_plus' | 'sangat_baik' | 'standar' | 'Prima A+' | 'Sangat Baik' | 'Standar' | string;
  avatar?: string;
  failedLoginAttempts?: number;
}

export interface AdminMember {
  id: string;
  memberNumber: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  membershipStatus: string;
  creditScore: string;
  joinDate: string;
  totalSavings: number;
  activeLoans: number;
}

export interface SavingsSummary {
  pokok: number;
  wajib: number;
  sukarela: number;
  total: number;
  wajibStatusBulanIni: 'Lunas' | 'Belum Dibayar';
}

export interface LoanItem {
  id: string;
  loanNumber: string;
  amount: number;
  tenorMonths: number;
  interestRate: number; // in percent per year
  interestType: 'flat' | 'menurun';
  monthlyInstallment: number;
  remainingPrincipal: number;
  nextDueDate: string;
  purpose: string;
  status: 'Disetujui' | 'Verifikasi Analis' | 'Ditolak' | 'Lunas' | 'Draf';
  dateApplied: string;
  memberName?: string; // untuk admin view
}

export interface CashflowTransaction {
  id: string;
  date: string;
  type: 'masuk' | 'keluar';
  category: string;
  amount: number;
  referenceNo: string;
  description: string;
  status: 'Berhasil' | 'Menunggu Verifikasi';
  memberName?: string; // untuk admin view
}

export interface ShuProjection {
  totalEstimatedShu: number;
  jasaModal: number; // based on member's savings proportion
  jasaUsaha: number; // based on transaction/loan volume
  ratDateEstimated: string;
  year: number;
}

export interface GlobalReport {
  totalMembers: number;
  activeMembers: number;
  totalSavings: number;
  totalLoansOutstanding: number;
  totalCashInMonth: number;
  totalCashOutMonth: number;
}

