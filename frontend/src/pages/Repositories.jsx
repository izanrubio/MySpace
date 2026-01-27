import { useState, useEffect } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiExternalLink, FiFileText, FiZap, FiCode, FiGitBranch, FiLock, FiGlobe
} from 'react-icons/fi';
import { repositories } from '../services/api';
import Modal from '../components/Modal';

export default function Repositories() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showCloneInfoModal, setShowCloneInfoModal] = useState(false);
  const [cloneInfo, setCloneInfo] = useState(null);
  const [editingRepo, setEditingRepo] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    deployUrl: '',
    description: '',
    technology: '',
    tags: '',
    status: 'activo',
  });
  const [githubFormData, setGithubFormData] = useState({
    name: '',
    description: '',
    isPrivate: true,
    autoInit: true,
  });

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    try {
      const response = await repositories.getAll();
      setRepos(response.data);
    } catch (error) {
      console.error('Error loading repos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (editingRepo) {
        await repositories.update(editingRepo.id, data);
      } else {
        await repositories.create(data);
      }

      loadRepos();
      closeModal();
    } catch (error) {
      console.error('Error saving repo:', error);
    }
  };

  const handleGitHubSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await repositories.createGitHub(githubFormData);

      // Show clone info modal
      setCloneInfo(response.data);
      setShowGitHubModal(false);
      setShowCloneInfoModal(true);

      // Reset form
      setGithubFormData({
        name: '',
        description: '',
        isPrivate: true,
        autoInit: true,
      });

      // Reload repositories
      loadRepos();
    } catch (error) {
      console.error('Error creating GitHub repo:', error);
      const errorMessage = error.response?.data?.error || 'Error creating GitHub repository';

      // Check if it's an authentication error
      if (error.response?.status === 400 || error.response?.status === 401) {
        if (confirm(`${errorMessage}\n\n¿Quieres reconectar tu cuenta de GitHub para obtener los permisos necesarios?`)) {
          // Redirect to GitHub OAuth
          window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/github`;
        }
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Seguro que quieres eliminar este repositorio?')) {
      try {
        await repositories.delete(id);
        loadRepos();
      } catch (error) {
        console.error('Error deleting repo:', error);
      }
    }
  };

  const openModal = (repo = null) => {
    if (repo) {
      setEditingRepo(repo);
      setFormData({
        name: repo.name,
        url: repo.url,
        deployUrl: repo.deployUrl || '',
        description: repo.description || '',
        technology: repo.technology || '',
        tags: repo.tags.join(', '),
        status: repo.status,
      });
    } else {
      setEditingRepo(null);
      setFormData({
        name: '',
        url: '',
        deployUrl: '',
        description: '',
        technology: '',
        tags: '',
        status: 'activo',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRepo(null);
  };

  const filteredRepos = repos.filter(repo => {
    if (filterStatus === 'all') return true;
    return repo.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const getIcon = (status) => {
    if (status === 'programando') return <FiCode className="text-lg" />;
    if (status === 'archivado') return <FiFileText className="text-lg" />;
    return <FiZap className="text-lg" />;
  };

  const showCloneInfo = (repo) => {
    // Generate clone URLs from repository URL
    const generateCloneUrls = (url) => {
      // Check if it's a GitHub URL
      if (url.includes('github.com')) {
        // Extract owner and repo name from URL
        const match = url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
        if (match) {
          const [, owner, repoName] = match;
          return {
            https: `https://github.com/${owner}/${repoName}.git`,
            ssh: `git@github.com:${owner}/${repoName}.git`,
          };
        }
      }
      // For non-GitHub repos, try to generate generic URLs
      return {
        https: url.endsWith('.git') ? url : `${url}.git`,
        ssh: url.replace('https://', 'git@').replace('/', ':') + (url.endsWith('.git') ? '' : '.git'),
      };
    };

    const cloneUrls = generateCloneUrls(repo.url);
    setCloneInfo({
      name: repo.name,
      description: repo.description,
      cloneUrls,
      githubUrl: repo.url,
    });
    setShowCloneInfoModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Repositories</h1>
          <p className="text-gray-400">Manage your private assets and environment.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowGitHubModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2.5 rounded-lg transition-all font-medium shadow-lg shadow-purple-500/30"
          >
            <FiPlus size={18} />
            Create GitHub Repo
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
          >
            <FiPlus size={18} />
            Add Repo
          </button>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[
            { label: 'ALL', value: 'all' },
            { label: 'ACTIVO', value: 'activo' },
            { label: 'PROGRAMANDO', value: 'programando' },
            { label: 'ARCHIVADO', value: 'archivado' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-4 py-2 text-xs font-bold tracking-wider transition-colors ${filterStatus === filter.value
                ? 'text-white border-b-2 border-white'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase">
          <span>SORT:</span>
          <button className="text-white font-medium">LAST UPDATED</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-black/40 border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 bg-black/20">
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Technology</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filteredRepos.map((repo) => (
              <tr key={repo.id} className="group hover:bg-gray-800/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${repo.status === 'programando'
                      ? 'bg-yellow-900/30 text-yellow-400'
                      : repo.status === 'activo'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-gray-700/50 text-gray-400'
                      }`}>
                      {getIcon(repo.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-[15px]">{repo.name}</h3>
                        {repo.isPrivate !== undefined && (
                          <span title={repo.isPrivate ? "Private Repository" : "Public Repository"}>
                            {repo.isPrivate ? (
                              <FiLock size={12} className="text-gray-500" />
                            ) : (
                              <FiGlobe size={12} className="text-gray-500" />
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {repo.description || `Updated 2h ago`}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <span>{repo.technology || 'NextJS'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${repo.status === 'activo' ? 'bg-green-500' :
                      repo.status === 'programando' ? 'bg-yellow-500' :
                        repo.status === 'archivado' ? 'bg-gray-500' :
                          'bg-gray-400'
                      }`}></div>
                    <span className={`text-xs font-medium uppercase tracking-wider ${repo.status === 'activo' ? 'text-green-400' :
                      repo.status === 'programando' ? 'text-yellow-400' :
                        repo.status === 'archivado' ? 'bg-gray-700 text-gray-400 px-2 py-0.5 rounded' :
                          'text-gray-400'
                      }`}>
                      {repo.status}
                    </span>
                    {repo.status === 'activo' && repo.deployUrl && (
                      <a
                        href={repo.deployUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-green-400 hover:text-green-300 transition-colors"
                        title="Ver sitio desplegado"
                      >
                        <FiExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {repo.deployUrl && (
                      <a
                        href={repo.deployUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Ver deploy"
                      >
                        <FiExternalLink size={16} />
                      </a>
                    )}
                    <button
                      onClick={() => showCloneInfo(repo)}
                      className="p-2 text-purple-400 hover:text-purple-300 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Clone info"
                    >
                      <FiGitBranch size={16} />
                    </button>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="Ver repositorio"
                    >
                      <FiCode size={16} />
                    </a>
                    <button
                      onClick={() => openModal(repo)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(repo.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRepos.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between text-sm text-gray-500 bg-black/20">
            <span>{filteredRepos.length} OF {repos.length} REPOSITORIES</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs uppercase font-bold text-gray-400 hover:text-white transition-colors">PREV</button>
              <button className="px-3 py-1.5 text-xs uppercase font-bold text-white transition-colors">NEXT</button>
            </div>
          </div>
        )}
      </div>

      {filteredRepos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No repositories found
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingRepo ? 'Edit Repository' : 'New Repository'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              required
            />
          </div>
          {formData.status === 'activo' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Deploy URL (opcional)</label>
              <input
                type="url"
                value={formData.deployUrl}
                onChange={(e) => setFormData({ ...formData, deployUrl: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                placeholder="https://mi-app.vercel.app"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Technology</label>
            <input
              type="text"
              value={formData.technology}
              onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              placeholder="NestJS, React, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              placeholder="frontend, backend, personal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="activo">Activo</option>
              <option value="programando">Programando</option>
              <option value="archivado">Archivado</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-2 rounded-lg transition-colors font-medium"
            >
              {editingRepo ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* GitHub Repository Modal */}
      <Modal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        title="Create GitHub Repository"
      >
        <form onSubmit={handleGitHubSubmit} className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 mb-4">
            <p className="text-blue-300 text-sm">
              ℹ️ Si es la primera vez que usas esta función, necesitarás reconectar tu cuenta de GitHub para obtener los permisos necesarios.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Repository Name *</label>
            <input
              type="text"
              value={githubFormData.name}
              onChange={(e) => setGithubFormData({ ...githubFormData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              placeholder="my-awesome-project"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={githubFormData.description}
              onChange={(e) => setGithubFormData({ ...githubFormData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              rows="3"
              placeholder="A brief description of your repository"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={githubFormData.isPrivate}
              onChange={(e) => setGithubFormData({ ...githubFormData, isPrivate: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="isPrivate" className="text-sm text-gray-300">
              Private repository (recommended)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoInit"
              checked={githubFormData.autoInit}
              onChange={(e) => setGithubFormData({ ...githubFormData, autoInit: e.target.checked })}
              className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="autoInit" className="text-sm text-gray-300">
              Initialize with README
            </label>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2 rounded-lg transition-all font-medium"
            >
              Create on GitHub
            </button>
            <button
              type="button"
              onClick={() => setShowGitHubModal(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Clone Info Modal */}
      <Modal
        isOpen={showCloneInfoModal}
        onClose={() => setShowCloneInfoModal(false)}
        title="🎉 Repository Created Successfully!"
      >
        {cloneInfo && (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <h3 className="text-green-400 font-semibold mb-2">✓ Repository created on GitHub</h3>
              <p className="text-gray-300 text-sm">
                Your repository <span className="font-mono text-white">{cloneInfo.name}</span> has been created successfully!
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Clone with HTTPS</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cloneInfo.cloneUrls.https}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(cloneInfo.cloneUrls.https);
                    alert('HTTPS URL copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Clone with SSH</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cloneInfo.cloneUrls.ssh}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(cloneInfo.cloneUrls.ssh);
                    alert('SSH URL copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-300 text-sm mb-2">Quick start commands:</p>
              <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                {`git clone ${cloneInfo.cloneUrls.https}
cd ${cloneInfo.name}
# Start coding! 🚀`}
              </pre>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={cloneInfo.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors font-medium text-center"
              >
                View on GitHub
              </a>
              <button
                onClick={() => setShowCloneInfoModal(false)}
                className="flex-1 bg-primary-600 hover:bg-primary-500 text-white py-2 rounded-lg transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
