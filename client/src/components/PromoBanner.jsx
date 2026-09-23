import { motion } from 'framer-motion';
import { Gift, Zap, Sparkles } from 'lucide-react';

export default function PromoBanner() {
  return (
    <aside className="promo-banner" aria-label="Welcome Bonus Announcement">
      <div className="promo-inner">
        <motion.div
          className="promo-badge"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <Gift size={15} />
          <span>BONUS REWARD</span>
        </motion.div>

        <p className="promo-text">
          🎁 <strong>Get ₹500 Instant Cash Bonus</strong> upon registration! Play games &amp; win real cash.
        </p>

        <div className="promo-tag">
          <Sparkles size={13} />
          <span>Claim ₹500</span>
        </div>
      </div>
    </aside>
  );
}
