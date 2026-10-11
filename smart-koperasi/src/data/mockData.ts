import type { SavingsSummary, LoanItem, CashflowTransaction, ShuProjection } from '../types';

/**
 * Nilai default kosong (Semua data murni diambil dan disimpan langsung ke database PostgreSQL 'zeal')
 */
export const initialSavings: SavingsSummary = {
  pokok: 0,
  wajib: 0,
  sukarela: 0,
  total: 0,
  wajibStatusBulanIni: 'Belum Dibayar'
};

export const initialLoans: LoanItem[] = [];

export const initialCashflow: CashflowTransaction[] = [];

export const initialShu: ShuProjection = {
  totalEstimatedShu: 0,
  jasaModal: 0,
  jasaUsaha: 0,
  ratDateEstimated: 'Februari 2027',
  year: new Date().getFullYear()
};

export const formatRupiah = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val);
};
