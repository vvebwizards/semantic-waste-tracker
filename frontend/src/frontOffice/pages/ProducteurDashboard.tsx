import React from 'react';
import Sidebar from '../partials/ProducerSideBar';
import DashboardHeader from '../partials/DashboardHeader';
import StatsGrid from '../components/ProducerStatsGrid';
import DistributionSection from '../components/DistributionSection';
import RecentDechets from '../components/RecentDechets';
import AISection from '../components/AISection';
import '../styles/producer_dashboard.css';

const ProducteurDashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="dashboard-main">
        <DashboardHeader />
        
        <div className="dashboard-content">
          {/* Section Statistiques */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-chart-bar"></i>
                Aperçu du Mois
              </h2>
            </div>
            <StatsGrid />
          </section>

          {/* Section Répartition */}
          <DistributionSection />

          {/* Section Derniers Déchets */}
          <RecentDechets />

          {/* Section IA */}
          <AISection />
        </div>
      </div>
    </div>
  );
};

export default ProducteurDashboard;