import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Loader, Zap, CheckCircle, Gift, Sparkles } from 'lucide-react';
import FaceCapture from './FaceCapture';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';
import api from '../services/api';

export default function RegisterModal() {
  const { register: doRegister, isLoading, error } = useAuthStore();
  const { sessionId, locationData } = useSessionStore();

  const [username, setUsername] = useState('');
  const [usernameErr, setUsernameErr] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [submitErr, setSubmitErr] = useState('');

  const validateUsername = (val) => {
    if (!val || val.trim().length < 2) return 'Min 2 characters required';
    if (val.trim().length > 20) return 'Max 20 characters allowed';
    if (!/^[a-zA-Z0-9_]+$/.test(val)) return 'Letters, numbers and underscores only';
    return '';
  };

  const handleFaceCapture = (photo) => {
    setCapturedPhoto(photo);
    if (photo) setSubmitErr('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validateUsername(username);
    if (err) {
      setUsernameErr(err);
      return;
    }
    if (!capturedPhoto) {
      setSubmitErr('Please capture your face photo to complete verification.');
      return;
    }

    setSubmitErr('');
    setUsernameErr('');

    // Save verification event
    try {
      await api.post('/api/verification', {
        sessionId,
        faceDetected: true,
        faceCount: 1,
        cameraPermission: true,
      });
    } catch {
      /* non-blocking */
    }

    const result = await doRegister({
      username: username.trim(),
      profilePhoto: capturedPhoto,
      location: locationData || {},
      sessionId,
    });

    if (result.success) {
      // Fire celebration & scroll to games
      window.dispatchEvent(
        new CustomEvent('playrush:registered', {
          detail: { username: username.trim() },
        })
      );
    } else {
      setSubmitErr(result.message);
    }
  };

  const canSubmit = capturedPhoto && username.trim().length >= 2 && !usernameErr && !isLoading;

  return (
    <motion.div
      className="modal-overlay reg-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ zIndex: 9999 }}
    >
      <motion.div
        className="register-modal"
        initial={{ scale: 0.88, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        {/* Prominent Sticky Instant ₹500 Bonus Header */}
        <div className="register-bonus-banner">
          <div className="bonus-banner-left">
            <Gift size={20} className="bonus-gift-icon" />
            <div>
              <div className="bonus-banner-title">
                🎁 GET ₹500 INSTANT BONUS
              </div>
              <div className="bonus-banner-sub">
                Wallet credited immediately after face verification
              </div>
            </div>
          </div>
          <span className="bonus-amount-badge">+₹500 CASH</span>
        </div>

        {/* Modal Brand Header */}
        <div className="modal-header" style={{ marginTop: 8 }}>
          <div className="modal-logo">
            <Zap size={22} className="logo-icon" />
            <span>PlayRush</span>
          </div>
          <div className="modal-step-pill">Step 2 of 2: Face &amp; Username</div>
        </div>

        <h2 className="modal-title" style={{ fontSize: 20 }}>Player Registration</h2>

        <form onSubmit={onSubmit} className="register-form">
          {/* Username field */}
          <div className="form-group">
            <label htmlFor="reg-username">
              Choose your Gamer Tag / Username <span className="required-badge">*</span>
            </label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" />
              <input
                id="reg-username"
                type="text"
                placeholder="e.g. GamerPro_99"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameErr(validateUsername(e.target.value));
                }}
                autoFocus
                maxLength={20}
              />
              {username.trim().length >= 2 && !usernameErr && (
                <CheckCircle
                  size={16}
                  style={{ position: 'absolute', right: 12, color: 'var(--color-success)' }}
                />
              )}
            </div>
            {usernameErr && <span className="form-error">{usernameErr}</span>}
          </div>

          {/* Face Capture below username */}
          <div className="form-group">
            <label>
              Face Verification <span className="required-badge">Required</span>
            </label>
            <p className="face-hint">
              Center your face in the camera. 1 verified face unlocks your ₹500 bonus.
            </p>
            <FaceCapture onCapture={handleFaceCapture} />
          </div>

          {(error || submitErr) && (
            <p className="form-error center" style={{ marginTop: 4 }}>
              {submitErr || error}
            </p>
          )}

          <motion.button
            type="submit"
            className={`btn-primary full ${canSubmit ? '' : 'disabled'}`}
            disabled={!canSubmit}
            whileTap={canSubmit ? { scale: 0.97 } : {}}
            id="register-submit-btn"
          >
            {isLoading ? (
              <>
                <Loader size={16} className="spin" /> Creating profile &amp; crediting ₹500…
              </>
            ) : (
              '🎮 Claim ₹500 & Start Playing'
            )}
          </motion.button>

          <p className="modal-login-hint">
            Already registered?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('playrush:openLogin'));
              }}
            >
              Login here
            </button>
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
}
