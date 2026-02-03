import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiLink,
  FiGitBranch,
  FiCpu,
  FiExternalLink,
  FiSearch,
  FiUsers,
  FiFolder
} from 'react-icons/fi';
import { projects, repositories, aiResources } from '../services/api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projectList, setProjectList] = useState([]);
  const [repoList, setRepoList] = useState([]);
  const [aiList, setAiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingLink, setSubmittingLink] = useState(false);

  // States for Modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    notes: '',
  });

  const [linkForm, setLinkForm] = useState({
    title: '',
    url: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsRes, reposRes, aiRes] = await Promise.all([
        projects.getAll(),
        repositories.getAll(),
        aiResources.getAll(),
      ]);
      setProjectList(projectsRes.data);
      setRepoList(reposRes.data);
      setAiList(aiRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (editingProject) {
        await projects.update(editingProject.id, projectForm);
      } else {
        await projects.create(projectForm);
      }
      loadData();
      closeProjectModal();
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = (id) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar proyecto?',
      message: '¿Estás seguro que quieres eliminar este proyecto? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await projects.delete(id);
          const newProjects = projectList.filter(p => p.id !== id);
          setProjectList(newProjects);
        } catch (error) {
          console.error('Error deleting project:', error);
        }
      }
    });
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await projects.updateStatus(projectId, newStatus);
      // Update the local state
      setProjectList(projectList.map(p => 
        p.id === projectId ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      activo: { color: 'bg-green-500/10 border-green-500/30 text-green-500', label: 'Activo' },
      pausado: { color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500', label: 'Pausado' },
      completado: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-500', label: 'Completado' },
      archivado: { color: 'bg-slate-500/10 border-slate-500/30 text-slate-500', label: 'Archivado' },
    };
    const config = statusConfig[status] || statusConfig.activo;
    return (
      <div className={`flex items-center gap-1 px-2 py-0.5 border rounded-lg ${config.color}`}>
        <span className="text-xs font-medium">{config.label}</span>
      </div>
    );
  };

  const openProjectModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setProjectForm({
        name: project.name,
        description: project.description || '',
        notes: project.notes || '',
      });
    } else {
      setEditingProject(null);
      setProjectForm({ name: '', description: '', notes: '' });
    }
    setShowProjectModal(true);
  };

  const closeProjectModal = () => {
    setShowProjectModal(false);
    setEditingProject(null);
  };

  const openLinkModal = () => {
    setLinkForm({ title: '', url: '' });
    setShowLinkModal(true);
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    // Esta función se puede implementar más tarde
    console.log('Add link:', linkForm);
    closeLinkModal();
  };

  const filteredProjects = projectList.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Projects</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your projects and resources</p>
        </div>
        <button
          onClick={() => openProjectModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
        >
          <FiPlus size={20} />
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500/50 focus:bg-slate-50 dark:focus:bg-white/10 transition-all"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
            No projects found
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              onDoubleClick={() => navigate(`/projects/${project.id}`)}
              className="group bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-purple-500 dark:hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 flex flex-col h-full cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                  <FiFolder className="text-white" size={20} />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                  {project.name}
                </h3>
                {getStatusBadge(project.status || 'activo')}
                {project.user && project.user.id !== user?.id && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <FiUsers className="text-blue-500" size={12} />
                    <span className="text-xs font-medium text-blue-500">Compartido</span>
                  </div>
                )}
              </div>

              {project.user && project.user.id !== user?.id && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Propietario: {project.user.name || project.user.email}
                </p>
              )}

              {project.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 flex-grow">
                  {project.description}
                </p>
              )}

              <div className="grid grid-cols-4 gap-2 mt-4 mb-4">
                <div className="bg-slate-100 dark:bg-black/20 rounded-lg p-2 text-center">
                  <span className="block text-lg font-bold text-purple-600 dark:text-purple-400">{project.repos?.length || 0}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">Repos</span>
                </div>
                <div className="bg-slate-100 dark:bg-black/20 rounded-lg p-2 text-center">
                  <span className="block text-lg font-bold text-pink-600 dark:text-pink-400">{project.aiResources?.length || 0}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">AI Res</span>
                </div>
                <div className="bg-slate-100 dark:bg-black/20 rounded-lg p-2 text-center">
                  <span className="block text-lg font-bold text-blue-600 dark:text-blue-400">{project.links?.length || 0}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">Links</span>
                </div>
                <div className="bg-slate-100 dark:bg-black/20 rounded-lg p-2 text-center">
                  <span className="block text-lg font-bold text-amber-600 dark:text-amber-400">{project.languages?.length || 0}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">Langs</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/projects/${project.id}`)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Ver proyecto
              </button>

            </div>
          ))
        )}
      </div>

      {/* Project Create/Edit Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={closeProjectModal}
        title={editingProject ? 'Edit Project' : 'New Project'}
      >
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={projectForm.name}
              onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes (Markdown)
            </label>
            <textarea
              value={projectForm.notes}
              onChange={(e) => setProjectForm({ ...projectForm, notes: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 font-mono text-sm"
              rows="6"
              placeholder="# Project Notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Guardando...' : (editingProject ? 'Update' : 'Create')}
            </button>
            <button
              type="button"
              onClick={closeProjectModal}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Link Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={closeLinkModal}
        title="Add Link"
      >
        <form onSubmit={handleAddLink} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
            <input
              type="text"
              value={linkForm.title}
              onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">URL *</label>
            <input
              type="url"
              value={linkForm.url}
              onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg transition-all"
            >
              Add Link
            </button>
            <button
              type="button"
              onClick={closeLinkModal}
              className="flex-1 px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}
