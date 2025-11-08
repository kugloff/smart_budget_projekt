import React, { useState } from "react";
import "./AddDayModal.css";

export const AddDayModal = ({ isOpen, onClose, onSave }) => {
  const [date, setDate] = useState("");

  // az API-ból jöhetne a mai dátum (pl. szerveridő alapján),
  // setDate értékét kell beállítani erre
  // ez azt a célt szolgálná, hogy amikor megnyitod az addday-t akkor alapból a mai nap jön be

  const handleSave = () => {
    if (!date) return;

    // POST új nap mentéséhez
    onSave({
      date
    });

    onClose();
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
          />
        </div>
        <div className="modal-buttons">
          <button className="close-button" onClick={onClose}>Mégse</button>
          <button className="save-button" onClick={handleSave}>Mentés</button>
        </div>
      </div>
    </div>
  );
};