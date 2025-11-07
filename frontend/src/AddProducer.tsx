import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./pages.css";

const FactoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
    <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
    <path d="M12 3v6"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

interface ProducerData {
  id: string;
  name: string;
  type: string;
  city: string;
  address: string;
  postalCode: string;
}

function AddProducer() {
  const { producerUri } = useParams();
  const [formData, setFormData] = useState<ProducerData>({
    id: "",
    name: "",
    type: "industriel",
    city: "",
    address: "",
    postalCode: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (producerUri) {
      setIsEditing(true);
      fetchProducerData(producerUri);
    }
  }, [producerUri]);

  const fetchProducerData = async (uri: string) => {
    try {
      setLoading(true);
      const decodedUri = decodeURIComponent(uri);
      const response = await fetch(`${API_URL}/api/production/producers/detailed/?producer_uri=${encodeURIComponent(decodedUri)}`);
      const result = await response.json();

      if (result.status === "success" && result.data.results.bindings.length > 0) {
        const bindings = result.data.results.bindings;
        
        const producerData: Partial<ProducerData> = {};
        
        bindings.forEach((binding: any) => {
          const property = binding.property.value;
          const value = binding.value.value;
          
          if (property.includes('idProducteur')) producerData.id = value;
          else if (property.includes('nom')) producerData.name = value;
          else if (property.includes('ville')) producerData.city = value;
          else if (property.includes('adresse')) producerData.address = value;
          else if (property.includes('codePostal')) producerData.postalCode = value;
        });

        setFormData(prev => ({
          ...prev,
          ...producerData
        }));
      }
    } catch (err: any) {
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditing && producerUri) {
        const decodedUri = decodeURIComponent(producerUri);
        const response = await fetch(`${API_URL}/api/production/producers/update/${encodeURIComponent(decodedUri)}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.status === "success") {
          navigate('/producers');
        } else {
          setError(result.message || "Erreur lors de la modification");
        }
      } else {
        const response = await fetch(`${API_URL}/api/production/producers/create/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.status === "success") {
          navigate('/producers');
        } else {
          setError(result.message || "Erreur lors de la création");
        }
      }
    } catch (err: any) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* En-tête cohérent avec Producers.tsx */}
      <div className="page-header">
        <div className="header-icon">
          {isEditing ? <EditIcon /> : <FactoryIcon />}
        </div>
        <h1>{isEditing ? 'Modifier le Producteur' : 'Ajouter un Producteur'}</h1>
        <p>
          {isEditing 
            ? 'Modifiez les informations du producteur dans le système' 
            : 'Créez un nouveau producteur de déchets dans le système'
          }
        </p>
      </div>

      {/* Actions de page cohérentes */}
      <div className="page-actions">
        <button 
          className="btn-secondary"
          onClick={() => navigate('/producers')}
        >
          <ArrowLeftIcon />
          Retour à la liste
        </button>
      </div>

      {/* Formulaire avec design cohérent */}
      <div className="form-wrapper">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="producer-form">
            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => setError("")} className="close-error">×</button>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="id">ID du Producteur *</label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  required
                  disabled={isEditing}
                  placeholder="Ex: PIND-001"
                  className="form-input"
                />
                {isEditing && <small className="field-note">L'ID ne peut pas être modifié</small>}
              </div>

              <div className="form-group">
                <label htmlFor="name">Nom du Producteur *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Usine Peugeot Sochaux"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Type de Producteur *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  disabled={isEditing}
                  className="form-select"
                >
                  <option value="industriel">Industriel</option>
                  <option value="agricole">Agricole</option>
                  <option value="commercial">Commercial</option>
                  <option value="hospitalier">Hospitalier</option>
                  <option value="residentiel">Résidentiel</option>
                </select>
                {isEditing && <small className="field-note">Le type ne peut pas être modifié</small>}
              </div>

              <div className="form-group">
                <label htmlFor="city">Ville *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Paris"
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">Adresse</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Ex: 123 Rue de l'Industrie"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="postalCode">Code Postal</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Ex: 75000"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {isEditing ? <EditIcon /> : <PlusIcon />}
                {loading 
                  ? (isEditing ? "Modification..." : "Création...") 
                  : (isEditing ? "Modifier le Producteur" : "Créer le Producteur")
                }
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => navigate('/producers')}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading">
            {isEditing ? "Chargement des données..." : "Traitement en cours..."}
          </div>
        </div>
      )}
    </div>
  );
}

export default AddProducer;