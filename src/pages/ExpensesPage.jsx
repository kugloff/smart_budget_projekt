import React, { useState } from 'react';
import { LimitModal } from '../components/LimitModal/LimitModal';

export default function ExpensesPage(){
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [limit, setLimit] = useState(0);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const saveLimit = () => {
    console.log('Limit mentve:', limit);
    closeModal();
  };

  return (
    <div>
      <h2>Kiadások</h2>
      <button onClick={openModal}>Költési limit beállítása</button>

      <LimitModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSave={saveLimit} 
        limit={limit} 
        setLimit={setLimit} 
      />
    </div>
  );
};