import { useState, useEffect } from 'react';
import { FiSearch, FiPlus } from 'react-icons/fi';
import { search } from '../services/api';

export default function Header() {
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
    <header className="bg-gray-800 border-b border-gray-700 h-16 px-6 flex items-center justify-between gap-4">
      {/* Search Bar */}
      <div className="relative w-96">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search repositories, tools, or projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors text-sm"
        />

        {showResults && searchResults && getTotalResults() > 0 && (
          <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
            {searchResults.repositories.length > 0 && (
              <div className="p-2">
                <h3 className="text-xs font-semibold text-gray-400 px-2 mb-1">
                  REPOSITORIES
                </h3>
                {searchResults.repositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <div className="text-white font-medium">{repo.name}</div>
                    <div className="text-sm text-gray-400">{repo.url}</div>
                  </div>
                ))}
              </div>
            )}

            {searchResults.aiResources.length > 0 && (
              <div className="p-2 border-t border-gray-700">
                <h3 className="text-xs font-semibold text-gray-400 px-2 mb-1">
                  AI RESOURCES
                </h3>
                {searchResults.aiResources.map((ai) => (
                  <div
                    key={ai.id}
                    className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <div className="text-white font-medium">{ai.name}</div>
                    <div className="text-sm text-gray-400">
                      {ai.type} - {ai.url}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchResults.projects.length > 0 && (
              <div className="p-2 border-t border-gray-700">
                <h3 className="text-xs font-semibold text-gray-400 px-2 mb-1">
                  PROJECTS
                </h3>
                {searchResults.projects.map((project) => (
                  <div
                    key={project.id}
                    className="px-3 py-2 hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <div className="text-white font-medium">{project.name}</div>
                    {project.description && (
                      <div className="text-sm text-gray-400">
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

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
          <FiPlus size={16} />
          <span>Add Repo</span>
        </button>
      </div>
    </header>
  );
}
