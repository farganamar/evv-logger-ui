import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useState } from 'react';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex relative">
        {/* Sidebar with proper positioning and height */}
        <aside className={`fixed top-[64px] left-0 h-[calc(100vh-64px)] z-20 
          transition-transform duration-300 ease-in-out bg-white
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </aside>
        
        {/* Main content area with proper margin and width */}
        <main className={`flex-1 min-h-[calc(100vh-64px)] w-full transition-all duration-300 
          p-4 md:p-6 lg:p-8
          ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}
        `}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;