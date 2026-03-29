// Layout - Root layout wrapper with consistent page structure
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="layout">
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="app-footer">
        <span className="muted">Family Dashboard · Private & Local</span>
      </footer>
    </div>
  );
};

export default Layout;
