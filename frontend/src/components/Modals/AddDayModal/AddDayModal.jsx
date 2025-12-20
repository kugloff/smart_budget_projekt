import React, { useState, useEffect } from "react";
import "./AddDayModal.css";

export const AddDayModal = ({ isOpen, onClose, onSave }) => {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false); // Visszajelzés a mentésről

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const formatted = today.toISOString().split("T")[0];
      setDate(formatted);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!date) return;

    setLoading(true);
    try {
      // BACKEND ÖSSZEKÖTÉS
      const response = await fetch("/api/add_napi_koltes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ datum: date }), // A backend 'datum' kulcsot vár
      });

      const result = await response.json();

      if (result.error === false) {
        // Ha a backend sikeresen válaszolt
        onSave(); // Ez frissíti az Expense oldalon a listát
        onClose();
      } else {
        // Ha hiba történt (pl. már létezik ez a nap)
        alert(result.info);
      }
    } catch (error) {
      console.error("Hiba a mentés során:", error);
      alert("Hálózati hiba történt!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Új nap hozzáadása</h2>

        <div className="add-modal-input-container">
          <label>Dátum:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="modal-buttons">
          <button 
            className="close-button" 
            onClick={onClose} 
            disabled={loading}
          >
            Mégse
          </button>
          <button 
            className="save-button" 
            onClick={handleSave} 
            disabled={loading}
          >
            {loading ? "Mentés..." : "Mentés"}
          </button>
        </div>
      </div>
    </div>
  );
};