import React from 'react';
import '../styles/producer_dashboard.css';


const StatsGrid = () => {
  const stats = [
    {
      title: "Total Déchets",
      value: "1,250 kg",
      period: "Ce mois-ci",
      icon: "fas fa-weight-hanging",
      type: "primary" as const
    },
    {
      title: "Déchets Recyclés",
      value: "890 kg",
      period: "71% du total",
      icon: "fas fa-recycle",
      type: "success" as const
    },
    {
      title: "Compost Produit",
      value: "210 kg",
      period: "À partir des déchets organiques",
      icon: "fas fa-leaf",
      type: "warning" as const
    },
    {
      title: "CO₂ Évité",
      value: "2.1 t",
      period: "Équivalent carbone",
      icon: "fas fa-co2",
      type: "info" as const
    }
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className={`stat-card ${stat.type}`}>
          <div className="stat-content">
            <div className="stat-icon">
              <i className={stat.icon}></i>
            </div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-period">{stat.period}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;