import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function BarChartExpenses({ data }) {
  const fixedData = data.map(item => ({
    name: item.honap,
    value: item.osszeg
  }));

  const formatter = new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', minimumFractionDigits: 0 });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={fixedData}>
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => formatter.format(value)} />
        <Tooltip formatter={(value) => formatter.format(value)} />
        <Bar dataKey="value" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}