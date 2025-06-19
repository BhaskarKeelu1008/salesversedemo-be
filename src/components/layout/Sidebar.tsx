import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { MenuItem } from '../../types';
import { cn } from '../../utils/cn';
import Logo from '../ui/Logo';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

type IconKey = keyof typeof Icons;

const navigationItems: MenuItem[] = [
  {
    id: 'access-control',
    title: 'Access Control',
    path: '/access-control',
    icon: 'Lock',
  },
  {
    id: 'admin-activity-logs',
    title: 'Admin Activity Logs',
    path: '/admin-activity-logs',
    icon: 'ClipboardList',
  },
  {
    id: 'module-configuration',
    title: 'Module Configuration',
    path: '/modules/table',
    icon: 'Package',
    role: 'superadmin',
  },
  {
    id: 'masters',
    title: 'Masters',
    path: '/masters',
    icon: 'Database',
    subItems: [
      {
        id: 'channel-master',
        title: 'Channel Master',
        path: '/masters/channel',
        icon: 'Layers',
      },
      {
        id: 'hierarchy-master',
        title: 'Hierarchy Master',
        path: '/masters/hierarchy',
        icon: 'GitBranchPlus',
      },
      {
        id: 'role-master',
        title: 'Role Master',
        path: '/masters/role',
        icon: 'UserCog',
      },
      {
        id: 'designation-master',
        title: 'Designation Master',
        path: '/masters/designation',
        icon: 'BadgeCheck',
      },
      {
        id: 'product-category-master',
        title: 'Product Category Master',
        path: '/masters/product-category',
        icon: 'ShoppingBag',
      },
      {
        id: 'resource-category-master',
        title: 'Resource Category Master',
        path: '/masters/resource-category',
        icon: 'FolderKanban',
      },
    ],
  },
  {
    id: 'user-management',
    title: 'User Management',
    path: '/user-management',
    icon: 'Users',
    subItems: [
      {
        id: 'sv-agent',
        title: 'SV Agent',
        path: '/user-management/sv-agent',
        icon: 'UserCircle',
      },
      {
        id: 'admin-user-management',
        title: 'Admin Users',
        path: '/admin-user-management',
        icon: 'Shield',
        role: 'superadmin',
      },
    ],
  },
  {
    id: 'qc-discrepancy',
    title: 'QC & Discrepancy',
    path: '/qc-discrepancy',
    icon: 'FileCheck2',
  },
  {
    id: 'presales-tools',
    title: 'Presales Tools',
    path: '/presales-tools',
    icon: 'Wrench',
    subItems: [
      {
        id: 'create-product',
        title: 'Create Product',
        path: '/presales-tools/create-product',
        icon: 'Plus',
      },
      {
        id: 'resource-center',
        title: 'Resource Center',
        path: '/presales-tools/resource-center',
        icon: 'Database',
      },
      {
        id: 'presentation',
        title: 'Presentation',
        path: '/presales-tools/presentation',
        icon: 'Presentation',
      },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { user } = useAuth();
  const { getColorClasses } = useTheme();

  // Auto-expand the submenu if the current path matches one of its items
  useEffect(() => {
    const currentPath = location.pathname;

    navigationItems.forEach(item => {
      if (item.subItems) {
        const matchingSubItem = item.subItems.find(
          subItem =>
            currentPath === subItem.path ||
            currentPath.startsWith(subItem.path + '/')
        );

        if (matchingSubItem && !expandedItems.includes(item.id)) {
          setExpandedItems(prev => [...prev, item.id]);
        }
      }
    });
  }, [location.pathname, expandedItems]);

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden'
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed md:sticky top-0 left-0 h-full z-30 flex flex-col bg-white shadow-md transition-all duration-300 ease-in-out transform',
          isOpen ? 'w-64' : 'w-20',
          'md:flex'
        )}
        initial={false}
        animate={{ width: isOpen ? 256 : 80 }}
      >
        {/* Logo */}
        <div
          className={`flex justify-between items-center h-16 px-4 bg-${getColorClasses('primary')} shadow`}
        >
          <div className={cn(isOpen ? 'flex' : 'hidden')}>
            <div className='flex items-center'>
              <Logo size='sm' variant='light' />
            </div>
          </div>
          <div
            className={cn(!isOpen ? 'flex w-full justify-center' : 'hidden')}
          >
            <Logo size='sm' variant='light' withText={false} />
          </div>

          {/* Toggle sidebar button */}
          <button
            className='hidden md:flex items-center justify-center text-white hover:bg-opacity-20 hover:bg-white p-1 rounded transition-colors'
            onClick={toggleSidebar}
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? (
              <ChevronLeft className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </button>
        </div>

        {/* Menu Label */}
        {isOpen && (
          <div className='px-3 py-2'>
            <p className='text-xs font-semibold text-gray-900'>Main Menu</p>
          </div>
        )}

        {/* Navigation */}
        <nav className='flex-1 overflow-y-auto py-1 px-2'>
          <ul className='space-y-0.5'>
            {/* Create Project module - only visible to superadmin */}
            {user?.role === 'superadmin' && (
              <li>
                <Link
                  to='/create-project'
                  className={cn(
                    'flex items-center gap-x-3 px-3 py-2 rounded-md group transition-colors',
                    isActive('/create-project')
                      ? `bg-${getColorClasses('primary')} text-white font-medium`
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center',
                      isActive('/create-project')
                        ? `bg-${getColorClasses('secondary')}`
                        : 'bg-gray-100'
                    )}
                  >
                    <Icons.FolderPlus
                      className={cn(
                        'h-4 w-4',
                        isActive('/create-project')
                          ? 'text-white'
                          : `text-${getColorClasses('primary')}`
                      )}
                    />
                  </div>
                  {isOpen && (
                    <span className='font-medium text-sm'>Create Project</span>
                  )}
                </Link>
              </li>
            )}

            {navigationItems.map(item => {
              // Check role restriction
              if (item.role && user?.role !== item.role) {
                return null;
              }

              const isItemActive = !item.subItems && isActive(item.path);
              const isExpanded = expandedItems.includes(item.id);
              const LucideIcon = Icons[
                item.icon as IconKey
              ] as React.ComponentType<{ className?: string }>;

              return (
                <li key={item.id}>
                  {item.subItems ? (
                    <div>
                      {/* Only render parent button when sidebar is open */}
                      {isOpen && (
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className={cn(
                            'w-full flex items-center gap-x-3 px-3 py-2 rounded-md group transition-colors',
                            isItemActive
                              ? `bg-${getColorClasses('primary')} text-white font-medium`
                              : 'text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          <div
                            className={cn(
                              'flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center',
                              isItemActive
                                ? `bg-${getColorClasses('secondary')}`
                                : 'bg-gray-100'
                            )}
                          >
                            <LucideIcon
                              className={cn(
                                'h-4 w-4',
                                isItemActive ? 'text-white' : 'text-gray-500'
                              )}
                            />
                          </div>
                          <span className='flex-1 text-left font-medium text-sm'>
                            {item.title}
                          </span>
                          <ChevronRight
                            className={cn(
                              'h-4 w-4 transition-transform',
                              isExpanded ? 'transform rotate-90' : '',
                              isItemActive ? 'text-white' : 'text-gray-500'
                            )}
                          />
                        </button>
                      )}

                      {/* Show subitems either when sidebar is open and expanded, or when sidebar is closed */}
                      {((isExpanded && isOpen) || !isOpen) && (
                        <motion.ul
                          initial={{ height: 'auto', opacity: 1 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            'space-y-0.5',
                            isOpen ? 'mt-0.5 pl-3' : 'mt-0'
                          )}
                        >
                          {item.subItems.map(subItem => {
                            // Check role restriction for subitems
                            if (subItem.role && user?.role !== subItem.role) {
                              return null;
                            }

                            const SubIcon = Icons[
                              subItem.icon as IconKey
                            ] as React.ComponentType<{ className?: string }>;
                            const isSubItemActive = isActive(subItem.path);

                            return (
                              <li key={subItem.id}>
                                <Link
                                  to={subItem.path}
                                  className={cn(
                                    'flex items-center gap-x-3 px-3 py-1.5 rounded-md group transition-colors',
                                    isSubItemActive
                                      ? `bg-${getColorClasses('primary')} text-white font-medium`
                                      : 'text-gray-700 hover:bg-gray-50'
                                  )}
                                  title={subItem.title}
                                >
                                  <div
                                    className={cn(
                                      'flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center',
                                      isSubItemActive
                                        ? `bg-${getColorClasses('secondary')}`
                                        : 'bg-gray-100'
                                    )}
                                  >
                                    <SubIcon
                                      className={cn(
                                        'h-3.5 w-3.5',
                                        isSubItemActive
                                          ? 'text-white'
                                          : 'text-gray-500'
                                      )}
                                    />
                                  </div>
                                  {isOpen && (
                                    <span className='font-medium text-xs'>
                                      {subItem.title}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center gap-x-3 px-3 py-2 rounded-md group transition-colors',
                        isItemActive
                          ? `bg-${getColorClasses('primary')} text-white font-medium`
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                      title={item.title}
                    >
                      <div
                        className={cn(
                          'flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center',
                          isItemActive
                            ? `bg-${getColorClasses('secondary')}`
                            : 'bg-gray-100'
                        )}
                      >
                        <LucideIcon
                          className={cn(
                            'h-4 w-4',
                            isItemActive ? 'text-white' : 'text-gray-500'
                          )}
                        />
                      </div>
                      {isOpen && (
                        <span className='font-medium text-sm'>
                          {item.title}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className='mt-auto p-4 border-t border-gray-100'>
          <div className='flex items-center'>
            <img
              src='https://randomuser.me/api/portraits/men/32.jpg'
              alt='User'
              className='h-10 w-10 rounded-full border-2 border-white shadow-sm'
            />
            {isOpen && (
              <div className='ml-3'>
                <p className='text-sm font-medium text-gray-800'>
                  {user?.fullName || 'Latiful Fajar'}
                </p>
                <p className='text-xs text-gray-500'>
                  {user?.email || 'latiful@example.com'}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
