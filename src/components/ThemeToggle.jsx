import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={!isLight}
    >
      <span className="theme-toggle__track">
        <motion.span
          className="theme-toggle__thumb"
          animate={{ x: isLight ? 0 : 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isLight ? (
              <motion.span
                key="sun"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.25 }}
                className="theme-toggle__icon"
              >
                <Sun size={13} strokeWidth={2.3} />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.25 }}
                className="theme-toggle__icon"
              >
                <Moon size={13} strokeWidth={2.3} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
      </span>
    </button>
  );
}