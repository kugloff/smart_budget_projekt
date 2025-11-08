import React from "react";
import { Trash2 } from "lucide-react";
import "./DayCard.css";

export const EntryItem = ({ entry, isEditing, onEntryChange, onDelete }) => {
  return (
    <div className="entry-item-container">
      {isEditing ? (
        <>
          <input
            type="text"
            value={entry.description === "Új tétel" ? "" : entry.description}
            placeholder="Új tétel"
            className="entry-description-input"
            onChange={e => onEntryChange("description", e.target.value)}
          />
          <input
            type="number"
            value={entry.amount === 0 ? "" : entry.amount}
            placeholder="Összeg"
            onChange={e => onEntryChange("amount", e.target.value)}
            className="entry-amount-input"
          />
          <button className="delete-entry-btn" onClick={onDelete}>
            <Trash2 size={16} />
          </button>
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