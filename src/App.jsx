import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import WelcomePopup from './components/WelcomePopup';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Plants from './pages/Plants';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './context/ThemeContext';
import './styles/global.css';

function PageTransition({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  );
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/plants"
          element={
            <PageTransition>
              <Plants />
            </PageTransition>
          }
        />
        <Route
          path="/contact"
          element={
            <PageTransition>
              <Contact />
            </PageTransition>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Nav />
        {/* Scoped to the routed content so a page-level throw keeps the nav
            and footer usable instead of blanking the whole document. */}
        <ErrorBoundary where="page">
          <AnimatedRoutes />
        </ErrorBoundary>
        <Footer />
        {/* The popup is non-essential; if it throws it must not take the
            page down with it. */}
        <ErrorBoundary where="welcome-popup" fallbackSilent>
          <WelcomePopup />
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
}