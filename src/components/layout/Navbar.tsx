import { NavLink } from 'react-router-dom';
import { Home, BookOpen, CalendarDays, ShoppingCart, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from './Logo';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/recipes', label: 'Recipes', icon: BookOpen },
  { to: '/planner', label: 'Planner', icon: CalendarDays },
  { to: '/export', label: 'Grocery', icon: ShoppingCart },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden sm:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <NavLink to="/" className="flex items-center gap-2">
              <Logo size={30} />
              <span className="font-semibold text-gray-900 dark:text-white text-lg">
                Meal Planner
              </span>
            </NavLink>

            <div className="flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span className="hidden md:inline">{label}</span>
                </NavLink>
              ))}

              <button
                onClick={toggleTheme}
                className="ml-2 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile top bar (logo + theme toggle only) */}
      <nav className="sm:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
        <div className="flex items-center justify-between px-4 h-12">
          <NavLink to="/" className="flex items-center gap-2">
            <Logo size={26} />
            <span className="font-semibold text-gray-900 dark:text-white text-base">
              Meal Planner
            </span>
          </NavLink>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-bottom">
        <div className="flex items-center justify-around h-14 px-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors min-w-[56px] ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
