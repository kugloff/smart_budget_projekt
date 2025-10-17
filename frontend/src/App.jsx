import React from 'react';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import LoginPage from './pages/LoginPage';
import ExpensesPage from './pages/ExpensesPage';
import AnalysisPage from './pages/AnalysisPage';
import AIAssistantPage from './pages/AIAssistantPage';

const App = () => {
  let PageComponent;

  // Flask által beállított page prop alapján választunk
  switch(window.REACT_PAGE) {
    case 'expenses':
      PageComponent = ExpensesPage;
      break;
    case 'analysis':
      PageComponent = AnalysisPage;
      break;
    case 'ai':
      PageComponent = AIAssistantPage;
      break;
    case 'login':
    default:
      PageComponent = LoginPage;
  }

  return (
    <>
      <Navbar />
      <main>
        <PageComponent />
      </main>
      <Footer />
    </>
  );
};

export default App;
