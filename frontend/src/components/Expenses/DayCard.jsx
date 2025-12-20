import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Trash2, Edit3, Save, X, Plus } from "lucide-react";
import { CategoryCard } from "./CategoryCard";
import "./DayCard.css";

export const DayCard = ({ dayData, onDelete, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [localCategories, setLocalCategories] = useState([]);

  const date = dayData.date || dayData.datum;

  // Adatok szinkronizálása a szülővel
  useEffect(() => {
    if (dayData && dayData.categories) {
      setLocalCategories(dayData.categories);
    }
  }, [dayData]);

  // --- EZ HIÁNYZOTT: A kinyitás/becsukás kezelője ---
  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      // Ha becsukjuk, lépjünk ki a szerkesztési módból is
      if (prev) setIsEdit(false);
      return !prev;
    });
  };

  const handleEditClick = () => {
    if (!isOpen) setIsOpen(true);
    setIsEdit(true);
  };

  const handleAddEmptyCategory = () => {
    const newEmpty = { 
        name: "", 
        entries: [], 
        color: "#999999",
        amount: 0 
    };
    setLocalCategories([...localCategories, newEmpty]);
  };

  const handleSave = () => {
    setIsEdit(false);
    if (onRefresh) onRefresh();
  };

  const handleCancel = () => {
    setIsEdit(false);
    setLocalCategories(dayData.categories || []);
  };

  return (
    <div className="day-card">
      <div className="day-header">
        <div className="day-info">
          <strong>{date?.replace(/-/g, ".") + "."}</strong>
          {!isOpen && (
            <div className="day-category-dots">
              {localCategories.map((cat, i) => (
                <span
                  key={i}
                  className="small-dot"
                  style={{ backgroundColor: cat.color || cat.szin_kod || "#999" }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="day-actions-total">
          <div className="day-total">
            {localCategories.reduce((s, c) => s + (c.amount || c.osszeg || 0), 0).toLocaleString()} Ft
          </div>

          {!isEdit ? (
            <>
              <button onClick={handleEditClick}><Edit3 size={20} /></button>
              <button onClick={onDelete}><Trash2 size={20} /></button>
            </>
          ) : (
            <>
              <button onClick={handleSave}><Save size={20} /></button>
              <button onClick={handleCancel}><X size={20} /></button>
            </>
          )}

          <button onClick={handleToggleOpen}>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="day-content">
          {localCategories.map((cat, i) => (
            <CategoryCard
              key={cat.id || i}
              category={cat}
              isEditing={isEdit}
              datum={date}
              onRefresh={onRefresh}
            />
          ))}

          {isEdit && (
            <button 
              className="add-category-btn" 
              onClick={handleAddEmptyCategory}
            >
              <Plus size={16} /> Új kategória hozzáadása
            </button>
          )}
        </div>
      )}
    </div>
  );
};