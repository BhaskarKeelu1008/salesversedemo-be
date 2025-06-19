import { motion } from 'framer-motion';
import {
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  Palette,
  Settings,
  User,
  X,
} from 'lucide-react';
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import ColorSchemeSelector from '../ui/ColorSchemeSelector';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { getColorClasses } = useTheme();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showSettingsPopover, setShowSettingsPopover] = React.useState(false);

  const handleLogout = () => {
    setShowUserMenu(false); // Close the menu before logout
    logout();
  };

  const getUserInitial = () => {
    if (!user) return '';
    if (user.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return '';
  };

  const getUserFullName = () => {
    if (!user) return '';
    if (user.fullName) return user.fullName;
    if (user.firstName && user.lastName)
      return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return user.email || '';
  };

  return (
    <header
      className={`sticky top-0 z-10 flex-shrink-0 flex h-16 bg-${getColorClasses('primary')} shadow`}
    >
      <div className='flex-1 flex justify-between px-4'>
        <div className='flex-1 flex items-center'>
          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 rounded-md text-white hover:text-gray-100 hover:bg-${getColorClasses('hover')} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white`}
            onClick={toggleSidebar}
            aria-label='Toggle sidebar'
          >
            <Menu className='h-6 w-6' />
          </button>

          {/* Search bar */}
          {/* <div className="hidden md:flex md:ml-4 items-center bg-purple-700 bg-opacity-50 rounded-md px-3 py-1.5 focus-within:ring-2 focus-within:ring-white focus-within:bg-purple-700 w-full max-w-xs">
            <Search className="h-5 w-5 text-white" />
            <input
              type="text"
              placeholder="Search..."
              className="ml-2 flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-purple-200"
            />
          </div> */}
        </div>

        <div className='ml-4 flex items-center gap-2'>
          {/* Notification button */}
          <Button
            variant='ghost'
            size='icon'
            className={`relative text-white hover:bg-${getColorClasses('hover')}`}
          >
            <Bell className='h-5 w-5' />
            <span className='absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full'></span>
          </Button>

          {/* Settings button with popover */}
          <div className='relative'>
            <Button
              variant='ghost'
              size='icon'
              className={`text-white hover:bg-${getColorClasses('hover')}`}
              onClick={() => setShowSettingsPopover(!showSettingsPopover)}
            >
              <Settings className='h-5 w-5' />
            </Button>

            {/* Settings Popover */}
            {showSettingsPopover && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className='absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50'
              >
                {/* Popover Header */}
                <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Settings
                  </h3>
                  <button
                    onClick={() => setShowSettingsPopover(false)}
                    className='p-1 rounded-full hover:bg-gray-100 transition-colors'
                  >
                    <X className='h-4 w-4 text-gray-500' />
                  </button>
                </div>

                {/* Popover Content */}
                <div className='p-4 space-y-6'>
                  {/* Theme Settings */}
                  <div>
                    <div className='flex items-center gap-2 mb-3'>
                      <Palette className='h-5 w-5 text-gray-600' />
                      <h4 className='text-sm font-medium text-gray-900'>
                        Theme
                      </h4>
                    </div>
                    <div className='space-y-3'>
                      <p className='text-xs text-gray-500'>
                        Choose your preferred color scheme
                      </p>
                      <ColorSchemeSelector />
                    </div>
                  </div>

                  {/* Other Settings Sections */}
                  <div className='border-t border-gray-200 pt-4'>
                    <div className='space-y-2'>
                      <button className='w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'>
                        <User className='h-4 w-4 text-gray-500' />
                        <span>Profile Settings</span>
                      </button>
                      <button className='w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'>
                        <Bell className='h-4 w-4 text-gray-500' />
                        <span>Notification Preferences</span>
                      </button>
                      <button className='w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors'>
                        <HelpCircle className='h-4 w-4 text-gray-500' />
                        <span>Help & Support</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Help button */}
          <Button
            variant='ghost'
            size='icon'
            className={`text-white hover:bg-${getColorClasses('hover')}`}
          >
            <HelpCircle className='h-5 w-5' />
          </Button>

          {/* User menu */}
          <div className='relative ml-2'>
            <div>
              <button
                className='flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white'
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className='sr-only'>Open user menu</span>
                <div
                  className={`h-8 w-8 rounded-full bg-white flex items-center justify-center text-${getColorClasses('primary')} font-medium`}
                >
                  {getUserInitial()}
                </div>
              </button>
            </div>

            {/* User dropdown menu */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1'
              >
                <div className='px-4 py-2 border-b border-gray-100'>
                  <p className='text-sm font-medium text-gray-900'>
                    {getUserFullName()}
                  </p>
                  <p className='text-xs text-gray-500 truncate'>
                    {user?.email}
                  </p>
                </div>
                <a
                  href='#'
                  className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                >
                  <User className='mr-3 h-4 w-4 text-gray-500' />
                  Profile
                </a>
                <button
                  onClick={handleLogout}
                  className='flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                >
                  <LogOut className='mr-3 h-4 w-4 text-gray-500' />
                  Sign out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop to close settings popover */}
      {showSettingsPopover && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setShowSettingsPopover(false)}
        />
      )}
    </header>
  );
};

export default Header;
