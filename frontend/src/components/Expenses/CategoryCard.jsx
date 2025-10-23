import React, { useState } from "react";
import { EntryItem } from "./EntryItem";
import "./CategoryCard.css";

export const CategoryCard = ({ category, isEditing, onUpdateCategory }) => {
  const [editedCategory, setEditedCategory] = useState({ ...category });

  // Példa: kategóriák és színek (később adatbázisból)
  const categoryColors = {
    Étel: "#FF6B6B",
    Közlekedés: "#4ECDC4",
    Szórakozás: "#FFD93D",
    Számlák: "#1E90FF",
    Bevásárlás: "#9B59B6",
    Egyéb: "#95A5A6"
  };

  const availableCategories = Object.keys(categoryColors);

  const categoryTotal = editedCategory.entries.reduce(
    (sum, entry) => sum + Number(entry.amount),
    0
  );

  //itt: ha nem választ a user kategóriát, akkor alapból az egyébbe dobja
  const handleCategoryChange = (value) => {
    const finalValue = value || "Egyéb";
    const updated = {
      ...editedCategory,
      name: finalValue,
      color: categoryColors[finalValue] || "#cccccc"
    };
    setEditedCategory(updated);
    onUpdateCategory(updated);
  };

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...editedCategory.entries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: field === "amount" ? Number(value) : value
    };
    const updated = { ...editedCategory, entries: newEntries };
    setEditedCategory(updated);
    onUpdateCategory(updated);
  };

  return (
    <div className="category-card">
      <div className="category-header">
        <div className="category-left">
          <span
            className="color-dot"
            style={{ backgroundColor: editedCategory.color }}
          ></span>

          {isEditing ? (
            <select
              value={editedCategory.name}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="category-select"
            >
              <option value="">Válassz kategóriát</option>
              {availableCategories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          ) : (
            <span className="category-name">{editedCategory.name}</span>
          )}
        </div>

        <span className="category-total">
          {categoryTotal.toLocaleString()} Ft
        </span>
      </div>

      <div className="category-entries">
        {editedCategory.entries.map((entry, i) => (
          <EntryItem
            key={i}
            entry={entry}
            isEditing={isEditing}
            onEntryChange={(field, value) =>
              handleEntryChange(i, field, value)
            }
          />
        ))}
      </div>
    </div>
  );
};