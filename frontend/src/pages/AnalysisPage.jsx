import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell 
} from "recharts";
import "./AnalysisPage.css";

const BarChartExpenses = ({ data }) => {
  const months = ["Jan", "Feb", "Már", "Ápr", "Máj", "Jún", "Júl", "Aug", "Szep", "Okt", "Nov", "Dec"];

  const fixedData = months.map((monthName, index) => {
    const currentMonthNum = index + 1;
    const foundItem = data.find(item => parseInt(item.honap) === currentMonthNum);
    return {
      name: monthName,
      value: foundItem ? foundItem.osszeg : 0
    };
  });

  const formatter = new Intl.NumberFormat('hu-HU', { 
    style: 'currency', currency: 'HUF', minimumFractionDigits: 0 
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={fixedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => formatter.format(value)} width={80} />
        <Tooltip formatter={(value) => formatter.format(value)} cursor={{ fill: 'transparent' }} />
        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const PieChartCategories = ({ data }) => {
  const fallbackColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];
  const formatter = new Intl.NumberFormat('hu-HU', { 
    style: 'currency', currency: 'HUF', minimumFractionDigits: 0 
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={(entry) => `${entry.category}: ${formatter.format(entry.value)}`} 
        >
          {data.map((entry, index) => {
            let color = entry.szin_kod || entry.color;
            if (color && !color.startsWith('#')) color = `#${color}`;
            return <Cell key={`cell-${index}`} fill={color || fallbackColors[index % fallbackColors.length]} />;
          })}
        </Pie>
        <Tooltip formatter={(value) => formatter.format(value)} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default function AnalysisPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (targetYear) => {
    setLoading(true);
    try {
      const [res1, res2] = await Promise.all([
        fetch(`/api/analysis/monthly/${targetYear}`),
        fetch(`/api/analysis/category/${targetYear}`)
      ]);
      
      const monthly = await res1.json();
      const cats = await res2.json();

      setExpenses(monthly);
      setCategories(cats);
    } catch (err) {
      console.error("Hiba az analysis fetch-ben:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(year);
  }, [year]);

  return (
    <div className="analysis-page">
      <div className="header">
        <button className="year-btn" onClick={() => setYear(y => y - 1)}>◀ Előző év</button>
        <span className="year-label">{year}</span>
        <button className="year-btn" onClick={() => setYear(y => y + 1)}>Következő év ▶</button>
      </div>

      {loading ? (
        <div className="loading-container">
          <p className="loading">Adatok betöltése...</p>
        </div>
      ) : (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Havi kiadások eloszlása</h3>
            {expenses.length > 0 ? (
              <BarChartExpenses data={expenses} />
            ) : (
              <p className="no-data">Nincsenek havi adatok ebben az évben.</p>
            )}
          </div>

          <div className="chart-card">
            <h3>Kategóriák szerinti megoszlás</h3>
            {categories.length > 0 ? (
              <PieChartCategories data={categories} />
            ) : (
              <p className="no-data">Nincsenek kategória adatok ebben az évben.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}