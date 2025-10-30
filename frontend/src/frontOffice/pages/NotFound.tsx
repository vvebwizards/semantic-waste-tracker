// frontOffice/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/notfound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-bubbles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="not-found-bubble"></div>
        ))}
      </div>

      <div className="floating-elements">
        <div className="floating-element">♻️</div>
        <div className="floating-element">🌱</div>
        <div className="floating-element">💚</div>
        <div className="floating-element">🌍</div>
      </div>

      <div className="not-found-content">
        <div className="error-animation">
          <div className="error-number">404</div>
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
        </div>

        <h1>Page non trouvée</h1>
        <p>
          Désolé, la page que vous recherchez semble s'être perdue dans le cycle de recyclage. 
          Elle pourrait avoir été déplacée ou n'existe plus.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="not-found-btn primary">
            <i className="fas fa-home"></i>
            Retour à l'accueil
          </Link>
          <Link to="/login" className="not-found-btn secondary">
            <i className="fas fa-sign-in-alt"></i>
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;