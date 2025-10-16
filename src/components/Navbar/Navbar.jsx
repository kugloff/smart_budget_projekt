import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import { LimitModal } from '../LimitModal/LimitModal';

export const Navbar = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [limit, setLimit] = useState(0);

  const isHome = location.pathname === '/' || location.pathname === '';

  return (
    <nav className='container'>
      <div className='top-row'>
        <ul className='left'>
          <li className={isHome ? 'active' : ''}><Link to="/">Kiadások</Link></li>
          <li className={location.pathname === '/analysis' ? 'active' : ''}><Link to="/analysis">Elemzés</Link></li>
           {isHome && (
            <li className='limit-button' onClick={() => setIsModalOpen(true)}>
              Költési limit beállítása
            </li>
          )}
        </ul>

        <h1>SmartBudget</h1>

        <ul className='right'>
          <li className={location.pathname === '/ai' ? 'active' : ''}><Link to="/ai">AI-alapú tanácsadás</Link></li>
        </ul>
      </div>

      <div className='bottom-row'>
        <button className={`new-day-button ${isHome ? 'visible' : 'hidden'}`}>Új nap hozzáadása</button>
        <span className='status'>
          {isHome ? 'Kiadások' :
           location.pathname === '/analysis' ? 'Elemzés' :
           location.pathname === '/ai' ? 'AI-alapú tanácsadás' :
           location.pathname === '/login' ? 'Bejelentkezés' : ''}
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