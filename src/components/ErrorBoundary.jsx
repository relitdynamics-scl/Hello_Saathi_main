import { Component } from 'react';
import { Link } from 'react-router-dom';
import { reportError, GENERIC_MESSAGE } from '../utils/reportError';
import './ErrorBoundary.css';

/*
  Without this, a throw during render unmounts the entire React tree and the
  visitor is left looking at a blank white page.

  The fallback shows a fixed sentence and a reference code. It never renders
  error.message or the stack — in a bundled app those carry module paths and
  chunk names, which is exactly what should not reach a visitor.
*/
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, reference: null };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    const { reference } = reportError(error, {
      where: this.props.where || 'render',
      componentStack: info?.componentStack,
    });
    this.setState({ reference });
  }

  render() {
    if (!this.state.failed) return this.props.children;

    // Non-essential widgets just disappear: a broken popup should not put a
    // full-page error in front of someone browsing the catalog.
    if (this.props.fallbackSilent) return null;

    return (
      <div className="error-fallback">
        <div className="container error-fallback__inner">
          <span className="eyebrow">Something broke</span>
          <h1 className="error-fallback__title">
            This page didn’t load <em>properly.</em>
          </h1>
          <p className="error-fallback__text">{GENERIC_MESSAGE}</p>
          <div className="error-fallback__actions">
            <button className="error-fallback__btn" onClick={() => window.location.reload()}>
              Reload the page
            </button>
            <Link to="/" className="error-fallback__link">
              Back to home
            </Link>
          </div>
          {this.state.reference && (
            <p className="error-fallback__ref">
              Reference <code>{this.state.reference}</code> — quote this if you tell us about it.
            </p>
          )}
        </div>
      </div>
    );
  }
}
