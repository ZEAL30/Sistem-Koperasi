import React, { useState } from 'react';
import { 
  TrendingUp, 
  Coins, 
  Award, 
  Layers
} from 'lucide-react';
import type { ShuProjection, SavingsSummary, LoanItem } from '../types';
import { formatRupiah } from '../data/mockData';
import { Card, Badge } from './ui';

interface ShuViewProps {
  shu: ShuProjection;
  savings: SavingsSummary;
  loans: LoanItem[];
}

export const ShuView: React.FC<ShuViewProps> = ({ shu, savings, loans }) => {
  // Simulasi variabel interaktif untuk proyeksi RAT
  const [estimatedTotalCoopProfit, setEstimatedTotalCoopProfit] = useState<number>(350000000);
  const savingsRatio = 40; // 40% Jasa Modal
  const loanActivityRatio = 60; // 60% Jasa Usaha

  // Perhitungan proyeksi
  const memberSavingsProportion = (savings.total / 1200000000) * 100; // Contoh asumsi total simpanan seluruh koperasi = 1.2M
  const projectedJasaModal = ((estimatedTotalCoopProfit * (savingsRatio / 100)) * (memberSavingsProportion / 100));
  
  const totalLoanRepaid = loans.reduce((sum, item) => sum + (item.amount - item.remainingPrincipal), 0);
  const memberLoanProportion = (totalLoanRepaid / 850000000) * 100; // Contoh asumsi perputaran kredit anggota
  const projectedJasaUsaha = ((estimatedTotalCoopProfit * (loanActivityRatio / 100)) * (Math.max(memberLoanProportion, 0.4) / 100));

  const totalProjectedDividen = projectedJasaModal + projectedJasaUsaha;

  return (
    <div className="fade-in flex-col-gap">
      
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Sisa Hasil Usaha (SHU) & Transparansi Dividen</h2>
          <p className="section-subtitle">
            Formula pembagian dividen berdasarkan partisipasi modal dan partisipasi ekonomi (Jasa Usaha Anggota).
          </p>
        </div>
      </div>

      {/* Hero Card: Estimasi Total Dividen */}
      <Card variant="emerald">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Award size={20} color="var(--secondary)" />
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--secondary)' }}>
                Estimasi Dividen RAT {shu.year}
              </span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              {formatRupiah(Math.round(totalProjectedDividen))}
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', marginTop: '6px', maxWidth: '580px', lineHeight: 1.5 }}>
              Akan didistribusikan langsung ke rekening simpanan sukarela saat Rapat Anggota Tahunan ({shu.ratDateEstimated}).
            </p>
          </div>

          <div className="glass-stats">
            <div className="glass-stat-label">Jasa Modal (Simpanan)</div>
            <div className="glass-stat-value">{formatRupiah(Math.round(projectedJasaModal))}</div>
            <div className="glass-stat-label" style={{ marginTop: '12px' }}>Jasa Usaha (Aktivitas Pinjaman)</div>
            <div className="glass-stat-value glass-stat-value-gold">{formatRupiah(Math.round(projectedJasaUsaha))}</div>
          </div>
        </div>
      </Card>

      {/* 2 Breakdown Cards: Jasa Modal vs Jasa Usaha */}
      <div className="grid-2 stagger">
        
        {/* Komponen 1: Jasa Modal */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div className="metric-icon metric-icon-emerald">
              <Coins size={20} />
            </div>
            <div>
              <h3 className="card-header-title">
                Komponen Jasa Modal (JM)
              </h3>
              <span className="card-header-sub">Berdasarkan akumulasi saldo simpanan</span>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
            Dihitung dari porsi total simpanan Anda (pokok + wajib + sukarela) terhadap total modal simpanan seluruh anggota koperasi.
          </p>

          <div className="info-box">
            <div className="info-row">
              <span>Total Simpanan Anda:</span>
              <strong className="text-primary font-bold">{formatRupiah(savings.total)}</strong>
            </div>
            <div className="info-row">
              <span>Porsi Kepemilikan Modal:</span>
              <strong style={{ color: 'var(--text-main)' }}>{memberSavingsProportion.toFixed(2)}%</strong>
            </div>
          </div>
        </Card>

        {/* Komponen 2: Jasa Usaha */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div className="metric-icon metric-icon-amber">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="card-header-title">
                Komponen Jasa Usaha / Anggota (JU)
              </h3>
              <span className="card-header-sub">Berdasarkan partisipasi transaksi pinjaman</span>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
            Diberikan sebagai timbal balik atas pemanfaatan fasilitas pinjaman dan kelancaran pembayaran bunga/angsuran Anda ke koperasi.
          </p>

          <div className="info-box">
            <div className="info-row">
              <span>Partisipasi Angsuran Lunas:</span>
              <strong style={{ color: 'var(--warning)', fontWeight: 700 }}>{formatRupiah(totalLoanRepaid)}</strong>
            </div>
            <div className="info-row">
              <span>Status Kepatuhan Kredit:</span>
              <Badge variant="success">Disiplin (Prima A+)</Badge>
            </div>
          </div>
        </Card>

      </div>

      {/* Simulator Fleksibilitas SHU */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Layers size={18} color="var(--primary)" />
          <h3 className="card-header-title">
            Simulator Proyeksi Perolehan SHU Koperasi
          </h3>
        </div>

        <div className="slider-group">
          <div className="slider-header">
            <label className="slider-label">
              Estimasi Surplus Laba Bersih Koperasi Tahun Berjalan
            </label>
            <span className="slider-value">
              {formatRupiah(estimatedTotalCoopProfit)}
            </span>
          </div>
          <input
            type="range"
            min="100000000"
            max="1000000000"
            step="50000000"
            value={estimatedTotalCoopProfit}
            onChange={(e) => setEstimatedTotalCoopProfit(Number(e.target.value))}
            className="slider-input"
          />
          <div className="slider-range">
            <span>Rp 100.000.000</span>
            <span>Rp 1.000.000.000</span>
          </div>
        </div>
      </Card>

    </div>
  );
};
