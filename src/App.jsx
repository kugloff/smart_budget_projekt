import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import { LoginPage } from './pages/LoginPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { AIAssistantPage } from './pages/AIAssistantPage';

const App = () => {
  return (
    <Router>
      <Navbar/>
      <main>
        <Routes>
          <Route path="/" element={<ExpensesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/ai" element={<AIAssistantPage />} />
        </Routes>
      </main>
      <Footer/>
    </Router>
  );
};

export default App;