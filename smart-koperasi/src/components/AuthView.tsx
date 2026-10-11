import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  UserCheck, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  User,
  Phone,
  CreditCard,
  Headphones,
  Award,
  Sparkles,
  FileText,
  Smartphone,
  Check,
  KeyRound,
  ExternalLink,
  Shield,
  HelpCircle,
  X
} from 'lucide-react';
import type { User as UserType } from '../types';
import { apiService } from '../services/api';

interface AuthModalProps {
  onLoginSuccess: (user: UserType) => void;
}

type AuthMode = 'login' | 'register' | 'recovery';
type RecoveryStep = 1 | 2 | 3;

export const AuthView: React.FC<AuthModalProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  
  // Login form state
  const [emailOrMemberId, setEmailOrMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regNik, setRegNik] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regShowConfirmPassword, setRegShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState('');

  // Password Recovery state
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryNia, setRecoveryNia] = useState('');
  const [otpCodes, setOtpCodes] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(65);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logoutAllSessions, setLogoutAllSessions] = useState(true);
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState('');
  const [verifiedUser, setVerifiedUser] = useState<{
    id: string;
    name: string;
    email: string;
    memberNumber: string;
    phone: string;
    maskedPhone: string;
  } | null>(null);

  // Help Modal state
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP inputs refs for auto focus
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP
  useEffect(() => {
    let interval: any = null;
    if (mode === 'recovery' && recoveryStep === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, recoveryStep, otpTimer]);

  // Format OTP timer MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const regPassScore = getPasswordStrength(regPassword);
  const newPassScore = getPasswordStrength(newPassword);

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return 'Lemah';
    if (score <= 2) return 'Sedang';
    if (score === 3) return 'Kuat (Strong)';
    return 'Sangat Kuat (Very Strong)';
  };

  // Handle Role Change
  const handleRoleChange = (newRole: 'member' | 'admin') => {
    setRole(newRole);
    setErrorMessage('');
  };

  // Quick Demo fill
  const handleQuickDemoFill = () => {
    if (role === 'admin') {
      setEmailOrMemberId('rayhan.setya@koperasi.id');
    } else {
      setEmailOrMemberId('budi.santoso@koperasi.id');
    }
    setPassword('Rahasia123!');
    setErrorMessage('');
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setErrorMessage('Keamanan terpicu: Akun terkunci sementara karena 5x kegagalan input berurutan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await apiService.login(emailOrMemberId, password, role);
      if (response.success && response.user) {
        onLoginSuccess(response.user);
      }
    } catch (err: any) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 5) {
        setIsLocked(true);
        setErrorMessage('Keamanan terpicu: Akun Anda dikunci sementara setelah 5 kali gagal.');
      } else {
        setErrorMessage(err.message || `Identitas atau kata sandi salah. Percobaan: ${nextFailed}/5`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regNik.length !== 16 || !/^\d+$/.test(regNik)) {
      setErrorMessage('NIK wajib tepat 16 digit angka sesuai KTP.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('Anda harus menyetujui seluruh ketentuan AD/ART Smart Koperasi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await apiService.register({
        name: regName,
        nik: regNik,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        role: 'member'
      });
      if (response.success) {
        setRegisterSuccessMsg(`Pendaftaran berhasil! Akun Anda terdaftar dengan No. Anggota: ${response.user.memberNumber}. Mengalihkan ke login...`);
        setTimeout(() => {
          setEmailOrMemberId(regEmail);
          setMode('login');
          setRegisterSuccessMsg('');
        }, 2500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan pendaftaran ke database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP Inputs
  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 1) {
      // Paste handling
      const digits = cleaned.slice(0, 6).split('');
      const newArr = [...otpCodes];
      digits.forEach((d, i) => {
        if (i < 6) newArr[i] = d;
      });
      setOtpCodes(newArr);
      const nextIdx = Math.min(digits.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    const newArr = [...otpCodes];
    newArr[index] = cleaned;
    setOtpCodes(newArr);

    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCodes[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Recovery Step 1 -> 2: Kirim Kode OTP via API
  const handleSendRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = (recoveryEmail || recoveryNia).trim();
    if (!identifier) {
      setErrorMessage('Masukkan email terdaftar atau Nomor Induk Anggota (NIA).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await apiService.sendRecoveryOtp(identifier);
      if (res.success && res.user) {
        setVerifiedUser(res.user);
        setRecoveryStep(2);
        setOtpTimer(65);
        setOtpCodes(['', '', '', '', '', '']);
        // Tampilkan kode demo jika ada untuk kemudahan pengujian
        if (res.demoCode) {
          setRecoverySuccessMsg(`Kode OTP dikirim! (Kode Verifikasi: ${res.demoCode})`);
          setTimeout(() => setRecoverySuccessMsg(''), 6000);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Akun tidak ditemukan. Silakan periksa email atau NIA Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    const identifier = verifiedUser?.email || verifiedUser?.memberNumber || recoveryEmail || recoveryNia;
    if (!identifier) return;
    try {
      const res = await apiService.sendRecoveryOtp(identifier);
      setOtpTimer(65);
      setOtpCodes(['', '', '', '', '', '']);
      if (res.demoCode) {
        setRecoverySuccessMsg(`Kode OTP baru telah dikirim! (Kode: ${res.demoCode})`);
        setTimeout(() => setRecoverySuccessMsg(''), 6000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengirim ulang kode OTP.');
    }
  };

  // Recovery Step 2 -> 3: Verifikasi OTP via API
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otpCodes.join('');
    if (token.length < 6) {
      setErrorMessage('Masukkan 6-digit kode OTP dengan lengkap.');
      return;
    }

    const identifier = verifiedUser?.email || verifiedUser?.memberNumber || recoveryEmail || recoveryNia;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await apiService.verifyRecoveryOtp(identifier, token);
      if (res.success) {
        setRecoveryStep(3);
        setErrorMessage('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Kode OTP tidak cocok atau kedaluwarsa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recovery Step 3 -> Reset Finished & Update Password ke Database PostgreSQL
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMessage('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    const identifier = verifiedUser?.email || verifiedUser?.memberNumber || recoveryEmail || recoveryNia;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await apiService.resetPassword(identifier, newPassword, logoutAllSessions);
      if (res.success) {
        setRecoverySuccessMsg('Kata sandi berhasil disimpan ke database! Mengalihkan ke login...');
        setTimeout(() => {
          setPassword('');
          setEmailOrMemberId(verifiedUser?.email || recoveryEmail);
          setMode('login');
          setRecoveryStep(1);
          setRecoverySuccessMsg('');
        }, 2200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui kata sandi di database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. LOGIN SCREEN (SPLIT SCREEN LAYOUT)
      ───────────────────────────────────────────────────────────── */}
      {mode === 'login' && (
        <div className="auth-split-layout">
          {/* Left Emerald Hero Panel */}
          <div className="auth-hero-panel">
            <div className="auth-hero-bg-overlay" />
            <div className="auth-hero-content">
              {/* Brand Pill at Top */}
              <div className="hero-brand-pill">
                <div className="hero-brand-logo-area">
                  <div className="hero-brand-icon-box">
                    <Building2 size={16} />
                  </div>
                  <span className="hero-brand-text">Smart Koperasi</span>
                </div>
                <div className="hero-brand-divider" />
                <span className="hero-brand-ecosystem-tag">Ekosistem Koperasi Digital</span>
              </div>

              {/* Main Intro in Middle */}
              <div className="hero-main-intro">
                <div className="hero-tag-badge">
                  <span className="hero-green-dot" />
                  <span>Platform Finansial Generasi Baru</span>
                </div>

                <h1 className="hero-heading">
                  Transformasi Digital Koperasi Modern & Terpercaya
                </h1>

                <p className="hero-description">
                  Kelola tabungan, pengajuan pinjaman amanah, dan kalkulasi dividen SHU secara instan dengan tata kelola transparan.
                </p>

                {/* 3 Value Propositions */}
                <div className="hero-feature-list">
                  <div className="hero-feature-item">
                    <div className="hero-feature-icon">
                      <FileText size={18} />
                    </div>
                    <span className="hero-feature-text">
                      Transparansi Dana Simpan Pinjam Real-time
                    </span>
                  </div>

                  <div className="hero-feature-item">
                    <div className="hero-feature-icon">
                      <ShieldCheck size={18} />
                    </div>
                    <span className="hero-feature-text">
                      Otentikasi Berlapis & Terenkripsi Standar Kemenkop UKM
                    </span>
                  </div>

                  <div className="hero-feature-item">
                    <div className="hero-feature-icon">
                      <Sparkles size={18} />
                    </div>
                    <span className="hero-feature-text">
                      Estimasi SHU & Pembukuan Otomatis
                    </span>
                  </div>
                </div>

                {/* Social Proof Bar */}
                <div className="hero-social-proof-card">
                  <div className="social-proof-left">
                    <div className="social-award-icon">
                      <Award size={22} />
                    </div>
                    <div>
                      <div className="social-stat-title-row">
                        <span className="social-stat-title">99.8% Kepuasan Anggota</span>
                        <span className="social-badge-verified">Terakreditasi</span>
                      </div>
                      <div className="social-stat-desc">
                        12,000+ Transaksi Finansial Terverifikasi & Aman
                      </div>
                    </div>
                  </div>

                  {/* Avatars Cluster */}
                  <div className="social-avatar-stack">
                    <div className="avatar-initial-circle" style={{ background: '#0D9488' }}>AK</div>
                    <div className="avatar-initial-circle" style={{ background: '#F59E0B' }}>BP</div>
                    <div className="avatar-initial-circle" style={{ background: '#0284C7' }}>MN</div>
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="hero-copyright">
                © 2025 Smart Koperasi Indonesia. Seluruh hak cipta dilindungi undang-undang.
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="auth-form-panel">
            {/* Top Bar with Support Button */}
            <div className="auth-form-top-bar">
              <button 
                type="button" 
                onClick={() => setShowHelpModal(true)}
                className="support-pill-btn"
              >
                <Headphones size={15} color="#004132" />
                <span>Butuh Bantuan? <strong>Hubungi Pengurus</strong></span>
              </button>
            </div>

            {/* Form Inner Content */}
            <div className="auth-form-inner">
              <div>
                <h2 className="auth-title-large">Selamat Datang Kembali 👋</h2>
                <p className="auth-subtitle-soft">
                  Masuk ke portal anggota dan pengurus Smart Koperasi.
                </p>
              </div>

              {/* Feedback Alert */}
              {errorMessage && (
                <div className="alert alert-error">
                  <AlertCircle size={18} className="alert-icon" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {registerSuccessMsg && (
                <div className="alert alert-success">
                  <CheckCircle2 size={18} className="alert-icon" />
                  <span>{registerSuccessMsg}</span>
                </div>
              )}

              {recoverySuccessMsg && (
                <div className="alert alert-success">
                  <CheckCircle2 size={18} className="alert-icon" />
                  <span>{recoverySuccessMsg}</span>
                </div>
              )}

              {/* Role Switcher Tabs */}
              <div className="auth-role-tabs">
                <button
                  type="button"
                  onClick={() => handleRoleChange('member')}
                  className={`auth-role-tab ${role === 'member' ? 'active' : ''}`}
                >
                  <UserCheck size={16} />
                  <span>Anggota Koperasi</span>
                  <span className="role-personal-badge">Personal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`auth-role-tab ${role === 'admin' ? 'active' : ''}`}
                >
                  <ShieldCheck size={16} />
                  <span>Pengurus / Admin</span>
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Email / NIA Field */}
                <div className="modern-input-group">
                  <div className="modern-input-header">
                    <label className="modern-label">
                      Email atau Nomor Anggota (NIA)
                    </label>
                    <span className="modern-helper-badge">Resmi Kemenkop UKM</span>
                  </div>
                  <div className="modern-input-box">
                    <User size={18} className="modern-input-icon" />
                    <input
                      type="text"
                      required
                      value={emailOrMemberId}
                      onChange={(e) => setEmailOrMemberId(e.target.value)}
                      placeholder="contoh: anggota@smartkoperasi.id atau NIA-2024098"
                      className="modern-input"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="modern-input-group">
                  <div className="modern-input-header">
                    <label className="modern-label">Kata Sandi</label>
                    <button
                      type="button"
                      onClick={() => { setMode('recovery'); setRecoveryStep(1); setErrorMessage(''); }}
                      className="modern-link"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="modern-input-box">
                    <Lock size={18} className="modern-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun Anda"
                      className="modern-input has-right-btn"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="modern-input-right-btn"
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Encryption Badge */}
                <div className="auth-options-row">
                  <label className="remember-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Ingat sesi saya selama 30 hari</span>
                  </label>

                  <div className="session-encrypted-badge">
                    <ShieldCheck size={13} />
                    <span>Sesi Terenkripsi 256-bit</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLocked || isSubmitting}
                  className="btn-auth-primary"
                >
                  {isSubmitting ? (
                    'Memverifikasi ke Database...'
                  ) : (
                    <>
                      <span>Masuk ke Akun</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                {/* Switch to Register */}
                <div className="auth-register-cta">
                  <span>Belum terdaftar sebagai anggota?</span>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setErrorMessage(''); }}
                    className="auth-register-link"
                  >
                    <span>Daftar Akun Baru</span>
                    <ExternalLink size={13} />
                  </button>
                </div>

                {/* Quick Demo Sandbox Card */}
                <div 
                  className="auth-demo-card"
                  onClick={handleQuickDemoFill}
                  title="Klik untuk mengisi data login demo otomatis"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={16} color="#D97706" />
                    <span><strong>Akses Demo Cepat:</strong> Langsung klik Masuk ke Akun</span>
                  </div>
                  <span className="demo-sandbox-tag">Sandbox v2.0</span>
                </div>
              </form>
            </div>

            {/* Security Footer */}
            <div className="auth-security-footer">
              <Shield size={14} color="#004132" />
              <span>Dilindungi Enkripsi 256-bit SSL & Standar Regulasi Kemenkop UKM RI</span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. REGISTER SCREEN (CENTERED 2-COLUMN CARD)
      ───────────────────────────────────────────────────────────── */}
      {mode === 'register' && (
        <div className="auth-centered-page">
          <div 
            className="auth-top-brand"
            onClick={() => setMode('login')}
          >
            <div className="auth-top-brand-icon">
              <Building2 size={16} />
            </div>
            <span>Smart Koperasi</span>
          </div>

          <div className="auth-centered-card card-register">
            {/* Header with rounded banner */}
            <div className="register-card-header">
              <div className="register-logo-badge">
                <Building2 size={26} />
              </div>
              <br />
              <div className="register-pill-badge">
                <ShieldCheck size={14} />
                <span>Portal Keanggotaan Resmi</span>
              </div>
              <h2 className="register-title">Pendaftaran Anggota Koperasi Baru</h2>
              <p className="register-subtitle">
                Lengkapi formulir registrasi digital sesuai KTP untuk membuka akses layanan simpan pinjam, permodalan, dan transparansi SHU.
              </p>
            </div>

            {/* Status Awal Akun Warning */}
            <div className="register-status-box">
              <AlertCircle size={20} className="status-box-icon" />
              <div>
                <div className="status-box-title-row">
                  <span>STATUS AWAL AKUN</span>
                  <span className="status-pending-pill">Pending Verification</span>
                </div>
                <div className="status-box-desc">
                  Akun Anda akan diverifikasi dan disetujui oleh Pengurus Koperasi dalam kurun waktu <strong>1x24 jam kerja</strong> sebelum aktivasi simpanan pokok.
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div style={{ margin: '0 32px 16px' }} className="alert alert-error">
                <AlertCircle size={18} className="alert-icon" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Registration Form (2 Columns) */}
            <form onSubmit={handleRegister}>
              <div className="register-grid">
                {/* Col 1 Row 1: Nama Lengkap */}
                <div className="modern-input-group">
                  <label className="modern-label">
                    Nama Lengkap (Sesuai KTP) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div className="modern-input-box">
                    <User size={18} className="modern-input-icon" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Fauzan Mukhlish"
                      className="modern-input"
                    />
                  </div>
                  <span className="input-helper-note">
                    Pastikan ejaan sesuai kartu identitas resmi.
                  </span>
                </div>

                {/* Col 2 Row 1: NIK */}
                <div className="modern-input-group">
                  <div className="modern-input-header">
                    <label className="modern-label">
                      NIK (Nomor Induk Kependudukan) <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    {regNik.length === 16 && (
                      <span className="badge-valid-ktp">
                        <Check size={13} /> Format KTP Valid
                      </span>
                    )}
                  </div>
                  <div className="modern-input-box">
                    <CreditCard size={18} className="modern-input-icon" />
                    <input
                      type="text"
                      required
                      maxLength={16}
                      value={regNik}
                      onChange={(e) => setRegNik(e.target.value.replace(/\D/g, ''))}
                      placeholder="3204281908950002"
                      className="modern-input"
                    />
                  </div>
                  <span className="input-helper-note">
                    16 digit angka sesuai KTP domisili.
                  </span>
                </div>

                {/* Col 1 Row 2: Alamat Email */}
                <div className="modern-input-group">
                  <label className="modern-label">
                    Alamat Email Aktif <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div className="modern-input-box">
                    <Mail size={18} className="modern-input-icon" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="fauzan.mukhlish@koperasi.id"
                      className="modern-input"
                    />
                  </div>
                  <span className="input-helper-note">
                    Digunakan untuk bukti transaksi & laporan buku simpanan.
                  </span>
                </div>

                {/* Col 2 Row 2: Nomor WhatsApp */}
                <div className="modern-input-group">
                  <label className="modern-label">
                    Nomor WhatsApp / Seluler <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div className="modern-input-box">
                    <Smartphone size={18} className="modern-input-icon" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+62 812-8899-2341"
                      className="modern-input"
                    />
                  </div>
                  <span className="input-helper-note">
                    Pemberitahuan OTP pendaftaran dan verifikasi pengurus.
                  </span>
                </div>

                {/* Col 1 Row 3: Kata Sandi */}
                <div className="modern-input-group">
                  <label className="modern-label">
                    Kata Sandi <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div className="modern-input-box">
                    <Lock size={18} className="modern-input-icon" />
                    <input
                      type={regShowPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="modern-input has-right-btn"
                    />
                    <button
                      type="button"
                      onClick={() => setRegShowPassword(!regShowPassword)}
                      className="modern-input-right-btn"
                    >
                      {regShowPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  <div className="password-strength-meter">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="strength-label-text">
                        Tingkat Keamanan: <span className="strength-label-val">{getStrengthLabel(regPassScore)}</span>
                      </span>
                    </div>
                    <div className="password-strength-bars">
                      <div className={`strength-seg ${regPassScore >= 1 ? 'filled-1' : ''}`} />
                      <div className={`strength-seg ${regPassScore >= 2 ? 'filled-2' : ''}`} />
                      <div className={`strength-seg ${regPassScore >= 3 ? 'filled-3' : ''}`} />
                      <div className={`strength-seg ${regPassScore >= 4 ? 'filled-4' : ''}`} />
                    </div>
                  </div>
                  <span className="input-helper-note">
                    Minimal 8 karakter: kombinasikan huruf besar, angka, dan simbol.
                  </span>
                </div>

                {/* Col 2 Row 3: Konfirmasi Kata Sandi */}
                <div className="modern-input-group">
                  <div className="modern-input-header">
                    <label className="modern-label">
                      Konfirmasi Kata Sandi <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    {regConfirmPassword && regConfirmPassword === regPassword && (
                      <span className="badge-match-pwd">
                        <Check size={13} /> Sandi Cocok
                      </span>
                    )}
                  </div>
                  <div className="modern-input-box">
                    <RefreshCw size={18} className="modern-input-icon" />
                    <input
                      type={regShowConfirmPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="modern-input has-right-btn"
                    />
                    <button
                      type="button"
                      onClick={() => setRegShowConfirmPassword(!regShowConfirmPassword)}
                      className="modern-input-right-btn"
                    >
                      {regShowConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <span className="input-helper-note">
                    Ulangi kata sandi untuk verifikasi ketepatan.
                  </span>
                </div>
              </div>

              {/* Checkbox Terms */}
              <div className="register-terms-box">
                <input
                  type="checkbox"
                  id="regTerms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <label htmlFor="regTerms">
                  Saya telah membaca, memahami, dan menyetujui seluruh ketentuan dalam{' '}
                  <a href="#ad-art" onClick={(e) => { e.preventDefault(); alert('Anggaran Dasar & Rumah Tangga (AD/ART) Koperasi Digital mengatur simpanan pokok Rp 1.000.000 (satu kali) dan simpanan wajib Rp 200.000 per bulan.'); }}>
                    Anggaran Dasar & Anggaran Rumah Tangga (AD/ART)
                  </a>{' '}
                  serta Syarat & Ketentuan Keanggotaan Smart Koperasi Digital.
                </label>
              </div>

              {/* Submit CTA & Back to Login */}
              <div className="register-action-area">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-auth-primary"
                >
                  {isSubmitting ? (
                    'Mendaftarkan Akun ke Database...'
                  ) : (
                    <>
                      <span>Daftar Akun Anggota Baru</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <div className="auth-register-cta">
                  <span>Sudah memiliki akun?</span>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMessage(''); }}
                    className="auth-register-link"
                  >
                    <span>Masuk ke Akun Sekarang</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. RECOVERY FLOW (3-STEP PROGRESS SCREEN)
      ───────────────────────────────────────────────────────────── */}
      {mode === 'recovery' && (
        <div className="auth-centered-page">
          <div 
            className="auth-top-brand"
            onClick={() => setMode('login')}
          >
            <div className="auth-top-brand-icon">
              <Building2 size={16} />
            </div>
            <span>Smart Koperasi</span>
          </div>

          {/* Stepper Header (3 Steps) */}
          <div className="recovery-stepper">
            {/* Step 1 */}
            <div className="stepper-step">
              <div className={`stepper-circle ${recoveryStep === 1 ? 'active' : 'completed'}`}>
                {recoveryStep > 1 ? <Check size={16} /> : '1'}
              </div>
              <div className="stepper-labels">
                <span className="stepper-label-step">Langkah 1</span>
                <span className="stepper-label-title">Identifikasi</span>
                <span className={`stepper-label-sub ${recoveryStep === 1 ? 'active' : 'completed'}`}>
                  {recoveryStep === 1 ? '● Sedang Berjalan' : '● Selesai'}
                </span>
              </div>
            </div>

            <div className={`stepper-line ${recoveryStep > 1 ? 'active' : ''}`} />

            {/* Step 2 */}
            <div className="stepper-step">
              <div className={`stepper-circle ${recoveryStep === 2 ? 'active' : recoveryStep > 2 ? 'completed' : 'waiting'}`}>
                {recoveryStep > 2 ? <Check size={16} /> : '2'}
              </div>
              <div className="stepper-labels">
                <span className="stepper-label-step">Langkah 2</span>
                <span className="stepper-label-title">Verifikasi OTP</span>
                <span className={`stepper-label-sub ${recoveryStep === 2 ? 'active' : recoveryStep > 2 ? 'completed' : 'waiting'}`}>
                  {recoveryStep === 2 ? '● Sedang Berjalan' : recoveryStep > 2 ? '● Selesai' : 'Menunggu'}
                </span>
              </div>
            </div>

            <div className={`stepper-line ${recoveryStep > 2 ? 'active' : ''}`} />

            {/* Step 3 */}
            <div className="stepper-step">
              <div className={`stepper-circle ${recoveryStep === 3 ? 'active' : 'waiting'}`}>
                3
              </div>
              <div className="stepper-labels">
                <span className="stepper-label-step">Terakhir</span>
                <span className="stepper-label-title">Sandi Baru</span>
                <span className={`stepper-label-sub ${recoveryStep === 3 ? 'active' : 'waiting'}`}>
                  {recoveryStep === 3 ? '● Sedang Berjalan' : 'Menunggu'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="auth-centered-card card-recovery">
            <div className="recovery-card-inner">
              {/* Badges Row */}
              <div className="recovery-badges-row">
                <div className="recovery-pill-left">
                  <ShieldCheck size={13} />
                  <span>
                    {recoveryStep === 1 && 'PEMULIHAN AKUN & IDENTIFIKASI'}
                    {recoveryStep === 2 && 'PEMULIHAN AKUN: VERIFIKASI'}
                    {recoveryStep === 3 && 'PEMULIHAN AKUN SELESAI'}
                  </span>
                </div>
                <div className="recovery-pill-right">
                  <Lock size={12} />
                  <span>Terenkripsi 256-Bit</span>
                </div>
              </div>

              {/* Feedback messages */}
              {errorMessage && (
                <div className="alert alert-error">
                  <AlertCircle size={18} className="alert-icon" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {recoverySuccessMsg && (
                <div className="alert alert-success">
                  <CheckCircle2 size={18} className="alert-icon" />
                  <span>{recoverySuccessMsg}</span>
                </div>
              )}

              {/* ──────────────── STEP 1: IDENTIFIKASI ──────────────── */}
              {recoveryStep === 1 && (
                <form onSubmit={handleSendRecoveryCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h2 className="recovery-title-large">Lupa Kata Sandi?</h2>
                    <p className="recovery-subtitle-soft">
                      Masukkan alamat email terdaftar atau Nomor Induk Anggota (NIA) Anda. Kami akan mengirimkan tautan pemulihan dan 6-digit kode OTP untuk verifikasi identitas.
                    </p>
                  </div>

                  {/* Input Email */}
                  <div className="modern-input-group">
                    <div className="modern-input-header">
                      <label className="modern-label">Alamat Email Terdaftar</label>
                      <span className="modern-helper-badge">Metode Rekomendasi</span>
                    </div>
                    <div className="modern-input-box">
                      <Mail size={18} className="modern-input-icon" />
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="contoh: fauzan@smartkoperasi.id"
                        className="modern-input"
                      />
                    </div>
                    <span className="input-helper-note">
                      ⓘ Email yang terhubung dengan akun koperasi Anda
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="recovery-divider">
                    <span>ATAU GUNAKAN NOMOR ANGGOTA</span>
                  </div>

                  {/* Input NIA */}
                  <div className="modern-input-group">
                    <label className="modern-label">Nomor Induk Anggota (NIA)</label>
                    <div className="modern-input-box">
                      <CreditCard size={18} className="modern-input-icon" />
                      <input
                        type="text"
                        value={recoveryNia}
                        onChange={(e) => setRecoveryNia(e.target.value)}
                        placeholder="contoh: NIA-2024-089"
                        className="modern-input"
                      />
                    </div>
                    <span className="input-helper-note">
                      📇 Nomor kartu anggota resmi koperasi
                    </span>
                  </div>

                  {/* Anti-Spam protection */}
                  <div className="anti-spam-box">
                    <ShieldCheck size={18} />
                    <span>
                      <strong>Proteksi Anti-Spam:</strong> Sistem kami terlindungi oleh reCAPTCHA Enterprise dan pembatasan frekuensi permintaan reset akun.
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" className="btn-auth-primary">
                    <span>Kirim Kode Verifikasi OTP</span>
                    <ArrowRight size={17} />
                  </button>

                  {/* Admin Help Box */}
                  <div className="admin-help-box">
                    <div className="admin-help-info">
                      <div className="admin-help-icon-circle">
                        <Headphones size={16} />
                      </div>
                      <div>
                        <div className="admin-help-text-title">Kesulitan mengingat akun Anda?</div>
                        <div className="admin-help-text-sub">Hubungi Layanan Anggota 24/7</div>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setShowHelpModal(true)}
                      className="admin-help-btn"
                    >
                      Bantuan Admin
                    </button>
                  </div>

                  {/* Return to Login */}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMessage(''); }}
                    className="recovery-back-btn"
                  >
                    ← Kembali ke Halaman Login
                  </button>
                </form>
              )}

              {/* ──────────────── STEP 2: VERIFIKASI OTP ──────────────── */}
              {recoveryStep === 2 && (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h2 className="recovery-title-large">Verifikasi Kode OTP</h2>
                    <p className="recovery-subtitle-soft">
                      Masukkan 6-digit kode verifikasi yang telah kami kirimkan untuk memvalidasi kepemilikan akun Anda.
                    </p>
                  </div>

                  {/* OTP Sent Destination Card */}
                  <div className="otp-destination-card">
                    <div className="otp-dest-header">
                      <span>▷ KODE OTP DIKIRIMKAN KE:</span>
                      <span className="role-personal-badge">Otentikasi Ganda Aktif</span>
                    </div>

                    <div className="otp-dest-grid">
                      <div className="otp-dest-item">
                        <div className="otp-dest-icon-box">
                          <Mail size={16} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div className="otp-dest-label">Email Utama</div>
                          <div className="otp-dest-value">{verifiedUser?.email || recoveryEmail || 'fauzan@smartkoperasi.id'}</div>
                        </div>
                      </div>

                      <div className="otp-dest-item">
                        <div className="otp-dest-icon-box">
                          <Smartphone size={16} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div className="otp-dest-label">WhatsApp Aktif</div>
                          <div className="otp-dest-value">{verifiedUser?.maskedPhone || '+62 812-****-4590'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 6 Digit Inputs */}
                  <div className="modern-input-group">
                    <label className="modern-label">Masukkan 6-Digit Token OTP</label>
                    <div className="otp-inputs-row">
                      {otpCodes.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="otp-box-input"
                          aria-label={`Digit ${idx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Timer & Resend Row */}
                    <div className="otp-timer-row">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} />
                        Kirim ulang kode dalam <strong>{formatTimer(otpTimer)}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="otp-resend-btn"
                      >
                        <RefreshCw size={12} />
                        <span>Kirim Ulang via WhatsApp / SMS</span>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" disabled={isSubmitting} className="btn-auth-primary">
                    <span>{isSubmitting ? 'Memvalidasi Token...' : 'Verifikasi & Lanjutkan'}</span>
                    <ArrowRight size={17} />
                  </button>

                  {/* Admin Help Box */}
                  <div className="admin-help-box">
                    <div className="admin-help-info">
                      <div className="admin-help-icon-circle">
                        <Headphones size={16} />
                      </div>
                      <div>
                        <div className="admin-help-text-title">Butuh bantuan verifikasi?</div>
                        <div className="admin-help-text-sub">Hubungi Layanan Anggota 24/7</div>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setShowHelpModal(true)}
                      className="admin-help-btn"
                    >
                      Bantuan Admin
                    </button>
                  </div>

                  {/* Return to Login */}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setRecoveryStep(1); setErrorMessage(''); }}
                    className="recovery-back-btn"
                  >
                    ← Batalkan & Kembali ke Halaman Login
                  </button>
                </form>
              )}

              {/* ──────────────── STEP 3: SANDI BARU ──────────────── */}
              {recoveryStep === 3 && (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Verified Member Badge */}
                  <div className="verified-member-card">
                    <div className="verified-member-icon">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <div className="verified-member-title">AKUN TERVERIFIKASI ANGGOTA</div>
                      <div className="verified-member-name">{verifiedUser?.name || 'Fauzan Mukhlish'}</div>
                      <div className="verified-member-meta">
                        {verifiedUser?.memberNumber || 'NIA-2024-089'} • {verifiedUser?.email || recoveryEmail || 'fauzan@smartkoperasi.id'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="recovery-title-large">Buat Kata Sandi Baru</h2>
                    <p className="recovery-subtitle-soft">
                      Kata sandi baru Anda harus berbeda dari kata sandi sebelumnya untuk menjamin keamanan data finansial dan tabungan Anda.
                    </p>
                  </div>

                  {/* New Password */}
                  <div className="modern-input-group">
                    <div className="modern-input-header">
                      <label className="modern-label">Kata Sandi Baru</label>
                      <span className="modern-helper-badge">Wajib diisi</span>
                    </div>
                    <div className="modern-input-box">
                      <Lock size={18} className="modern-input-icon" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="modern-input has-right-btn"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="modern-input-right-btn"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Strength Bar */}
                    <div className="password-strength-meter">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="strength-label-text">
                          Tingkat Keamanan: <span className="strength-label-val">{getStrengthLabel(newPassScore)}</span>
                        </span>
                      </div>
                      <div className="password-strength-bars">
                        <div className={`strength-seg ${newPassScore >= 1 ? 'filled-3' : ''}`} />
                        <div className={`strength-seg ${newPassScore >= 2 ? 'filled-3' : ''}`} />
                        <div className={`strength-seg ${newPassScore >= 3 ? 'filled-3' : ''}`} />
                        <div className={`strength-seg ${newPassScore >= 4 ? 'filled-4' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="password-req-checklist">
                    <div className={`req-item ${newPassword.length >= 8 ? 'satisfied' : ''}`}>
                      <div className="req-item-icon">
                        <Check size={14} />
                      </div>
                      <span>Minimal 8 karakter</span>
                    </div>

                    <div className={`req-item ${/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? 'satisfied' : ''}`}>
                      <div className="req-item-icon">
                        <Check size={14} />
                      </div>
                      <span>Kombinasi huruf besar & huruf kecil</span>
                    </div>

                    <div className={`req-item ${/[0-9]/.test(newPassword) ? 'satisfied' : ''}`}>
                      <div className="req-item-icon">
                        <Check size={14} />
                      </div>
                      <span>Mengandung angka (0-9)</span>
                    </div>

                    <div className={`req-item ${/[^A-Za-z0-9]/.test(newPassword) ? 'satisfied' : ''}`}>
                      <div className="req-item-icon">
                        <Check size={14} />
                      </div>
                      <span>Mengandung simbol khusus (@, #, $, dll.)</span>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="modern-input-group">
                    <div className="modern-input-header">
                      <label className="modern-label">Konfirmasi Kata Sandi Baru</label>
                      {confirmPassword && confirmPassword === newPassword && (
                        <span className="badge-match-pwd">
                          <Check size={13} /> Sandi Cocok
                        </span>
                      )}
                    </div>
                    <div className="modern-input-box">
                      <KeyRound size={18} className="modern-input-icon" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="modern-input has-right-btn"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="modern-input-right-btn"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Checkbox Logout All Devices */}
                  <div className="remember-checkbox" style={{ marginTop: '2px' }}>
                    <input
                      type="checkbox"
                      id="logoutDevices"
                      checked={logoutAllSessions}
                      onChange={(e) => setLogoutAllSessions(e.target.checked)}
                    />
                    <label htmlFor="logoutDevices" style={{ cursor: 'pointer', fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                      Keluarkan sesi aktif dari semua perangkat lain demi keamanan ekstra akun Anda.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" className="btn-auth-primary">
                    <span>Simpan & Perbarui Kata Sandi</span>
                    <Check size={17} />
                  </button>

                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setRecoveryStep(1); setErrorMessage(''); }}
                    className="recovery-back-btn"
                  >
                    ← Batalkan & Kembali ke Halaman Login
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Recovery Page Footer */}
          <div className="recovery-page-footer">
            <div className="footer-row-pills">
              <span className="footer-pill-item">
                <Clock size={13} />
                <span>Sesi token reset berlaku 15 menit</span>
              </span>
              <span>•</span>
              <span className="footer-pill-item">
                <ShieldCheck size={13} />
                <span>Standard ISO 27001 Terpenuhi</span>
              </span>
            </div>
            {recoveryStep === 1 && (
              <div className="footer-pill-item" style={{ marginTop: '4px' }}>
                <Lock size={12} color="#004132" />
                <span>Koneksi Finansial Terenkripsi & Diawasi Pengurus Koperasi</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          HELP / SUPPORT MODAL
      ───────────────────────────────────────────────────────────── */}
      {showHelpModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowHelpModal(false)}
        >
          <div 
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ECFDF5', color: '#004132', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Headphones size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Layanan Bantuan Anggota</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>Pengurus Smart Koperasi siap melayani 24/7</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#334155' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, color: '#004132', marginBottom: '2px' }}>WhatsApp Resmi Pengurus</div>
                <div>+62 812-8899-2341 (Fast Response)</div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, color: '#004132', marginBottom: '2px' }}>Email Sekretariat Koperasi</div>
                <div>pengurus@smartkoperasi.id / bantuan@koperasi.id</div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, color: '#004132', marginBottom: '2px' }}>Kantor Operasional</div>
                <div>Gedung Koperasi Mandiri Sejahtera Lt. 2, Jl. Sudirman Kav. 24, Jakarta</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="btn-auth-primary"
              style={{ marginTop: '20px' }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
