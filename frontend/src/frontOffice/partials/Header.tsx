import React from 'react';

const Header = () => (
  <header className="fo-header">
    <div className="logo">
      ♻️ <span>EcoTrace</span>
    </div>
    <nav className="nav-links">
      <a href="/">Accueil</a>
      <a href="/login">Connexion</a>
      <a href="/register">Inscription</a>
    </nav>
  </header>
);

export default Header;
