import React, { useEffect, useState } from "react";
import { DayCard } from "../components/Expenses/DayCard";
import { AddDayModal } from "../components/Modals/AddDayModal/AddDayModal";
import { CategoryManagerModal } from "../components/Modals/CategoryManagerModal/CategoryManagerModal";
import { LimitModal } from "../components/Modals/LimitModal/LimitModal";
import "./ExpensesPage.css";

export default function ExpensesPage() {
  // --- ÁLLAPOTOK (STATE) ---
  const [days, setDays] = useState([]);
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  
  // Modal kapcsolók
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // --- ADATOK BETÖLTÉSE ---
  const loadDays = async () => {
    try {
      const res = await fetch("/api/get_napi_koltesek");
      const data = await res.json();

      // Limit betöltése a közös vagy külön végpontból
      if (data.havi_limit) setMonthlyLimit(data.havi_limit);

      const sourceData = data.napok || data;
      const napok = Object.entries(sourceData).map(([datum, kategoriaObjektum]) => {
        const categoriesArray = Object.entries(kategoriaObjektum).map(([kategoriaNev, adatok]) => {
          const totalAmount = adatok.koltesek.reduce((sum, koltes) => sum + (koltes.osszeg || 0), 0);
          return {
            name: kategoriaNev,
            amount: totalAmount,
            color: adatok.szin_kod,
            koltesek: adatok.koltesek,
            koltes_id: adatok.koltes_id
          };
        });
        return { id: datum, date: datum, categories: categoriesArray };
      });
      setDays(napok);
    } catch (err) {
      console.error("Hiba a betöltéskor:", err);
    }
  };

  useEffect(() => {
    loadDays();
  }, []);

  // --- SZÁMÍTÁSOK ---
  const totalMonthlySpending = days.reduce((sum, day) => {
    return sum + day.categories.reduce((catSum, cat) => catSum + cat.amount, 0);
  }, 0);

  // --- FUNKCIÓK ---
  const handleSaveLimit = async () => {
    try {
      const res = await fetch("/api/set_user_limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: monthlyLimit })
      });
      const data = await res.json();
      if (!data.error) setIsLimitModalOpen(false);
    } catch (err) { console.error(err); }
  };

  const handleSaveNewDay = async ({ date }) => {
    try {
      const res = await fetch("/api/add_napi_koltes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datum: date })
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        loadDays();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="expenses-view-container">
      

      <div className="budget-summary-card">
        <div className="budget-info">
          <span>Havi költés: <strong>{totalMonthlySpending.toLocaleString()} Ft</strong></span>
          <span>Keret: <strong>{monthlyLimit > 0 ? monthlyLimit.toLocaleString() + " Ft" : "Nincs beállítva"}</strong></span>
        </div>
        
        <div className="progress-container" onClick={() => setIsLimitModalOpen(true)}>
          <div 
            className={`progress-bar ${totalMonthlySpending > monthlyLimit && monthlyLimit > 0 ? "danger" : "success"}`}
            style={{ width: `${Math.min((totalMonthlySpending / (monthlyLimit || 1)) * 100, 100)}%` }}
          ></div>
        </div>
        
        <button className="limit-edit-btn" onClick={() => setIsLimitModalOpen(true)}>
          Limit módosítása
        </button>
      </div>

      <div className="expenses-container">
        {days.length === 0 && <p>Nincs még rögzített nap.</p>}
        {days.map((day) => (
          <DayCard key={day.id} dayData={day} onRefresh={loadDays} />
        ))}
      </div>

      {/* MODALOK (Csak itt várakoznak, nem csinálnak plusz gombot) */}
      <AddDayModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewDay}
      />

      <CategoryManagerModal 
        isOpen={isCatModalOpen} 
        onClose={() => setIsCatModalOpen(false)} 
        onRefresh={loadDays}
      />

      <LimitModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        onSave={handleSaveLimit}
        limit={monthlyLimit}
        setLimit={setMonthlyLimit}
      />
    </div>
  );
}