import React from "react";
import { EntryItem } from "./EntryItem";
import "./CategoryCard.css";

export const CategoryCard = ({ category }) => {
  // kategória összeg kiszámítása az entry-k alapján
  const categoryTotal = category.entries.reduce(
    (sum, entry) => sum + entry.amount,
    0
  );

  return (
    <div className="category-card">
      <div className="category-header">
        <div className="category-left">
          <span
            className="color-dot"
            style={{ backgroundColor: category.color }}
          ></span>
          <span className="category-name">{category.name}</span>
        </div>
        <span className="category-total">{categoryTotal.toLocaleString()} Ft</span>
      </div>

      <div className="category-entries">
        {category.entries.map((entry, i) => (
          <EntryItem key={i} entry={entry} />
        ))}
      </div>
    </div>
  );
};
