import React, { useState, useEffect } from "react";
import BarChartExpenses from "../components/Charts/BarChart";
import PieChartCategories from "../components/Charts/PieChart";
import "./AnalysisPage.css";

export default function AnalysisPage() {

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (year) => {
    setLoading(true);

    try {
      const res1 = await fetch(`/api/analysis/monthly/${year}`);
      const monthly = await res1.json();

      const res2 = await fetch(`/api/analysis/category/${year}`);
      const cats = await res2.json();

      setExpenses(monthly);
      setCategories(cats);

    } catch (err) {
      console.error("Hiba az analysis fetch-ben:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData(year);
  }, [year]);

  return (
    <div className="analysis-page">
      <div className="header">
        <button onClick={() => setYear(y => y - 1)}>◀ Előző év</button>
        <span className="year-label">{year}</span>
        <button onClick={() => setYear(y => y + 1)}>Következő év ▶</button>
      </div>

      {loading ? (
        <p className="loading">Betöltés...</p>
      ) : (
        <div className="charts">
          <div>
            <h3>Havi kiadások</h3>
            {expenses.length > 0 ? (
              <BarChartExpenses data={expenses} />
            ) : (
              <p className="no-data">Nincsenek kiadások az adott évre.</p>
            )}
          </div>

          <div>
            <h3>Kategóriák százalékos megoszlása</h3>
            {categories.length > 0 ? (
              <PieChartCategories data={categories} />
            ) : (
              <p className="no-data">Nincsenek kategóriák az adott évre.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}