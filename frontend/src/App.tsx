import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Producers from "./Producers";
import Wastes from "./Wastes";
import Statistics from "./Statistics";
import "./App.css";

interface Result {
  label: string;
  object?: string;
  subjectUri?: string;
  objectUri?: string;
}

interface Binding {
  sujet?: { value: string };
  objet?: { value: string };
}

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          ♻️ Recircle
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Accueil
          </Link>
          <Link to="/producers" className="nav-link">
            Producteurs
          </Link>
          <Link to="/wastes" className="nav-link">
            Déchets
          </Link>
          <Link to="/superviseurs" className="nav-link">
            Superviseur
          </Link>
          <Link to="/centre_de_tri" className="nav-link">
            Centre de tri
          </Link>
          <Link to="/statistics" className="nav-link">
            Statistiques
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Home() {
  const [question, setQuestion] = useState("");
  const [sparql, setSparql] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleAsk = async () => {
    if (!question) return;
    setLoading(true);
    setError("");
    setResults([]);
    
    try {
      const res = await fetch(`${API_URL}/api/nlp_query/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      
      if (data.status === "error") {
        setError(data.message || "Une erreur s'est produite");
        setLoading(false);
        return;
      }
      
      const bindings: Binding[] = data?.data?.results?.bindings || [];
      const cleanedResults: Result[] = bindings.map((b: Binding) => {
        const subject = b.sujet?.value;
        const object = b.objet?.value;
        
        if (subject) {
          const subjectLabel = subject.split(/[#/]/).pop()?.replace(/_/g, " ") || subject;
          if (object) {
            const objectLabel = object.split(/[#/]/).pop()?.replace(/_/g, " ") || object;
            return { 
              label: subjectLabel, 
              object: objectLabel,
              subjectUri: subject,
              objectUri: object
            };
          }
          return { 
            label: subjectLabel,
            subjectUri: subject
          };
        }
        return { label: "Résultat inconnu" };
      });
      
      setResults(cleanedResults);
      setQuestion("");
      if (cleanedResults.length === 0) {
        setError("Aucun résultat trouvé");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRawQuery = async () => {
    if (!sparql) return;
    setLoading(true);
    setError("");
    setResults([]);
    
    try {
      const res = await fetch(`${API_URL}/api/sparql/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sparql }),
      });
      const data = await res.json();
      
      if (data.status === "error") {
        setError(data.message || "Une erreur s'est produite");
        setLoading(false);
        return;
      }
      
      const bindings: Binding[] = data?.data?.results?.bindings || [];
      const cleanedResults: Result[] = bindings.map((b: Binding) => {
        const subject = b.sujet?.value;
        const object = b.objet?.value;
        
        if (subject) {
          const subjectLabel = subject.split(/[#/]/).pop()?.replace(/_/g, " ") || subject;
          if (object) {
            const objectLabel = object.split(/[#/]/).pop()?.replace(/_/g, " ") || object;
            return { 
              label: subjectLabel, 
              object: objectLabel,
              subjectUri: subject,
              objectUri: object
            };
          }
          return { 
            label: subjectLabel,
            subjectUri: subject
          };
        }
        return { label: "Résultat inconnu" };
      });
      
      setResults(cleanedResults);
      setSparql("");
      if (cleanedResults.length === 0) {
        setError("Aucun résultat trouvé");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion au serveur");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Recircle</h1>
        <p>Posez une question sur la gestion des déchets</p>

        <div className="input-section">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Ex: Quels superviseurs sont actifs ? Liste des centres de traitement ?"
            disabled={loading}
          />
          <button onClick={handleAsk} disabled={loading}>
            {loading ? "..." : "Demander"}
          </button>
        </div>

        <hr style={{ margin: "2rem 0", border: "1px solid #ccc" }} />

        <div className="sparql-section">
          <h2>Ou exécutez directement une requête SPARQL </h2>
          <textarea
            rows={6}
            value={sparql}
            onChange={(e) => setSparql(e.target.value)}
            placeholder="Écrivez ici une requête SPARQL...."
          />
          <button onClick={handleRawQuery}>Run SPARQL</button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="loading">
            <p>Chargement...</p>
          </div>
        )}

        <div className="results">
          {results.length > 0 && (
            <>
              <h2>Résultats ({results.length}):</h2>
              <div className="card-container">
                {results.map((r, i) => (
                  <div key={i} className="card">
                    <h3>{r.label}</h3>
                    {r.object && (
                      <p className="relation">
                        <span className="relation-label">→</span> {r.object}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/producers" element={<Producers />} />
          <Route path="/wastes" element={<Wastes />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/superviseurs" element={<div className="page-container"><h1>Page Superviseurs</h1><p>Contenu à venir...</p></div>} />
          <Route path="/centre_de_tri" element={<div className="page-container"><h1>Page Centre de tri</h1><p>Contenu à venir...</p></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;