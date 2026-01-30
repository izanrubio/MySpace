import { NavLink } from 'react-router-dom';
import { FiGitBranch, FiCpu, FiFolderPlus, FiLogOut, FiCode, FiZap } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const { logout, user } = useAuth();
  const { isDark } = useTheme();

  const links = [
    { to: '/repositories', icon: FiGitBranch, label: 'Repositories' },
    { to: '/ai-resources', icon: FiCpu, label: 'AI Resources' },
    { to: '/projects', icon: FiFolderPlus, label: 'Projects' },
    { to: '/languages', icon: FiCode, label: 'Languages' },
  ];

  return (
    <aside className={`w-72 ${isDark ? 'bg-zinc-900/50' : 'bg-white border-r border-gray-200'} backdrop-blur-xl ${isDark ? 'border-r border-zinc-800' : ''} flex flex-col ${isDark ? 'shadow-2xl' : 'shadow-sm'}`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <FiZap className="text-white" size={20} />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>MySpace</h1>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Workspace Manager</p>
          </div>
        </div>


      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                ? isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-500 shadow-md shadow-blue-500/20'
                : isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 rounded-lg ${isActive ? (isDark ? 'bg-blue-500/20' : 'bg-white/20') : (isDark ? 'bg-blue-500/10' : 'bg-blue-50')} transition-all`}>
                  <link.icon className={`${isActive ? (isDark ? 'text-blue-400' : 'text-white') : (isDark ? 'text-blue-400' : 'text-blue-600')} transition-colors`} size={18} />
                </div>
                <span className={`font-medium ${isActive ? (isDark ? 'text-white' : 'text-white') : (isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-700 group-hover:text-gray-900')} transition-colors`}>
                  {link.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'text-gray-400 hover:text-white hover:bg-red-500/10' : 'text-gray-700 hover:text-red-600 hover:bg-red-50'} transition-all w-full group`}
        >
          <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/10 group-hover:bg-red-500/20' : 'bg-red-50 group-hover:bg-red-100'} transition-all`}>
            <FiLogOut className={isDark ? 'text-red-400' : 'text-red-600'} size={18} />
          </div>
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
