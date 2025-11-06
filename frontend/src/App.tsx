import { useState } from "react";
import "./App.css";

interface Result {
  label: string;
  object?: string;
  subjectUri?: string;
  objectUri?: string;
}

type VarValue = { value: string; type?: string };
interface Binding {
  // Typical names for generated queries
  sujet?: VarValue;
  objet?: VarValue;
  // Allow any other SPARQL variable names for raw queries
  [varName: string]: VarValue | undefined;
}

function formatValue(v?: VarValue): string | undefined {
  if (!v) return undefined;
  const val = v.value;
  // If looks like a URI, extract last fragment or path segment
  if (/^https?:\/\//i.test(val)) {
    const last = val.split(/[#/]/).pop() || val;
    return last.replace(/_/g, " ");
  }
  return val;
}

function bindingToResult(b: Binding): Result {
  const keys = Object.keys(b);
  const lowerToKey: Record<string, string> = {};
  keys.forEach((k) => (lowerToKey[k.toLowerCase()] = k));

  const prefer = (names: string[]): VarValue | undefined => {
    for (const n of names) {
      const key = lowerToKey[n];
      if (key && b[key]) return b[key];
    }
    return undefined;
  };

  // 1) Prefer explicit produit/dechet naming
  const produit = prefer(["produitnom", "produit", "productname", "product"]);
  const dechet = prefer(["dechetnom", "dechet", "wastename", "waste"]);
  if (produit) {
    const subjectLabel = formatValue(produit) || produit.value;
    if (dechet) {
      const objectLabel = formatValue(dechet) || dechet.value;
      return { label: subjectLabel, object: objectLabel };
    }
    return { label: subjectLabel };
  }

  // 2) Check for nomComplet (full name) - prioritize this for supervisors
  const nomComplet = prefer(["nomcomplet", "nom_complet", "fullname"]);
  if (nomComplet) {
    const subjectLabel = nomComplet.value; // Use the actual value, not formatted
    const subject = prefer(["sujet", "subject"]);
    const object = prefer(["objet", "object"]);
    // Also check for nomCentre (center name) for better object display
    const nomCentre = prefer(["nomcentre", "nom_centre", "centrename"]);
    if (object) {
      // Prefer nomCentre if available, otherwise format the object URI
      const objectLabel = nomCentre ? nomCentre.value : (formatValue(object) || object.value);
      return {
        label: subjectLabel,
        object: objectLabel,
        subjectUri: subject?.value,
        objectUri: object.value,
      };
    }
    return { label: subjectLabel, subjectUri: subject?.value };
  }

  // 3) Then try sujet/objet
  const subject = prefer(["sujet", "subject"]);
  const object = prefer(["objet", "object"]);
  if (subject) {
    const subjectLabel = formatValue(subject) || subject.value;
    if (object) {
      const objectLabel = formatValue(object) || object.value;
      return {
        label: subjectLabel,
        object: objectLabel,
        subjectUri: subject.value,
        objectUri: object.value,
      };
    }
    return { label: subjectLabel, subjectUri: subject.value };
  }

  // 4) Generic fallback: first variable as label, second as object
  if (keys.length > 0) {
    const firstKey = keys[0];
    const secondKey = keys[1];
    const firstVal = formatValue(b[firstKey]);
    const secondVal = formatValue(b[secondKey as keyof Binding]);
    if (firstVal && secondVal) return { label: firstVal, object: secondVal };
    if (firstVal) return { label: firstVal };
  }

  return { label: "Résultat inconnu" };
}

function App() {
  const [question, setQuestion] = useState("");
  const [sparql, setSparql] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [columns, setColumns] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Binding[]>([]);
  const [showTable, setShowTable] = useState(false);

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
      const headVars: string[] = data?.data?.head?.vars || [];
      const cleanedResults: Result[] = bindings.map(bindingToResult);
      setColumns(headVars.length ? headVars : Object.keys(bindings[0] || {}));
      setRawRows(bindings);
      
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
      const headVars: string[] = data?.data?.head?.vars || [];
      const cleanedResults: Result[] = bindings.map(bindingToResult);
      setColumns(headVars.length ? headVars : Object.keys(bindings[0] || {}));
      setRawRows(bindings);
      
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

              {/* Full table toggle if more than two variables returned */}
              {columns.filter(Boolean).length > 2 && (
                <div style={{ marginTop: "1rem" }}>
                  <button onClick={() => setShowTable((v) => !v)}>
                    {showTable ? "Masquer toutes les colonnes" : "Afficher toutes les colonnes"}
                  </button>
                  {showTable && (
                    <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            {columns.map((c) => (
                              <th key={c} style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rawRows.map((row, idx) => (
                            <tr key={idx}>
                              {columns.map((c) => (
                                <td key={c} style={{ padding: "8px", borderBottom: "1px solid #f0f0f0" }}>
                                  {formatValue(row[c]) || ""}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
