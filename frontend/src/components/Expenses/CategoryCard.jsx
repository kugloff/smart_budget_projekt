import React, { useState, useEffect } from "react";
import { EntryItem } from "./EntryItem";
import { Trash2, Plus } from "lucide-react";
import "./DayCard.css";

export const CategoryCard = ({ category, isEditing, datum, onRefresh }) => {
  const [availableTypes, setAvailableTypes] = useState([]); 

  useEffect(() => {
    if (isEditing && !category.name) {
      fetch("/api/get_kategoria_nevek")
        .then((res) => res.json())
        .then((data) => {
          setAvailableTypes(data);
        })
        .catch((err) => console.error("Hiba a kategóriák betöltésekor:", err));
    }
  }, [isEditing, category.name]);

  const handleSelectCategory = async (kategoria_id) => {
    try {
      const response = await fetch("/api/add_koltesi_kategoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datum: datum,
          kategoria_id: kategoria_id, 
        }),
      });

      const result = await response.json();
      if (!result.error) {
        onRefresh();
      } else {
        alert(result.info);
      }
    } catch (err) {
      console.error("Hiba a mentésnél:", err);
    }
  };

  const categoryTotal = (category.entries || []).reduce(
    (sum, entry) => sum + Number(entry.osszeg ?? 0),
    0
  );

  // Szín meghatározása (backend: szin_kod vagy color)
  const categoryColor = category.szin_kod || category.color || "#999999";

  return (
    <div className="category-card">
      <div className="category-header">
        <div className="category-left">
          <span
            className="color-dot"
            style={{ backgroundColor: categoryColor }}
          ></span>

          {isEditing && !category.name ? (
            <select
              className="category-select"
              onChange={(e) => handleSelectCategory(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Kategória kiválasztása...</option>
              {availableTypes.map((type) => (
                <option key={type[0]} value={type[0]}>
                  {type[1]}
                </option>
              ))}
            </select>
          ) : (
            <span className="category-name">{category.name || "Új kategória"}</span>
          )}
        </div>

        <div className="category-right" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="category-total">
            {categoryTotal.toLocaleString()} Ft
          </span>
          {isEditing && category.name && (
            <button className="delete-entry-btn">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="category-entries">
        {/* Csak akkor mutatjuk a tételeket, ha már el van mentve a kategória */}
        {category.entries &&
          category.entries.map((entry, i) => (
            <EntryItem key={i} entry={entry} isEditing={isEditing} />
          ))}

        {isEditing && category.name && (
          <button className="add-entry-btn">
            <Plus size={14} /> Új tétel
          </button>
        )}
      </div>
    </div>
  );
};