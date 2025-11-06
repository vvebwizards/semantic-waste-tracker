import { useState } from "react";
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

function App() {
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
        // Handle both sujet and objet
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
        <h1>Waste Management Semantic Web</h1>
        <p>Ask a question about waste management:</p>

        {/* Natural language question section */}
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

        {/* SPARQL query section */}
        <div className="sparql-section">
          <h2>Or execute a SPARQL query directly:</h2>
          <textarea
            rows={6}
            value={sparql}
            onChange={(e) => setSparql(e.target.value)}
            placeholder="Write your SPARQL query here..."
          />
          <button onClick={handleRawQuery}>Run SPARQL</button>
        </div>

        {/* Error display */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="loading">
            <p>Chargement...</p>
          </div>
        )}

        {/* Results display */}
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

export default App;
