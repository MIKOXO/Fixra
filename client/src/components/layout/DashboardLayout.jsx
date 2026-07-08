import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const STORAGE_KEY = 'fixra-sidebar-collapsed';

const DashboardLayout = ({ navItems, role }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Listen for storage changes to keep sidebar width in sync
  useEffect(() => {
    const handleStorage = () => {
      try {
        setIsCollapsed(localStorage.getItem(STORAGE_KEY) === 'true');
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleStorage);
    // Also poll on an interval in case same-tab writes don't fire 'storage'
    const interval = setInterval(handleStorage, 300);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-surface-warm">
      <Sidebar navItems={navItems} role={role} />

      {/* Main content area — offset by sidebar width */}
      <main
        className="flex-1 overflow-y-auto transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ marginLeft: isCollapsed ? 64 : 240 }}
      >
        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
