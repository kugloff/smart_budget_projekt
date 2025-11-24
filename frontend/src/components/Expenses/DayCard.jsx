import React, { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, Edit3, Save, X } from "lucide-react";
import { CategoryCard } from "./CategoryCard";
import "./DayCard.css";

export const DayCard = ({ dayData, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // A backendből jövő adatok:
  const date = dayData.date || dayData.datum;
  const categories = Array.isArray(dayData.categories)
    ? dayData.categories
    : [];

  // Napi összeg
  const dayTotal = categories.reduce(
    (sum, c) => sum + (c.amount ?? c.osszeg ?? 0),
    0
  );

  const handleEditClick = () => {
    if (!isOpen) setIsOpen(true);
    setIsEdit(true);
  };

  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      if (prev) setIsEdit(false);
      return !prev;
    });
  };

  const handleSave = () => setIsEdit(false);
  const handleCancel = () => setIsEdit(false);

  return (
    <div className="day-card">
      <div className="day-header">
        <div className="day-info">
          <strong>{date.replace(/-/g, ".") + "."}</strong>

          {!isOpen && (
            <div className="day-category-dots">
              {categories.map((cat, i) => (
                <span
                  key={i}
                  className="small-dot"
                  style={{ backgroundColor: cat.color || cat.kategoria_szin || "#999" }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="day-actions-total">
          <div className="day-total">{dayTotal.toLocaleString()} Ft</div>

          {!isEdit && (
            <>
              <button onClick={handleEditClick}>
                <Edit3 size={20} />
              </button>
              <button onClick={onDelete}>
                <Trash2 size={20} />
              </button>
            </>
          )}

          {isEdit && (
            <>
              <button onClick={handleSave}>
                <Save size={20} />
              </button>
              <button onClick={handleCancel}>
                <X size={20} />
              </button>
            </>
          )}

          <button onClick={handleToggleOpen}>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="day-content">
          {categories.map((cat, i) => (
            <CategoryCard
              key={i}
              category={cat}
              isEditing={isEdit}
            />
          ))}

          {isEdit && (
            <button className="add-category-btn">
              Új kategória hozzáadása
            </button>
          )}
        </div>
      )}
    </div>
  );
};
