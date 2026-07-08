import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdChevronLeft, MdChevronRight, MdLogout } from 'react-icons/md';
import useAuth from '@hooks/useAuth';
import Tooltip from '@components/ui/Tooltip';

const STORAGE_KEY = 'fixra-sidebar-collapsed';

const Sidebar = ({ navItems = [], role = '' }) => {
  const { user } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    } catch {
      // localStorage unavailable
    }
  }, [isCollapsed]);

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  // Derive initials from user name
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-charcoal-200/70 bg-white"
    >
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center overflow-hidden border-b border-charcoal-200/70 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500 shadow-[0_4px_12px_rgba(232,93,58,0.25)]">
          <span className="font-heading text-xs font-bold text-white">F</span>
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="ml-3 whitespace-nowrap font-heading text-sm font-bold tracking-wide text-charcoal-950"
            >
              Fixra
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Floating collapse toggle — positioned relative to the entire sidebar, vertically centered with the role badge */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="absolute -right-3.5 top-[87px] z-50 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-charcoal-200 bg-white text-charcoal-500 shadow-[0_2px_8px_rgba(26,26,31,0.12)] transition-all duration-200 hover:bg-charcoal-50 hover:text-charcoal-800 hover:shadow-[0_4px_12px_rgba(26,26,31,0.18)]"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <MdChevronRight className="h-4 w-4" />
        ) : (
          <MdChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Role badge */}
      <div className="shrink-0 overflow-hidden px-4 pb-2 pt-4">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="truncate font-heading text-[10px] font-semibold uppercase tracking-[0.3em] text-primary-500"
            >
              {role}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const linkContent = (
              <NavLink
                to={item.path}
                end={item.path === `/${role.toLowerCase()}`}
                className={({ isActive }) =>
                  `group flex items-center rounded-xl px-3 py-2.5 transition-all duration-200 w-full ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 shadow-[0_2px_8px_rgba(232,93,58,0.10)]'
                      : 'text-charcoal-500 hover:bg-charcoal-50 hover:text-charcoal-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                        isActive
                          ? 'text-primary-500'
                          : 'text-charcoal-400 group-hover:text-charcoal-700'
                      }`}
                    />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -4 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className={`ml-3 whitespace-nowrap font-heading text-sm font-medium ${
                            isActive ? 'font-semibold' : ''
                          }`}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>
            );

            return (
              <li key={item.path}>
                {isCollapsed ? (
                  <Tooltip label={item.label} side="right" className="w-full flex">
                    {linkContent}
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile */}
      <div className="shrink-0 border-t border-charcoal-200/70 p-2">
        {isCollapsed ? (
          <Tooltip label={user?.name || 'Profile'} side="right" className="w-full flex justify-center">
            <div className="flex h-10 w-full items-center justify-center rounded-xl transition-colors duration-200 hover:bg-charcoal-50 cursor-pointer">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-[0_2px_8px_rgba(232,93,58,0.20)]">
                <span className="font-heading text-xs font-bold text-white">
                  {initials}
                </span>
              </div>
            </div>
          </Tooltip>
        ) : (
          <div className="flex items-center overflow-hidden rounded-xl px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-[0_2px_8px_rgba(232,93,58,0.20)]">
              <span className="font-heading text-xs font-bold text-white">
                {initials}
              </span>
            </div>
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="ml-3 min-w-0 flex-1"
            >
              <p className="truncate font-heading text-sm font-semibold text-charcoal-900">
                {user?.name}
              </p>
              <p className="truncate text-xs text-charcoal-400">
                {user?.email}
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
