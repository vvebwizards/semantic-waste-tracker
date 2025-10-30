import React, { useState } from 'react';

const DashboardHeader = () => {
  const [notifications] = useState(3);

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1>Tableau de Bord</h1>
        <p>Bienvenue sur votre espace de gestion des déchets</p>
      </div>
      
      <div className="header-right">
        <div className="current-time">
          <div className="time">{new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</div>
          <div className="date">{new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;