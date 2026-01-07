import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function BarChartExpenses({ data }) {
  const months = [
    "Jan", "Feb", "Már", "Ápr", "Máj", "Jún", 
    "Júl", "Aug", "Szep", "Okt", "Nov", "Dec"
  ];

  const fixedData = months.map((monthName, index) => {
    const currentMonthNum = index + 1;

    const foundItem = data.find(item => parseInt(item.honap) === currentMonthNum);

    return {
      name: monthName,
      value: foundItem ? foundItem.osszeg : 0 // Ha nincs adat, legyen 0 Ft
    };
  });

  const formatter = new Intl.NumberFormat('hu-HU', { 
    style: 'currency', 
    currency: 'HUF', 
    minimumFractionDigits: 0 
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
}