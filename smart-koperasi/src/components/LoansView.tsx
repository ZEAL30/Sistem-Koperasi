import React, { useState } from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Clock
} from 'lucide-react';
import type { LoanItem, User } from '../types';
import { formatRupiah } from '../data/mockData';
import { Card, Badge, Button, Modal } from './ui';

interface LoansViewProps {
  user: User;
  loans: LoanItem[];
  onAddLoan: (loan: LoanItem) => void;
  onCancelLoan: (id: string) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  user,
  loans,
  onAddLoan,
  onCancelLoan
}) => {
  // Simulator State
  const [calcAmount, setCalcAmount] = useState<number>(10000000);
  const [calcTenor, setCalcTenor] = useState<number>(12);
  const [interestScheme, setInterestScheme] = useState<'flat' | 'menurun'>('flat');
  const [showApplyModal, setShowApplyModal] = useState(false);

  // New Application Form State
  const [applyPurpose, setApplyPurpose] = useState('');
  const [applyAmount, setApplyAmount] = useState(10000000);
  const [applyTenor, setApplyTenor] = useState(12);

  // Perhitungan Simulasi (< 1 detik real-time)
  const annualRate = 6.0; // 6% per tahun
  const monthlyRate = annualRate / 100 / 12;
  
  let monthlyInstallment = 0;
  let totalRepayment = 0;

  if (interestScheme === 'flat') {
    const monthlyPrincipal = calcAmount / calcTenor;
    const monthlyInterest = calcAmount * monthlyRate;
    monthlyInstallment = monthlyPrincipal + monthlyInterest;
    totalRepayment = monthlyInstallment * calcTenor;
  } else {
    monthlyInstallment = (calcAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -calcTenor));
    totalRepayment = monthlyInstallment * calcTenor;
  }

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `loan-${Date.now().toString().slice(-4)}`;
    const newLoan: LoanItem = {
      id: newId,
      loanNumber: `PJ-2026-0${Math.floor(100 + Math.random() * 900)}`,
      amount: applyAmount,
      tenorMonths: applyTenor,
      interestRate: 6.0,
      interestType: interestScheme,
      monthlyInstallment: Math.round(monthlyInstallment),
      remainingPrincipal: applyAmount,
      nextDueDate: 'Menunggu Verifikasi',
      purpose: applyPurpose || 'Kebutuhan Modal Kerja',
      status: 'Verifikasi Analis',
      dateApplied: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    onAddLoan(newLoan);
    setShowApplyModal(false);
    setApplyPurpose('');
  };

  return (
    <div className="fade-in flex-col-gap">
      
      {/* Title */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Modul Pinjaman & Portofolio Anggota</h2>
          <p className="section-subtitle">
            Simulasi kalkulasi kredit instan, verifikasi kelayakan OJK/Kemenkop UKM, serta pemantauan angsuran.
          </p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={() => {
            setApplyAmount(calcAmount);
            setApplyTenor(calcTenor);
            setShowApplyModal(true);
          }}
        >
          Ajukan Pinjaman Baru
        </Button>
      </div>

      {/* Grid: Kalkulator Simulasi + Indikator Plafon & Checklist */}
      <div className="grid-1-2-1">
        
        {/* Kalkulator Simulasi Interaktif */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <div className="metric-icon metric-icon-emerald">
              <Calculator size={20} />
            </div>
            <h3 className="card-header-title">
              Kalkulator Simulasi Pinjaman Real-Time
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Input Plafon Slider */}
            <div className="slider-group">
              <div className="slider-header">
                <label className="slider-label">Jumlah Pinjaman</label>
                <span className="slider-value">{formatRupiah(calcAmount)}</span>
              </div>
              <input
                type="range"
                min="1000000"
                max="50000000"
                step="1000000"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="slider-input"
              />
              <div className="slider-range">
                <span>Rp 1.000.000</span>
                <span>Plafon Maks: Rp 50.000.000</span>
              </div>
            </div>

            {/* Input Tenor Slider */}
            <div className="slider-group">
              <div className="slider-header">
                <label className="slider-label">Jangka Waktu (Tenor)</label>
                <span className="slider-value">{calcTenor} Bulan</span>
              </div>
              <input
                type="range"
                min="3"
                max="36"
                step="3"
                value={calcTenor}
                onChange={(e) => setCalcTenor(Number(e.target.value))}
                className="slider-input"
              />
              <div className="slider-range">
                <span>3 Bulan</span>
                <span>36 Bulan</span>
              </div>
            </div>

            {/* Skema Bunga Toggle */}
            <div className="form-group">
              <label className="form-label">Skema Bunga Pinjaman</label>
              <div className="role-toggle">
                <button
                  type="button"
                  onClick={() => setInterestScheme('flat')}
                  className={`role-btn ${interestScheme === 'flat' ? 'active' : ''}`}
                >
                  Bunga Flat (Tetap)
                </button>
                <button
                  type="button"
                  onClick={() => setInterestScheme('menurun')}
                  className={`role-btn ${interestScheme === 'menurun' ? 'active' : ''}`}
                >
                  Bunga Menurun (Efektif)
                </button>
              </div>
            </div>

            {/* Hasil Kalkulasi Card */}
            <div className="calc-result-box">
              <div className="calc-result-row">
                <span>Estimasi Angsuran / Bulan:</span>
                <strong className="calc-result-main">
                  {formatRupiah(Math.round(monthlyInstallment))}
                </strong>
              </div>
              <div className="calc-result-row">
                <span>Suku Bunga Koperasi:</span>
                <span className="calc-result-sub">{annualRate}% per tahun</span>
              </div>
              <div className="calc-result-row">
                <span>Total Pengembalian:</span>
                <span className="calc-result-sub">{formatRupiah(Math.round(totalRepayment))}</span>
              </div>
            </div>

          </div>
        </Card>

        {/* Kartu Ringkasan Plafon & Syarat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card Limit Plafon */}
          <Card>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Limit Plafon Anda</span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 8px' }}>
              Rp 50.000.000
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Badge variant="success">
                Skor Kredit: {user.creditScore}
              </Badge>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Profil Risiko Rendah</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '30%' }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
              Terpakai: Rp 15.000.000 (30%) • Tersisa: Rp 35.000.000
            </span>
          </Card>

          {/* Checklist Persyaratan Kepatuhan */}
          <Card>
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              Checklist Syarat Pengajuan (OJK / Kemenkop)
            </h4>

            <div className="checklist">
              <div className="checklist-item">
                <CheckCircle2 size={16} color="var(--success)" />
                <span>Keaktifan anggota minimal 3 bulan berturut-turut</span>
              </div>
              <div className="checklist-item">
                <CheckCircle2 size={16} color="var(--success)" />
                <span>Simpanan wajib bulan berjalan telah lunas</span>
              </div>
              <div className="checklist-item">
                <CheckCircle2 size={16} color="var(--success)" />
                <span>Identitas KTP & NIK terverifikasi Dukcapil</span>
              </div>
              <div className="checklist-item">
                <CheckCircle2 size={16} color="var(--success)" />
                <span>Bebas dari riwayat kredit macet (*Non-Performing Loan*)</span>
              </div>
            </div>
          </Card>

        </div>

      </div>

      {/* Portofolio CRUD Pinjaman Aktif */}
      <Card noPadding>
        <div className="card-header">
          <div>
            <h3 className="card-header-title">Portofolio Pinjaman Anggota</h3>
            <span className="card-header-sub">
              Daftar pinjaman aktif, jadwal jatuh tempo, dan opsi pengelolaan draf.
            </span>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>No. Kontrak Pinjaman</th>
                <th>Tujuan</th>
                <th>Plafon</th>
                <th>Tenor</th>
                <th>Angsuran/Bln</th>
                <th>Sisa Pokok</th>
                <th className="text-center">Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>{item.loanNumber}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>Tgl: {item.dateApplied}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{item.purpose}</td>
                  <td className="font-bold text-primary">
                    {formatRupiah(item.amount)}
                  </td>
                  <td>{item.tenorMonths} Bulan</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {formatRupiah(item.monthlyInstallment)}
                  </td>
                  <td className="font-bold" style={{ color: 'var(--warning)' }}>
                    {formatRupiah(item.remainingPrincipal)}
                  </td>
                  <td className="text-center">
                    <Badge 
                      variant={item.status === 'Disetujui' ? 'success' : 'warning'} 
                      icon={item.status === 'Disetujui' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="text-center">
                    {item.status === 'Verifikasi Analis' || item.status === 'Draf' ? (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 size={12} />}
                        onClick={() => onCancelLoan(item.id)}
                      >
                        Batalkan
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`Jadwal angsuran untuk pinjaman ${item.loanNumber}:\nJatuh tempo terdekat: ${item.nextDueDate}\nAngsuran: ${formatRupiah(item.monthlyInstallment)}`)}
                      >
                        Lihat Jadwal
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Ajukan Pinjaman */}
      {showApplyModal && (
        <Modal onClose={() => setShowApplyModal(false)}>
          <h3 className="modal-title" style={{ textAlign: 'left', color: 'var(--primary)' }}>
            Formulir Pengajuan Pinjaman Baru
          </h3>
          <p className="modal-desc" style={{ textAlign: 'left', marginBottom: '16px' }}>
            Proses verifikasi analis kredit membutuhkan waktu &lt; 24 jam kerja sesuai standar SLA KR 2.2.
          </p>

          <form onSubmit={handleApplySubmit} className="gap-stack">
            <div className="form-group">
              <label className="form-label">Jumlah Pinjaman (Rp)</label>
              <input
                type="number"
                step="500000"
                min="1000000"
                max="50000000"
                required
                value={applyAmount}
                onChange={(e) => setApplyAmount(Number(e.target.value))}
                className="form-input"
                style={{ fontSize: '15px', fontWeight: 700 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Jangka Waktu (Tenor)</label>
              <select
                value={applyTenor}
                onChange={(e) => setApplyTenor(Number(e.target.value))}
                className="form-input"
              >
                <option value={6}>6 Bulan</option>
                <option value={12}>12 Bulan (1 Tahun)</option>
                <option value={18}>18 Bulan</option>
                <option value={24}>24 Bulan (2 Tahun)</option>
                <option value={36}>36 Bulan (3 Tahun)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tujuan Pengajuan Pinjaman</label>
              <textarea
                required
                rows={2}
                placeholder="Contoh: Tambahan modal usaha warung / renovasi atap rumah"
                value={applyPurpose}
                onChange={(e) => setApplyPurpose(e.target.value)}
                className="form-input"
                style={{ resize: 'none' }}
              />
            </div>

            <div className="modal-actions" style={{ marginTop: '10px' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowApplyModal(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                Kirim Pengajuan
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
