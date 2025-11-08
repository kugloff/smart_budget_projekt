import React from "react";
import { Trash2 } from "lucide-react";
import "./DayCard.css";

export const EntryItem = ({ entry, isEditing }) => {
  // backend - entry.description és entry.amount
  //         - update, delete

  return (
    <div className="entry-item-container">
      {isEditing ? (
        <>
          <input
            type="text"
            value={entry.description}
            placeholder="Új tétel"
            className="entry-description-input"
            disabled
          />
          <input
            type="number"
            value={entry.amount}
            placeholder="Összeg"
            className="entry-amount-input"
            disabled
          />
          <button className="delete-entry-btn" disabled>
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