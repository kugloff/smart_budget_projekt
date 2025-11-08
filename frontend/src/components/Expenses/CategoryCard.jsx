import React from "react";
import { EntryItem } from "./EntryItem";
import { Trash2 } from "lucide-react";
import "./DayCard.css";

export const CategoryCard = ({ category, isEditing }) => {
  // Backendből jön majd a kategória adata
  // const category = backendData;

  const categoryTotal = category?.entries?.reduce(
    (sum, entry) => sum + Number(entry.amount), 
    0
  ) || 0;

  const categoryColors = { Étel:"#FF6B6B", Közlekedés:"#4ECDC4", Szórakozás:"#FFD93D", Számlák:"#1E90FF", Bevásárlás:"#9B59B6", Egyéb:"#CCC" };
  const availableCategories = Object.keys(categoryColors);

  // backend update/delete/add entry

  return (
    <div className="category-card">
      <div className="category-header">
        <div className="category-left">
          <span className="color-dot" style={{backgroundColor:category.color}}></span>
          {isEditing ? (
            <select value={category.name} className="category-select" disabled>
              <option value="">Válassz kategóriát</option>
              {availableCategories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
            </select>
          ) : (
            <span className="category-name">{category.name}</span>
          )}
        </div>
        <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
          <span className="category-total">{categoryTotal.toLocaleString()} Ft</span>
          {isEditing && (
            <button className="delete-entry-btn" disabled>
              <Trash2 size={16}/>
            </button>
          )}
        </div>
      </div>

      <div className="category-entries">
        {category?.entries?.map((entry, i) => (
          <EntryItem 
            key={i} 
            entry={entry} 
            isEditing={isEditing} 
            // backend entry változtatás és delete
          />
        ))}
        {isEditing && (
          <button className="add-entry-btn" disabled>Új tétel hozzáadása</button>
        )}
      </div>
    </div>
  );
};
