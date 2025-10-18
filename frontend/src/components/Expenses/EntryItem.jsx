import React from "react";
import "./EntryItem.css";

export const EntryItem = ({ entry, isEditing, onEntryChange }) => {
  return (
    <div className="entry-item">
      {isEditing ? (
        <>
          <input
            type="text"
            value={entry.description}
            onChange={(e) => onEntryChange("description", e.target.value)}
          />
          <input
            type="number"
            value={entry.amount}
            onChange={(e) => onEntryChange("amount", e.target.value)}
          />
        </>
      ) : (
        <>
          <span className="entry-description">{entry.description}</span>
          <span className="entry-amount">{entry.amount.toLocaleString()} Ft</span>
        </>
      )}
    </div>
  );
};