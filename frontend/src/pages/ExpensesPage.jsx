  import React, { useEffect, useState } from "react";
  import { DayCard } from "../components/Expenses/DayCard";
  import { AddDayModal } from "../components/Modals/AddDayModal/AddDayModal";
  import "./ExpensesPage.css";

  export default function ExpensesPage() {
    const [days, setDays] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const loadDays = async () => {
      try {
  const res = await fetch("/api/get_napi_koltesek");
  const data = await res.json();

  const napok = Object.entries(data).map(([datum, kategoriaObjektum]) => {
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

  return {
  id: datum, 
  date: datum,
  categories: categoriesArray
  };
  });

  setDays(napok); 
  } catch (err) {
  console.error("Hiba a napok betöltésekor:", err);
  }
  };
    useEffect(() => {
      loadDays();
    }, []);

    const handleSaveNewDay = async ({ date }) => {
      try {
        const res = await fetch("/api/add_napi_koltes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datum: date })  
        });

        const data = await res.json();
        console.log("Add napi költés válasz:", data);

        if (!data.error) {
          await loadDays(); 
        } else {
          alert(data.info);
        }
      } catch (err) {
        console.error("Hiba új nap hozzáadásakor:", err);
      }
    };

    const handleDelete = (dayId) => {
      setDays(prev => prev.filter(d => d.id !== dayId));
    };

    return (
      <div className="expenses-view-container">
        <div className="expenses-container">

          {
          }

          {days.length === 0 && (
            <p>Nincs még rögzített nap.</p>
          )}

          {days.map((day) => (
            <DayCard
              key={day.id}
              dayData={day}
              onDelete={() => handleDelete(day.id)}
            />
          ))}
        </div>

        {/* Modal */}
        <AddDayModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveNewDay}
        />
      </div>
    );
  }
