import React, { useState } from 'react';
import { 
  BookOpen, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  CheckCircle 
} from 'lucide-react';
import type { CashflowTransaction } from '../types';
import { formatRupiah } from '../data/mockData';
import { Card, Badge, Button } from './ui';

interface CashflowViewProps {
  cashflow: CashflowTransaction[];
}

export const CashflowView: React.FC<CashflowViewProps> = ({ cashflow }) => {
  const [filterType, setFilterType] = useState<'all' | 'masuk' | 'keluar'>('all');

  const totalMasuk = cashflow
    .filter((c) => c.type === 'masuk')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalKeluar = cashflow
    .filter((c) => c.type === 'keluar')
    .reduce((sum, item) => sum + item.amount, 0);

  const netCashflow = totalMasuk - totalKeluar;

  const filteredCashflow = cashflow.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const exportExcel = () => {
    alert('Mengekspor data Buku Kas Digital ke format Microsoft Excel (.xlsx) berstandar akuntansi SAK ETAP...');
  };

  const exportPdf = () => {
    alert('Mencetak Laporan Rekapitulasi Arus Kas ke format PDF resmi berstempel digital...');
  };

  return (
    <div className="fade-in flex-col-gap">
      
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Buku Kas Digital Anggota</h2>
          <p className="section-subtitle">
            Transparansi arus kas personal: setoran, cicilan pinjaman, penarikan, dan pembagian dividen SHU.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outline"
            icon={<FileSpreadsheet size={16} color="var(--success)" />}
            onClick={exportExcel}
          >
            Ekspor Excel
          </Button>
          <Button
            icon={<Download size={16} />}
            onClick={exportPdf}
          >
            Ekspor PDF
          </Button>
        </div>
      </div>

      {/* 3 Summary Cards: Uang Masuk, Uang Keluar, Arus Kas Bersih */}
      <div className="grid-3 stagger">
        
        {/* Card Uang Masuk */}
        <Card className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Uang Masuk</span>
            <div className="metric-icon metric-icon-emerald">
              <ArrowDownLeft size={18} />
            </div>
          </div>
          <div className="metric-value text-success">
            +{formatRupiah(totalMasuk)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
            Simpanan rutin, bagi hasil SHU, dan pencairan kredit
          </span>
        </Card>

        {/* Card Uang Keluar */}
        <Card className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Uang Keluar</span>
            <div className="metric-icon" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="metric-value text-danger">
            -{formatRupiah(totalKeluar)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
            Pembayaran angsuran dan penarikan saldo sukarela
          </span>
        </Card>

        {/* Card Arus Kas Bersih */}
        <Card className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Arus Kas Bersih (Net)</span>
            <div className="metric-icon metric-icon-blue">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="metric-value metric-value-emerald">
            {formatRupiah(netCashflow)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
            Saldo surplus akun pergerakan finansial anggota
          </span>
        </Card>

      </div>

      {/* Tabel Jurnal Arus Kas */}
      <Card noPadding>
        <div className="card-header">
          <div>
            <h3 className="card-header-title">Jurnal Mutasi Keuangan Personal</h3>
            <span className="card-header-sub">Audit trail transaksi berstandar SAK ETAP</span>
          </div>

          <div className="filter-bar">
            <Filter size={15} color="var(--text-muted)" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">Semua Arus Kas</option>
              <option value="masuk">Hanya Kas Masuk</option>
              <option value="keluar">Hanya Kas Keluar</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal / Jam</th>
                <th>No. Jurnal Referensi</th>
                <th>Akun Transaksi</th>
                <th>Deskripsi / Keterangan</th>
                <th className="text-right">Kas Masuk (Kredit)</th>
                <th className="text-right">Kas Keluar (Debit)</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCashflow.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td className="text-mono" style={{ color: 'var(--text-muted)' }}>{item.referenceNo}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.category}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.description}</td>
                  <td className="text-right font-bold text-success">
                    {item.type === 'masuk' ? formatRupiah(item.amount) : '-'}
                  </td>
                  <td className="text-right font-bold text-danger">
                    {item.type === 'keluar' ? formatRupiah(item.amount) : '-'}
                  </td>
                  <td className="text-center">
                    <Badge variant="success" icon={<CheckCircle size={12} />}>
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
