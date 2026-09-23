import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, RefreshCw, Shield } from 'lucide-react';
import { useSessionStore } from '../store/useSessionStore';
import api from '../services/api';

export default function LocationBanner() {
  const { sessionId, locationGranted, setLocationGranted, setLocationDenied } = useSessionStore();
  const [status, setStatus] = useState('idle'); // idle | requesting | denied | granted
  const [countdown, setCountdown] = useState(null);

  const requestLocation = useCallback(() => {
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setStatus('granted');
        setLocationGranted({ latitude, longitude, accuracy });
        try {
          await api.post('/api/analytics/location', {
            sessionId, latitude, longitude, accuracy, consent: true,
          });
        } catch (e) { /* non-blocking */ }
      },
      () => {
        setStatus('denied');
        setLocationDenied(); // marks locationChecked = true
        // re-prompt after 4 seconds
        setCountdown(4);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, [sessionId, setLocationGranted]);

  // Countdown re-prompt
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { requestLocation(); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, requestLocation]);

  // Auto-request on mount
  useEffect(() => {
    if (!locationGranted) requestLocation();
  }, []); // eslint-disable-line

  if (locationGranted) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="location-banner"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="location-banner-content">
          <motion.div
            className="location-pulse"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <MapPin size={20} />
          </motion.div>
          <div className="location-text">
            {status === 'denied' ? (
              <>
                <strong>Location access needed</strong>
                <span>
                  Enable location to see nearby players.
                  {countdown !== null && countdown > 0 && (
                    <> Retrying in <strong>{countdown}s</strong>…</>
                  )}
                </span>
              </>
            ) : status === 'requesting' ? (
              <>
                <strong>Allow location access</strong>
                <span>Please click "Allow" in your browser popup</span>
              </>
            ) : (
              <>
                <strong>Enable your location</strong>
                <span>PlayRush needs location to show nearby players</span>
              </>
            )}
          </div>
          <div className="location-actions">
            <Shield size={14} style={{ color: 'var(--color-success)' }} />
            <span className="location-privacy">Privacy Protected</span>
            <button className="btn-location" onClick={requestLocation}>
              <RefreshCw size={14} />
              {status === 'denied' ? 'Try Again' : 'Enable'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
