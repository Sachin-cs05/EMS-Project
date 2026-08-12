// ── DashboardLayout.jsx ───────────────────────────────────────────────────────
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Navbar  from './Navbar';

export default function DashboardLayout({ role }) {
  const sidebarOpen = useSelector((s) => s.ui.sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f0f13] overflow-hidden">
      <Sidebar role={role} />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
