import React, { useState, useEffect } from "react";
import "./AddDayModal.css";

export const AddDayModal = ({ isOpen, onClose, onSave }) => {
  const todayString = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayString);

  useEffect(() => {
    if (isOpen) setDate(todayString);
  }, [isOpen]);

  const handleSave = () => {
    if (!date) return;
    onSave({
      date,
      categories: [
        { name: "Új kategória", color: "#4CAF50", entries: [{ description: "Új tétel", amount: 0 }] }
      ]
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
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="modal-buttons">
          <button className="close-button" onClick={onClose}>Mégse</button>
          <button className="save-button" onClick={handleSave}>Mentés</button>
        </div>
      </div>
    </div>
  );
};