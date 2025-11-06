import { useState, useEffect } from "react";
import "./pages.css";

interface Producer {
  producer: { value: string };
  id: { value: string };
  name: { value: string };
  type: { value: string };
  address?: { value: string };
  city?: { value: string };
  postalCode?: { value: string };
}

function Producers() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProducers();
  }, []);

  const fetchProducers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/production/producers/`);
      const data = await res.json();
      
      if (data.status === "error") {
        setError(data.message);
        return;
      }

      const producersData = data.data?.results?.bindings || [];
      setProducers(producersData);
    } catch (err: any) {
      setError("Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (typeUri: string) => {
    const type = typeUri.split('#').pop() || '';
    return type.replace(/_/g, ' ').replace('Producteur', '').trim() || 'Général';
  };

  const filteredProducers = filter === "all" 
    ? producers 
    : producers.filter(p => p.type.value.includes(filter));

  const typeCounts = producers.reduce((acc, producer) => {
    const type = getTypeLabel(producer.type.value);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="page-container">
   

      <div className="filters">
        <button 
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Tous ({producers.length})
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
      {loading && <div className="loading">Chargement des producteurs...</div>}

      <div className="grid-container">
        {filteredProducers.map((producer, index) => (
          <div key={index} className="card" style={{backgroundColor:"white"}}>
            <div className="card-header">
              <h3>{producer.name.value}</h3>
              <span className={`type-badge type-${getTypeLabel(producer.type.value).toLowerCase()}`}>
                {getTypeLabel(producer.type.value)}
              </span>
            </div>
            
            <div className="card-content">
              <p><strong>ID:</strong> {producer.id.value}</p>
              {producer.city && <p><strong>📍 Ville:</strong> {producer.city.value}</p>}
              {producer.address && <p><strong>🏠 Adresse:</strong> {producer.address.value}</p>}
              {producer.postalCode && <p><strong>📮 Code postal:</strong> {producer.postalCode.value}</p>}
            </div>

            <div className="card-actions">
              <button 
                className="action-btn primary"
                onClick={() => {
                  console.log('Voir déchets de:', producer.producer.value);
                }}
              >
                Voir les déchets
              </button>
              <button className="action-btn secondary">
                Détails
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredProducers.length === 0 && (
        <div className="empty-state">
          <p>Aucun producteur trouvé</p>
        </div>
      )}
    </div>
  );
}

export default Producers;