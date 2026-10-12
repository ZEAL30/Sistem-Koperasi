import { useState, useEffect } from 'react';
import { Navbar, type ActiveTab } from './components/Navbar';
import { AuthView } from './components/AuthView';
import { OverviewView } from './components/OverviewView';
import { SavingsView } from './components/SavingsView';
import { LoansView } from './components/LoansView';
import { CashflowView } from './components/CashflowView';
import { ShuView } from './components/ShuView';
import { AdminView } from './components/AdminView';
import { SettingsView } from './components/SettingsView';
import { 
  initialSavings, 
  initialLoans, 
  initialCashflow, 
  initialShu 
} from './data/mockData';
import type { User, SavingsSummary, LoanItem, CashflowTransaction, ShuProjection } from './types';
import { hasPermission } from './types';
import { LogOut } from 'lucide-react';
import { apiService } from './services/api';
import { Modal, Button, LoadingSpinner } from './components/ui';

export function App() {
  // Session & Auth state: Ambil sesi tersimpan dari localStorage agar tidak kembali ke login saat reload
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('smart_koperasi_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    try {
      const savedTab = localStorage.getItem('smart_koperasi_tab') as ActiveTab | null;
      if (savedTab) return savedTab;
      const savedUser = localStorage.getItem('smart_koperasi_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        return hasPermission(user.role, 'view:admin_members') ? 'admin' : 'overview';
      }
    } catch {}
    return 'overview';
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Simpan perubahan tab ke localStorage
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    localStorage.setItem('smart_koperasi_tab', tab);
  };

  // Business entities state (Terhubung langsung dan dimuat dari database PostgreSQL zeal)
  const [savings, setSavings] = useState<SavingsSummary>(initialSavings);
  const [loans, setLoans] = useState<LoanItem[]>(initialLoans);
  const [cashflow, setCashflow] = useState<CashflowTransaction[]>(initialCashflow);
  const [shu, setShu] = useState<ShuProjection>(initialShu);

  // Fungsi memuat data real-time dari PostgreSQL 'zeal' saat user login
  const loadDatabaseData = async (userId: string) => {
    setIsLoading(true);
    try {
      const [resSavings, resLoans, resCashflow, resShu] = await Promise.allSettled([
        apiService.getSavings(userId),
        apiService.getLoans(userId),
        apiService.getCashflow(userId),
        apiService.getShu(userId)
      ]);
      if (resSavings.status === 'fulfilled') setSavings(resSavings.value);
      if (resLoans.status === 'fulfilled') setLoans(resLoans.value);
      if (resCashflow.status === 'fulfilled') setCashflow(resCashflow.value);
      if (resShu.status === 'fulfilled') setShu(resShu.value);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadDatabaseData(currentUser.id);
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('smart_koperasi_user', JSON.stringify(user));
    // Admin/Pengurus langsung ke panel admin, member ke overview
    const defaultTab: ActiveTab = hasPermission(user.role, 'view:admin_members') ? 'admin' : 'overview';
    setActiveTab(defaultTab);
    localStorage.setItem('smart_koperasi_tab', defaultTab);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('smart_koperasi_user');
    localStorage.removeItem('smart_koperasi_tab');
    setCurrentUser(null);
    setShowLogoutModal(false);
    // Reset data saat logout
    setSavings(initialSavings);
    setLoans(initialLoans);
    setCashflow(initialCashflow);
    setShu(initialShu);
  };

  // Transaction Handlers yang langsung menyimpan & sinkron ke PostgreSQL 'zeal' (spesifik user)
  const handleDepositSuccess = async (amount: number, category: 'wajib' | 'sukarela') => {
    if (!currentUser) return;
    try {
      await apiService.depositSavings(amount, category, currentUser.id);
      // Reload saldo dan cashflow terbaru khusus user ini
      const [updatedSavings, updatedCashflow] = await Promise.all([
        apiService.getSavings(currentUser.id),
        apiService.getCashflow(currentUser.id)
      ]);
      setSavings(updatedSavings);
      setCashflow(updatedCashflow);
    } catch (err: any) {
      alert(`Gagal menyimpan setoran ke database: ${err.message}`);
    }
  };

  const handleAddLoan = async (newLoan: LoanItem) => {
    if (!currentUser) return;
    try {
      await apiService.applyLoan({
        amount: newLoan.amount,
        tenorMonths: newLoan.tenorMonths,
        interestRate: newLoan.interestRate,
        interestType: newLoan.interestType,
        monthlyInstallment: newLoan.monthlyInstallment,
        purpose: newLoan.purpose,
        userId: currentUser.id
      });
      // Refresh daftar pinjaman khusus user ini
      const updatedLoans = await apiService.getLoans(currentUser.id);
      setLoans(updatedLoans);
    } catch (err: any) {
      alert(`Gagal menyimpan pengajuan pinjaman ke database: ${err.message}`);
    }
  };

  const handleCancelLoan = async (loanId: string) => {
    if (!currentUser) return;
    if (confirm('Apakah Anda yakin ingin membatalkan draf pengajuan pinjaman ini?')) {
      try {
        await apiService.cancelLoan(loanId);
        const updatedLoans = await apiService.getLoans(currentUser.id);
        setLoans(updatedLoans);
      } catch (err: any) {
        alert(`Gagal membatalkan pinjaman: ${err.message}`);
      }
    }
  };

  // Jika belum login, tampilkan Auth View
  if (!currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell">
      
      {/* App Shell Navigation */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onRequestLogout={() => setShowLogoutModal(true)}
      />

      {/* Main Content Area */}
      <main className="app-main">
        {isLoading ? (
          <LoadingSpinner text="Memuat data koperasi langsung dari PostgreSQL..." />
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewView
                savings={savings}
                loans={loans}
                shu={shu}
                cashflow={cashflow}
                onNavigateTab={handleTabChange}
              />
            )}

            {activeTab === 'savings' && (
              <SavingsView
                savings={savings}
                cashflow={cashflow}
                onDepositSuccess={handleDepositSuccess}
              />
            )}

            {activeTab === 'loans' && (
              <LoansView
                user={currentUser}
                loans={loans}
                onAddLoan={handleAddLoan}
                onCancelLoan={handleCancelLoan}
              />
            )}

            {activeTab === 'cashflow' && (
              <CashflowView cashflow={cashflow} />
            )}

            {activeTab === 'shu' && (
              <ShuView shu={shu} savings={savings} loans={loans} />
            )}

            {/* Admin Panel — hanya tersedia untuk admin & pengurus */}
            {activeTab === 'admin' && hasPermission(currentUser.role, 'view:admin_members') && (
              <AdminView currentUser={currentUser} />
            )}

            {/* Menu Pengaturan Akun & Profil */}
            {activeTab === 'settings' && (
              <SettingsView 
                user={currentUser} 
                onUpdateUser={(updated) => {
                  setCurrentUser(updated);
                  localStorage.setItem('smart_koperasi_user', JSON.stringify(updated));
                }} 
              />
            )}

            {/* Fallback: akses tidak diizinkan */}
            {activeTab === 'admin' && !hasPermission(currentUser.role, 'view:admin_members') && (
              <div style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', 
                justifyContent: 'center', minHeight: '400px', gap: '16px', 
                color: 'var(--text-muted)', textAlign: 'center' 
              }}>
                <div style={{ fontSize: '48px' }}>🔒</div>
                <h3 style={{ color: 'var(--text-main)', margin: 0 }}>Akses Ditolak</h3>
                <p style={{ maxWidth: '360px', lineHeight: 1.6 }}>
                  Panel Admin hanya dapat diakses oleh Pengurus atau Administrator koperasi.
                </p>
                <Button variant="outline" onClick={() => setActiveTab('overview')}>
                  Kembali ke Ringkasan
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer Berstandar Enterprise */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div>
            <strong>Smart Koperasi v1.0.0</strong> — Terhubung ke Database PostgreSQL 'zeal'
          </div>
          <div className="footer-credits">
            <span>Ketua Proyek: Rayhan Setya</span>
            <span>Frontend: Fauzan Mukhlish</span>
            <span>Backend: Ghania Syafika</span>
            <span>QA: Fitri Choirun Nisa</span>
          </div>
        </div>
      </footer>

      {/* Modal Konfirmasi Logout */}
      {showLogoutModal && (
        <Modal size="sm" onClose={() => setShowLogoutModal(false)}>
          <div className="modal-icon modal-icon-danger">
            <LogOut size={24} />
          </div>
          <h3 className="modal-title">
            Konfirmasi Keluar Sesi
          </h3>
          <p className="modal-desc">
            Apakah Anda yakin ingin keluar dari sesi portal Smart Koperasi? Token otentikasi akan dibersihkan secara aman.
          </p>
          <div className="modal-actions">
            <Button
              variant="outline"
              onClick={() => setShowLogoutModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmLogout}
            >
              Ya, Keluar
            </Button>
          </div>
        </Modal>
      )}

    </div>
  );
}

export default App;


