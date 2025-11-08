import React from "react";
import { DayCard } from "../components/Expenses/DayCard";
import "./ExpensesPage.css";

export default function ExpensesPage(){

  // Backend

  return (
    <div className="expenses-view-container">
      <div className="expenses-container">
        {/* DayCard komponensek backendből jövő adatok alapján generálódnak majd 
          {days.map((day) => (
            <DayCard
              key={day.id}
              initialDate={day.date}
              initialCategories={day.categories}
              onDelete={() => handleDelete(day.id)}
            />
          ))}
        */}
      </div>
    </div>
  );
}
