import React from "react";
import "./DeleteModal.css";

export const DeleteModal = ({ isOpen, onClose, onDelete, day }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">
          Biztosan törölni szeretnéd ezt a napot?
        </h2>

        <p className="modal-day">Dátum: {day}</p>

        <div className="modal-buttons">
          <button className="close-button" onClick={onClose}>Mégse</button>
          <button className="delete-button" onClick={onDelete}>Törlés</button>
        </div>
      </div>
    </div>
  );
};