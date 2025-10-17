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
    <div>expenses oldal</div>
  );
};