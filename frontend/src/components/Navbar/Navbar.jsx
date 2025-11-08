import React, { useState } from 'react';
import './Navbar.css';
import { LimitModal } from '../Modals/LimitModal/LimitModal';
import { CategoryManagerModal } from '../Modals/CategoryManagerModal/CategoryManagerModal';

export const Navbar = ({ onOpenAddDayModal }) => {
  // 🟢 BACKEND:
  // - limit lekérése és mentése (LimitModal)
  // - kategória lista lekérése és mentése (CategoryManagerModal)
  // Ezeket majd a useEffect-ben és onSave-ben kell kezelni.

  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [limit, setLimit] = useState(-1); // alapérték (-1 → nincs limit)

  const currentPage = window.REACT_PAGE || 'login';
  const isLoggingIn = currentPage === 'login';

  // 🟢 BACKEND: amikor a komponens betölt (pl. useEffect-ben),
  // le kell kérni a bejelentkezett felhasználó aktuális havi limitjét és kategóriáit:
  //
  // useEffect(() => {
  //   axios.get('/api/limit').then(res => setLimit(res.data.limit));
  //   axios.get('/api/categories').then(res => setCategories(res.data));
  // }, []);
  //
  // A kategóriák állapotát viszont a CategoryManagerModal-on belül fogod kezelni.

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
              Költési limit beállítása {/* 🟢 backend: limit lekérése */}
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
              {/* 🟢 backend: kategória-adatok lekérése */}
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

      {/* LimitModal – backend POST mentés */}
      <LimitModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        onSave={() => {
          // 🟢 BACKEND: mentés a szerverre
          // axios.post('/api/limit', { limit })
          //   .then(() => console.log('Limit mentve:', limit))
          //   .catch(err => console.error('Hiba:', err));
          setIsLimitModalOpen(false);
        }}
        limit={limit}
        setLimit={setLimit}
      />

      {/* backend GET, POST, DELETE */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </nav>
  );
};