import { Link } from 'react-router-dom';
import '../components/ErrorBoundary.css';

/*
  The Vercel rewrite serves index.html for every unmatched path so client-side
  routes survive a refresh. Without a catch-all route that also means any
  typo'd URL rendered the nav and footer around an empty page.
*/
export default function NotFound() {
  return (
    <div className="error-fallback">
      <div className="container error-fallback__inner">
        <span className="eyebrow">404</span>
        <h1 className="error-fallback__title">
          We couldn’t find <em>that one.</em>
        </h1>
        <p className="error-fallback__text">
          The page you were after doesn’t exist — it may have moved, or the link
          might have a typo. The catalog is a good place to start again.
        </p>
        <div className="error-fallback__actions">
          <Link to="/plants" className="error-fallback__btn">
            Browse the plants
          </Link>
          <Link to="/" className="error-fallback__link">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
