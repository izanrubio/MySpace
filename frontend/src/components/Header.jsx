import { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { search } from '../services/api';

export default function Header() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults(null);
      setShowResults(false);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    try {
      const response = await search.global(searchQuery);
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const getTotalResults = () => {
    if (!searchResults) return 0;
    return (
      searchResults.repositories.length +
      searchResults.aiResources.length +
      searchResults.projects.length +
      searchResults.folders.length
    );
  };

  return (
    <header className={`${isDark ? 'bg-zinc-900/30' : 'bg-white/80'} backdrop-blur-xl border-b ${isDark ? 'border-zinc-800' : 'border-gray-200'} h-16 px-6 flex items-center justify-between gap-4 shadow-lg`}>
      {/* Search Bar */}
      <div className="relative w-96">
        <FiSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
        <input
          type="text"
          placeholder="Search repositories, AI tools, projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className={`w-full pl-12 pr-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500'} border rounded-xl focus:outline-none ${isDark ? 'focus:border-blue-500/50 focus:bg-white/10' : 'focus:border-blue-500 focus:bg-white'} transition-all`}
        />

        {showResults && searchResults && getTotalResults() > 0 && (
          <div className={`absolute top-full mt-2 w-full ${isDark ? 'bg-zinc-900/95' : 'bg-white'} backdrop-blur-xl border ${isDark ? 'border-white/10' : 'border-gray-200'} rounded-xl max-h-96 overflow-y-auto z-50 shadow-2xl`}>
            {searchResults.repositories.length > 0 && (
              <div className="p-3">
                <h3 className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'} px-3 mb-2 uppercase tracking-wider`}>
                  Repositories
                </h3>
                {searchResults.repositories.map((repo) => (
                  <div
                    key={repo.id}
                    className={`px-3 py-2.5 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} rounded-lg cursor-pointer transition-all`}
                  >
                    <div className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium text-sm`}>{repo.name}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>{repo.url}</div>
                  </div>
                ))}
              </div>
            )}

            {searchResults.aiResources.length > 0 && (
              <div className={`p-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <h3 className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'} px-3 mb-2 uppercase tracking-wider`}>
                  AI Resources
                </h3>
                {searchResults.aiResources.map((ai) => (
                  <div
                    key={ai.id}
                    className={`px-3 py-2.5 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} rounded-lg cursor-pointer transition-all`}
                  >
                    <div className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium text-sm`}>{ai.name}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                      {ai.type} - {ai.url}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchResults.projects.length > 0 && (
              <div className={`p-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <h3 className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'} px-3 mb-2 uppercase tracking-wider`}>
                  Projects
                </h3>
                {searchResults.projects.map((project) => (
                  <div
                    key={project.id}
                    className={`px-3 py-2.5 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} rounded-lg cursor-pointer transition-all`}
                  >
                    <div className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium text-sm`}>{project.name}</div>
                    {project.description && (
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                        {project.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-gray-100 hover:bg-gray-200 border-gray-200'} border transition-all`}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <FiSun className="text-yellow-400" size={18} />
          ) : (
            <FiMoon className="text-blue-600" size={18} />
          )}
        </button>

        {/* User Menu */}
        <div className={`flex items-center gap-3 px-4 py-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'} rounded-xl border ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'} transition-all cursor-pointer group`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <FiUser className="text-white" size={16} />
          </div>
          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>{user?.name || user?.email}</span>
        </div>
      </div>
    </header>
  );
}
