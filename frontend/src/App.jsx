import React, { useState } from 'react';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import LoginPage from './pages/LoginPage';
import ExpensesPage from './pages/ExpensesPage';
import AnalysisPage from './pages/AnalysisPage';
import AIAssistantPage from './pages/AIAssistantPage';
import { AddDayModal } from './components/Modals/AddDayModal/AddDayModal';

const App = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  let PageComponent;

  // Flask által beállított page prop alapján választunk
  switch(window.REACT_PAGE){
    case 'expenses':
      PageComponent = ExpensesPage;
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
      />
    </>
  );
};

export default App;