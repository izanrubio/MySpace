import { FiUser, FiGithub } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  return (
    <header className={`${isDark ? 'bg-zinc-900/30' : 'bg-white/80'} backdrop-blur-xl border-b ${isDark ? 'border-zinc-800' : 'border-gray-200'} h-16 px-6 flex items-center justify-end gap-4 shadow-lg`}>
      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <div className={`flex items-center gap-3 px-4 py-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'} rounded-xl border ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'} transition-all cursor-pointer group`}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <FiUser className="text-white" size={16} />
            </div>
          )}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>{user?.name || user?.email}</span>
              {user?.githubUsername && (
                <div className="relative group/github">
                  <FiGithub className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} transition-colors`} size={14} />
                  <span className="absolute top-full mt-2 right-0 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover/github:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {user.githubUsername}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}