import React from 'react';
import '../styles/home.css';
import { Link } from 'react-router-dom';

const Home = () => {
  const roles = [
    {
      id: 1,
      title: "Producteur",
      description: "Gérez la génération et le signalement des déchets",
      icon: "fas fa-industry",
      color: "#2e7d32"
    },
    {
      id: 2,
      title: "Collecteur",
      description: "Organisez la collecte et le transport des déchets",
      icon: "fas fa-truck",
      color: "#ff9800"
    },
    {
      id: 3,
      title: "Transporteur",
      description: "Gérez la logistique et la livraison des déchets",
      icon: "fas fa-shipping-fast",
      color: "#2196f3"
    },
    {
      id: 4,
      title: "Centre de Traitement",
      description: "Traitez et valorisez les différents types de déchets",
      icon: "fas fa-hard-hat",
      color: "#9c27b0"
    }
  ];

  return (
    <div className="home-container">
      <div className="floating-bubbles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="bubble" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>

      <header className="home-header">
        <div className="logo">
          <div className="logo-icon">
            <i className="fas fa-recycle"></i>
          </div>
          <span>EcoGestion</span>
        </div>
        <nav className="nav-links">
          <a href="#about" className="nav-link">À propos</a>
          <a href="#contact" className="nav-link">Contact</a>
          <Link to="/login" className="btn btn-primary">Connexion</Link>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span>♻️ Plateforme Intelligente</span>
          </div>
          <h1 className="hero-title">
            <span className="title-line">Transformons ensemble</span>
            <span className="title-line highlight">la gestion des déchets</span>
          </h1>
          <p className="hero-description">
            Rejoignez la révolution de l'économie circulaire. Tracez, organisez et valorisez 
            vos déchets grâce à notre plateforme innovante basée sur les technologies du web sémantique.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">Utilisateurs</div>
            </div>
            <div className="stat">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Déchets traités</div>
            </div>
            <div className="stat">
              <div className="stat-number">85%</div>
              <div className="stat-label">Taux de recyclage</div>
            </div>
          </div>
          <div className="auth-buttons">
            <Link to="/register" className="btn btn-outline">
              <i className="fas fa-rocket"></i>
              Commencer gratuitement
            </Link>
            <a href="/login" className="btn btn-secondary">
              <i className="fas fa-play-circle"></i>
              Voir la démo
            </a>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="animated-earth">
            <div className="earth-core"></div>
            <div className="earth-surface">
              <div className="recycle-symbol">
                <i className="fas fa-recycle"></i>
              </div>
            </div>
            <div className="orbiting-waste">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="waste-item" style={{
                  animationDelay: `${i * 2}s`
                }}>
                  <i className={`fas ${i % 3 === 0 ? 'fa-trash' : i % 3 === 1 ? 'fa-recycle' : 'fa-leaf'}`}></i>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Pourquoi choisir EcoGestion ?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <h3>Rapide & Efficace</h3>
              <p>Automatisez vos processus de gestion des déchets avec notre interface intuitive</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Analyses Avancées</h3>
              <p>Suivez vos performances et optimisez votre chaîne de valorisation</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Conforme & Sécurisé</h3>
              <p>Respectez toutes les réglementations environnementales en vigueur</p>
            </div>
          </div>
        </div>
      </section>

      <section className="roles-section">
        <div className="container">
          <h2 className="section-title">Rejoignez l'écosystème</h2>
          <p className="section-subtitle">Choisissez votre rôle et commencez à faire la différence</p>
          <div className="roles-grid">
            {roles.map((role, index) => (
              <div 
                key={role.id} 
                className="role-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="role-icon" style={{ color: role.color }}>
                  <i className={role.icon}></i>
                </div>
                <h3 className="role-title">{role.title}</h3>
                <p className="role-description">{role.description}</p>
                <div className="role-actions">
                  <a href={`/register?role=${role.title.toLowerCase()}`} className="role-btn">
                    S'inscrire
                  </a>
                </div>
                <div className="role-glow" style={{ background: role.color }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à révolutionner votre gestion des déchets ?</h2>
            <p>Rejoignez des centaines d'acteurs déjà engagés dans l'économie circulaire</p>
            <div className="cta-buttons">
              <a href="/register" className="btn btn-large btn-primary">
                <i className="fas fa-calendar-check"></i>
                Planifier une démo
              </a>
              <a href="/contact" className="btn btn-large btn-outline">
                <i className="fas fa-question-circle"></i>
                Poser une question
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <i className="fas fa-recycle"></i>
                <span>EcoGestion</span>
              </div>
              <p>La plateforme intelligente pour une gestion durable des déchets</p>
              <div className="social-links">
                <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
                <a href="#" className="social-link"><i className="fab fa-linkedin"></i></a>
                <a href="#" className="social-link"><i className="fab fa-github"></i></a>
              </div>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Plateforme</h4>
                <a href="/features">Fonctionnalités</a>
                <a href="/pricing">Tarifs</a>
                <a href="/api">API</a>
              </div>
              <div className="link-group">
                <h4>Ressources</h4>
                <a href="/blog">Blog</a>
                <a href="/docs">Documentation</a>
                <a href="/support">Support</a>
              </div>
              <div className="link-group">
                <h4>Entreprise</h4>
                <a href="/about">À propos</a>
                <a href="/careers">Carrières</a>
                <a href="/contact">Contact</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 EcoGestion. Tous droits réservés.</p>
            <div className="footer-legal">
              <a href="/privacy">Confidentialité</a>
              <a href="/terms">Conditions</a>
              <a href="/cookies">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;