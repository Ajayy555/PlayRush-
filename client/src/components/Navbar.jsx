import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, Menu, X, LogOut, Shield, Wallet } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const ONLINE_COUNT = 18450;

export default function Navbar({ onLoginClick }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <Zap size={26} className="brand-icon" />
          <span className="brand-name">PlayRush</span>
        </div>

        {/* Live Online Badge */}
        <div className="nav-center">
          <div className="online-badge">
            <motion.span
              className="online-dot"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <Users size={13} />
            <span>{ONLINE_COUNT.toLocaleString()} Live</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="nav-links desktop">
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#games" className="nav-link">Games</a>
          {user?.role === 'ADMIN' && (
            <button className="nav-link admin-badge" onClick={() => navigate('/admin')}>
              <Shield size={14} /> Admin Portal
            </button>
          )}
        </div>

        {/* User Profile or Login Area (Always Visible in Top Bar) */}
        <div className="nav-right">
          {user ? (
            <div className="nav-user-container">
              {/* Wallet Chips Pill */}
              <div className="nav-wallet-badge" title="Your Gaming Wallet Balance">
                <Wallet size={14} color="var(--color-gold)" />
                <span className="wallet-amt">₹500</span>
              </div>

              {/* User Avatar & Name */}
              <div className="nav-user-profile" title={`Logged in as ${user.username}`}>
                <div className="nav-avatar-wrap">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.username} className="nav-avatar-img" />
                  ) : (
                    <div className="nav-avatar-fallback">👤</div>
                  )}
                  <span className="nav-avatar-online-dot" />
                </div>
                <span className="nav-username-text">{user.username}</span>
              </div>

              {/* Logout Button */}
              <button
                className="btn-nav-logout"
                onClick={handleLogout}
                title="Logout from PlayRush"
                aria-label="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button className="btn-login" onClick={onLoginClick} id="nav-login-btn">
              Login
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav-mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <a href="#how-it-works" className="nav-link" onClick={() => setMenuOpen(false)}>
              How It Works
            </a>
            <a href="#games" className="nav-link" onClick={() => setMenuOpen(false)}>
              Games Arena
            </a>

            {user?.role === 'ADMIN' && (
              <button
                className="nav-link admin-badge"
                onClick={() => {
                  navigate('/admin');
                  setMenuOpen(false);
                }}
              >
                <Shield size={14} /> Admin Portal
              </button>
            )}

            {user ? (
              <div className="mobile-user-card">
                <div className="mobile-user-info">
                  <div className="mobile-avatar-wrap">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="" className="mobile-avatar-img" />
                    ) : (
                      <span className="mobile-avatar-ph">👤</span>
                    )}
                    <span className="nav-avatar-online-dot" />
                  </div>
                  <div className="mobile-user-details">
                    <strong className="mobile-username">{user.username}</strong>
                    <div className="mobile-wallet-badge">
                      <Wallet size={12} color="var(--color-gold)" />
                      <span>Wallet: ₹500</span>
                    </div>
                  </div>
                </div>
                <button className="btn-logout-mobile" onClick={handleLogout}>
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <button
                className="btn-login full"
                onClick={() => {
                  onLoginClick();
                  setMenuOpen(false);
                }}
              >
                Login
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
