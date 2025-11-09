import React, { useState, useEffect } from "react";
import "./CategoryManagerModal.css";

// ez csak a törlést megerősítő modal
const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="modal-buttons">
          <button className="close-button" onClick={onCancel}>Mégse</button>
          <button className="delete-button" onClick={onConfirm}>Törlés</button>
        </div>
      </div>
    </div>
  );
};

export const CategoryManagerModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", color: "#cccccc" });
  const [confirmIndex, setConfirmIndex] = useState(null);

  // kategóriák

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;

    // új kategória mentése

    setNewCategory({ name: "", color: "#cccccc" });
  };

  const handleCategoryChange = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = value;
    setCategories(updated);

    // kategória frissítése
  };

  const handleDelete = (index) => {
    setConfirmIndex(index);
  };

  const confirmDelete = () => {
    const categoryToDelete = categories[confirmIndex];

    // kategória törlése

    setConfirmIndex(null);
  };

  const cancelDelete = () => setConfirmIndex(null);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="modal-title">Kategóriák kezelése</h2>

          {/* categories.map */}
          <div className="category-list">
            {categories.map((cat, i) => (
              <div key={cat.id || i} className="category-row">
                <span key={i} className="small-dot" style={{ backgroundColor: cat.color }} />
                <h1>{cat.name}</h1>
                <button className="delete-btn" onClick={() => handleDelete(i)}>
                  Törlés
                </button>
              </div>
            ))}
          </div>

          <div className="add-category-label">Új kategória hozzáadása</div>
          <div className="add-category">
            <input
              type="color"
              value={newCategory.color}
              onChange={e => setNewCategory({ ...newCategory, color: e.target.value })}
            />
            <input
              type="text"
              placeholder="Új kategória neve"
              value={newCategory.name}
              onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
            />
            <button className="add-btn" onClick={handleAddCategory}>
              Hozzáadás
            </button>
          </div>

          <div className="category-modal-buttons">
            <button className="category-close-btn" onClick={onClose}>Bezárás</button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmIndex !== null}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        message="Biztosan törölni szeretnéd a kategóriát?"
      />
    </>
  );
};