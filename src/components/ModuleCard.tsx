// ModuleCard - Displays a single module as a clickable card on the dashboard
import type { ModuleDefinition } from '../module-system/ModuleTypes';

interface ModuleCardProps {
  module: ModuleDefinition;
  onClick: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  return (
    <button className="card module-card" onClick={onClick} aria-label={'Open ' + module.name}>
      <div className="module-card-icon">{module.icon}</div>
      <div className="module-card-info">
        <h3 className="module-card-name">{module.name}</h3>
        <p className="module-card-desc muted">{module.description}</p>
      </div>
      {module.encrypted && <span className="encrypted-dot" title="Encrypted">⚿</span>}
    </button>
  );
};

export default ModuleCard;
