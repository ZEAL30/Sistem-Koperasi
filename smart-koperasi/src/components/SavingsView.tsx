import React, { useState } from 'react';
import { 
  PiggyBank, 
  Filter, 
  CheckCircle, 
  Plus
} from 'lucide-react';
import type { SavingsSummary, CashflowTransaction } from '../types';
import { formatRupiah } from '../data/mockData';
import { Card, Badge, Button, Modal } from './ui';

interface SavingsViewProps {
  savings: SavingsSummary;
  cashflow: CashflowTransaction[];
  onDepositSuccess: (amount: number, category: 'wajib' | 'sukarela') => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  savings,
  cashflow,
  onDepositSuccess
}) => {
  const [filterType, setFilterType] = useState<'all' | 'masuk' | 'keluar'>('all');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositCategory, setDepositCategory] = useState<'sukarela' | 'wajib'>('sukarela');
  const [depositAmount, setDepositAmount] = useState<number>(200000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNote, setSuccessNote] = useState('');

  const savingsTransactions = cashflow.filter((c) => 
    c.category.includes('Simpanan') || c.category.includes('Penarikan Sukarela')
  );

  const filteredList = savingsTransactions.filter((c) => {
    if (filterType === 'all') return true;
    return c.type === filterType;
  });

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0 || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await Promise.resolve(onDepositSuccess(depositAmount, depositCategory));
      setShowDepositModal(false);
      setSuccessNote(`Penyetoran ${depositCategory === 'wajib' ? 'Simpanan Wajib' : 'Simpanan Sukarela'} sebesar ${formatRupiah(depositAmount)} berhasil diproses!`);
      setTimeout(() => setSuccessNote(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in flex-col-gap">
      
      {/* Header Title & CTA */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Portal Simpanan Anggota</h2>
          <p className="section-subtitle">
            Pantau saldo simpanan pokok, kepatuhan simpanan wajib, dan simpanan sukarela likuid.
          </p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={() => setShowDepositModal(true)}
        >
          Setor Simpanan Baru
        </Button>
      </div>

      {successNote && (
        <div className="alert alert-success">
          <CheckCircle size={18} className="alert-icon" />
          <span>{successNote}</span>
        </div>
      )}

      {/* 3 Categories of Savings */}
      <div className="grid-3 stagger">
        
        {/* 1. Simpanan Pokok */}
        <Card className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Simpanan Pokok</span>
            <Badge variant="neutral">Modal Tetap</Badge>
          </div>
          <div className="metric-value metric-value-emerald">
            {formatRupiah(savings.pokok)}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '8px' }}>
            Disetorkan sekali saat pertama mendaftar sebagai anggota koperasi. Tidak dapat ditarik selama keanggotaan aktif.
          </p>
        </Card>

        {/* 2. Simpanan Wajib */}
        <Card className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Simpanan Wajib</span>
            <Badge variant="success">{savings.wajibStatusBulanIni} Bulan Ini</Badge>
          </div>
          <div className="metric-value metric-value-emerald">
            {formatRupiah(savings.wajib)}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '8px' }}>
            Iuran bulanan sebesar Rp 200.000. Mempengaruhi proporsi penerimaan <strong>Jasa Modal</strong> pada SHU tahunan.
          </p>
        </Card>

        {/* 3. Simpanan Sukarela */}
        <Card className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Simpanan Sukarela</span>
            <Badge variant="warning">Likuid & Fleksibel</Badge>
          </div>
          <div className="metric-value metric-value-emerald">
            {formatRupiah(savings.sukarela)}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '8px' }}>
            Dapat disetor dan ditarik sewaktu-waktu sesuai kebutuhan finansial Anda dengan proses verifikasi instan.
          </p>
        </Card>

      </div>

      {/* Tabel Mutasi Simpanan */}
      <Card noPadding>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PiggyBank size={18} color="var(--primary)" />
            <h3 className="card-header-title">Riwayat Mutasi Simpanan</h3>
          </div>

          <div className="filter-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <Filter size={14} />
              <span>Filter:</span>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">Semua Jenis</option>
              <option value="masuk">Penyetoran (Kredit)</option>
              <option value="keluar">Penarikan (Debit)</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal & Waktu</th>
                <th>No. Referensi</th>
                <th>Kategori</th>
                <th>Keterangan</th>
                <th className="text-right">Nominal</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td className="text-mono" style={{ color: 'var(--text-muted)' }}>{item.referenceNo}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.category}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.description}</td>
                  <td className={`text-right font-bold ${item.type === 'masuk' ? 'text-success' : 'text-danger'}`}>
                    {item.type === 'masuk' ? '+' : '-'}{formatRupiah(item.amount)}
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

      {/* Modal Penyetoran Simpanan */}
      {showDepositModal && (
        <Modal onClose={() => !isSubmitting && setShowDepositModal(false)}>
          <div style={{ paddingRight: '24px' }}>
            <h3 className="modal-title" style={{ textAlign: 'left', color: 'var(--primary)', fontSize: '20px' }}>
              Form Penyetoran Simpanan
            </h3>
            <p className="modal-desc" style={{ textAlign: 'left', marginBottom: '20px' }}>
              Pilih jenis simpanan dan nominal yang ingin Anda setorkan ke rekening koperasi.
            </p>
          </div>

          <form onSubmit={handleDepositSubmit} className="gap-stack">
            <div className="form-group">
              <label className="form-label">Jenis Simpanan</label>
              <div className="role-toggle">
                <button
                  type="button"
                  onClick={() => { setDepositCategory('sukarela'); setDepositAmount(200000); }}
                  className={`role-btn ${depositCategory === 'sukarela' ? 'active' : ''}`}
                >
                  <PiggyBank size={16} />
                  Simpanan Sukarela
                </button>
                <button
                  type="button"
                  onClick={() => { setDepositCategory('wajib'); setDepositAmount(200000); }}
                  className={`role-btn ${depositCategory === 'wajib' ? 'active' : ''}`}
                >
                  <CheckCircle size={16} />
                  Simpanan Wajib
                </button>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {depositCategory === 'sukarela' 
                  ? 'Simpanan fleksibel, dapat disetor kapan saja & ditarik sewaktu-waktu.'
                  : 'Iuran wajib bulanan anggota tetap sebesar Rp 200.000.'}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Nominal Penyetoran</label>
              <div style={{ position: 'relative' }}>
                <span style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  fontWeight: 700, 
                  color: 'var(--text-muted)' 
                }}>
                  Rp
                </span>
                <input
                  type="number"
                  step="10000"
                  min="10000"
                  required
                  value={depositAmount || ''}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="form-input"
                  style={{ 
                    paddingLeft: '42px', 
                    fontSize: '17px', 
                    fontWeight: 700,
                    letterSpacing: '0.5px' 
                  }}
                  placeholder="0"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="amount-quick-chips">
                {[100000, 200000, 500000, 1000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`chip-amount-btn ${depositAmount === amt ? 'active' : ''}`}
                    onClick={() => setDepositAmount(amt)}
                  >
                    {formatRupiah(amt)}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setShowDepositModal(false)}
              >
                Batal
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || depositAmount <= 0}
                icon={isSubmitting ? undefined : <Plus size={16} />}
              >
                {isSubmitting ? 'Memproses...' : 'Konfirmasi Setor'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
