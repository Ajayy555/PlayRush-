import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useSessionStore } from './store/useSessionStore';
import PromoBanner   from './components/PromoBanner';
import LocationModal from './components/LocationModal';
import Navbar        from './components/Navbar';
import RegisterModal from './components/RegisterModal';
import LoginModal    from './components/LoginModal';
import LandingPage   from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import api from './services/api';

function AppContent() {
  const { user, token, fetchMe } = useAuthStore();
  const { sessionId, locationGranted } = useSessionStore();
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Listen for "Login here" link inside RegisterModal
  useEffect(() => {
    const handler = () => setShowLogin(true);
    window.addEventListener('playrush:openLogin', handler);
    return () => window.removeEventListener('playrush:openLogin', handler);
  }, []);

  // Restore session if token exists
  useEffect(() => {
    if (token) fetchMe();
  }, [token]);

  // Track visitor analytics once on mount
  useEffect(() => {
    api.post('/api/analytics/visitor', {
      sessionId,
      userAgent:    navigator.userAgent,
      language:     navigator.language,
      timezone:     Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenWidth:  window.screen.width,
      screenHeight: window.screen.height,
      referrer:     document.referrer,
    }).catch(() => {});
  }, [sessionId]);

  const isLoggedIn = !!user;

  // Modals must ONLY show on main public gaming routes (never on /admin)
  const showLocationModal  = !isAdminRoute && !locationGranted;
  const showRegisterModal  = !isAdminRoute && locationGranted && !isLoggedIn && !showLogin;
  const showLoginModal     = !isAdminRoute && locationGranted && !isLoggedIn && showLogin;

  return (
    <>
      {/* PromoBanner always on top */}
      <PromoBanner />

      {/* Navbar always visible as backdrop context */}
      <Navbar onLoginClick={() => setShowLogin(true)} />

      {/* Landing page always rendered in background */}
      <Routes>
        <Route path="/"      element={<LandingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

      {/* Modal layers — on top of everything */}
      {showLocationModal  && <LocationModal />}
      {showRegisterModal  && <RegisterModal />}
      {showLoginModal     && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
