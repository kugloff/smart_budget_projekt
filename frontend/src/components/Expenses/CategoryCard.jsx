import React, { useState } from "react";
import { EntryItem } from "./EntryItem";
import "./CategoryCard.css";

export const CategoryCard = ({ category, isEditing, onUpdateCategory }) => {
  const [editedCategory, setEditedCategory] = useState({ ...category });

  const categoryTotal = editedCategory.entries.reduce(
    (sum, entry) => sum + Number(entry.amount),
    0
  );

  const handleChange = (field, value) => {
    const updated = { ...editedCategory, [field]: value };
    setEditedCategory(updated);
    onUpdateCategory(updated);
  };

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...editedCategory.entries];
    newEntries[index] = { ...newEntries[index], [field]: field === "amount" ? Number(value) : value };
    const updated = { ...editedCategory, entries: newEntries };
    setEditedCategory(updated);
    onUpdateCategory(updated);
  };

  return (
    <div className="category-card">
      <div className="category-header">
        <div className="category-left">
          {isEditing ? (
            <input
              type="color"
              value={editedCategory.color}
              onChange={(e) => handleChange("color", e.target.value)}
              style={{ width: "25px", height: "25px", marginRight: "5px", border: "none" }}
            />
          ) : (
            <span
              className="color-dot"
              style={{ backgroundColor: editedCategory.color }}
            ></span>
          )}

          {isEditing ? (
            <input
              type="text"
              value={editedCategory.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          ) : (
            <span className="category-name">{editedCategory.name}</span>
          )}
        </div>
        <span className="category-total">{categoryTotal.toLocaleString()} Ft</span>
      </div>

      <div className="category-entries">
        {editedCategory.entries.map((entry, i) => (
          <EntryItem
            key={i}
            entry={entry}
            isEditing={isEditing}
            onEntryChange={(field, value) => handleEntryChange(i, field, value)}
          />
        ))}
      </div>
    </div>
  );
};