import React, { useState } from 'react';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import LoginPage from './pages/LoginPage';
import ExpensesPage from './pages/ExpensesPage';
import AnalysisPage from './pages/AnalysisPage';
import AIAssistantPage from './pages/AIAssistantPage';
import { AddDayModal } from './components/AddDayModal/AddDayModal';

const App = () => {
  const [days, setDays] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const addDay = (newDay) => {
    setDays(prev => [...prev, newDay]);
  };

  const removeDay = (index) => {
    setDays(prev => prev.filter((_, i) => i !== index));
  };

  let PageComponent;

  // Flask által beállított page prop alapján választunk
  switch(window.REACT_PAGE){
    case 'expenses':
      PageComponent = () => <ExpensesPage days={days} removeDay={removeDay} />;
      break;
    case 'analysis':
      PageComponent = AnalysisPage;
      break;
    case 'ai':
      PageComponent = AIAssistantPage;
      break;
    default:
      PageComponent = LoginPage;
  }

  return (
    <>
      <Navbar onOpenAddDayModal={() => setIsAddModalOpen(true)} />
      <main>
        <PageComponent />
      </main>
      <Footer />
      <AddDayModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addDay}
      />
    </>
  );
};

export default App;