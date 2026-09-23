import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MapPin, Camera, Trophy, Users, Star, ArrowRight, Shield, Award, CheckCircle2, X, Sparkles } from 'lucide-react';
import GameCard from '../components/GameCard';
import GameModal from '../components/GameModal';
import { useAuthStore } from '../store/useAuthStore';

import teenPatti from '../assets/games/teen_patti.jpg';
import ludo from '../assets/games/ludo.jpg';
import rummy from '../assets/games/rummy.jpg';
import andarBahar from '../assets/games/andar_bahar.jpg';
import tambola from '../assets/games/tambola.jpg';
import carrom from '../assets/games/carrom.jpg';
import cricket from '../assets/games/cricket_fantasy.jpg';

const GAMES = [
  { name: 'Teen Patti', image: teenPatti, players: '2.4M playing', rating: '4.9', tag: '🔥 Hot', tagColor: '#ff4444' },
  { name: 'Ludo Star', image: ludo, players: '1.8M playing', rating: '4.8', tag: '🏆 Top', tagColor: '#f59e0b' },
  { name: 'Rummy', image: rummy, players: '3.1M playing', rating: '4.9', tag: '💎 Pro', tagColor: '#8b5cf6' },
  { name: 'Andar Bahar', image: andarBahar, players: '980K playing', rating: '4.7', tag: '⚡ Live', tagColor: '#06b6d4' },
  { name: 'Cricket Fantasy', image: cricket, players: '5.2M playing', rating: '4.9', tag: '🏏 #1', tagColor: '#22c55e' },
  { name: 'Tambola', image: tambola, players: '620K playing', rating: '4.6', tag: '🎉 Fun', tagColor: '#ec4899' },
  { name: 'Carrom', image: carrom, players: '440K playing', rating: '4.5', tag: '🎯 Skill', tagColor: '#0ea5e9' },
];

const LIVE_PLAYERS = [
  { name: 'Rahul S.', game: 'Teen Patti', won: '₹2,400', avatar: '👨' },
  { name: 'Priya M.', game: 'Rummy', won: '₹1,150', avatar: '👩' },
  { name: 'Arjun K.', game: 'Cricket', won: '₹5,800', avatar: '🧑' },
  { name: 'Sneha R.', game: 'Ludo', won: '₹320', avatar: '👩' },
  { name: 'Vikram P.', game: 'Teen Patti', won: '₹870', avatar: '👨' },
];

const FEATURES = [
  { icon: <MapPin size={28} />, title: 'Nearby Players', desc: 'Find players in your city and challenge them to live matches.' },
  { icon: <Trophy size={28} />, title: 'Referral System', desc: 'Invite friends, earn ₹100 per referral. No limits!' },
  { icon: <Camera size={28} />, title: 'Verified Players', desc: 'Face verification ensures real players — no bots allowed.' },
  { icon: <Star size={28} />, title: 'Analytics', desc: 'Track your win rate, earnings, and gaming streaks.' },
];

// Animated number counter
function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    let start = 0;
    const step = Math.ceil(target / 80);
    const t = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(start);
      if (start >= target) clearInterval(t);
    }, 20);
  }, [target]);
  return <>{val.toLocaleString()}{suffix}</>;
}

export default function LandingPage() {
  const { user } = useAuthStore();
  const [selectedGame, setSelectedGame] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Auto-scroll to games on registration event + auto dismiss toast after 8 seconds
  useEffect(() => {
    let dismissTimer;
    const handleRegistered = () => {
      setShowCelebration(true);
      setTimeout(() => {
        const gamesEl = document.getElementById('games');
        if (gamesEl) {
          gamesEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);

      dismissTimer = setTimeout(() => {
        setShowCelebration(false);
      }, 8000);
    };

    window.addEventListener('playrush:registered', handleRegistered);
    return () => {
      window.removeEventListener('playrush:registered', handleRegistered);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, []);

  return (
    <div className="landing">
      {/* Interactive Game Arena Modal */}
      <AnimatePresence>
        {selectedGame && (
          <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
        )}
      </AnimatePresence>

      {/* Welcome Celebration Banner after registration */}
      <AnimatePresence>
        {showCelebration && user && (
          <div className="celebration-toast-wrapper">
            <motion.div
              className="celebration-toast-card"
              initial={{ opacity: 0, y: -25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            >
              <div className="celebration-icon-box">
                <Award size={28} color="var(--color-gold)" />
              </div>
              <div className="celebration-body">
                <div className="celebration-tag">
                  <Sparkles size={12} />
                  <span>₹500 INSTANT BONUS CLAIMED</span>
                </div>
                <h4 className="celebration-heading">
                  Welcome to PlayRush, <span>{user.username}</span>! 🎉
                </h4>
                <p className="celebration-desc">
                  ₹500 has been credited to your wallet. Click any game below to play!
                </p>
              </div>
              <button
                type="button"
                className="celebration-close-btn"
                onClick={() => setShowCelebration(false)}
                aria-label="Close notification"
              >
                <X size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Animated background particles */}
      <div className="particles" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Hero */}
      <section className="hero" id="hero">
        <div className="hero-content">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Zap size={14} /> India's #1 Gaming Referral Platform
          </motion.div>
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Discover the<br />
            <span className="gradient-text">PlayRush Experience</span>
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Play India's favourite games, challenge nearby players, win real rewards. 50,000+ verified players online right now.
          </motion.p>
          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              className="btn-hero"
              onClick={() => {
                const el = document.getElementById('games');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Play Games Now <ArrowRight size={18} />
            </button>
            <div className="hero-trust">
              <Shield size={14} /> 100% Secure &amp; Verified Players
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[
              { label: 'Players Online', value: 52400, suffix: '+' },
              { label: 'Games Played Today', value: 284000, suffix: '+' },
              { label: 'Winners This Week', value: 18700, suffix: '+' },
            ].map((s) => (
              <div className="stat-item" key={s.label}>
                <span className="stat-number"><Counter target={s.value} suffix={s.suffix} /></span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating game preview cards */}
        <div className="hero-visual" aria-hidden="true">
          {[teenPatti, ludo, cricket].map((img, i) => (
            <motion.div
              key={i}
              className="hero-float-card"
              style={{ '--i': i }}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
            >
              <img src={img} alt="" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live Activity */}
      <section className="live-activity" id="activity">
        <div className="container">
          <div className="section-header">
            <motion.span className="live-dot" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>●</motion.span>
            <h2>Live Winners Right Now</h2>
          </div>
          <div className="activity-ticker">
            <motion.div
              className="ticker-track"
              animate={{ x: [0, -1200] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            >
              {[...LIVE_PLAYERS, ...LIVE_PLAYERS].map((p, i) => (
                <div className="ticker-card" key={i}>
                  <span className="ticker-avatar">{p.avatar}</span>
                  <div>
                    <strong>{p.name}</strong>
                    <span>won {p.won} in {p.game}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="games-section" id="games">
        <div className="container">
          <motion.div className="section-header" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2>🎮 Play India's Favourite Games</h2>
            <p>Verified, skill-based gaming — click any game to enter match arena</p>
          </motion.div>
          <div className="games-grid">
            {GAMES.map((g, i) => (
              <GameCard
                key={g.name}
                game={g}
                index={i}
                onPlay={(selected) => setSelectedGame(selected)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>Why PlayRush?</h2>
            <p>The safest, most exciting social gaming experience</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <motion.div
                className="feature-card"
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Zap size={22} color="var(--color-accent)" />
              <span className="brand-name">PlayRush</span>
              <p>India's leading verified gaming platform.</p>
            </div>
            <div className="footer-links">
              <a href="#hero">Home</a>
              <a href="#games">Games</a>
              <a href="#how-it-works">About</a>
              <a href="/admin">Admin Portal</a>
            </div>
          </div>
          <p className="copyright">© 2026 PlayRush. All rights reserved. 18+ only. Play responsibly.</p>
        </div>
      </footer>
    </div>
  );
}
