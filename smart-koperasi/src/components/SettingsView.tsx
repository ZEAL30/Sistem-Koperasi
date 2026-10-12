import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Shield, 
  Smartphone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Eye, 
  EyeOff, 
  Sparkles,
  Info,
  Building,
  KeyRound,
  ShieldCheck,
  Check
} from 'lucide-react';
import type { User as UserType } from '../types';
import { apiService } from '../services/api';
import { Card, Button, Badge } from './ui';

interface SettingsViewProps {
  user: UserType;
  onUpdateUser: (updatedUser: UserType) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  // Form State: Profile
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [avatar, setAvatar] = useState(
    user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State: Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Avatar presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  ];

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileMsg({ type: 'error', text: 'Nama lengkap wajib diisi.' });
      return;
    }

    setProfileSaving(true);
    setProfileMsg(null);

    try {
      const res = await apiService.updateProfile({
        userId: user.id,
        name: name.trim(),
        phone: phone.trim(),
        avatar: avatar
      });

      if (res.success && res.user) {
        onUpdateUser(res.user);
        setProfileMsg({ type: 'success', text: 'Profil dan identitas Anda berhasil disimpan ke database!' });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Gagal menyimpan profil.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Semua kolom kata sandi wajib diisi.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Kata sandi baru minimal 8 karakter.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    setPasswordSaving(true);
    setPasswordMsg(null);

    try {
      const res = await apiService.changePassword({
        userId: user.id,
        oldPassword,
        newPassword
      });

      if (res.success) {
        setPasswordMsg({ type: 'success', text: 'Kata sandi berhasil diperbarui dengan aman!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Gagal memperbarui kata sandi.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="fade-in flex-col-gap">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>
              Pengaturan Akun & Profil
            </h1>
            <Badge variant="gold" icon={<Sparkles size={12} />}>
              Profil Koperasi
            </Badge>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Kelola nama lengkap, kontak resmi, foto profil avatar, serta kata sandi akun Anda.
          </p>
        </div>
      </div>

      {/* Tabs Sub Navigation (Sesuai Style Admin & Member Portal) */}
      <div className="admin-tab-nav" style={{ marginTop: '8px' }}>
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`admin-tab-btn ${activeSubTab === 'profile' ? 'active' : ''}`}
        >
          <User size={16} />
          <span>Profil & Kontak</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`admin-tab-btn ${activeSubTab === 'security' ? 'active' : ''}`}
        >
          <Lock size={16} />
          <span>Keamanan & Sandi</span>
        </button>

        <button
          onClick={() => setActiveSubTab('preferences')}
          className={`admin-tab-btn ${activeSubTab === 'preferences' ? 'active' : ''}`}
        >
          <Shield size={16} />
          <span>Kepatuhan & Data Legal</span>
        </button>
      </div>

      {/* Tab 1: Profil & Kontak */}
      {activeSubTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Card Form Ubah Profil */}
          <Card>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                Informasi Biodata Anggota
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Perbarui nama dan nomor kontak untuk korespondensi resmi koperasi.
              </p>
            </div>

            {profileMsg && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                background: profileMsg.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                color: profileMsg.type === 'success' ? '#065F46' : '#B91C1C',
                border: `1px solid ${profileMsg.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`
              }}>
                {profileMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Avatar Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Pilih Avatar / Foto Profil
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                  <img
                    src={avatar}
                    alt={name}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--primary)',
                      boxShadow: 'var(--shadow-primary)'
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{name || 'Nama Anggota'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>No. Anggota: {user.memberNumber}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {avatarPresets.map((presetUrl, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setAvatar(presetUrl)}
                      style={{
                        padding: '2px',
                        borderRadius: '50%',
                        border: avatar === presetUrl ? '2px solid var(--primary)' : '2px solid var(--border)',
                        background: '#FFFFFF',
                        cursor: 'pointer',
                        transform: avatar === presetUrl ? 'scale(1.08)' : 'scale(1)',
                        transition: 'all 0.15s ease',
                        boxShadow: avatar === presetUrl ? 'var(--shadow-sm)' : 'none'
                      }}
                    >
                      <img
                        src={presetUrl}
                        alt={`Preset ${idx + 1}`}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama Lengkap */}
              <div className="modern-input-group">
                <div className="modern-input-header">
                  <label className="modern-label" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Nama Lengkap <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                </div>
                <div className="modern-input-box">
                  <User size={18} className="modern-input-icon" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Masukkan nama lengkap Anda"
                    className="modern-input"
                  />
                </div>
              </div>

              {/* Nomor Handphone / WhatsApp */}
              <div className="modern-input-group">
                <div className="modern-input-header">
                  <label className="modern-label" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Nomor Handphone / WhatsApp
                  </label>
                </div>
                <div className="modern-input-box">
                  <Smartphone size={18} className="modern-input-icon" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="modern-input"
                  />
                </div>
              </div>

              {/* Email (Read Only) */}
              <div className="modern-input-group">
                <div className="modern-input-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="modern-label" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Alamat Email (Akun Utama)
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Permanen</span>
                </div>
                <div className="modern-input-box">
                  <Mail size={18} className="modern-input-icon" />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="modern-input"
                    style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={profileSaving}
                icon={profileSaving ? undefined : <Save size={16} />}
                fullWidth
                style={{ marginTop: '6px' }}
              >
                {profileSaving ? 'Menyimpan ke Database...' : 'Simpan Perubahan Profil'}
              </Button>
            </form>
          </Card>

          {/* Kartu Informasi Anggota & Legalitas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card variant="emerald">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#F4B400" />
                Status Keanggotaan Terdaftar
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '10px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>No. Anggota</span>
                  <strong style={{ color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '0.5px', background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                    {user.memberNumber}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '10px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Hak Akses (Role)</span>
                  <Badge variant={user.role === 'admin' ? 'warning' : 'success'}>
                    {user.role.toUpperCase()}
                  </Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '10px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Status Keanggotaan</span>
                  <Badge variant="success">
                    {user.membershipStatus}
                  </Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Tanggal Bergabung</span>
                  <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{user.joinDate || '2024'}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={16} color="var(--primary)" />
                Bantuan & Pembaruan Data
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                Untuk perubahan data krusial seperti NIK KTP atau perpindahan nomor rekening bank utama, silakan hubungi pengurus koperasi melalui tiket layanan dengan melampirkan berkas fisik pendukung.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Keamanan & Sandi */}
      {activeSubTab === 'security' && (
        <div style={{ maxWidth: '600px' }}>
          <Card>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                Perbarui Kata Sandi Akun
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Gunakan kombinasi huruf, angka, dan karakter unik minimal 8 digit demi keamanan akun koperasi Anda.
              </p>
            </div>

            {passwordMsg && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                background: passwordMsg.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                color: passwordMsg.type === 'success' ? '#065F46' : '#B91C1C',
                border: `1px solid ${passwordMsg.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`
              }}>
                {passwordMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Kata Sandi Lama */}
              <div className="modern-input-group">
                <div className="modern-input-header">
                  <label className="modern-label" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Kata Sandi Saat Ini <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                </div>
                <div className="modern-input-box">
                  <Lock size={18} className="modern-input-icon" />
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="Ketik kata sandi saat ini"
                    className="modern-input has-right-btn"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="modern-input-right-btn"
                    aria-label="Tampilkan sandi"
                  >
                    {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Kata Sandi Baru */}
              <div className="modern-input-group">
                <div className="modern-input-header">
                  <label className="modern-label" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Kata Sandi Baru (Min. 8 Karakter) <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                </div>
                <div className="modern-input-box">
                  <KeyRound size={18} className="modern-input-icon" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Ketik kata sandi baru"
                    className="modern-input has-right-btn"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="modern-input-right-btn"
                    aria-label="Tampilkan sandi baru"
                  >
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div className="modern-input-group">
                <div className="modern-input-header">
                  <label className="modern-label" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Ulangi Kata Sandi Baru <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                </div>
                <div className="modern-input-box">
                  <KeyRound size={18} className="modern-input-icon" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Ketik ulang kata sandi baru"
                    className="modern-input has-right-btn"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="modern-input-right-btn"
                    aria-label="Tampilkan konfirmasi sandi"
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={passwordSaving}
                icon={passwordSaving ? undefined : <Save size={16} />}
                fullWidth
                style={{ marginTop: '6px' }}
              >
                {passwordSaving ? 'Mengenkripsi & Menyimpan...' : 'Perbarui Kata Sandi Sekarang'}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* Tab 3: Kepatuhan & Data Legal */}
      {activeSubTab === 'preferences' && (
        <div style={{ maxWidth: '720px' }}>
          <Card>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={20} color="var(--primary)" />
              Data Identitas Kependudukan & Regulasi Koperasi
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Nomor Induk Kependudukan (NIK)</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                  {user.nik ? `${user.nik.slice(0, 6)}******${user.nik.slice(-4)}` : '3271************'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12} /> Terverifikasi Kependudukan
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Skor Kelayakan Kredit</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                  {user.creditScore || 'Prima A+'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Tingkat Kolektibilitas Lancar
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'var(--primary-surface)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(15, 90, 71, 0.15)', fontSize: '13px', lineHeight: 1.6, color: 'var(--primary)' }}>
              <strong>Kepatuhan Standar Akuntansi Keuangan (SAK ETAP):</strong> Seluruh data setoran simpanan, pengajuan pinjaman, dan pembagian dividen SHU diatur sesuai AD/ART Smart Koperasi dan Undang-Undang Perkoperasian Republik Indonesia.
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
