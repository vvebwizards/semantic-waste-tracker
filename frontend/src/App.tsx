import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [sparql, setSparql] = useState("");
  const [results, setResults] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleAsk = async () => {
    if (!question) return;
    try {
      const res = await fetch(`${API_URL}/api/nlp_query/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      const bindings = data?.data?.results?.bindings || [];
      const cleanedResults = bindings.map((b) => {
        const uri = b.sujet.value;
        const label = uri.split(/[#/]/).pop().replace(/_/g, " ");
        return { label };
      });
      setResults(cleanedResults);
      setQuestion("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRawQuery = async () => {
    if (!sparql) return;
    try {
      const res = await fetch(`${API_URL}/api/sparql/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sparql }),
      });
      const data = await res.json();
      const bindings = data?.data?.results?.bindings || [];
      const cleanedResults = bindings.map((b) => {
        const uri = b.sujet.value;
        const label = uri.split(/[#/]/).pop().replace(/_/g, " ");
        return { label };
      });
      setResults(cleanedResults);
      setSparql("");
    } catch (err) {
      console.error(err);
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
            placeholder="e.g., List all wastes"
          />
          <button onClick={handleAsk}>Ask</button>
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

        {/* Results display */}
        <div className="results">
          {results.length > 0 && <h2>Results:</h2>}
          <div className="card-container">
            {results.map((r, i) => (
              <div key={i} className="card">
                <h3>{r.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
