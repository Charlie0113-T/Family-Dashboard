// ModulePage - Renders a single module by its ID from the URL
import { useParams, useNavigate } from 'react-router-dom';
import { ModuleRegistry } from '../module-system/ModuleRegistry';

const ModulePage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const moduleDef = moduleId ? ModuleRegistry.get(moduleId) : undefined;

  if (!moduleDef) {
    return (
      <div className="module-container">
        <p className="muted">Module not found.</p>
        <button className="btn" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { Component } = moduleDef;

  return (
    <div className="module-page">
      <div className="module-page-header">
        <button className="btn-back" onClick={() => navigate('/')} aria-label="Back">
          ← Back
        </button>
        <div className="module-page-title">
          <span className="module-page-icon">{moduleDef.icon}</span>
          <h1>{moduleDef.name}</h1>
        </div>
        {moduleDef.encrypted && (
          <span className="encrypted-badge">⚿ Encrypted</span>
        )}
      </div>
      <Component />
    </div>
  );
};

export default ModulePage;
