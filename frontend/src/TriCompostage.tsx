import React, { useState, useEffect } from "react";
import "./pages.css";

interface CentreTri {
  centre: string;
  nom: string;
  type: string;
  localisation: string;
  capacite: string;
  statut: string;
}

interface CentreCompostage {
  centre: string;
  nom: string;
  type: string;
  localisation: string;
  temperature: string;
  temps_compostage: string;
  statut: string;
}

interface Dechet {
  dechet: string;
  type_dechet: string;
  quantite: string;
}

const TriCompostage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"tri" | "compostage">("tri");
  const [centresTri, setCentresTri] = useState<CentreTri[]>([]);
  const [centresCompostage, setCentresCompostage] = useState<
    CentreCompostage[]
  >([]);
  const [dechetsTries, setDechetsTries] = useState<Dechet[]>([]);
  const [dechetsCompostables, setDechetsCompostables] = useState<Dechet[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Helper functions for status styling
  const getStatutClass = (statut: string): string => {
    const statutLower = statut.toLowerCase();
    if (statutLower === "en_service" || statutLower === "actif")
      return "type-general";
    if (statutLower === "maintenance") return "type-commercial";
    if (statutLower === "suspendu") return "type-hospitalier";
    return "type-general";
  };

  const getStatutIcon = (statut: string): string => {
    const statutLower = statut.toLowerCase();
    if (statutLower === "en_service" || statutLower === "actif") return "✅";
    if (statutLower === "maintenance") return "⚠️";
    if (statutLower === "suspendu") return "🔴";
    return "ℹ️";
  };

  // Charger les centres de tri
  const fetchCentresTri = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "http://localhost:8000/api/tri-compostage/centres-tri/"
      );
      const data = await response.json();
      console.log("Response centres tri:", data);

      if (data.status === "success" && data.data?.results?.bindings) {
        const centres = data.data.results.bindings.map((item: any) => ({
          centre: item.centre?.value || "",
          nom: item.nom?.value || "",
          type: item.type?.value || "",
          localisation: item.localisation?.value || "",
          capacite: item.capacite?.value || "",
          statut: item.statut?.value || "",
        }));
        console.log("Centres tri mapped:", centres);
        setCentresTri(centres);
      } else {
        console.warn("No data or unexpected format:", data);
        setError(data.message || "Aucune donnée disponible");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des centres de tri:", error);
      setError("Erreur de connexion au serveur");
    }
    setLoading(false);
  };

  // Charger les centres de compostage
  const fetchCentresCompostage = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "http://localhost:8000/api/tri-compostage/centres-compostage/"
      );
      const data = await response.json();
      console.log("Response centres compostage:", data);

      if (data.status === "success" && data.data?.results?.bindings) {
        const centres = data.data.results.bindings.map((item: any) => ({
          centre: item.centre?.value || "",
          nom: item.nom?.value || "",
          type: item.type?.value || "",
          localisation: item.localisation?.value || "",
          temperature: item.temperature?.value || "",
          temps_compostage: item.temps_compostage?.value || "",
          statut: item.statut?.value || "",
        }));
        console.log("Centres compostage mapped:", centres);
        setCentresCompostage(centres);
      } else {
        console.warn("No data or unexpected format:", data);
        setError(data.message || "Aucune donnée disponible");
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des centres de compostage:",
        error
      );
      setError("Erreur de connexion au serveur");
    }
    setLoading(false);
  };

  // Charger les déchets triés
  const fetchDechetsTries = async (centreNom: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/tri-compostage/dechets-tries/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ centre_nom: centreNom }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setDechetsTries(
          data.data.results.bindings.map((item: any) => ({
            dechet: item.dechet.value,
            type_dechet: item.type_dechet.value,
            quantite: item.quantite.value,
          }))
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des déchets triés:", error);
    }
    setLoading(false);
  };

  // Charger les déchets compostables
  const fetchDechetsCompostables = async (centreNom: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/tri-compostage/dechets-compostables/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ centre_nom: centreNom }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setDechetsCompostables(
          data.data.results.bindings.map((item: any) => ({
            dechet: item.dechet.value,
            type_dechet: item.type_dechet.value,
            quantite: item.quantite.value,
          }))
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des déchets compostables:",
        error
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCentresTri();
    fetchCentresCompostage();
  }, []);

  const handleCentreSelection = (centreNom: string) => {
    setSelectedCentre(centreNom);
    if (activeTab === "tri") {
      fetchDechetsTries(centreNom);
    } else {
      fetchDechetsCompostables(centreNom);
    }
  };

  return (
    <div className="page-container">
      {/* En-tête moderne */}
      <div className="page-header">
        <h1>🗑️ Tri & Compostage</h1>
        <p>
          Gérez les centres de tri et de compostage pour optimiser le traitement
          des déchets
        </p>
      </div>

      {/* Navigation par onglets moderne */}
      <div className="filters">
        <button
          className={`filter-btn ${activeTab === "tri" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("tri");
            setSelectedCentre("");
          }}
        >
          🏭 Centres de Tri ({centresTri.length})
        </button>
        <button
          className={`filter-btn ${activeTab === "compostage" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("compostage");
            setSelectedCentre("");
          }}
        >
          🌱 Centres de Compostage ({centresCompostage.length})
        </button>
      </div>

      {loading && <div className="loading">⏳ Chargement en cours...</div>}

      {error && <div className="error-message">⚠️ {error}</div>}

      {/* Section Centres de Tri */}
      {activeTab === "tri" && (
        <div className="centres-section">
          <div className="section-header">
            <h3>📋 Centres de Tri Disponibles</h3>
            <p>Cliquez sur un centre pour voir les déchets traités</p>
          </div>

          {centresTri.length === 0 ? (
            <div className="empty-state">
              <p>Aucun centre de tri disponible</p>
            </div>
          ) : (
            <div className="grid-container">
              {centresTri.map((centre) => (
                <div
                  key={centre.centre}
                  className={`card ${
                    selectedCentre === centre.nom ? "selected-card" : ""
                  }`}
                  onClick={() => handleCentreSelection(centre.nom)}
                >
                  <div className="card-header">
                    <h3>{centre.nom}</h3>
                    <span
                      className={`type-badge ${getStatutClass(centre.statut)}`}
                    >
                      {getStatutIcon(centre.statut)} {centre.statut}
                    </span>
                  </div>
                  <div className="card-content">
                    <p>
                      <strong>🏷️ Type:</strong> {centre.type.replace("_", " ")}
                    </p>
                    <p>
                      <strong>📍 Localisation:</strong> {centre.localisation}
                    </p>
                    <p>
                      <strong>📦 Capacité:</strong> {centre.capacite}{" "}
                      tonnes/jour
                    </p>
                  </div>
                  {selectedCentre === centre.nom && (
                    <div className="selected-indicator">✓ Sélectionné</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Déchets triés du centre sélectionné */}
          {selectedCentre && (
            <div className="dechets-section">
              <div className="section-header">
                <h3>♻️ Déchets Triés - {selectedCentre}</h3>
              </div>
              {dechetsTries.length > 0 ? (
                <div className="grid-container">
                  {dechetsTries.map((dechet, index) => (
                    <div
                      key={`${dechet.dechet}-${index}`}
                      className="card dechet-card"
                    >
                      <div className="dechet-icon">🗑️</div>
                      <div className="dechet-info">
                        <h4>{dechet.type_dechet}</h4>
                        <p className="dechet-quantite">
                          <strong>
                            {parseFloat(dechet.quantite).toFixed(2)} kg
                          </strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Aucun déchet trié trouvé pour ce centre</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Section Centres de Compostage */}
      {activeTab === "compostage" && (
        <div className="centres-section">
          <div className="section-header">
            <h3>🌿 Centres de Compostage Disponibles</h3>
            <p>Cliquez sur un centre pour voir les déchets compostés</p>
          </div>

          {centresCompostage.length === 0 ? (
            <div className="empty-state">
              <p>Aucun centre de compostage disponible</p>
            </div>
          ) : (
            <div className="grid-container">
              {centresCompostage.map((centre) => (
                <div
                  key={centre.centre}
                  className={`card ${
                    selectedCentre === centre.nom ? "selected-card" : ""
                  }`}
                  onClick={() => handleCentreSelection(centre.nom)}
                >
                  <div className="card-header">
                    <h3>{centre.nom}</h3>
                    <span
                      className={`type-badge ${getStatutClass(centre.statut)}`}
                    >
                      {getStatutIcon(centre.statut)} {centre.statut}
                    </span>
                  </div>
                  <div className="card-content">
                    <p>
                      <strong>🏷️ Type:</strong> {centre.type.replace("_", " ")}
                    </p>
                    <p>
                      <strong>📍 Localisation:</strong> {centre.localisation}
                    </p>
                    <p>
                      <strong>🌡️ Température:</strong> {centre.temperature}°C
                    </p>
                    <p>
                      <strong>⏱️ Temps compostage:</strong>{" "}
                      {centre.temps_compostage} jours
                    </p>
                  </div>
                  {selectedCentre === centre.nom && (
                    <div className="selected-indicator">✓ Sélectionné</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Déchets compostables du centre sélectionné */}
          {selectedCentre && (
            <div className="dechets-section">
              <div className="section-header">
                <h3>🌱 Déchets Compostables - {selectedCentre}</h3>
              </div>
              {dechetsCompostables.length > 0 ? (
                <div className="grid-container">
                  {dechetsCompostables.map((dechet, index) => (
                    <div
                      key={`${dechet.dechet}-${index}`}
                      className="card dechet-card"
                    >
                      <div className="dechet-icon">🌿</div>
                      <div className="dechet-info">
                        <h4>{dechet.type_dechet}</h4>
                        <p className="dechet-quantite">
                          <strong>
                            {parseFloat(dechet.quantite).toFixed(2)} kg
                          </strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Aucun déchet compostable trouvé pour ce centre</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <div style={{ marginTop: "3rem" }}>
        <AjouterCentreForm
          type={activeTab}
          onSuccess={() => {
            if (activeTab === "tri") fetchCentresTri();
            else fetchCentresCompostage();
          }}
        />
      </div>
    </div>
  );
};

// Composant pour ajouter un nouveau centre
const AjouterCentreForm: React.FC<{
  type: "tri" | "compostage";
  onSuccess: () => void;
}> = ({ type, onSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    nom: "",
    type_centre: type === "tri" ? "Centre_tri" : "Centre_compostage",
    localisation: "",
    capacite: "",
    debit_tri: "",
    taux_purete: "",
    temperature: "",
    temps_compostage: "",
    statut: "en_service",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint =
        type === "tri"
          ? "http://localhost:8000/api/tri-compostage/ajouter-tri/"
          : "http://localhost:8000/api/tri-compostage/ajouter-compostage/";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.status === "success") {
        alert("✅ Centre ajouté avec succès!");
        setShowForm(false);
        setFormData({
          id: "",
          nom: "",
          type_centre: type === "tri" ? "Centre_tri" : "Centre_compostage",
          localisation: "",
          capacite: "",
          debit_tri: "",
          taux_purete: "",
          temperature: "",
          temps_compostage: "",
          statut: "en_service",
        });
        onSuccess();
      } else {
        alert("❌ Erreur: " + data.message);
      }
    } catch (error) {
      alert("❌ Erreur lors de l'ajout du centre");
    }
  };

  return (
    <div className="ajouter-centre">
      {!showForm && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => setShowForm(true)}
            className="action-btn primary"
            style={{ maxWidth: "400px", margin: "0 auto" }}
          >
            ➕ Ajouter un centre de {type}
          </button>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <form onSubmit={handleSubmit} className="centre-form">
            <div className="card-header">
              <h3>➕ Nouveau centre de {type}</h3>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>ID Unique *</label>
                <input
                  type="text"
                  placeholder="ex: CT001"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Nom du centre *</label>
                <input
                  type="text"
                  placeholder="ex: Centre de tri Nord"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Localisation *</label>
                <input
                  type="text"
                  placeholder="ex: Paris, France"
                  value={formData.localisation}
                  onChange={(e) =>
                    setFormData({ ...formData, localisation: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Capacité journalière (tonnes) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="ex: 50"
                  value={formData.capacite}
                  onChange={(e) =>
                    setFormData({ ...formData, capacite: e.target.value })
                  }
                  required
                />
              </div>

              {type === "tri" && (
                <>
                  <div className="form-group">
                    <label>Débit de tri (tonnes/heure)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="ex: 5"
                      value={formData.debit_tri}
                      onChange={(e) =>
                        setFormData({ ...formData, debit_tri: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Taux de pureté (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="ex: 95"
                      value={formData.taux_purete}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          taux_purete: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              {type === "compostage" && (
                <>
                  <div className="form-group">
                    <label>Température moyenne (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="ex: 60"
                      value={formData.temperature}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          temperature: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Temps de compostage (jours)</label>
                    <input
                      type="number"
                      placeholder="ex: 90"
                      value={formData.temps_compostage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          temps_compostage: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Statut *</label>
                <select
                  value={formData.statut}
                  onChange={(e) =>
                    setFormData({ ...formData, statut: e.target.value })
                  }
                >
                  <option value="en_service">✅ En service</option>
                  <option value="maintenance">⚠️ Maintenance</option>
                  <option value="suspendu">🔴 Suspendu</option>
                </select>
              </div>
            </div>

            <div className="card-actions" style={{ marginTop: "2rem" }}>
              <button type="submit" className="action-btn primary">
                ✅ Ajouter le centre
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="action-btn secondary"
              >
                ❌ Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TriCompostage;
