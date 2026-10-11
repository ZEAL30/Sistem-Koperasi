import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Search,
  RefreshCw,
  Shield,
  UserCheck,
  FileText,
  BarChart3,
  BookOpen,
  CreditCard,
  Wallet,
  ChevronDown,
  Eye,
  UserPlus,
  Download,
} from 'lucide-react';
import type { User, AdminMember, LoanItem, CashflowTransaction, GlobalReport, UserRole } from '../types';
import { hasPermission } from '../types';
import { Card, Badge, Button } from './ui';
import { apiService } from '../services/api';
import { formatRupiah } from '../data/mockData';

type AdminTab = 'members' | 'loans' | 'cashflow' | 'reports';

interface AdminViewProps {
  currentUser: User;
}

function getRoleBadgeVariant(role: UserRole): 'success' | 'warning' | 'info' {
  if (role === 'admin') return 'success';
  if (role === 'pengurus') return 'warning';
  return 'info';
}

function getRoleLabel(role: UserRole): string {
  if (role === 'admin') return 'Admin';
  if (role === 'pengurus') return 'Pengurus';
  return 'Anggota';
}

function getStatusBadgeVariant(status: string): 'success' | 'danger' | 'warning' {
  if (status === 'active' || status === 'Aktif') return 'success';
  if (status === 'inactive' || status === 'Nonaktif') return 'danger';
  return 'warning';
}

export const AdminView: React.FC<AdminViewProps> = ({ currentUser }) => {
  const [adminTab, setAdminTab] = useState<AdminTab>('members');
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [allLoans, setAllLoans] = useState<LoanItem[]>([]);
  const [allCashflow, setAllCashflow] = useState<CashflowTransaction[]>([]);
  const [globalReport, setGlobalReport] = useState<GlobalReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loanFilter, setLoanFilter] = useState<string>('all');

  const canApproveLoans = hasPermission(currentUser.role, 'action:approve_loan');
  const canManageMembers = hasPermission(currentUser.role, 'action:manage_members');
  const canManageShu = hasPermission(currentUser.role, 'action:manage_shu');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [membersRes, loansRes, cashflowRes, reportRes] = await Promise.allSettled([
        apiService.getAdminMembers(),
        apiService.getAllLoans(),
        apiService.getAllCashflow(),
        apiService.getGlobalReport(),
      ]);
      if (membersRes.status === 'fulfilled') setMembers(membersRes.value);
      if (loansRes.status === 'fulfilled') setAllLoans(loansRes.value);
      if (cashflowRes.status === 'fulfilled') setAllCashflow(cashflowRes.value);
      if (reportRes.status === 'fulfilled') setGlobalReport(reportRes.value);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApproveLoan = async (loanId: string, action: 'approve' | 'reject') => {
    try {
      await apiService.updateLoanStatus(loanId, action === 'approve' ? 'disetujui' : 'ditolak');
      const updated = await apiService.getAllLoans();
      setAllLoans(updated);
    } catch (err: any) {
      alert(`Gagal memperbarui status pinjaman: ${err.message}`);
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.memberNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLoans = allLoans.filter(l =>
    loanFilter === 'all' ? true : l.status.toLowerCase().includes(loanFilter.toLowerCase())
  );

  const pendingLoans = allLoans.filter(l =>
    l.status === 'Verifikasi Analis' || l.status === 'review_analis'
  );

  return (
    <div className="fade-in flex-col-gap">

      {/* Admin Header Banner */}
      <Card variant="admin" className="scale-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Badge variant="admin-badge" icon={<Shield size={12} />} style={{ marginBottom: '10px' }}>
              {currentUser.role === 'admin' ? 'PANEL ADMINISTRATOR SISTEM' : 'PANEL PENGURUS KOPERASI'}
            </Badge>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 6px', color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              Manajemen & Operasional Koperasi
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', maxWidth: '560px', lineHeight: 1.5 }}>
              Kelola seluruh anggota, proses persetujuan pinjaman, dan pantau arus kas koperasi secara real-time.
              {pendingLoans.length > 0 && (
                <span style={{ color: '#FCD34D', fontWeight: 700 }}>
                  {' '}⚠ {pendingLoans.length} pinjaman menunggu persetujuan.
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="md"
              icon={<RefreshCw size={15} />}
              onClick={loadData}
              disabled={isLoading}
            >
              {isLoading ? 'Memuat...' : 'Refresh Data'}
            </Button>
            {canManageMembers && (
              <Button
                variant="outline"
                size="md"
                icon={<UserPlus size={15} />}
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                onClick={() => alert('Fitur tambah anggota tersedia di modul registrasi')}
              >
                Tambah Anggota
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Sub-Tab Navigation */}
      <div className="admin-tab-nav">
        <button
          className={`admin-tab-btn ${adminTab === 'members' ? 'active' : ''}`}
          onClick={() => setAdminTab('members')}
        >
          <Users size={16} /> Manajemen Anggota
          <span className="admin-tab-count">{members.length}</span>
        </button>
        {hasPermission(currentUser.role, 'view:admin_loans') && (
          <button
            className={`admin-tab-btn ${adminTab === 'loans' ? 'active' : ''}`}
            onClick={() => setAdminTab('loans')}
          >
            <CreditCard size={16} /> Persetujuan Pinjaman
            {pendingLoans.length > 0 && (
              <span className="admin-tab-count admin-tab-count-urgent">{pendingLoans.length}</span>
            )}
          </button>
        )}
        {hasPermission(currentUser.role, 'view:admin_cashflow') && (
          <button
            className={`admin-tab-btn ${adminTab === 'cashflow' ? 'active' : ''}`}
            onClick={() => setAdminTab('cashflow')}
          >
            <BookOpen size={16} /> Buku Kas Global
          </button>
        )}
        {hasPermission(currentUser.role, 'view:admin_reports') && (
          <button
            className={`admin-tab-btn ${adminTab === 'reports' ? 'active' : ''}`}
            onClick={() => setAdminTab('reports')}
          >
            <BarChart3 size={16} /> Laporan Keuangan
          </button>
        )}
      </div>

      {/* MEMBERS TAB */}
      {adminTab === 'members' && (
        <div className="flex-col-gap">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ flex: 1, minWidth: '240px' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Cari anggota (nama, email, nomor)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="admin-stats-row">
              <div className="admin-stat-chip admin-stat-chip-green">
                <UserCheck size={14} /> {members.filter(m => m.membershipStatus === 'active' || m.membershipStatus === 'Aktif').length} Aktif
              </div>
              <div className="admin-stat-chip admin-stat-chip-amber">
                <Clock size={14} /> {members.filter(m => m.membershipStatus === 'pending').length} Pending
              </div>
              <div className="admin-stat-chip admin-stat-chip-blue">
                <Users size={14} /> {members.length} Total
              </div>
            </div>
          </div>

          <Card noPadding>
            <div className="card-header">
              <div>
                <h3 className="card-header-title">Daftar Anggota Koperasi</h3>
                <div className="card-header-sub">Semua data anggota terdaftar di sistem</div>
              </div>
              <Button variant="outline" size="sm" icon={<Download size={14} />}>Ekspor CSV</Button>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Anggota</th>
                    <th>No. Anggota</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Skor Kredit</th>
                    <th>Total Simpanan</th>
                    <th>Pinjaman Aktif</th>
                    <th>Bergabung</th>
                    {canManageMembers && <th>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={canManageMembers ? 9 : 8} className="table-empty-row">
                        {isLoading ? 'Memuat data anggota...' : 'Belum ada anggota terdaftar'}
                      </td>
                    </tr>
                  ) : filteredMembers.map((m) => (
                    <tr key={m.id} className="admin-table-row">
                      <td>
                        <div className="admin-member-cell">
                          <div className="admin-member-avatar">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="admin-member-name">{m.name}</div>
                            <div className="admin-member-email">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><code className="member-number-code">{m.memberNumber}</code></td>
                      <td><Badge variant={getRoleBadgeVariant(m.role)}>{getRoleLabel(m.role)}</Badge></td>
                      <td>
                        <Badge variant={getStatusBadgeVariant(m.membershipStatus)}>
                          {m.membershipStatus === 'active' ? 'Aktif' : m.membershipStatus}
                        </Badge>
                      </td>
                      <td>
                        <span className="credit-score-pill">
                          {String(m.creditScore).replace(/_/g, ' ').replace('prima a plus', 'Prima A+')}
                        </span>
                      </td>
                      <td className="amount-cell">{formatRupiah(m.totalSavings || 0)}</td>
                      <td>
                        <span className={m.activeLoans > 0 ? 'loans-count-active' : 'loans-count-zero'}>
                          {m.activeLoans}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.joinDate}</td>
                      {canManageMembers && (
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="action-btn action-btn-view" title="Lihat Detail"><Eye size={13} /></button>
                            <button className="action-btn action-btn-edit" title="Edit Anggota"><FileText size={13} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* LOANS APPROVAL TAB */}
      {adminTab === 'loans' && hasPermission(currentUser.role, 'view:admin_loans') && (
        <div className="flex-col-gap">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'Semua', count: allLoans.length },
              { key: 'verifikasi', label: '⏳ Menunggu', count: allLoans.filter(l => l.status.toLowerCase().includes('verifikasi') || l.status.toLowerCase().includes('review')).length },
              { key: 'disetujui', label: '✅ Disetujui', count: allLoans.filter(l => l.status.toLowerCase().includes('disetujui')).length },
              { key: 'ditolak', label: '❌ Ditolak', count: allLoans.filter(l => l.status.toLowerCase().includes('ditolak')).length },
            ].map(f => (
              <button key={f.key} className={`filter-chip ${loanFilter === f.key ? 'active' : ''}`} onClick={() => setLoanFilter(f.key)}>
                {f.label} <span className="filter-chip-count">{f.count}</span>
              </button>
            ))}
          </div>

          <Card noPadding>
            <div className="card-header">
              <div>
                <h3 className="card-header-title">Manajemen Persetujuan Pinjaman</h3>
                <div className="card-header-sub">Review dan proses pengajuan pinjaman anggota</div>
              </div>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No. Pinjaman</th>
                    <th>Anggota</th>
                    <th>Jumlah</th>
                    <th>Tenor</th>
                    <th>Tujuan</th>
                    <th>Tgl Pengajuan</th>
                    <th>Status</th>
                    {canApproveLoans && <th>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={canApproveLoans ? 8 : 7} className="table-empty-row">
                        {isLoading ? 'Memuat data pinjaman...' : 'Tidak ada data pinjaman'}
                      </td>
                    </tr>
                  ) : filteredLoans.map((loan) => {
                    const isPending = loan.status === 'Verifikasi Analis' || (loan.status as string) === 'review_analis';
                    return (
                      <tr key={loan.id} className={`admin-table-row ${isPending ? 'row-highlight-pending' : ''}`}>
                        <td><code className="member-number-code">{loan.loanNumber}</code></td>
                        <td style={{ fontSize: '13px', fontWeight: 600 }}>{loan.memberName || '—'}</td>
                        <td className="amount-cell">{formatRupiah(loan.amount)}</td>
                        <td style={{ fontSize: '13px' }}>{loan.tenorMonths} bln</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '160px' }}>
                          <span style={{ display: '-webkit-box', overflow: 'hidden', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {loan.purpose}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{loan.dateApplied}</td>
                        <td>
                          <Badge variant={
                            loan.status === 'Disetujui' ? 'success'
                              : loan.status === 'Ditolak' ? 'danger'
                              : 'warning'
                          }>
                            {isPending ? '⏳ Menunggu' : loan.status}
                          </Badge>
                        </td>
                        {canApproveLoans && (
                          <td>
                            {isPending ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button className="action-btn action-btn-approve" onClick={() => handleApproveLoan(loan.id, 'approve')}>
                                  <CheckCircle size={13} /> Setujui
                                </button>
                                <button className="action-btn action-btn-reject" onClick={() => handleApproveLoan(loan.id, 'reject')}>
                                  <XCircle size={13} /> Tolak
                                </button>
                              </div>
                            ) : <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* GLOBAL CASHFLOW TAB */}
      {adminTab === 'cashflow' && hasPermission(currentUser.role, 'view:admin_cashflow') && (
        <Card noPadding>
          <div className="card-header">
            <div>
              <h3 className="card-header-title">Buku Kas Global Koperasi</h3>
              <div className="card-header-sub">Seluruh mutasi kas dari semua anggota</div>
            </div>
            <Button variant="outline" size="sm" icon={<Download size={14} />}>Ekspor Jurnal</Button>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tanggal</th><th>Anggota</th><th>Tipe</th><th>Kategori</th>
                  <th>Jumlah</th><th>Referensi</th><th>Keterangan</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allCashflow.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="table-empty-row">
                      {isLoading ? 'Memuat jurnal kas...' : 'Belum ada transaksi kas'}
                    </td>
                  </tr>
                ) : allCashflow.map((t) => (
                  <tr key={t.id} className="admin-table-row">
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t.date}</td>
                    <td style={{ fontSize: '12px', fontWeight: 600 }}>{t.memberName || '—'}</td>
                    <td>
                      <div className={`flow-type-chip ${t.type === 'masuk' ? 'flow-in' : 'flow-out'}`}>
                        {t.type === 'masuk' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {t.type === 'masuk' ? 'Masuk' : 'Keluar'}
                      </div>
                    </td>
                    <td style={{ fontSize: '12px' }}>{t.category}</td>
                    <td className={`amount-cell ${t.type === 'masuk' ? 'amount-in' : 'amount-out'}`}>
                      {t.type === 'masuk' ? '+' : '-'}{formatRupiah(t.amount)}
                    </td>
                    <td><code style={{ fontSize: '11px' }}>{t.referenceNo}</code></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '180px' }}>{t.description}</td>
                    <td><Badge variant="success">{t.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* REPORTS TAB */}
      {adminTab === 'reports' && hasPermission(currentUser.role, 'view:admin_reports') && (
        <div className="flex-col-gap">
          {globalReport ? (
            <>
              <div className="grid-3 stagger">
                <Card className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Total Anggota Aktif</span>
                    <div className="metric-icon metric-icon-blue"><Users size={20} /></div>
                  </div>
                  <div className="metric-value metric-value-blue">{globalReport.activeMembers}</div>
                  <div className="metric-footer">
                    <span>Dari <strong>{globalReport.totalMembers}</strong> anggota terdaftar</span>
                  </div>
                </Card>
                <Card className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Total Simpanan Koperasi</span>
                    <div className="metric-icon metric-icon-emerald"><Wallet size={20} /></div>
                  </div>
                  <div className="metric-value metric-value-emerald">{formatRupiah(globalReport.totalSavings)}</div>
                  <div className="metric-footer"><span>Agregat seluruh rekening simpanan</span></div>
                </Card>
                <Card className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Total Pinjaman Beredar</span>
                    <div className="metric-icon metric-icon-amber"><CreditCard size={20} /></div>
                  </div>
                  <div className="metric-value metric-value-dark">{formatRupiah(globalReport.totalLoansOutstanding)}</div>
                  <div className="metric-footer"><span>Saldo pokok pinjaman aktif</span></div>
                </Card>
              </div>
              <div className="grid-2">
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div className="metric-icon metric-icon-emerald" style={{ width: '36px', height: '36px' }}><TrendingUp size={18} /></div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Kas Masuk Bulan Ini</div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--success)' }}>+{formatRupiah(globalReport.totalCashInMonth)}</div>
                    </div>
                  </div>
                  <div className="info-box">
                    <div className="info-row"><span>Setoran Simpanan</span><strong>{formatRupiah(Math.round(globalReport.totalCashInMonth * 0.7))}</strong></div>
                    <div className="info-row"><span>Angsuran Diterima</span><strong>{formatRupiah(Math.round(globalReport.totalCashInMonth * 0.3))}</strong></div>
                  </div>
                </Card>
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div className="metric-icon metric-icon-amber" style={{ width: '36px', height: '36px' }}><TrendingDown size={18} /></div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Kas Keluar Bulan Ini</div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--danger)' }}>-{formatRupiah(globalReport.totalCashOutMonth)}</div>
                    </div>
                  </div>
                  <div className="info-box">
                    <div className="info-row"><span>Pencairan Pinjaman</span><strong>{formatRupiah(Math.round(globalReport.totalCashOutMonth * 0.8))}</strong></div>
                    <div className="info-row"><span>Biaya Operasional</span><strong>{formatRupiah(Math.round(globalReport.totalCashOutMonth * 0.2))}</strong></div>
                  </div>
                </Card>
              </div>
              {canManageShu && (
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <AlertTriangle size={18} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Manajemen Periode SHU</h3>
                    <Badge variant="gold">Admin Only</Badge>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
                    Konfigurasi parameter distribusi SHU untuk periode fiskal berjalan. Perubahan akan mempengaruhi estimasi SHU seluruh anggota.
                  </p>
                  <Button variant="primary" icon={<ChevronDown size={15} />} onClick={() => alert('Panel konfigurasi SHU — fitur eksklusif Admin')}>
                    Konfigurasi Distribusi SHU {new Date().getFullYear()}
                  </Button>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <div className="table-empty-row">{isLoading ? 'Memuat laporan...' : 'Data laporan belum tersedia'}</div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
