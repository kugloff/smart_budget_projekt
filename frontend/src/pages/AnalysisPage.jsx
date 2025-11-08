import React, { useEffect, useState } from "react";
import BarChartExpenses from "../components/Charts/BarChart";
import PieChartCategories from "../components/Charts/PieChart";
import axios from "axios";
import "./AnalysisPage.css";

export default function AnalysisPage({ userId }) {
  const [year, setYear] = useState(2025);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(`/api/expenses/${userId}/${year}`).then(res => setExpenses(res.data));
    axios.get(`/api/analysis/${userId}`).then(res => setCategories(res.data));
  }, [userId, year]);

  return (
    <div className="analysis-page">
      <div className="header">
        <button onClick={() => setYear(year-1)}>◀ {year-1}</button>
        <span className="year-label">{year}</span>
        <button onClick={() => setYear(year+1)}>{year+1} ▶</button>
      </div>

      <div className="charts">
        <div>
          <h3>Havi kiadások</h3>
          <BarChartExpenses data={expenses} />
        </div>

        <div>
          <h3>Kategóriák százalékos megoszlása</h3>
          <PieChartCategories data={categories} />
        </div>
      </div>
    </div>
  );
}