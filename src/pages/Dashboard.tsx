// Dashboard - Main view showing all registered module cards in a grid
import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { ModuleRegistry } from '../module-system/ModuleRegistry';
import ModuleCard from '../components/ModuleCard';
import { AuthService } from '../core/auth/AuthService';
import { useAppStore } from '../store/useAppStore';
import { prefersReducedMotion } from '../utils/helpers';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { setUnlocked } = useAppStore();
  const modules = ModuleRegistry.getAll();

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    animate('.module-card', {
      opacity: [0, 1],
      y: [14, 0],
      delay: stagger(55),
      duration: 420,
      ease: 'outCubic',
    });
  }, []);

  const handleLock = () => {
    AuthService.lock();
    setUnlocked(false);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Family Dashboard</h1>
          <p className="muted">Your private family hub</p>
        </div>
        <button
          className="btn-back"
          onClick={handleLock}
          title="Lock now and require the password again on this device"
        >
          ⚿ Lock
        </button>
      </div>
      <div className="module-grid">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            onClick={() => navigate('/module/' + mod.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
