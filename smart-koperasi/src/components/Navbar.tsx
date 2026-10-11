import React, { useState } from 'react';
import { 
  Building2, 
  Bell, 
  LogOut, 
  LayoutDashboard, 
  PiggyBank, 
  CreditCard, 
  BookOpen, 
  PieChart, 
  ShieldCheck,
  Menu,
  X,
  Settings,
  Crown,
} from 'lucide-react';
import type { User } from '../types';
import { hasPermission } from '../types';

export type ActiveTab = 'overview' | 'savings' | 'loans' | 'cashflow' | 'shu' | 'admin';

interface NavbarProps {
  user: User;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onRequestLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onTabChange,
  onRequestLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminOrPengurus = hasPermission(user.role, 'view:admin_members');

  const memberTabs = [
    { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'savings', label: 'Simpanan', icon: PiggyBank },
    { id: 'loans', label: 'Pinjaman', icon: CreditCard },
    { id: 'cashflow', label: 'Buku Kas', icon: BookOpen },
    { id: 'shu', label: 'SHU', icon: PieChart },
  ] as const;

  const handleSelectTab = (tab: ActiveTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  const getRoleInfo = () => {
    if (user.role === 'admin') return { label: 'Administrator', color: '#F59E0B', icon: <Crown size={13} /> };
    if (user.role === 'pengurus') return { label: 'Pengurus', color: '#818CF8', icon: <ShieldCheck size={13} /> };
    return { label: 'Anggota', color: '#10B981', icon: <ShieldCheck size={13} /> };
  };

  const roleInfo = getRoleInfo();

  return (
    <header className="navbar">
      {/* Brand & Desktop Tabs */}
      <div className="navbar-left">
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="navbar-brand" onClick={() => handleSelectTab('overview')}>
          <div className="navbar-brand-icon">
            <Building2 size={22} />
          </div>
          <div>
            <div className="navbar-brand-text">SMART KOPERASI</div>
            <div className="navbar-brand-sub">Enterprise Portal</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={`nav-tabs ${mobileMenuOpen ? 'open' : ''}`}>
          {/* Member tabs — always visible */}
          {memberTabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTab(t.id as ActiveTab)}
                className={`nav-tab ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} />
                <span>{t.label}</span>
              </button>
            );
          })}

          {/* Admin tab — only for admin/pengurus */}
          {isAdminOrPengurus && (
            <button
              onClick={() => handleSelectTab('admin')}
              className={`nav-tab nav-tab-admin ${activeTab === 'admin' ? 'active' : ''}`}
            >
              <Settings size={17} />
              <span>Panel Admin</span>
              {user.role === 'admin' && <Crown size={11} className="crown-icon" />}
            </button>
          )}
        </nav>
      </div>

      {/* Utilities: Status Badge, Notification, Profile, Logout */}
      <div className="navbar-right">
        {/* Role Badge */}
        <div className="role-badge" style={{ '--role-color': roleInfo.color } as React.CSSProperties}>
          {roleInfo.icon}
          <span>{roleInfo.label}</span>
        </div>

        {/* Membership Status */}
        <div className="membership-badge">
          <ShieldCheck size={14} color="#10B981" />
          <span>{user.membershipStatus}</span>
        </div>

        {/* Notifications Icon with animated dot */}
        <button className="notification-btn" title="Notifikasi" aria-label="Notifikasi">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        {/* User Profile */}
        <div className="user-profile">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user.name}
            className="user-avatar"
          />
          <div>
            <div className="user-info-name">{user.name}</div>
            <div className="user-info-meta">
              {user.memberNumber}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onRequestLogout}
          className="logout-btn"
          title="Keluar dari Akun"
        >
          <LogOut size={15} />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
};

