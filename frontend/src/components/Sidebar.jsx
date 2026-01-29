import { NavLink } from 'react-router-dom';
import { FiGitBranch, FiCpu, FiFolderPlus, FiLogOut, FiCode } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { logout, user } = useAuth();

  const links = [
    { to: '/repositories', icon: FiGitBranch, label: 'Repositories' },
    { to: '/ai-resources', icon: FiCpu, label: 'IAs' },
    { to: '/projects', icon: FiFolderPlus, label: 'Projects' },
    { to: '/languages', icon: FiCode, label: 'Lenguajes' },
  ];

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">MySpace</h1>
        <p className="text-gray-400 text-sm mt-1">{user?.name}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            <link.icon className="text-xl" />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors w-full"
        >
          <FiLogOut className="text-xl" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
