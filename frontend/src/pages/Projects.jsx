import { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiLink,
  FiGitBranch,
  FiCpu,
  FiSettings,
  FiFolder,
  FiExternalLink,
  FiSearch
} from 'react-icons/fi';
import { projects, repositories, aiResources } from '../services/api';
import Modal from '../components/Modal';
import ReactMarkdown from 'react-markdown';

export default function Projects() {
  const [projectList, setProjectList] = useState([]);
  const [repoList, setRepoList] = useState([]);
  const [aiList, setAiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for Modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [managingProject, setManagingProject] = useState(null); // Nuevo modal de gestión

  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    }
  };

  const handleDeleteProject = async (id) => {
    if (confirm('¿Seguro que quieres eliminar este proyecto?')) {
      try {
        await projects.delete(id);
        const newProjects = projectList.filter(p => p.id !== id);
        setProjectList(newProjects);
        if (managingProject?.id === id) setManagingProject(null);
      } catch (error) {
        console.error('Error deleting project:', error);
        loadData(); // Reload to be safe
      }
    }
  };

  // Resource Management Handlers
  const handleAddRepo = async (projectId, repoId) => {
    try {
      await projects.addRepository(projectId, repoId);
      refreshCurrentProject(projectId);
    } catch (error) {
      console.error('Error adding repo:', error);
    }
  };

  const handleRemoveRepo = async (projectId, repoId) => {
    try {
      await projects.removeRepository(projectId, repoId);
      refreshCurrentProject(projectId);
    } catch (error) {
      console.error('Error removing repo:', error);
    }
  };

  const handleAddAI = async (projectId, aiId) => {
    try {
      await projects.addAIResource(projectId, aiId);
      refreshCurrentProject(projectId);
    } catch (error) {
      console.error('Error adding AI:', error);
    }
  };

  const handleRemoveAI = async (projectId, aiId) => {
    try {
      await projects.removeAIResource(projectId, aiId);
      refreshCurrentProject(projectId);
    } catch (error) {
      console.error('Error removing AI:', error);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    try {
      await projects.addLink(managingProject.id, linkForm);
      refreshCurrentProject(managingProject.id);
      closeLinkModal();
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  const handleRemoveLink = async (projectId, linkId) => {
    try {
      await projects.removeLink(projectId, linkId);
      refreshCurrentProject(projectId);
    } catch (error) {
      console.error('Error removing link:', error);
    }
  };

  // Helper to refresh data without full page reload flicker, focusing on the managed project
  const refreshCurrentProject = async (projectId) => {
    // We reload everything to keep sync, but we could optimize to fetch only one project
    // For simplicity, re-fetching all projects
    const res = await projects.getAll();
    setProjectList(res.data);

    // Update the currently managed project object
    const updated = res.data.find(p => p.id === projectId);
    if (updated) setManagingProject(updated);
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

  const getAvailableRepos = (project) => {
    if (!project) return [];
    const projectRepoIds = project.repos?.map((pr) => pr.repository?.id) || [];
    return repoList.filter((r) => !projectRepoIds.includes(r.id));
  };

  const getAvailableAIs = (project) => {
    if (!project) return [];
    const projectAIIds = project.aiResources?.map((pa) => pa.aiResource?.id) || [];
    return aiList.filter((ai) => !projectAIIds.includes(ai.id));
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
              className="group bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-purple-500 dark:hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                  <FiFolder className="text-white" size={20} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openProjectModal(project)}
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                    title="Edit"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-500 transition-colors">
                {project.name}
              </h3>

              {project.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 flex-grow">
                  {project.description}
                </p>
              )}

              <div className="grid grid-cols-3 gap-2 mt-4 mb-6">
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
              </div>

              <button
                onClick={() => setManagingProject(project)}
                className="w-full py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 border border-slate-200 dark:border-white/10 hover:border-purple-600 rounded-xl text-slate-900 dark:text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                <FiSettings size={16} /> Manage Resources
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg transition-all"
            >
              {editingProject ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={closeProjectModal}
              className="flex-1 px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Resources Modal (The "Accordion" Content) */}
      <Modal
        isOpen={!!managingProject}
        onClose={() => setManagingProject(null)}
        title={`Manage: ${managingProject?.name}`}
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Repositories Section */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium flex items-center gap-2">
                <FiGitBranch className="text-purple-400" /> Repositories
              </h4>
              {getAvailableRepos(managingProject).length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddRepo(managingProject.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="text-sm px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">+ Add Repository</option>
                  {getAvailableRepos(managingProject).map((repo) => (
                    <option key={repo.id} value={repo.id}>
                      {repo.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-2">
              {managingProject?.repos?.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No linked repositories.</p>
              ) : (
                managingProject?.repos?.map((pr) => (
                  <div key={pr.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{pr.repository.name}</span>
                      <a href={pr.repository.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate max-w-[200px]">{pr.repository.url}</a>
                    </div>
                    <button onClick={() => handleRemoveRepo(managingProject.id, pr.repository.id)} className="text-gray-400 hover:text-red-400 p-2"><FiTrash2 /></button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Resources Section */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium flex items-center gap-2">
                <FiCpu className="text-pink-400" /> AI Resources
              </h4>
              {getAvailableAIs(managingProject).length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddAI(managingProject.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="text-sm px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">+ Add Resource</option>
                  {getAvailableAIs(managingProject).map((ai) => (
                    <option key={ai.id} value={ai.id}>
                      {ai.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-2">
              {managingProject?.aiResources?.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No linked resources.</p>
              ) : (
                managingProject?.aiResources?.map((pai) => (
                  <div key={pai.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{pai.aiResource.name}</span>
                      <a href={pai.aiResource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate max-w-[200px]">{pai.aiResource.url}</a>
                    </div>
                    <button onClick={() => handleRemoveAI(managingProject.id, pai.aiResource.id)} className="text-gray-400 hover:text-red-400 p-2"><FiTrash2 /></button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Links Section */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium flex items-center gap-2">
                <FiLink className="text-blue-400" /> External Links
              </h4>
              <button
                onClick={openLinkModal}
                className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1"
              >
                <FiPlus size={12} /> New Link
              </button>
            </div>
            <div className="space-y-2">
              {managingProject?.links?.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No links added.</p>
              ) : (
                managingProject?.links?.map((link) => (
                  <div key={link.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-colors">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                      <FiExternalLink size={14} />
                      <span className="font-medium underline">{link.title}</span>
                    </a>
                    <button onClick={() => handleRemoveLink(managingProject.id, link.id)} className="text-gray-400 hover:text-red-400 p-2"><FiTrash2 /></button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notes Preview Section */}
          {managingProject?.notes && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-medium flex items-center gap-2 mb-3">
                <FiFileText className="text-yellow-400" /> Notes
              </h4>
              <div className="bg-black/20 p-4 rounded-lg prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{managingProject.notes}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button onClick={() => setManagingProject(null)} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">Close</button>
        </div>
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
    </div>
  );
}
