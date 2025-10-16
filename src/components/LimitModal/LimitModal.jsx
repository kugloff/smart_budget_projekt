import React from 'react';
import './LimitModal.css';

export const LimitModal = ({ isOpen, onClose, onSave, limit, setLimit }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Állíts be egy havi limitet:</h2>

        <div className="modal-input-container">
          <input 
            type="number" 
            value={limit} 
            onChange={e => setLimit(e.target.value)} 
            placeholder="200000"
            className="modal-input"
          />
          <span className="modal-currency">Ft</span>
        </div>

        <div className="modal-buttons">
          <button className="close-button" onClick={onClose}>Mégse</button>
          <button className="save-button" onClick={onSave}>Mentés</button>
        </div>
      </div>
    </div>
  );
};