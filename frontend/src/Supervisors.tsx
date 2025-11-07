import { useState, useEffect } from "react";
import "./pages.css";

interface Supervisor {
  supervisor: { value: string };
  id: { value: string };
  nomComplet: { value: string };
  type: { value: string };
  fonction?: { value: string };
  email?: { value: string };
  telephone?: { value: string };
  zoneAffectation?: { value: string };
  actif?: { value: string };
}

interface Center {
  center: { value: string };
  id: { value: string };
  nomCentre?: { value: string };
  typeCentre?: { value: string };
  statutOperationnel?: { value: string };
  horairesOuverture?: { value: string };
  adresse?: { value: string };
  type: { value: string };
}

function Supervisors() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showCentersModal, setShowCentersModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [centersError, setCentersError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);
  const [formData, setFormData] = useState({
    nomComplet: '',
    type: '',
    email: '',
    telephone: '',
    fonction: '',
    zoneAffectation: '',
    centerUri: '',
    actif: true
  });
  const [editFormData, setEditFormData] = useState({
    nomComplet: '',
    email: '',
    telephone: '',
    fonction: '',
    zoneAffectation: '',
    centerUri: '',
    actif: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [availableCenters, setAvailableCenters] = useState<Array<{center: {value: string}, nomCentre?: {value: string}, id: {value: string}}>>([]);
  const [loadingAvailableCenters, setLoadingAvailableCenters] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const supervisorTypes = [
    { value: 'Superviseur_Environnemental', label: 'Environnemental' },
    { value: 'Superviseur_Municipal', label: 'Municipal' },
    { value: 'Superviseur_National', label: 'National' },
    { value: 'Superviseur_Regional', label: 'Régional' },
    { value: 'Superviseur_Securite', label: 'Sécurité' },
    { value: 'Superviseur_Qualite', label: 'Qualité' }
  ];

  useEffect(() => {
    fetchSupervisors();
    fetchAvailableCenters();
  }, []);

  const fetchAvailableCenters = async () => {
    try {
      setLoadingAvailableCenters(true);
      const res = await fetch(`${API_URL}/api/tri_compostage/centers/`);
      const data = await res.json();
      
      if (data.status === "error") {
        console.error("Erreur lors de la récupération des centres:", data.message);
        return;
      }

      const centersData = data.data?.results?.bindings || [];
      setAvailableCenters(centersData);
    } catch (err: any) {
      console.error("Erreur de connexion au serveur pour les centres:", err);
    } finally {
      setLoadingAvailableCenters(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/supervision/supervisors/`);
      const data = await res.json();
      
      if (data.status === "error") {
        setError(data.message);
        return;
      }

      const supervisorsData = data.data?.results?.bindings || [];
      setSupervisors(supervisorsData);
    } catch (err: any) {
      setError("Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (typeUri: string) => {
    const type = typeUri.split('#').pop() || '';
    return type.replace(/_/g, ' ').replace('Superviseur', '').replace('Supervuseur', '').trim() || 'Général';
  };

  const filteredSupervisors = filter === "all" 
    ? supervisors 
    : supervisors.filter(s => {
        const typeLabel = getTypeLabel(s.type.value).toLowerCase();
        return typeLabel.includes(filter.toLowerCase());
      });

  const typeCounts = supervisors.reduce((acc, supervisor) => {
    const type = getTypeLabel(supervisor.type.value);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getTypeBadgeClass = (typeLabel: string) => {
    const lower = typeLabel.toLowerCase();
    if (lower.includes('environnemental')) return 'type-environnemental';
    if (lower.includes('municipal')) return 'type-municipal';
    if (lower.includes('national')) return 'type-national';
    if (lower.includes('regional')) return 'type-regional';
    if (lower.includes('securite')) return 'type-securite';
    if (lower.includes('qualite')) return 'type-qualite';
    return 'type-general';
  };

  const fetchSupervisorCenters = async (supervisorUri: string) => {
    try {
      setLoadingCenters(true);
      setCentersError("");
      const res = await fetch(`${API_URL}/api/supervision/supervisors/centers/?supervisor_uri=${encodeURIComponent(supervisorUri)}`);
      const data = await res.json();
      
      if (data.status === "error") {
        setCentersError(data.message);
        setCenters([]);
        return;
      }

      const centersData = data.data?.results?.bindings || [];
      setCenters(centersData);
    } catch (err: any) {
      setCentersError("Erreur de connexion au serveur");
      setCenters([]);
      console.error(err);
    } finally {
      setLoadingCenters(false);
    }
  };

  const handleViewCenters = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setShowCentersModal(true);
    fetchSupervisorCenters(supervisor.supervisor.value);
  };

  const getCenterTypeLabel = (typeUri: string) => {
    const type = typeUri.split('#').pop() || '';
    let label = type.replace(/_/g, ' ');
    label = label.replace(/^Centre Tri /i, '').replace(/^Centre_Tri_/i, '');
    label = label.replace(/^Centre Compostage /i, 'Compostage ').replace(/^Centre_compostage$/i, 'Compostage');
    label = label.replace(/^Centre_Compostage_/i, 'Compostage ');
    label = label.replace(/^Usine Recyclage /i, 'Recyclage ').replace(/^Usine_recyclage$/i, 'Recyclage');
    label = label.replace(/^Usine_Recyclage_/i, 'Recyclage ');
    return label.trim() || 'Général';
  };

  const getCenterTypeBadgeClass = (typeLabel: string) => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    if (!formData.nomComplet || !formData.type) {
      setSubmitError("Le nom complet et le type sont obligatoires");
      setSubmitting(false);
      return;
    }

    try {
      // Debug: imprimer les données envoyées
      console.log("DEBUG - Données envoyées pour l'ajout de superviseur:", formData);
      
      const res = await fetch(`${API_URL}/api/supervision/supervisors/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.status === "error") {
        setSubmitError(data.message);
      } else {
        setSubmitSuccess(true);
        // Réinitialiser le formulaire
        setFormData({
          nomComplet: '',
          type: '',
          email: '',
          telephone: '',
          fonction: '',
          zoneAffectation: '',
          centerUri: '',
          actif: true
        });
        // Attendre un court délai pour s'assurer que Fuseki a bien persisté les données
        await new Promise(resolve => setTimeout(resolve, 500));
        // Rafraîchir la liste des superviseurs
        await fetchSupervisors();
        // Fermer la modal après un court délai pour voir le message de succès
        setTimeout(() => {
          setShowAddModal(false);
          setSubmitSuccess(false);
        }, 1500);
      }
    } catch (err: any) {
      setSubmitError("Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      nomComplet: '',
      type: '',
      email: '',
      telephone: '',
      fonction: '',
      zoneAffectation: '',
      centerUri: '',
      actif: true
    });
    setSubmitError("");
    setSubmitSuccess(false);
  };

  const handleEditSupervisor = async (supervisor: Supervisor) => {
    setEditingSupervisor(supervisor);
    setEditFormData({
      nomComplet: supervisor.nomComplet.value,
      email: supervisor.email?.value || '',
      telephone: supervisor.telephone?.value || '',
      fonction: supervisor.fonction?.value || '',
      zoneAffectation: supervisor.zoneAffectation?.value || '',
      centerUri: '',
      actif: supervisor.actif?.value === 'true'
    });
    
    // Récupérer le centre d'affectation actuel
    try {
      const res = await fetch(`${API_URL}/api/supervision/supervisors/centers/?supervisor_uri=${encodeURIComponent(supervisor.supervisor.value)}`);
      const data = await res.json();
      if (data.status === "success" && data.data?.results?.bindings?.length > 0) {
        const firstCenter = data.data.results.bindings[0];
        setEditFormData(prev => ({
          ...prev,
          centerUri: firstCenter.center.value
        }));
      }
    } catch (err) {
      console.error("Erreur lors de la récupération du centre:", err);
    }
    
    setShowEditModal(true);
    setSubmitError("");
    setSubmitSuccess(false);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupervisor) return;

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const res = await fetch(`${API_URL}/api/supervision/supervisors/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supervisorUri: editingSupervisor.supervisor.value,
          ...editFormData
        })
      });

      const data = await res.json();

      if (data.status === "error") {
        setSubmitError(data.message);
      } else {
        setSubmitSuccess(true);
        // Attendre un court délai pour s'assurer que Fuseki a bien persisté les données
        await new Promise(resolve => setTimeout(resolve, 500));
        // Rafraîchir la liste des superviseurs
        await fetchSupervisors();
        // Fermer la modal après un court délai pour voir le message de succès
        setTimeout(() => {
          setShowEditModal(false);
          setSubmitSuccess(false);
          setEditingSupervisor(null);
        }, 1500);
      }
    } catch (err: any) {
      setSubmitError("Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingSupervisor(null);
    setEditFormData({
      nomComplet: '',
      email: '',
      telephone: '',
      fonction: '',
      zoneAffectation: '',
      centerUri: '',
      actif: true
    });
    setSubmitError("");
    setSubmitSuccess(false);
  };

  const handleDeleteSupervisor = async (supervisor: Supervisor) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le superviseur "${supervisor.nomComplet.value}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/supervision/supervisors/delete/?supervisor_uri=${encodeURIComponent(supervisor.supervisor.value)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await res.json();

      if (data.status === "error") {
        alert(`Erreur lors de la suppression: ${data.message}`);
      } else {
        alert("Superviseur supprimé avec succès");
        // Rafraîchir la liste des superviseurs
        await fetchSupervisors();
      }
    } catch (err: any) {
      alert("Erreur de connexion au serveur");
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Superviseurs</h1>
        <button 
          className="action-btn primary"
          onClick={() => setShowAddModal(true)}
          style={{ padding: '0.75rem 1.5rem' }}
        >
          + Ajouter un superviseur
        </button>
      </div>

      <div className="filters">
        <button 
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Tous ({supervisors.length})
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
      {loading && <div className="loading">Chargement des superviseurs...</div>}

      <div className="grid-container">
        {filteredSupervisors.map((supervisor, index) => (
          <div key={index} className="card" style={{backgroundColor:"white"}}>
            <div className="card-header">
              <h3>{supervisor.nomComplet.value}</h3>
              <span className={`type-badge ${getTypeBadgeClass(getTypeLabel(supervisor.type.value))}`}>
                {getTypeLabel(supervisor.type.value)}
              </span>
            </div>
            
            <div className="card-content">
              <p><strong>ID:</strong> {supervisor.id.value}</p>
              {supervisor.fonction && <p><strong>📋 Fonction:</strong> {supervisor.fonction.value}</p>}
              {supervisor.email && <p><strong>📧 Email:</strong> {supervisor.email.value}</p>}
              {supervisor.telephone && <p><strong>📞 Téléphone:</strong> {supervisor.telephone.value}</p>}
              <p>
                <strong>Status:</strong> 
                <span style={{ 
                  marginLeft: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '50px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  backgroundColor: supervisor.actif && supervisor.actif.value === 'true' ? '#10b981' : '#ef4444',
                  color: 'white'
                }}>
                  {supervisor.actif && supervisor.actif.value === 'true' ? 'Actif' : 'Inactif'}
                </span>
              </p>
            </div>

            <div className="card-actions">
              <button 
                className="action-btn primary"
                onClick={() => handleViewCenters(supervisor)}
              >
                Voir les centres
              </button>
              <button 
                className="action-btn secondary"
                onClick={() => handleEditSupervisor(supervisor)}
              >
                Modifier
              </button>
              <button 
                className="action-btn danger"
                onClick={() => handleDeleteSupervisor(supervisor)}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredSupervisors.length === 0 && (
        <div className="empty-state">
          <p>Aucun superviseur trouvé</p>
        </div>
      )}

      {/* Modal pour afficher les centres */}
      {showCentersModal && (
        <div className="modal-overlay" onClick={() => setShowCentersModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                Centres associés à {selectedSupervisor?.nomComplet.value}
              </h2>
              <button 
                className="modal-close"
                onClick={() => setShowCentersModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {loadingCenters && (
                <div className="loading">Chargement des centres...</div>
              )}
              
              {centersError && (
                <div className="error-message">{centersError}</div>
              )}
              
              {!loadingCenters && !centersError && centers.length === 0 && (
                <div className="empty-state">
                  <p>Aucun centre associé à ce superviseur</p>
                </div>
              )}
              
              {!loadingCenters && centers.length > 0 && (
                <div className="centers-list">
                  {centers.map((center, index) => (
                    <div key={index} className="center-card">
                      <div className="center-card-header">
                        <h4>{center.nomCentre?.value || center.id.value}</h4>
                        <span className={`type-badge ${getCenterTypeBadgeClass(getCenterTypeLabel(center.type.value))}`}>
                          {getCenterTypeLabel(center.type.value)}
                        </span>
                      </div>
                      
                      <div className="center-card-content">
                        <p><strong>ID:</strong> {center.id.value}</p>
                        {center.typeCentre && (
                          <p><strong>Type:</strong> {center.typeCentre.value}</p>
                        )}
                        {center.statutOperationnel && (
                          <p>
                            <strong>Statut:</strong> 
                            <span style={{ 
                              marginLeft: '0.5rem',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '50px',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              backgroundColor: center.statutOperationnel.value.toLowerCase() === 'opérationnel' ? '#10b981' : '#ef4444',
                              color: 'white'
                            }}>
                              {center.statutOperationnel.value}
                            </span>
                          </p>
                        )}
                        {center.horairesOuverture && (
                          <p><strong>Horaires:</strong> {center.horairesOuverture.value}</p>
                        )}
                        {center.adresse && (
                          <p><strong>Adresse:</strong> {center.adresse.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal pour ajouter un superviseur */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseAddModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Ajouter un nouveau superviseur</h2>
              <button 
                className="modal-close"
                onClick={handleCloseAddModal}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nomComplet">Nom complet *</label>
                  <input
                    type="text"
                    id="nomComplet"
                    name="nomComplet"
                    value={formData.nomComplet}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Type *</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  >
                    <option value="">Sélectionner un type</option>
                    {supervisorTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telephone">Téléphone</label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fonction">Fonction</label>
                  <input
                    type="text"
                    id="fonction"
                    name="fonction"
                    value={formData.fonction}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="zoneAffectation">Zone d'affectation</label>
                  <input
                    type="text"
                    id="zoneAffectation"
                    name="zoneAffectation"
                    value={formData.zoneAffectation}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="centerUri">Centre d'affectation</label>
                  <select
                    id="centerUri"
                    name="centerUri"
                    value={formData.centerUri}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Sélectionner un centre (optionnel)</option>
                    {loadingAvailableCenters ? (
                      <option disabled>Chargement des centres...</option>
                    ) : (
                      availableCenters.map((center, index) => (
                        <option key={index} value={center.center.value}>
                          {center.nomCentre?.value || center.id.value || center.center.value.split('#').pop()}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="actif"
                      checked={formData.actif}
                      onChange={handleInputChange}
                      style={{ width: 'auto' }}
                    />
                    <span>Actif</span>
                  </label>
                </div>

                {submitError && (
                  <div className="error-message" style={{ marginTop: '1rem' }}>
                    {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem', 
                    backgroundColor: '#10b981', 
                    color: 'white', 
                    borderRadius: '4px' 
                  }}>
                    Superviseur ajouté avec succès !
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    type="submit"
                    className="action-btn primary"
                    disabled={submitting}
                    style={{ flex: 1 }}
                  >
                    {submitting ? 'Ajout en cours...' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    className="action-btn secondary"
                    onClick={handleCloseAddModal}
                    style={{ flex: 1 }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour modifier un superviseur */}
      {showEditModal && editingSupervisor && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Modifier le superviseur</h2>
              <button 
                className="modal-close"
                onClick={handleCloseEditModal}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleUpdateSubmit}>
                <div className="form-group">
                  <label htmlFor="editNomComplet">Nom complet</label>
                  <input
                    type="text"
                    id="editNomComplet"
                    name="nomComplet"
                    value={editFormData.nomComplet}
                    onChange={handleEditInputChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editEmail">Email</label>
                  <input
                    type="email"
                    id="editEmail"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editTelephone">Téléphone</label>
                  <input
                    type="tel"
                    id="editTelephone"
                    name="telephone"
                    value={editFormData.telephone}
                    onChange={handleEditInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editFonction">Fonction</label>
                  <input
                    type="text"
                    id="editFonction"
                    name="fonction"
                    value={editFormData.fonction}
                    onChange={handleEditInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editZoneAffectation">Zone d'affectation</label>
                  <input
                    type="text"
                    id="editZoneAffectation"
                    name="zoneAffectation"
                    value={editFormData.zoneAffectation}
                    onChange={handleEditInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editCenterUri">Centre d'affectation</label>
                  <select
                    id="editCenterUri"
                    name="centerUri"
                    value={editFormData.centerUri}
                    onChange={handleEditInputChange}
                    className="form-input"
                  >
                    <option value="">Sélectionner un centre (optionnel)</option>
                    {loadingAvailableCenters ? (
                      <option disabled>Chargement des centres...</option>
                    ) : (
                      availableCenters.map((center, index) => (
                        <option key={index} value={center.center.value}>
                          {center.nomCentre?.value || center.id.value || center.center.value.split('#').pop()}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="actif"
                      checked={editFormData.actif}
                      onChange={handleEditInputChange}
                      style={{ width: 'auto' }}
                    />
                    <span>Actif</span>
                  </label>
                </div>

                {submitError && (
                  <div className="error-message" style={{ marginTop: '1rem' }}>
                    {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem', 
                    backgroundColor: '#10b981', 
                    color: 'white', 
                    borderRadius: '4px' 
                  }}>
                    Superviseur mis à jour avec succès !
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    type="submit"
                    className="action-btn primary"
                    disabled={submitting}
                    style={{ flex: 1 }}
                  >
                    {submitting ? 'Mise à jour en cours...' : 'Mettre à jour'}
                  </button>
                  <button
                    type="button"
                    className="action-btn secondary"
                    onClick={handleCloseEditModal}
                    style={{ flex: 1 }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Supervisors;

