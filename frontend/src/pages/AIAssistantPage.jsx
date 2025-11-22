import React, { useState, useEffect } from "react";
import "./AIAssistantPage.css";

export default function AIAssistantPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [userData, setUserData] = useState(null);

  //lekéri az adatokat az adatbázisból
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
    if (!userData) {
      setResponse('Felhasználói adatok még nem töltődtek be.');
      return;
    }

    setLoading(true);
    setResponse("");

    //ez lenne az új végpont, amit majd az api híváshoz használunk
    try {
      const res = await fetch("/api/google-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, userData }),
      });

      const data = await res.json();
      setResponse(data.result || "Nincs válasz.");
    } catch (err) {
      setResponse("Hiba történt az AI hívás közben.");
    }

    setLoading(false);
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-content">
          <p className="subtitle">
            Válaszd ki, milyen adatokat szeretnél elemeztetni. <br/>
            A válaszokat a Google Gemini mesterséges intelligencia generálja.
          </p>

          <div className="button-grid">
            <button
              className="action-btn"
              onClick={() => callAI("all")}
              disabled={loading || !userData}
            >
              {loading ? "Betöltés..." : "Összes kiadás elemzése"}
            </button>

            <button
              className="action-btn"
              onClick={() => callAI("year")}
              disabled={loading || !userData}
            >
              {loading ? "Betöltés..." : "Idei év elemzése"}
            </button>
          </div>

          <div className="response-box">
            {response ? response : (!userData ? "Felhasználói adatok betöltése..." : "AI válasza itt fog megjelenni...")}
          </div>
        </div>
      </div>
    </div>
  );
}