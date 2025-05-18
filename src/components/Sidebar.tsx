import { XCircle, LayoutDashboard, Calendar, ClipboardList, Settings, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const navItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/dashboard',
    },
    {
      name: 'Appointments',
      icon: <Calendar size={20} />,
      path: '/dashboard', // Currently shows on dashboard
    },
    {
      name: 'Clients',
      icon: <Users size={20} />,
      path: '/clients',
    },
    {
      name: 'Tasks',
      icon: <ClipboardList size={20} />,
      path: '/tasks',
    },
    {
      name: 'Settings',
      icon: <Settings size={20} />,
      path: '/settings',
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-border z-30
        w-64 transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-auto md:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border md:hidden">
          <div className="flex items-center">
            <span className="text-primary font-bold text-xl">EVV</span>
            <span className="text-text-primary font-semibold text-xl ml-1">Caregiver</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-text-secondary hover:text-error hover:bg-error/10"
          >
            <XCircle size={24} />
          </button>
        </div>
        
        <nav className="px-2 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center px-3 py-2 rounded-md text-sm font-medium
                    ${isActive 
                      ? 'bg-primary-light/10 text-primary' 
                      : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                    }
                  `}
                  onClick={onClose}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;