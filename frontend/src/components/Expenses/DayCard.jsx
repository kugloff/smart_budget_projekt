import React, { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, Edit3 } from "lucide-react";
import { CategoryCard } from "./CategoryCard";
import "./DayCard.css";

export const DayCard = () => {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    {
      name: "Élelmiszer",
      color: "#4CAF50",
      entries: [
        { description: "Aldi bevásárlás", amount: 54000 },
        { description: "Lidl", amount: 500 },
      ],
    },
    {
      name: "Közlekedés",
      color: "#2196F3",
      entries: [{ description: "BKV bérlet", amount: 3450 }],
    },
    {
      name: "Szórakozás",
      color: "#E91E63",
      entries: [{ description: "Mozijegy", amount: 1000 }],
    },
  ];

  const dayTotal = categories.reduce(
    (sum, cat) =>
      sum + cat.entries.reduce((catSum, entry) => catSum + entry.amount, 0),
    0
  );

  return (
    <div className="day-card">
      <div className="day-header">
        <div className="day-info">
          <strong>2025.10.17. (Péntek)</strong>
          {!isOpen && (
            <div className="day-category-dots">
              {categories.map((cat, i) => (
                <span
                  key={i}
                  className="small-dot"
                  style={{ backgroundColor: cat.color }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="day-actions-total">
          <div className="day-total">{dayTotal.toLocaleString()} Ft</div>
          <button>
            <Edit3 size={20} />
          </button>
          <button>
            <Trash2 size={20} />
          </button>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="day-content">
          {categories.map((cat, i) => (
            <CategoryCard key={i} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
};