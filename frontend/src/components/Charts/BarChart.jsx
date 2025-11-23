import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function BarChartExpenses({ data }) {
  const fixedData = data.map(item => ({
    name: item.honap + ". hó",
    value: item.osszeg
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={fixedData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}