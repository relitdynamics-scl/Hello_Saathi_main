import { Link } from 'react-router-dom';
import { Leaf, Camera, MessageCircle, MapPin } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="footer__brand-mark">
              <Leaf size={16} strokeWidth={2.2} />
            </span>
            <span className="footer__brand-name">Hello Saathi</span>
          </div>
          <p className="footer__tag">A little green company for your home.</p>
        </div>

        <div className="footer__grid">
          <div className="footer__col">
            <span className="footer__col-title">Explore</span>
            <Link to="/">Home</Link>
            <Link to="/plants">Our plants</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer__col">
            <span className="footer__col-title">Visit</span>
            <span className="footer__row"><MapPin size={14} /> Delhi</span>
            <span className="footer__row">Open daily, 9am – 7pm</span>
          </div>
          <div className="footer__col">
            <span className="footer__col-title">Say hello</span>
            <a href="#" className="footer__row"><Camera size={14} /> @hellosaathi</a>
            <a href="#" className="footer__row"><MessageCircle size={14} /> Chat with us</a>
          </div>
        </div>
      </div>

      <div className="footer__bottom container">
        <span>© {new Date().getFullYear()} Hello Saathi. Grown with care.</span>
      </div>
    </footer>
  );
}