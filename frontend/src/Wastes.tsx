import { useState, useEffect } from "react";
import "./pages.css";

interface Waste {
  waste: { value: string };
  id: { value: string };
  name?: { value: string };
  type: { value: string };
  weight?: { value: string };
  quantity?: { value: string };
  dangerLevel?: { value: string };
}

function Wastes() {
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchWastes();
  }, []);

  const fetchWastes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/production/wastes/`);
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

  const getTypeLabel = (typeUri: string) => {
    const type = typeUri.split('#').pop() || '';
    return type.replace(/_/g, ' ').replace('Dechets', '').trim() || 'Déchet';
  };

  const getDangerColor = (level: string) => {
    const numLevel = parseInt(level);
    if (numLevel >= 4) return 'danger-high';
    if (numLevel >= 2) return 'danger-medium';
    return 'danger-low';
  };

  return (
    <div className="page-container">

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Chargement des déchets...</div>}

      <div className="grid-container">
        {wastes.map((waste, index) => (
          <div key={index} className="card waste-card">
            <div className="card-header">
              <h3>{waste.name?.value || 'Déchet sans nom'}</h3>
              <span className={`type-badge type-${getTypeLabel(waste.type.value).toLowerCase()}`}>
                {getTypeLabel(waste.type.value)}
              </span>
            </div>
            
            <div className="card-content">
              <p><strong>ID:</strong> {waste.id.value}</p>
              {waste.weight && <p><strong>⚖️ Poids:</strong> {waste.weight.value} kg</p>}
              {waste.quantity && <p><strong>📦 Quantité:</strong> {waste.quantity.value}</p>}
              {waste.dangerLevel && (
                <p>
                  <strong>⚠️ Niveau de danger:</strong> 
                  <span className={`danger-level ${getDangerColor(waste.dangerLevel.value)}`}>
                    {waste.dangerLevel.value}/5
                  </span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && wastes.length === 0 && (
        <div className="empty-state">
          <p>Aucun déchet trouvé</p>
        </div>
      )}
    </div>
  );
}

export default Wastes;