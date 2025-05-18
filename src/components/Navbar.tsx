import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-md text-text-secondary hover:text-primary hover:bg-primary-light/10 md:hidden"
              onClick={onMenuClick}
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center ml-2 md:ml-0">
              <span className="text-primary font-bold text-xl">EVV</span>
              <span className="text-text-primary font-semibold text-xl ml-1">Caregiver</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell size={20} className="text-text-secondary" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="hidden md:block">
                <p className="text-sm font-medium text-text-primary">{user?.username || 'User'}</p>
                <p className="text-xs text-text-secondary truncate">{user?.email || 'user@example.com'}</p>
              </div>
              
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              <button 
                className="p-2 rounded-md text-text-secondary hover:text-error hover:bg-error/10"
                onClick={logout}
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;