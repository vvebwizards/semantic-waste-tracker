import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./producerWastes.css";

// Icônes SVG
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const WeightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m21 16-4 4-4-4"/>
    <path d="M17 20V4"/>
    <path d="m3 8 4-4 4 4"/>
    <path d="M7 4v16"/>
  </svg>
);

const QuantityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 21h8"/>
    <path d="M12 17v4"/>
    <path d="M3 10h18l-1.5 6h-15L3 10Z"/>
    <path d="M3 10l1-4h16l1 4"/>
  </svg>
);

const DangerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" x2="12" y1="16" y2="12"/>
    <line x1="12" x2="12.01" y1="8" y2="8"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

interface Waste {
  waste: { value: string };
  id: { value: string };
  name?: { value: string };
  type?: { value: string };
  weight?: { value: string };
  quantity?: { value: string };
  dangerLevel?: { value: string };
  creationDate?: { value: string };
  description?: { value: string };
}

interface ProducerInfo {
  name: string;
  id: string;
  type: string;
  city?: string;
}

function ProducerWastes() {
  const { producerUri } = useParams<{ producerUri: string }>();
  const navigate = useNavigate();
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [producerInfo, setProducerInfo] = useState<ProducerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (producerUri) {
      fetchProducerWastes();
      fetchProducerInfo();
    }
  }, [producerUri]);

  const fetchProducerWastes = async () => {
    try {
      setLoading(true);
      const decodedUri = decodeURIComponent(producerUri!);
      const res = await fetch(
        `${API_URL}/api/production/producers/wastes/detailed/?producer_uri=${encodeURIComponent(decodedUri)}`
      );
      const data = await res.json();
      
      if (data.status === "error") {
        setError(data.message);
        return;
      }

      const wastesData = data.data?.results?.bindings || [];
      setWastes(wastesData);
    } catch (err: any) {
      setError("Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducerInfo = async () => {
    try {
      const decodedUri = decodeURIComponent(producerUri!);
      const res = await fetch(
        `${API_URL}/api/production/producers/details/?producer_uri=${encodeURIComponent(decodedUri)}`
      );
      const data = await res.json();
      
      if (data.status === "success" && data.data?.results?.bindings.length > 0) {
        const bindings = data.data.results.bindings;
        const info: ProducerInfo = {
          name: '',
          id: '',
          type: 'Producteur'
        };
        
        bindings.forEach((binding: any) => {
          const property = binding.property.value;
          const value = binding.value.value;
          
          if (property.includes('nom')) info.name = value;
          else if (property.includes('idProducteur')) info.id = value;
          else if (property.includes('ville')) info.city = value;
        });
        
        setProducerInfo(info);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des infos du producteur:", err);
    }
  };

  const getDangerLevelLabel = (level: string) => {
    const levels: { [key: string]: { label: string, class: string } } = {
      "1": { label: "Faible", class: "danger-low" },
      "2": { label: "Moyen", class: "danger-medium" },
      "3": { label: "Élevé", class: "danger-high" },
      "faible": { label: "Faible", class: "danger-low" },
      "moyen": { label: "Moyen", class: "danger-medium" },
      "eleve": { label: "Élevé", class: "danger-high" },
    };
    
    return levels[level.toLowerCase()] || { label: "Inconnu", class: "danger-unknown" };
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const getWasteTypeLabel = (typeUri: string) => {
    if (!typeUri) return "Non spécifié";
    const type = typeUri.split('#').pop() || '';
    return type.replace(/_/g, ' ').replace('Dechet', '').trim() || 'Général';
  };

  if (!producerUri) {
    return (
      <div className="producer-wastes-page">
        <div className="error-message">
          <p>URI du producteur non spécifiée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="producer-wastes-page">
      <div className="producer-wastes-container">
        <div className="wastes-header">
  <div className="header-main">
    <button 
      className="back-btn"
      onClick={() => navigate('/producers')}
    >
      <ArrowLeftIcon />
      Retour aux producteurs
    </button>
    <div className="header-content">
      
      <div className="header-text">
        <h1>Déchets du Producteur</h1>
        {producerInfo && (
          <div className="producer-info">
            <h2>{producerInfo.name}</h2>
            <div className="producer-details">
              <span>ID: {producerInfo.id}</span>
              {producerInfo.city && <span>📍 {producerInfo.city}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  
  <div className="header-stats">
    <div className="stat-badge">
      <span className="stat-number">{wastes.length}</span>
      <span className="stat-label">Déchets</span>
    </div>
  </div>
</div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError("")}>×</button>
          </div>
        )}
        
        {loading && <div className="loading">Chargement des déchets...</div>}

        {!loading && wastes.length > 0 && (
          <div className="wastes-section">
            <div className="section-header">
              <h3>Liste des Déchets</h3>
              <div className="info-text">
                {wastes.length} déchet{wastes.length > 1 ? 's' : ''} trouvé{wastes.length > 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="wastes-grid">
              {wastes.map((waste, index) => {
                const dangerInfo = waste.dangerLevel ? getDangerLevelLabel(waste.dangerLevel.value) : null;
                
                return (
                  <div key={index} className="waste-card">
                    <div className="waste-header">
                      <h4>{waste.name?.value || `Déchet ${waste.id.value}`}</h4>
                      <div className="waste-badges">
                        <span className="id-badge">ID: {waste.id.value}</span>
                        {waste.type && (
                          <span className="type-badge">
                            {getWasteTypeLabel(waste.type.value)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="waste-content">
                      {dangerInfo && (
                        <div className="danger-level">
                          <span className={`danger-indicator ${dangerInfo.class}`}>
                            <DangerIcon />
                            Niveau de danger: {dangerInfo.label}
                          </span>
                        </div>
                      )}
                      
                      {(waste.weight?.value || waste.quantity?.value) && (
                        <div className="waste-metrics">
                          {waste.weight?.value && (
                            <div className="metric">
                              <div className="metric-icon">
                                <WeightIcon />
                              </div>
                              <div className="metric-info">
                                <span className="metric-value">{waste.weight.value} kg</span>
                                <span className="metric-label">Poids</span>
                              </div>
                            </div>
                          )}
                          {waste.quantity?.value && (
                            <div className="metric">
                              <div className="metric-icon">
                                <QuantityIcon />
                              </div>
                              <div className="metric-info">
                                <span className="metric-value">{waste.quantity.value}</span>
                                <span className="metric-label">Quantité</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {waste.creationDate?.value && (
                        <div className="waste-date">
                          <CalendarIcon />
                          <span>Créé le {formatDate(waste.creationDate.value)}</span>
                        </div>
                      )}
                      
                      {waste.description?.value && (
                        <div className="waste-description">
                          <div className="description-header">
                            <InfoIcon />
                            <span>Description</span>
                          </div>
                          <p>{waste.description.value}</p>
                        </div>
                      )}
                    </div>
                    
                    
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && wastes.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-icon">🗑️</div>
            <h3>Aucun déchet trouvé</h3>
            <p>Ce producteur n'a pas encore de déchets associés.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProducerWastes;