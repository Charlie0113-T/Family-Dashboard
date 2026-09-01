// App - Root application with routing setup
// Imports all modules to trigger their self-registration with ModuleRegistry

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';
import LockScreen from './components/LockScreen';
import { useAppStore } from './store/useAppStore';
import { AuthService } from './core/auth/AuthService';
import { useEffect } from 'react';

// Import modules so they self-register
import './modules/todo/TodoModule';
import './modules/diary/DiaryModule';
import './modules/mood/MoodModule';
import './modules/health/HealthModule';
import './modules/accounting/AccountingModule';

const App: React.FC = () => {
  const { isUnlocked, isSetup, setIsSetup, setUnlocked } = useAppStore();

  useEffect(() => {
    setIsSetup(AuthService.isSetup());
    // Trusted devices skip the lock screen until the trust expires
    AuthService.tryRestoreSession().then((restored) => {
      if (restored) setUnlocked(true);
    });
  }, [setIsSetup, setUnlocked]);

  // Show lock screen if not unlocked
  if (!isUnlocked) {
    return <LockScreen isSetup={isSetup} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/module/:moduleId" element={<ModulePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
