import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { BarChart3, Calendar, Bot, Loader2 } from "lucide-react";
import "./AIAssistantPage.css";

export default function AIAssistantPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/get_napi_koltesek'); 
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error('Hiba a felhasználói adatok betöltésekor', err);
      }
    };
    fetchUserData();
  }, []);

  const callAI = async (mode) => {
    if (!userData) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, userData }),
      });
      const data = await res.json();
      setResponse(data.result || data.info || "Sajnos nem érkezett válasz az AI-tól.");
    } catch (err) {
      setResponse("Hálózati hiba történt az elemzés során.");
    }
    setLoading(false);
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-content">
          <div className="button-grid">
            <button
              className="action-btn"
              onClick={() => callAI("all")}
              disabled={loading || !userData}
            >
              <BarChart3 size={20} />
              {loading ? "Elemzés..." : "Teljes elemzés"}
            </button>

            <button
              className="action-btn"
              onClick={() => callAI("year")}
              disabled={loading || !userData}
            >
              <Calendar size={20} />
              {loading ? "Elemzés..." : "Idei év áttekintése"}
            </button>
          </div>

          {(loading || response) && (
            <div className="response-container animate-fade-in">
              {loading ? (
                <div className="loading-state">
                  <Loader2 className="spinner" />
                  <p>A Gemini AI gondolkodik...</p>
                </div>
              ) : (
                <div className="markdown-content">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {!loading && !response && (
            <p className="hint-text">
              <Bot size={16} /> {!userData ? "Adatok betöltése..." : "Válassz egy elemzési módot!"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}