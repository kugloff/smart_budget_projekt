import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import { LimitModal } from '../LimitModal/LimitModal'; // importáljuk a modal-t

export const Navbar = () => {
  const location = useLocation();
  let currentPage = '';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [limit, setLimit] = useState(0);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const saveLimit = () => {
    console.log('Limit mentve:', limit);
    closeModal();
  };

  switch(location.pathname) {
    case '/': currentPage = 'Kiadások'; break;
    case '/login': currentPage = 'Bejelentkezés'; break;
    case '/analysis': currentPage = 'Elemzés'; break;
    case '/ai': currentPage = 'AI-alapú tanácsadás'; break;
    default: currentPage = '';
  }

  return (
    <nav className='container'>
      <div className='top-row'>
        <ul className='left'>
          <li className={location.pathname === '/' ? 'active' : ''}><Link to="/">Kiadások</Link></li>
          <li className={location.pathname === '/analysis' ? 'active' : ''}><Link to="/analysis">Elemzés</Link></li>
          {location.pathname === '/' && (
            <li className='limit-button' onClick={openModal}>
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
        {location.pathname === '/' ? (
          <button className="new-day-button">Új kiadás hozzáadása</button>
        ):(<div style={{ width: '150px' }}></div>)}
        {currentPage && <span className='status'>{currentPage}</span>}
      </div>

      <LimitModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={saveLimit}
        limit={limit}
        setLimit={setLimit}
      />
    </nav>
  );
};