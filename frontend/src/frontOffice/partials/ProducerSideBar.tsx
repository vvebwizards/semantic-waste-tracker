import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const ProducerSideBar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Tableau de Bord',
      path: '/dashboard',
      icon: 'fas fa-chart-pie',
    },
    {
      title: 'Mes Déchets',
      path: '/dashboard/dechets',
      icon: 'fas fa-trash',
    },
    {
      title: 'Statistiques',
      path: '/dashboard/statistiques',
      icon: 'fas fa-chart-bar',
    },
    {
      title: 'Points de Collecte',
      path: '/dashboard/collecte',
      icon: 'fas fa-map-marker-alt',
    },
    {
      title: 'Assistant IA',
      path: '/dashboard/assistant',
      icon: 'fas fa-robot',
    },
    {
      title: 'Paramètres',
      path: '/dashboard/parametres',
      icon: 'fas fa-cog',
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <div className="profile-info">
          <div className="profile-name">{user?.nom || user?.username}</div>
          <div className="profile-role">{user?.sous_role}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <div className="nav-icon">
              <i className={item.icon}></i>
            </div>
            <span className="nav-text">{item.title}</span>
            
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default ProducerSideBar;