import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Shield, RefreshCw, Navigation, CheckCircle, AlertCircle, Compass, Gift } from 'lucide-react';
import { useSessionStore } from '../store/useSessionStore';
import api from '../services/api';

export default function LocationModal() {
  const { sessionId, setLocationGranted, setLocationDenied } = useSessionStore();
  const [status, setStatus] = useState('idle'); // idle | requesting | denied | granted
  const [countdown, setCountdown] = useState(null);
  const [errMsg, setErrMsg] = useState('');
  const hasAttemptedRef = useRef(false);

  const requestLocation = useCallback(async () => {
    setStatus('requesting');
    setErrMsg('');

    if (!navigator.geolocation) {
      setErrMsg('Geolocation is not supported by your browser.');
      setStatus('denied');
      setLocationDenied();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setStatus('granted');
        setLocationGranted({ latitude, longitude, accuracy });

        // Save location event to backend MongoDB
        try {
          await api.post('/api/analytics/location', {
            sessionId,
            latitude,
            longitude,
            accuracy,
            consent: true,
          });
        } catch {
          /* non-blocking */
        }
      },
      (err) => {
        setStatus('denied');
        setLocationDenied();
        if (err.code === 1) {
          setErrMsg('Location access was blocked. Tap the 🔒 lock icon in your browser URL bar, set Location to "Allow", and tap "Try Again".');
        } else if (err.code === 2) {
          setErrMsg('Position unavailable. Please ensure device location/GPS is turned ON.');
        } else {
          setErrMsg('Location request timed out. Please try again.');
        }
        setCountdown(5);
      },
      { timeout: 12000, maximumAge: 60000, enableHighAccuracy: true }
    );
  }, [sessionId, setLocationGranted, setLocationDenied]);

  // Auto-request location on initial mount so browser prompts immediately
  useEffect(() => {
    if (!hasAttemptedRef.current) {
      hasAttemptedRef.current = true;
      const timer = setTimeout(() => {
        requestLocation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [requestLocation]);

  // Real-time permission listener: automatically unblocks if user toggles lock icon in browser bar
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permissionStatus) => {
          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              requestLocation();
            }
          };
        })
        .catch(() => {});
    }
  }, [requestLocation]);

  // Auto-retry countdown if denied
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      requestLocation();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, requestLocation]);

  return (
    <motion.div
      className="modal-overlay loc-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ zIndex: 99999 }}
    >
      <motion.div
        className="loc-modal"
        initial={{ scale: 0.88, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        {/* Prominent Instant ₹500 Bonus Strip */}
        <div className="register-bonus-banner" style={{ width: '100%', marginBottom: 16 }}>
          <div className="bonus-banner-left">
            <Gift size={20} className="bonus-gift-icon" />
            <div>
              <div className="bonus-banner-title">
                🎁 CLAIM ₹500 INSTANT BONUS
              </div>
              <div className="bonus-banner-sub">
                Enable location to unlock ₹500 welcome reward
              </div>
            </div>
          </div>
          <span className="bonus-amount-badge">₹500 FREE</span>
        </div>

        {/* Animated GPS Radar Icon */}
        <div className="loc-icon-wrap">
          <motion.div
            className="loc-icon-ring"
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.15, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="loc-icon-ring loc-icon-ring-2"
            animate={{ scale: [1, 1.45, 1], opacity: [0.35, 0.05, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.5, ease: 'easeInOut' }}
          />
          <div
            className={`loc-icon-core ${
              status === 'granted' ? 'loc-granted' : status === 'denied' ? 'loc-denied' : 'loc-idle'
            }`}
          >
            {status === 'granted' ? (
              <CheckCircle size={36} color="#22c55e" />
            ) : status === 'denied' ? (
              <AlertCircle size={36} color="#ef4444" />
            ) : (
              <Navigation size={34} color="var(--color-accent-2)" />
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status !== 'granted' ? (
            <motion.div
              key="request-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="loc-badge-tag">
                <Compass size={13} /> Step 1 of 2: Region Verification
              </div>

              <h2 className="modal-title" style={{ textAlign: 'center', marginTop: 8 }}>
                {status === 'denied' ? '📍 Location Access Required' : '📍 Enable Location to Play'}
              </h2>

              <p className="loc-desc">
                {status === 'denied'
                  ? errMsg
                  : 'PlayRush matches you with verified regional players in your city. Location access is required to claim your ₹500 bonus.'}
              </p>

              <div className="loc-privacy-box">
                <Shield size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
                <span>
                  <strong>100% Privacy Protected:</strong> Only your city region is verified. Exact coordinates are never shared with other players.
                </span>
              </div>

              {status === 'denied' && countdown !== null && countdown > 0 && (
                <p className="loc-countdown">
                  Auto-retrying access in <strong>{countdown}s</strong>…
                </p>
              )}

              <motion.button
                className={`btn-primary full loc-btn ${status === 'requesting' ? 'disabled' : ''}`}
                onClick={requestLocation}
                disabled={status === 'requesting'}
                whileTap={{ scale: 0.96 }}
                id="grant-location-action-btn"
              >
                {status === 'requesting' ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw size={18} />
                    </motion.span>
                    Requesting… Please click Allow
                  </>
                ) : status === 'denied' ? (
                  <>
                    <RefreshCw size={18} /> Try Again Now
                  </>
                ) : (
                  <>
                    <MapPin size={18} /> Enable Location &amp; Claim ₹500
                  </>
                )}
              </motion.button>

              <p className="loc-blocking-note">
                🔒 Location grant is required to activate your ₹500 account bonus.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="granted-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="loc-success"
            >
              <h2 className="modal-title" style={{ textAlign: 'center', color: '#22c55e' }}>
                Location Verified ✓
              </h2>
              <p className="loc-desc" style={{ textAlign: 'center' }}>
                Connecting to regional server… Step 2 loading!
              </p>
              <div className="loc-progress-track">
                <motion.div
                  className="loc-loading-bar"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.9 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
