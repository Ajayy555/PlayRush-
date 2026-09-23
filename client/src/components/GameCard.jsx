import { motion } from 'framer-motion';
import { Users, Star, ChevronRight, Zap } from 'lucide-react';

export default function GameCard({ game, index, onPlay }) {
  const { name, image, players, rating, tag, tagColor } = game;

  return (
    <motion.div
      className="game-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <div className="game-card-img-wrapper">
        <img src={image} alt={name} className="game-card-img" loading="lazy" />
        <div className="game-card-overlay" />
        {tag && (
          <span className="game-card-tag" style={{ background: tagColor || 'var(--color-accent)' }}>
            {tag}
          </span>
        )}
      </div>
      <div className="game-card-body">
        <h3 className="game-card-title">{name}</h3>
        <div className="game-card-meta">
          <span className="game-meta-item"><Users size={12} /> {players}</span>
          <span className="game-meta-item"><Star size={12} /> {rating}</span>
        </div>
        <motion.button
          className="game-card-btn"
          whileHover={{ gap: '10px' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPlay && onPlay(game)}
        >
          <Zap size={14} /> Play Now <ChevronRight size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
}
