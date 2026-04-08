import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/api';
import SearchBar from './SearchBar';
import {
  Home, Users, BookOpen, User, LogOut, ShieldCheck, GraduationCap, MessageCircle, UserCheck, Bell, Calendar
} from 'lucide-react';

const navLinks = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/groupes', icon: Users, label: 'Groupes' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/amis', icon: UserCheck, label: 'Amis' },
  { to: '/cours', icon: BookOpen, label: 'Cours' },
  { to: '/evenements', icon: Calendar, label: 'Événements' },
  { to: '/profil', icon: User, label: 'Mon Profil' },
];

export default function Layout({ children }) {
  const { user, logoutUser, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await getUnreadCount();
        setUnreadCount(res.data?.count ?? 0);
      } catch (error) {
        // silently ignore
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const initials = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase()
    : '?';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 40, display: 'none'
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        transition: 'transform 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={20} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>
              CampusLink
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Réseau étudiant</div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>
          <SearchBar />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navLinks.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 10,
                  color: active ? 'white' : 'var(--text2)',
                  background: active ? 'var(--accent)' : 'transparent',
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; } }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}

          {/* Notifications link */}
          <Link
            to="/notifications"
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 10,
              color: location.pathname === '/notifications' ? 'white' : 'var(--text2)',
              background: location.pathname === '/notifications' ? 'var(--accent)' : 'transparent',
              fontWeight: location.pathname === '/notifications' ? 600 : 400,
              fontSize: 14,
              textDecoration: 'none',
              transition: 'all 0.2s',
              position: 'relative',
            }}
            onMouseEnter={e => { if (location.pathname !== '/notifications') { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)'; } }}
            onMouseLeave={e => { if (location.pathname !== '/notifications') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)'; } }}
          >
            <Bell size={18} />
            Notifications
            {unreadCount > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: 'var(--accent2)',
                color: 'white',
                borderRadius: '50%',
                width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {isAdmin() && (
            <Link
              to="/admin"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 10,
                color: location.pathname === '/admin' ? 'white' : 'var(--accent3)',
                background: location.pathname === '/admin' ? 'var(--accent3)' : 'rgba(255,107,107,0.08)',
                fontWeight: 500, fontSize: 14, textDecoration: 'none',
                marginTop: 8,
                border: '1px solid rgba(255,107,107,0.2)',
                transition: 'all 0.2s',
              }}
            >
              <ShieldCheck size={18} />
              Administration
            </Link>
          )}
        </nav>

        {/* User section */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid var(--border)',
        }}>
          <Link
            to="/profil"
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10,
              textDecoration: 'none',
              background: 'var(--bg3)',
              marginBottom: 8,
              transition: 'background 0.2s',
            }}
          >
            <div className="avatar">
              {user?.photo
                ? <img src={user.photo} alt="avatar" />
                : initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.prenom} {user?.nom}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', padding: '9px 14px' }}
          >
            <LogOut size={15} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: 240,
        flex: 1,
        minHeight: '100vh',
        background: 'var(--bg)',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
