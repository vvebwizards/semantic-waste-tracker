import React from 'react';
import '../styles/producer_dashboard.css';

const RecentDechets = () => {
  const recentDechets = [
    { id: 1, type: 'Plastique PET', quantite: '25 kg', date: '2024-01-15', statut: 'Collecté' },
    { id: 2, type: 'Carton', quantite: '18 kg', date: '2024-01-14', statut: 'En attente' },
    { id: 3, type: 'Déchets organiques', quantite: '32 kg', date: '2024-01-13', statut: 'Traité' },
    { id: 4, type: 'Verre', quantite: '12 kg', date: '2024-01-12', statut: 'Collecté' }
  ];

  return (
    <section className="table-section">
      <div className="section-header">
        <h2>
          <i className="fas fa-history"></i>
          Dernières Entrées
        </h2>
      </div>
      
      <div className="table-container">
        <table className="dechets-table">
          <thead>
            <tr>
              <th>Type de Déchet</th>
              <th>Quantité</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentDechets.map((dechet) => (
              <tr key={dechet.id}>
                <td>
                  <i className="fas fa-trash"></i>
                  {dechet.type}
                </td>
                <td>{dechet.quantite}</td>
                <td>{dechet.date}</td>
                <td>
                  <span className={`status-badge status-${dechet.statut.toLowerCase()}`}>
                    {dechet.statut}
                  </span>
                </td>
                <td>
                  <button className="action-btn info">
                    <i className="fas fa-eye"></i>
                  </button>
                  <button className="action-btn warning">
                    <i className="fas fa-edit"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RecentDechets;