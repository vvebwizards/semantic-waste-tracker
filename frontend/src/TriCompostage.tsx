import React, { useState, useEffect } from "react";

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
    <div>
      {/* Embedded CSS */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          :root {
            --primary: #2563eb;
            --primary-dark: #1d4ed8;
            --secondary: #64748b;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --dark: #1e293b;
            --light: #f8fafc;
            --gray-100: #f1f5f9;
            --gray-200: #e2e8f0;
            --gray-300: #cbd5e1;
            --gray-400: #94a3b8;
            --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --shadow-lg: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
            --border-radius: 16px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .tri-compostage-container * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
          }

          .tri-compostage-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
            min-height: 100vh;

          }

          .page-header {
            text-align: center;
            margin-bottom: 3rem;
            background: #ffffff;
            padding: 3rem 2rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            border: 1px solid var(--gray-200);
          }

          .page-header h1 {
            font-size: 3.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--primary), #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 1rem;
            letter-spacing: -0.5px;
          }

          .page-header p {
            font-size: 1.25rem;
            color: var(--secondary);
            font-weight: 400;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
          }

          .filters {
            display: flex;
            gap: 1rem;
            margin-bottom: 3rem;
            flex-wrap: wrap;
            justify-content: center;
            background: #ffffff;
            padding: 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            border: 1px solid var(--gray-200);
          }

          .filter-btn {
            padding: 0.875rem 1.5rem;
            border: 2px solid var(--gray-200);
            background: white;
            color: var(--secondary);
            border-radius: 50px;
            cursor: pointer;
            transition: var(--transition);
            font-weight: 500;
            font-size: 0.9rem;
            letter-spacing: 0.5px;
          }

          .filter-btn:hover {
            border-color: var(--primary);
            color: var(--primary);
            transform: translateY(-2px);
            box-shadow: var(--shadow);
          }

          .filter-btn.active {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
            transform: translateY(-2px);
          }

          .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
          }

          .card {
            background: #ffffff;
            border-radius: var(--border-radius);
            padding: 2rem;
            box-shadow: var(--shadow);
            transition: var(--transition);
            border: 1px solid var(--gray-200);
            position: relative;
            overflow: hidden;
            cursor: pointer;
          }

          .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary), #7c3aed);
          }

          .card:hover {
            transform: translateY(-8px);
            box-shadow: var(--shadow-lg);
            border-color: var(--primary);
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1.5rem;
          }

          .card-header h3 {
            font-size: 1.4rem;
            font-weight: 600;
            color: var(--dark);
            line-height: 1.3;
            flex: 1;
            margin-right: 1rem;
          }

          .type-badge {
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
          }

          .type-industriel { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
          .type-agricole { background: linear-gradient(135deg, #10b981, #047857); color: white; }
          .type-commercial { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
          .type-hospitalier { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
          .type-residentiel { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
          .type-general { background: linear-gradient(135deg, #64748b, #475569); color: white; }

          .card-content {
            margin-bottom: 2rem;
          }

          .card-content p {
            margin: 0.75rem 0;
            color: var(--secondary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.95rem;
          }

          .card-content strong {
            color: var(--dark);
            font-weight: 600;
            min-width: 120px;
          }

          .card-actions {
            display: flex;
            gap: 1rem;
          }

          .action-btn {
            padding: 0.875rem 1.5rem;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            transition: var(--transition);
            flex: 1;
            font-size: 0.9rem;
            letter-spacing: 0.5px;
          }

          .action-btn.primary {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          }

          .action-btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
          }

          .action-btn.secondary {
            background: transparent;
            color: var(--primary);
            border: 2px solid var(--primary);
          }

          .action-btn.secondary:hover {
            background: var(--primary);
            color: white;
            transform: translateY(-2px);
          }

          .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            background: #ffffff;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            border: 1px solid var(--gray-200);
          }

          .empty-state p {
            font-size: 1.25rem;
            color: var(--secondary);
            font-weight: 500;
          }

          .loading {
            text-align: center;
            padding: 3rem;
            color: var(--primary);
            font-size: 1.1rem;
            font-weight: 500;
          }

          .error-message {
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            color: #dc2626;
            padding: 1.5rem;
            border-radius: var(--border-radius);
            margin-bottom: 2rem;
            border-left: 4px solid #ef4444;
            font-weight: 500;
          }

          .section-header {
            text-align: center;
            margin: 3rem 0 2rem 0;
          }

          .section-header h3 {
            font-size: 2rem;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 0.5rem;
          }

          .section-header p {
            font-size: 1.1rem;
            color: var(--secondary);
            font-weight: 400;
          }

          .selected-card {
            border: 2px solid var(--primary) !important;
            box-shadow: 0 15px 35px rgba(37, 99, 235, 0.25) !important;
            transform: translateY(-5px);
          }

          .selected-indicator {
            position: absolute;
            top: 1rem;
            left: 1rem;
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-weight: 600;
            font-size: 0.875rem;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            animation: fadeIn 0.3s ease-out;
          }

          .dechets-section {
            margin-top: 3rem;
            padding-top: 3rem;
            border-top: 2px solid var(--gray-200);
          }

          .dechet-card {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            padding: 1.5rem !important;
            cursor: default;
          }

          .dechet-card:hover {
            transform: translateY(-3px);
          }

          .dechet-icon {
            font-size: 3rem;
            background: linear-gradient(135deg, var(--gray-100), var(--gray-200));
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            flex-shrink: 0;
          }

          .dechet-info {
            flex: 1;
          }

          .dechet-info h4 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--dark);
            margin-bottom: 0.5rem;
          }

          .dechet-quantite {
            font-size: 1.5rem;
            color: var(--primary);
            margin: 0;
          }

          .dechet-quantite strong {
            font-weight: 700;
          }

          .centre-form {
            width: 100%;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-group label {
            font-weight: 600;
            color: var(--dark);
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
          }

          .form-group input,
          .form-group select {
            padding: 0.875rem 1rem;
            border: 2px solid var(--gray-200);
            border-radius: 12px;
            font-size: 1rem;
            transition: var(--transition);
            font-family: 'Inter', sans-serif;
            background: white;
          }

          .form-group input:focus,
          .form-group select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          }

          .form-group input::placeholder {
            color: var(--gray-400);
          }

          .ajouter-centre {
            margin-top: 3rem;
          }

          .type-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .card {
            animation: fadeIn 0.6s ease-out;
          }

          @media (max-width: 768px) {
            .tri-compostage-container {
              padding: 1rem;
            }
            
            .page-header h1 {
              font-size: 2.5rem;
            }
            
            .grid-container {
              grid-template-columns: 1fr;
            }
            
            .filters {
              justify-content: flex-start;
              overflow-x: auto;
              padding: 1rem;
            }
            
            .card-header {
              flex-direction: column;
              gap: 1rem;
              align-items: flex-start;
            }
            
            .card-actions {
              flex-direction: column;
            }
            
            .section-header h3 {
              font-size: 1.5rem;
            }
            
            .dechet-card {
              flex-direction: column;
              text-align: center;
            }
            
            .dechet-icon {
              width: 60px;
              height: 60px;
              font-size: 2rem;
            }
            
            .form-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      {/* Main Content */}
      <div className="tri-compostage-container">
        {/* En-tête moderne */}
        <div className="page-header">
          <h1>🗑️ Tri & Compostage</h1>
          <p>
            Gérez les centres de tri et de compostage pour optimiser le
            traitement des déchets
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
            className={`filter-btn ${
              activeTab === "compostage" ? "active" : ""
            }`}
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
                        className={`type-badge ${getStatutClass(
                          centre.statut
                        )}`}
                      >
                        {getStatutIcon(centre.statut)} {centre.statut}
                      </span>
                    </div>
                    <div className="card-content">
                      <p>
                        <strong>🏷️ Type:</strong>{" "}
                        {centre.type.replace("_", " ")}
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
                        className={`type-badge ${getStatutClass(
                          centre.statut
                        )}`}
                      >
                        {getStatutIcon(centre.statut)} {centre.statut}
                      </span>
                    </div>
                    <div className="card-content">
                      <p>
                        <strong>🏷️ Type:</strong>{" "}
                        {centre.type.replace("_", " ")}
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
