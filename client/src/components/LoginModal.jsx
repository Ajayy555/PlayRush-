import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Loader, X, Zap } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginModal({ onClose }) {
  const { login, isLoading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) { setErr('Username required'); return; }
    const result = await login(username.trim());
    if (result.success) onClose();
    else setErr(result.message);
  };

  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div
        className="register-modal login-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.85, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        <button className="modal-close" onClick={onClose} id="login-close-btn"><X size={18} /></button>
        <div className="modal-header">
          <div className="modal-logo"><Zap size={24} className="logo-icon" /><span>PlayRush</span></div>
        </div>
        <h2 className="modal-title">Welcome Back!</h2>
        <p className="modal-subtitle">Enter your username to continue</p>
        <form onSubmit={onSubmit} className="register-form">
          <div className="form-group">
            <label>Username</label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" />
              <input
                id="login-username"
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErr(''); }}
                autoFocus
              />
            </div>
            {err && <span className="form-error">{err}</span>}
            {error && <span className="form-error">{error}</span>}
          </div>
          <button type="submit" className="btn-primary full" disabled={isLoading} id="login-submit-btn">
            {isLoading ? <><Loader size={16} className="spin" /> Logging in…</> : 'Login to PlayRush'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
