import React, { useState, useEffect } from "react";
import "./AddDayModal.css";

export const AddDayModal = ({ isOpen, onClose, onSave }) => {
  const [date, setDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const formatted = today.toISOString().split("T")[0];
      setDate(formatted);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!date) return;

    onSave({ date });
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

