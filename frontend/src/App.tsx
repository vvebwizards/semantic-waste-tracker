import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [results, setResults] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleAsk = async () => {
    if (!question) return;
    try {
      const res = await fetch(`${API_URL}/api/query/`, {
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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Waste Management Semantic Web</h1>
        <p>Ask a question about waste management:</p>

        <div className="input-section">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., List all wastes"
          />
          <button onClick={handleAsk}>Ask</button>
        </div>

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
