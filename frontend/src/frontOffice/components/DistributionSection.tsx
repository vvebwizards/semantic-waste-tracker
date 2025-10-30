import React from 'react';
import '../styles/producer_dashboard.css';


const DistributionSection = () => {
  const dechetsStats = {
    parType: [
      { type: 'Plastique', quantite: 450, pourcentage: 36 },
      { type: 'Organique', quantite: 320, pourcentage: 26 },
      { type: 'Papier', quantite: 280, pourcentage: 22 },
      { type: 'Métal', quantite: 120, pourcentage: 10 },
      { type: 'Verre', quantite: 80, pourcentage: 6 }
    ]
  };

  return (
    <section className="distribution-section">
      <div className="section-header">
        <h2>
          <i className="fas fa-chart-pie"></i>
          Répartition par Type
        </h2>
        <button className="ai-assistant-btn">
          <i className="fas fa-robot"></i>
          Analyser avec l'IA
        </button>
      </div>
      
      <div className="distribution-grid">
        <div className="chart-container">
          <div className="pie-chart-modern"></div>
          <div className="chart-legend">
            {dechetsStats.parType.map((item, index) => (
              <div key={item.type} className="legend-item">
                <div 
                  className="legend-color"
                  style={{backgroundColor: `hsl(${index * 70}, 70%, 50%)`}}
                ></div>
                <span>{item.type}</span>
                <span>{item.pourcentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="distribution-details">
          <h3>Détails par Catégorie</h3>
          {dechetsStats.parType.map((item) => (
            <div key={item.type} className="category-item">
              <div className="category-header">
                <span className="category-name">{item.type}</span>
                <span className="category-percentage">{item.pourcentage}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{width: `${item.pourcentage}%`}}
                ></div>
              </div>
              <div className="category-quantity">{item.quantite} kg</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DistributionSection;