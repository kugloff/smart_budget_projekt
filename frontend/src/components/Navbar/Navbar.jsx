import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { LimitModal } from '../Modals/LimitModal/LimitModal';
import { CategoryManagerModal } from '../Modals/CategoryManagerModal/CategoryManagerModal';

export const Navbar = ({ onOpenAddDayModal }) => {
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [limit, setLimit] = useState(0);

  const currentPage = window.REACT_PAGE || 'login';
  const isLoggingIn = currentPage === 'login';

  const fetchLimit = async () => {
    try {
      const res = await fetch("/api/get_user_limit");
      const data = await res.json();
      if (data.limit !== undefined) {
        setLimit(data.limit);
      }
    } catch (err) {
      console.error("Hiba a limit lekérésekor:", err);
    }
  };

const handleSaveLimit = async () => {
  const numericLimit = parseInt(limit, 10);
  
  if (isNaN(numericLimit)) {
    alert("Kérlek érvényes számot adj meg!");
    return;
  }

  try {
    const res = await fetch("/api/set_user_limit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: numericLimit })
    });
    
    const data = await res.json();
    if (!data.error) {
      setIsLimitModalOpen(false);
      await fetchLimit(); 
      window.location.reload(); 
    }
  } catch (err) {
    console.error("Hiba:", err);
  }
};

  useEffect(() => {
    if (!isLoggingIn) {
      fetchLimit();
    }
  }, [isLoggingIn]);

  return (
    <nav className="container">
      <div className="top-row">
        <ul className={`left ${isLoggingIn ? 'hidden' : 'visible'}`}>
          <li className={currentPage === 'expenses' ? 'active' : ''}>
            <a href="/expenses">Kiadások</a>
          </li>
          <li className={currentPage === 'analysis' ? 'active' : ''}>
            <a href="/analysis">Elemzés</a>
          </li>
          {currentPage === 'expenses' && (
            <li className="limit-button" onClick={() => setIsLimitModalOpen(true)}>
              Költési limit: {limit > 0 ? `${limit.toLocaleString()} Ft` : "Nincs beállítva"}
            </li>
          )}
        </ul>

        <h1>SmartBudget</h1>

        <ul className={`right ${isLoggingIn ? 'hidden' : 'visible'}`}>
          <li className={currentPage === 'ai' ? 'active' : ''}>
            <a href="/ai">AI-alapú tanácsadás</a>
          </li>
          {!isLoggingIn && (
            <li className="logout-button" onClick={() => (window.location.href = '/')}>
              Kijelentkezés
            </li>
          )}
        </ul>
      </div>

      <div className="bottom-row">
        <div className="bottom-buttons">
          {currentPage === 'expenses' ? (
            <>
              <button onClick={onOpenAddDayModal}>Új nap hozzáadása</button>
              <button onClick={() => setIsCategoryModalOpen(true)}>Kategóriák kezelése</button>
            </>
          ) : (
            <span style={{ visibility: 'hidden' }}>Placeholder</span>
          )}
        </div>

        <span className="status">
          {currentPage === 'login'
            ? 'Bejelentkezés / Regisztráció'
            : currentPage === 'expenses'
            ? 'Kiadások'
            : currentPage === 'analysis'
            ? 'Elemzés'
            : currentPage === 'ai'
            ? 'AI-alapú tanácsadás'
            : ''}
        </span>
      </div>

      <LimitModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        onSave={handleSaveLimit} 
        limit={limit}
        setLimit={setLimit}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </nav>
  );
};