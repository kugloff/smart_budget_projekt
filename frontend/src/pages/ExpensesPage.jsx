import React, { useState } from 'react';
import { DayCard } from "../components/Expenses/DayCard";
import "./ExpensesPage.css";

export default function ExpensesPage(){
  return (
      <div className="expenses-view-container">
        <div className="expenses-container">
          <DayCard />
          <DayCard />
          <DayCard />
        </div>
      </div>
  );
};