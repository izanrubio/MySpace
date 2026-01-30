import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink, FiGitBranch, FiLock, FiGlobe, FiCode, FiSearch, FiStar } from 'react-icons/fi';
import { repositories } from '../services/api';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import ConfirmModal from '../components/ConfirmModal';

export default function Repositories() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showCloneInfoModal, setShowCloneInfoModal] = useState(false);
  const [cloneInfo, setCloneInfo] = useState(null);
  const [editingRepo, setEditingRepo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirmar', cancelText: 'Cancelar' });
  const [deleteRepoId, setDeleteRepoId] = useState(null);
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
      setCloneInfo(response.data);
      setShowGitHubModal(false);
      setShowCloneInfoModal(true);
      setGithubFormData({
        name: '',
        description: '',
        isPrivate: true,
        autoInit: true,
      });
      loadRepos();
    } catch (error) {
      console.error('Error creating GitHub repo:', error);
      const errorMessage = error.response?.data?.error || 'Error creating GitHub repository';
      if (error.response?.status === 400 || error.response?.status === 401) {
        setConfirmModal({
          isOpen: true,
          title: 'Error de autenticación',
          message: `${errorMessage}\n\n¿Quieres reconectar tu cuenta de GitHub?`,
          confirmText: 'Reconectar',
          cancelText: 'Cancelar',
          onConfirm: () => {
            window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/github`;
          }
        });
      } else {
        setAlertModal({ isOpen: true, title: 'Error', message: errorMessage, type: 'error' });
      }
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar repositorio?',
      message: '¿Estás seguro que quieres eliminar este repositorio? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await repositories.delete(id);
          loadRepos();
        } catch (error) {
          console.error('Error deleting repo:', error);
        }
      }
    });
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

  const showCloneInfo = (repo) => {
    const generateCloneUrls = (url) => {
      if (url.includes('github.com')) {
        const match = url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
        if (match) {
          const [, owner, repoName] = match;
          return {
            https: `https://github.com/${owner}/${repoName}.git`,
            ssh: `git@github.com:${owner}/${repoName}.git`,
          };
        }
      }
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

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  const getLanguageColor = (tech) => {
    const colors = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#3178c6',
      'Python': '#3572A5',
      'React': '#61dafb',
      'Vue': '#42b883',
      'NextJS': '#000000',
      'NestJS': '#e0234e',
    };
    return colors[tech] || '#8b949e';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Repositories</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your code repositories and projects</p>
        </div>
        <button
          onClick={() => setShowGitHubModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
        >
          <FiPlus size={20} />
          New Repository
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500/50 focus:bg-slate-50 dark:focus:bg-white/10 transition-all"
        />
      </div>

      {/* Repositories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRepos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
            No repositories found
          </div>
        ) : (
          filteredRepos.map((repo) => (
            <div
              key={repo.id}
              className="group bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-purple-500 dark:hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                    <FiGitBranch className="text-white" size={18} />
                  </div>
                  {repo.isPrivate !== undefined && (
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {repo.isPrivate ? <FiLock size={12} /> : <FiGlobe size={12} />}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => showCloneInfo(repo)}
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                    title="Clone"
                  >
                    <FiGitBranch size={16} />
                  </button>
                  <button
                    onClick={() => openModal(repo)}
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                    title="Edit"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(repo.id)}
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-2"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {repo.name}
                </h3>
              </a>

              {repo.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{repo.description}</p>
              )}

              <div className="flex items-center gap-3 text-xs">
                {repo.technology && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getLanguageColor(repo.technology) }}
                    ></span>
                    <span className="text-slate-700 dark:text-slate-400">{repo.technology}</span>
                  </div>
                )}
                {repo.deployUrl && (
                  <a
                    href={repo.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                  >
                    <FiExternalLink size={12} />
                    <span>Live</span>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingRepo ? 'Edit Repository' : 'New Repository'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-500/50 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Deploy URL</label>
            <input
              type="url"
              value={formData.deployUrl}
              onChange={(e) => setFormData({ ...formData, deployUrl: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Technology</label>
            <input
              type="text"
              value={formData.technology}
              onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg transition-all"
            >
              {editingRepo ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showGitHubModal} onClose={() => setShowGitHubModal(false)} title="Create GitHub Repository">
        <form onSubmit={handleGitHubSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Repository Name</label>
            <input
              type="text"
              value={githubFormData.name}
              onChange={(e) => setGithubFormData({ ...githubFormData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={githubFormData.description}
              onChange={(e) => setGithubFormData({ ...githubFormData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              rows="3"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={githubFormData.isPrivate}
              onChange={(e) => setGithubFormData({ ...githubFormData, isPrivate: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="isPrivate" className="text-sm text-slate-700 dark:text-slate-300">Private repository</label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg transition-all"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowGitHubModal(false)}
              className="flex-1 px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showCloneInfoModal} onClose={() => setShowCloneInfoModal(false)} title="Clone Repository">
        {cloneInfo && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">HTTPS</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cloneInfo.cloneUrls.https}
                  readOnly
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(cloneInfo.cloneUrls.https)}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">SSH</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cloneInfo.cloneUrls.ssh}
                  readOnly
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(cloneInfo.cloneUrls.ssh)}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowCloneInfoModal(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg transition-all"
            >
              Done
            </button>
          </div>
        )}
      </Modal>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText || 'Eliminar'}
        cancelText={confirmModal.cancelText || 'Cancelar'}
      />
    </div>
  );
}
