import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Users, Zap, ShieldCheck, Play, RotateCcw, Award } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';

export default function GameModal({ game, onClose }) {
  const { user } = useAuthStore();
  const { locationData } = useSessionStore();

  const [gameState, setGameState] = useState('matchmaking'); // matchmaking | playing | won | lost
  const [wallet, setWallet] = useState(500);
  const [countdown, setCountdown] = useState(3);
  const [roundResult, setRoundResult] = useState(null);

  // Matchmaking simulation
  useEffect(() => {
    if (gameState === 'matchmaking') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('playing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  const handlePlayRound = () => {
    // Deduct entry fee
    setWallet((w) => Math.max(0, w - 50));

    // Simulate winning
    setTimeout(() => {
      const won = Math.random() > 0.35; // 65% win chance for exciting demo
      if (won) {
        setWallet((w) => w + 95);
        setRoundResult('🎉 You Won ₹95! High Hand / Winning Move!');
        setGameState('won');
      } else {
        setRoundResult('Better luck next hand! Opponent scored higher.');
        setGameState('lost');
      }
    }, 1200);
  };

  const handlePlayAgain = () => {
    setGameState('matchmaking');
    setCountdown(2);
    setRoundResult(null);
  };

  return (
    <motion.div
      className="modal-overlay game-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: 9999 }}
    >
      <motion.div
        className="game-arena-modal"
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        {/* Header */}
        <div className="game-arena-header">
          <div className="game-arena-title-wrap">
            <span className="game-arena-tag">{game.tag || 'LIVE'}</span>
            <h3>{game.name} Arena</h3>
          </div>
          <div className="game-arena-wallet">
            <Zap size={15} color="var(--color-gold)" />
            <span>₹{wallet}</span>
          </div>
          <button className="game-arena-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Game Arena Body */}
        <div className="game-arena-body">
          {gameState === 'matchmaking' && (
            <div className="matchmaking-view">
              <motion.div
                className="matchmaking-radar"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <div className="radar-sweep" />
              </motion.div>
              <h4>Finding Nearby Opponents…</h4>
              <p className="matchmaking-sub">
                Searching verified players near{' '}
                {locationData?.latitude ? 'your region' : 'India'} • Starting in {countdown}s
              </p>

              {/* Player Slots */}
              <div className="matchmaking-slots">
                <div className="player-slot current-player">
                  <div className="slot-avatar-wrap">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.username} />
                    ) : (
                      <div className="slot-avatar-ph">👤</div>
                    )}
                    <span className="slot-verified-tag">
                      <ShieldCheck size={10} />
                    </span>
                  </div>
                  <span className="slot-name">{user?.username || 'You'}</span>
                  <span className="slot-status ready">Ready</span>
                </div>

                <div className="matchmaking-vs">VS</div>

                <div className="player-slot opponent">
                  <div className="slot-avatar-wrap opponent-avatar">
                    <span>👑</span>
                  </div>
                  <span className="slot-name">Rohit_Pro99</span>
                  <span className="slot-status matched">Matched ✓</span>
                </div>
              </div>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="playing-view">
              <div className="game-table-visual">
                <img src={game.image} alt={game.name} className="game-table-bg" />
                <div className="game-table-overlay" />
                <div className="game-table-center">
                  <div className="pot-chip-badge">
                    <Trophy size={16} color="var(--color-gold)" />
                    <span>Table Pot: ₹100</span>
                  </div>
                  <p className="table-turn-text">Your Turn to Move!</p>
                </div>
              </div>

              <div className="game-controls">
                <div className="match-info-strip">
                  <span>Entry: ₹50</span>
                  <span>Prize: ₹95</span>
                  <span>Skill Level: Verified</span>
                </div>
                <motion.button
                  className="btn-primary full game-action-btn"
                  onClick={handlePlayRound}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play size={18} /> Make Winning Move
                </motion.button>
              </div>
            </div>
          )}

          {(gameState === 'won' || gameState === 'lost') && (
            <div className="result-view">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`result-icon-box ${gameState}`}
              >
                {gameState === 'won' ? (
                  <Award size={48} color="#22c55e" />
                ) : (
                  <RotateCcw size={48} color="#f59e0b" />
                )}
              </motion.div>
              <h3 className={gameState === 'won' ? 'text-success' : 'text-warning'}>
                {gameState === 'won' ? 'Victory!' : 'Round Complete'}
              </h3>
              <p className="result-msg">{roundResult}</p>
              <div className="result-balance">
                Current Chips Balance: <strong>₹{wallet}</strong>
              </div>

              <div className="result-buttons">
                <button className="btn-primary full" onClick={handlePlayAgain}>
                  <RotateCcw size={16} /> Play Another Match
                </button>
                <button className="btn-outline-sm full" onClick={onClose}>
                  Back to Games
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
