import React from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

export default function PieChartCategories({ data }) {
  const fallbackColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];
  
  const formatter = new Intl.NumberFormat('hu-HU', { 
    style: 'currency', 
    currency: 'HUF', 
    minimumFractionDigits: 0 
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
            const color = entry.szin_kod || entry.color || fallbackColors[index % fallbackColors.length];
            return <Cell key={`cell-${index}`} fill={color} />;
          })}
        </Pie>
        <Tooltip formatter={(value) => formatter.format(value)} />
      </PieChart>
    </ResponsiveContainer>
  );
}