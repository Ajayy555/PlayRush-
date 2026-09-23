import { motion } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';

export default function PromoBanner() {
  return (
    <aside className="promo-banner" aria-label="Welcome Bonus Announcement">
      <div className="promo-inner">
        <motion.div
          className="promo-badge"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Gift size={13} className="promo-gift-icon" />
          <span>BONUS</span>
        </motion.div>

        <p className="promo-text">
          <span className="promo-desktop-msg">
            🎁 <strong>Get ₹500 Instant Cash Bonus</strong> upon registration! Play games &amp; win real cash.
          </span>
          <span className="promo-mobile-msg">
            🎁 <strong>₹500 Instant Bonus</strong> on registration!
          </span>
        </p>

        <div className="promo-tag">
          <Sparkles size={12} />
          <span>Claim ₹500</span>
        </div>
      </div>
    </aside>
  );
}
