import React from "react";
import "./EntryItem.css";

export const EntryItem = ({ entry }) => {
  return (
    <div className="entry-item">
      <span className="entry-description">{entry.description}</span>
      <span className="entry-amount">{entry.amount.toLocaleString()} Ft</span>
    </div>
  );
};