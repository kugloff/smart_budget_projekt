import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import { LimitModal } from '../LimitModal/LimitModal';

export const Navbar = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [limit, setLimit] = useState(0);

  const isLoggingIn =  location.pathname === '/smart_budget_projekt/';

  return (
    <nav className='container'>
      <div className='top-row'>
        <ul className={`left ${isLoggingIn ? 'hidden' : 'visible'}`}>
          <li className={location.pathname === '/expenses' ? 'active' : ''}><Link to="/expenses">Kiadások</Link></li>
          <li className={location.pathname === '/analysis' ? 'active' : ''}><Link to="/analysis">Elemzés</Link></li>
           {location.pathname === '/expenses' && (
            <li className='limit-button' onClick={() => setIsModalOpen(true)}>
              Költési limit beállítása
            </li>
          )}
        </ul>

        <h1>SmartBudget</h1>

        <ul className={`right ${isLoggingIn ? 'hidden' : 'visible'}`}>
          <li className={location.pathname === '/ai' ? 'active' : ''}><Link to="/ai">AI-alapú tanácsadás</Link></li>
        </ul>
      </div>

      <div className='bottom-row'>
        <button className={`new-day-button ${location.pathname === '/expenses' ? 'visible' : 'hidden'}`}>Új nap hozzáadása</button>
        <span className='status'>
          {location.pathname === '/smart_budget_projekt/' ? 'Bejelentkezés / Regisztráció' :
            location.pathname === '/expenses' ? 'Kiadások' :
            location.pathname === '/analysis' ? 'Elemzés' :
            location.pathname === '/ai' ? 'AI-alapú tanácsadás' : '' }
        </span>
      </div>

      <LimitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => { console.log('Limit mentve:', limit); setIsModalOpen(false); }}
        limit={limit}
        setLimit={setLimit}
      />
    </nav>
  );
};