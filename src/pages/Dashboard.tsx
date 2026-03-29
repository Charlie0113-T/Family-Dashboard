// Dashboard - Main view showing all registered module cards in a grid
import { useNavigate } from 'react-router-dom';
import { ModuleRegistry } from '../module-system/ModuleRegistry';
import ModuleCard from '../components/ModuleCard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const modules = ModuleRegistry.getAll();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Family Dashboard</h1>
        <p className="muted">Your private family hub</p>
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
