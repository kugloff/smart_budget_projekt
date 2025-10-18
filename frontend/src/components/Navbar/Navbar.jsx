import React, { useState } from 'react';
import './Navbar.css';
import { LimitModal } from '../LimitModal/LimitModal';

export const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [limit, setLimit] = useState(0);

  const currentPage = window.REACT_PAGE || 'login';
  const isLoggingIn = currentPage === 'login';

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
            <li
              className="limit-button"
              onClick={() => setIsModalOpen(true)}
            >
              Költési limit beállítása
            </li>
          )}
        </ul>

        <h1>SmartBudget</h1>

        <ul className={`right ${isLoggingIn ? 'hidden' : 'visible'}`}>
          <li className={currentPage === 'ai' ? 'active' : ''}>
            <a href="/ai">AI-alapú tanácsadás</a>
          </li>
        </ul>
      </div>

      <div className="bottom-row">
        <button
          className={`new-day-button ${
            currentPage === 'expenses' ? 'visible' : 'hidden'
          }`}
        >
          Új nap hozzáadása
        </button>

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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => {
          console.log('Limit mentve:', limit);
          setIsModalOpen(false);
        }}
        limit={limit}
        setLimit={setLimit}
      />
    </nav>
  );
};
