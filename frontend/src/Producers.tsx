import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./producer.css";


const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.3-4.3"/>
  </svg>
);

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

const ResetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
);

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
  const [filteredProducers, setFilteredProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [cities, setCities] = useState<string[]>([]);
  const [producerTypes, setProducerTypes] = useState<{value: string, label: string}[]>([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProducers();
    fetchProducerTypes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [producers, searchTerm, selectedCity, selectedType]);

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
      
      const uniqueCities = Array.from(
        new Set(
          producersData
            .filter(p => p.city?.value)
            .map(p => p.city.value)
            .sort()
        )
      ) as string[];
      setCities(uniqueCities);
    } catch (err: any) {
      setError("Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducerTypes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/production/producers/types/`);
      const data = await res.json();
      
      if (data.status === "success") {
        const types = data.data?.results?.bindings || [];
        const formattedTypes = types.map((type: any) => ({
          value: type.type.value.split('#').pop() || '',
          label: type.label?.value || type.type.value.split('#').pop()?.replace(/_/g, ' ') || ''
        }));
        setProducerTypes(formattedTypes);
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des types:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...producers];

    if (searchTerm) {
      filtered = filtered.filter(producer =>
        producer.name.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producer.id.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCity) {
      filtered = filtered.filter(producer =>
        producer.city?.value.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(producer =>
        producer.type.value.includes(selectedType)
      );
    }

    setFilteredProducers(filtered);
  };

  const handleSearchByCity = async (city: string) => {
    if (!city) {
      fetchProducers(); 
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/production/producers/city/?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      
      if (data.status === "success") {
        const producersData = data.data?.results?.bindings || [];
        setFilteredProducers(producersData);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByType = async (type: string) => {
    if (type === "all") {
      fetchProducers();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/production/producers/type/${type}/`);
      const data = await res.json();
      
      if (data.status === "success") {
        const producersData = data.data?.results?.bindings || [];
        setFilteredProducers(producersData);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalSearch = async () => {
    if (!searchTerm) {
      fetchProducers();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/production/producers/search/?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      
      if (data.status === "success") {
        const producersData = data.data?.results?.bindings || [];
        setFilteredProducers(producersData);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCity("");
    setSelectedType("all");
    fetchProducers();
  };

  const handleDelete = async (producerUri: string) => {
    try {
      const response = await fetch(`${API_URL}/api/production/producers/delete/${encodeURIComponent(producerUri)}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.status === "success") {
        setProducers(producers.filter(p => p.producer.value !== producerUri));
        setFilteredProducers(filteredProducers.filter(p => p.producer.value !== producerUri));
        setDeleteConfirm(null);
      } else {
        setError(result.message || "Erreur lors de la suppression");
      }
    } catch (err: any) {
      setError("Erreur de connexion au serveur");
    }
  };

  const getTypeLabel = (typeUri: string) => {
    const type = typeUri.split('#').pop() || '';
    return type.replace(/_/g, ' ').replace('Producteur', '').trim() || 'Général';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-icon">
          <FactoryIcon />
        </div>
        <h1>Gestion des Producteurs</h1>
        <p>Gérez l'ensemble des producteurs de déchets</p>
      </div>

      <div className="page-actions">
        <button 
          className="add-btn"
          onClick={() => navigate('/producers/add')}
        >
          <PlusIcon />
          Ajouter un Producteur
        </button>
      </div>

      <div className="search-filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="Rechercher par nom ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGlobalSearch()}
            className="search-input"
          />
          <button 
            onClick={handleGlobalSearch}
            className="search-btn"
          >
            <SearchIcon />
            Rechercher
          </button>
        </div>

        <div className="filter-group">
          <label>Ville</label>
          <select 
            value={selectedCity} 
            onChange={(e) => {
              setSelectedCity(e.target.value);
              handleSearchByCity(e.target.value);
            }}
            className="filter-select"
          >
            <option value="">Toutes les villes</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Type</label>
          <select 
            value={selectedType} 
            onChange={(e) => {
              setSelectedType(e.target.value);
              handleSearchByType(e.target.value);
            }}
            className="filter-select"
          >
            <option value="all">Tous les types</option>
            {producerTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={resetFilters}
          className="reset-btn"
        >
          <ResetIcon />
          Réinitialiser
        </button>
      </div>

      <div className="stats-bar">
        <span className="stat-item">
          Total: <strong>{producers.length}</strong> producteurs
        </span>
        <span className="stat-item">
          Filtrage: <strong>{filteredProducers.length}</strong> résultats
        </span>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError("")} className="close-error">
            <CloseIcon />
          </button>
        </div>
      )}
      
      {loading && <div className="loading">Chargement des producteurs...</div>}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer ce producteur ? Cette action est irréversible.</p>
            <div className="modal-actions">
              <button 
                className="btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                <DeleteIcon />
                Supprimer
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid-container">
  {filteredProducers.map((producer, index) => {
    const producerName = producer.name?.value || 'Nom non disponible';
    const producerId = producer.id?.value || 'ID non disponible';
    const producerType = producer.type?.value || 'http://www.semanticweb.org/wiemb/ontologies/2025/8/untitled-ontology-2#Producteur';
    const producerCity = producer.city?.value;
    const producerAddress = producer.address?.value;
    const producerPostalCode = producer.postalCode?.value;
    const producerUri = producer.producer?.value;

    return (
      <div key={index} className="card" style={{backgroundColor:"white"}}>
        <div className="card-header">
          <h3>{producerName}</h3>
          <span className={`type-badge type-${getTypeLabel(producerType).toLowerCase()}`}>
            {getTypeLabel(producerType)}
          </span>
        </div>
        
        <div className="card-content">
          <p><strong>ID:</strong> {producerId}</p>
          {producerCity && (
            <p>
              <strong><LocationIcon /> Ville:</strong> 
              <span>{producerCity}</span>
            </p>
          )}
          {producerAddress && (
            <p>
              <strong><HomeIcon /> Adresse:</strong> 
              <span>{producerAddress}</span>
            </p>
          )}
          {producerPostalCode && (
            <p>
              <strong><MailIcon /> Code postal:</strong> 
              <span>{producerPostalCode}</span>
            </p>
          )}
        </div>

        <div className="card-actions">
          <button 
            className="action-btn primary"
            onClick={() => {
              console.log('Voir déchets de:', producerUri);
            }}
          >
            <ChartIcon />
            Déchets
          </button>
          <button 
            className="action-btn warning"
            onClick={() => producerUri && navigate(`/producers/edit/${encodeURIComponent(producerUri)}`)}
            disabled={!producerUri}
          >
            <EditIcon />
            Modifier
          </button>
          <button 
            className="action-btn danger"
            onClick={() => producerUri && setDeleteConfirm(producerUri)}
            disabled={!producerUri}
          >
            <DeleteIcon />
            Supprimer
          </button>
        </div>
      </div>
    );
  })}
</div>

      {!loading && filteredProducers.length === 0 && (
        <div className="empty-state">
          <p>Aucun producteur trouvé</p>
          {(searchTerm || selectedCity || selectedType !== "all") && (
            <button 
              onClick={resetFilters}
              className="reset-btn"
            >
              <ResetIcon />
              Afficher tous les producteurs
            </button>
          )}
          <button 
            className="add-btn"
            onClick={() => navigate('/producers/add')}
          >
            <PlusIcon />
            Ajouter un nouveau producteur
          </button>
        </div>
      )}
    </div>
  );
}

export default Producers;