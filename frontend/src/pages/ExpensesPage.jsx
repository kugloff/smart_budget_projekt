import React from "react";
import { DayCard } from "../components/Expenses/DayCard";
import "./ExpensesPage.css";

export default function ExpensesPage({ days, removeDay }){
  return (
    <div className="expenses-view-container">
      <div className="expenses-container">
        {days.map((day, index) => (
          <DayCard
            key={index}
            initialDate={day.date}
            initialCategories={day.categories}
            onDelete={() => removeDay(index)}
          />
        ))}
      </div>
    </div>
  );
}