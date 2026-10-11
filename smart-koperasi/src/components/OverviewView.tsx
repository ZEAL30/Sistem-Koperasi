import React from 'react';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  PlusCircle, 
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import type { SavingsSummary, LoanItem, ShuProjection, CashflowTransaction } from '../types';
import { formatRupiah } from '../data/mockData';
import { Card, Badge, Button } from './ui';

interface OverviewProps {
  savings: SavingsSummary;
  loans: LoanItem[];
  shu: ShuProjection;
  cashflow: CashflowTransaction[];
  onNavigateTab: (tab: 'savings' | 'loans' | 'cashflow' | 'shu') => void;
}

export const OverviewView: React.FC<OverviewProps> = ({
  savings,
  loans,
  shu,
  cashflow,
  onNavigateTab
}) => {
  const activeLoans = loans.filter((l) => l.status === 'Disetujui');
  const totalRemainingLoan = activeLoans.reduce((sum, item) => sum + item.remainingPrincipal, 0);

  return (
    <div className="fade-in flex-col-gap">
      
      {/* Welcome Hero Banner with Gradient & Glass Accents */}
      <Card variant="emerald" className="scale-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <Badge variant="gold" icon={<Sparkles size={12} />} style={{ marginBottom: '10px' }}>
              STATUS KEANGGOTAAN AKTIF TERVERIFIKASI
            </Badge>
            <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '6px 0 6px', color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              Selamat Datang di Portal Smart Koperasi
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '620px', lineHeight: 1.5 }}>
              Seluruh saldo simpanan, mutasi transaksi kas, dan proyeksi sisa hasil usaha (SHU) tersinkronisasi langsung ke sistem database PostgreSQL.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="md"
              icon={<PlusCircle size={16} />}
              onClick={() => onNavigateTab('savings')}
            >
              Setor Simpanan
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<CreditCard size={16} />}
              onClick={() => onNavigateTab('loans')}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.35)' }}
            >
              Ajukan Pinjaman
            </Button>
          </div>
        </div>
      </Card>

      {/* 3 Metric Summary Cards */}
      <div className="grid-3 stagger">
        
        {/* Metric 1: Total Simpanan */}
        <Card className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Saldo Simpanan</span>
            <div className="metric-icon metric-icon-emerald">
              <Wallet size={20} />
            </div>
          </div>
          <div className="metric-value metric-value-emerald">
            {formatRupiah(savings.total)}
          </div>
          <div className="metric-footer">
            <span>Pokok: <strong style={{ color: 'var(--text-main)' }}>{formatRupiah(savings.pokok)}</strong></span>
            <span>Wajib: <strong style={{ color: 'var(--text-main)' }}>{formatRupiah(savings.wajib)}</strong></span>
            <span>Sukarela: <strong style={{ color: 'var(--text-main)' }}>{formatRupiah(savings.sukarela)}</strong></span>
          </div>
        </Card>

        {/* Metric 2: Sisa Pokok Pinjaman */}
        <Card className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Sisa Pokok Pinjaman Aktif</span>
            <div className="metric-icon metric-icon-amber">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="metric-value metric-value-dark">
            {formatRupiah(totalRemainingLoan)}
          </div>
          <div className="metric-footer">
            <span>Jatuh Tempo: <strong>{activeLoans[0]?.nextDueDate || '-'}</strong></span>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{activeLoans.length} Pinjaman Aktif</span>
          </div>
        </Card>

        {/* Metric 3: Estimasi SHU */}
        <Card className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Estimasi SHU Berjalan ({shu.year})</span>
            <div className="metric-icon metric-icon-blue">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-value metric-value-blue">
            {formatRupiah(shu.totalEstimatedShu)}
          </div>
          <div className="metric-footer">
            <span>Jasa Modal: <strong style={{ color: 'var(--text-main)' }}>{formatRupiah(shu.jasaModal)}</strong></span>
            <span>Jasa Usaha: <strong style={{ color: 'var(--text-main)' }}>{formatRupiah(shu.jasaUsaha)}</strong></span>
          </div>
        </Card>

      </div>

      {/* Grid: Financial Activities & Quick Actions */}
      <div className="grid-2-1">
        
        {/* Aktivitas & Mutasi Terakhir */}
        <Card noPadding>
          <div className="card-header">
            <div>
              <h3 className="card-header-title">Aktivitas Finansial Terkini</h3>
              <div className="card-header-sub">Histori mutasi kas dan transaksi terkini</div>
            </div>
            <button
              onClick={() => onNavigateTab('cashflow')}
              className="view-all-link"
            >
              Lihat Seluruh Mutasi <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ padding: '18px 22px' }}>
            <div className="activity-list">
              {cashflow.slice(0, 4).map((item) => (
                <div key={item.id} className="activity-item">
                  <div className="activity-left">
                    <div className={`activity-icon ${item.type === 'masuk' ? 'activity-icon-in' : 'activity-icon-out'}`}>
                      {item.type === 'masuk' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <div className="activity-title">{item.category}</div>
                      <div className="activity-meta">
                        {item.date} • Ref: {item.referenceNo}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className={`activity-amount ${item.type === 'masuk' ? 'activity-amount-in' : 'activity-amount-out'}`}>
                      {item.type === 'masuk' ? '+' : '-'}{formatRupiah(item.amount)}
                    </div>
                    <Badge variant="success" size-sm="true">
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Kepatuhan & Aksi Cepat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Status Simpanan Wajib Reminder */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '8px' }}>
              <ShieldAlert size={18} />
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Simpanan Wajib Bulanan</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
              Status periode berjalan: <strong style={{ color: 'var(--success)' }}>{savings.wajibStatusBulanIni}</strong>. Pembayaran rutin menjaga skor keaktifan koperasi Anda.
            </p>
            <div className="info-box" style={{ padding: '10px 12px' }}>
              <div className="info-row">
                <span>Iuran Wajib:</span>
                <strong style={{ color: 'var(--text-main)' }}>Rp 200.000 / bln</strong>
              </div>
            </div>
          </Card>

          {/* Download E-Statement */}
          <Card>
            <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              E-Statement Bulanan
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
              Unduh rekapitulasi rekening koran dan sertifikat dividen resmi berstandar SAK ETAP.
            </p>
            <Button
              variant="outline"
              icon={<Download size={16} />}
              fullWidth
              onClick={() => alert('Mengunduh E-Statement resmi Koperasi format PDF...')}
            >
              Unduh E-Statement PDF
            </Button>
          </Card>

        </div>

      </div>

    </div>
  );
};
