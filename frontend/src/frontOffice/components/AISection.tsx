import React from 'react';
import '../styles/producer_dashboard.css';

const AISection = () => {
  return (
    <section className="ai-section">
      <div className="ai-card">
        <div className="ai-header">
          <i className="fas fa-robot"></i>
          <h3>Assistant IA Déchets</h3>
        </div>
        <div className="ai-content">
          <p>
            Notre intelligence artificielle peut vous aider à optimiser votre gestion des déchets.
            Posez vos questions sur le tri, le recyclage, ou demandez des analyses personnalisées.
          </p>
          <div className="ai-actions">
            <button className="ai-btn primary">
              <i className="fas fa-comment"></i>
              Poser une question
            </button>
            <button className="ai-btn secondary">
              <i className="fas fa-chart-line"></i>
              Analyse avancée
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISection;