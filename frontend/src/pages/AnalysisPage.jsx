import React from "react";
import BarChartExpenses from "../components/Charts/BarChart";
import PieChartCategories from "../components/Charts/PieChart";
import "./AnalysisPage.css";

export default function AnalysisPage() {

  // backend - adott évhez tartozó expenses adatok
  //         - adott évhez tartozó kategória csoportok

  return (
    <div className="analysis-page">
      <div className="header">
        {/* év váltása itt lenne a fetch */}
        <button>◀ Előző év</button>
        <span className="year-label">2025</span>
        <button>Következő év ▶</button>
      </div>

      <div className="charts">
        <div>
          <h3>Havi kiadások</h3>
          {/* expenses adatok */}
          {/* <BarChartExpenses data={expenses} /> (fontos a data mindkét esetben, mert a chartok ezt várják()*/}
        </div>

        <div>
          <h3>Kategóriák százalékos megoszlása</h3>
          {/* categories adatok */}
          {/* <PieChartCategories data={categories} /> */}
        </div>
      </div>
    </div>
  );
}