import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout({ role }) {
  const sidebarOpen = useSelector(
    (s) => s.ui.sidebarOpen
  );

  return (
    <div
      className="
        flex
        h-screen
        overflow-hidden
        bg-slate-50
        dark:bg-[#0c0e12]
      "
    >
      <Sidebar role={role} />

      <div
        className={`
          flex-1
          flex flex-col
          min-w-0
          transition-all
          duration-300
          ${
            sidebarOpen
              ? 'md:ml-[260px]'
              : 'md:ml-[76px]'
          }
        `}
      >
        <Navbar />

        <main
          className="
            flex-1
            overflow-y-auto
            px-4
            py-5
            md:px-7
            md:py-7
            lg:px-8
          "
        >
          <div
            className="
              max-w-[1440px]
              mx-auto
              animate-fade-in
            "
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}