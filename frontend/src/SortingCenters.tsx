import { useState, useEffect } from "react";
import "./pages.css";

interface SortingCenter {
  center: { value: string };
  id: { value: string };
  nomCentre: { value: string };
  type: { value: string };
  typeCentre?: { value: string };
  statutOperationnel?: { value: string };
  horairesOuverture?: { value: string };
  adresse?: { value: string };
}

function SortingCenters() {
  const [centers, setCenters] = useState<SortingCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/tri_compostage/centers/`);
      const data = await res.json();
      
      if (data.status === "error") {
        setError(data.message);
        return;
      }

      const centersData = data.data?.results?.bindings || [];
      setCenters(centersData);
    } catch (err: any) {
      setError("Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (typeUri: string) => {
    const type = typeUri.split('#').pop() || '';
    let label = type.replace(/_/g, ' ');
    // Remplacer les préfixes communs
    label = label.replace(/^Centre Tri /i, '').replace(/^Centre_Tri_/i, '');
    label = label.replace(/^Centre Compostage /i, 'Compostage ').replace(/^Centre_compostage$/i, 'Compostage');
    label = label.replace(/^Centre_Compostage_/i, 'Compostage ');
    label = label.replace(/^Usine Recyclage /i, 'Recyclage ').replace(/^Usine_recyclage$/i, 'Recyclage');
    label = label.replace(/^Usine_Recyclage_/i, 'Recyclage ');
    return label.trim() || 'Général';
  };

  const filteredCenters = filter === "all" 
    ? centers 
    : centers.filter(c => {
        const typeLabel = getTypeLabel(c.type.value).toLowerCase();
        return typeLabel.includes(filter.toLowerCase());
      });

  const typeCounts = centers.reduce((acc, center) => {
    const type = getTypeLabel(center.type.value);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getTypeBadgeClass = (typeLabel: string) => {
    const lower = typeLabel.toLowerCase();
    if (lower.includes('compostage')) return 'type-compostage';
    if (lower.includes('recyclage')) return 'type-recyclage';
    if (lower.includes('automatise')) return 'type-automatise';
    if (lower.includes('manuel')) return 'type-manuel';
    if (lower.includes('optique')) return 'type-optique';
    if (lower.includes('magnetique')) return 'type-magnetique';
    if (lower.includes('densite')) return 'type-densite';
    if (lower.includes('mixte')) return 'type-mixte';
    return 'type-general';
  };

  const getStatusBadgeClass = (statut?: string) => {
    if (!statut) return 'status-unknown';
    const lower = statut.toLowerCase();
    if (lower.includes('en_service') || lower.includes('actif')) return 'status-active';
    if (lower.includes('maintenance')) return 'status-maintenance';
    if (lower.includes('suspendu') || lower.includes('inactif')) return 'status-inactive';
    return 'status-unknown';
  };

  const getStatusLabel = (statut?: string) => {
    if (!statut) return 'Inconnu';
    const lower = statut.toLowerCase();
    if (lower.includes('en_service')) return 'En service';
    if (lower.includes('maintenance')) return 'Maintenance';
    if (lower.includes('suspendu')) return 'Suspendu';
    return statut;
  };

  const formatDateTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return '';
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTimeStr;
    }
  };

  return (
    <div className="page-container">
      <div className="filters">
        <button 
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Tous ({centers.length})
        </button>
        {Object.entries(typeCounts).map(([type, count]) => (
          <button
            key={type}
            className={`filter-btn ${filter === type ? "active" : ""}`}
            onClick={() => setFilter(type)}
          >
            {type} ({count})
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Chargement des centres de tri...</div>}

      <div className="grid-container">
        {filteredCenters.map((center, index) => (
          <div key={index} className="card" style={{backgroundColor:"white"}}>
            <div className="card-header">
              <h3>{center.nomCentre?.value || center.id?.value || 'Centre de tri'}</h3>
              <span className={`type-badge ${getTypeBadgeClass(getTypeLabel(center.type.value))}`}>
                {getTypeLabel(center.type.value)}
              </span>
            </div>
            
            <div className="card-content">
              <p><strong>ID:</strong> {center.id?.value || 'N/A'}</p>
              {center.nomCentre && <p><strong>📋 Nom:</strong> {center.nomCentre.value}</p>}
              {center.typeCentre && <p><strong>📋 Type:</strong> {center.typeCentre.value}</p>}
              {center.statutOperationnel && (
                <p>
                  <strong>Status:</strong> 
                  <span className={`status-badge ${getStatusBadgeClass(center.statutOperationnel.value)}`}>
                    {getStatusLabel(center.statutOperationnel.value)}
                  </span>
                </p>
              )}
              {center.horairesOuverture && (
                <p><strong>🕐 Horaires:</strong> {formatDateTime(center.horairesOuverture.value)}</p>
              )}
              {center.adresse && <p><strong>📍 Adresse:</strong> {center.adresse.value}</p>}
            </div>

            <div className="card-actions">
            
              
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredCenters.length === 0 && (
        <div className="empty-state">
          <p>Aucun centre de tri trouvé</p>
        </div>
      )}
    </div>
  );
}

export default SortingCenters;

