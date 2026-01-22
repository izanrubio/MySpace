import { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiLink,
  FiGitBranch,
  FiCpu,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import { projects, repositories, aiResources } from '../services/api';
import Modal from '../components/Modal';
import ReactMarkdown from 'react-markdown';

export default function Projects() {
  const [projectList, setProjectList] = useState([]);
  const [repoList, setRepoList] = useState([]);
  const [aiList, setAiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState(new Set());

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
        loadData();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleAddRepo = async (projectId, repoId) => {
    try {
      await projects.addRepository(projectId, repoId);
      loadData();
    } catch (error) {
      console.error('Error adding repo:', error);
    }
  };

  const handleRemoveRepo = async (projectId, repoId) => {
    try {
      await projects.removeRepository(projectId, repoId);
      loadData();
    } catch (error) {
      console.error('Error removing repo:', error);
    }
  };

  const handleAddAI = async (projectId, aiId) => {
    try {
      await projects.addAIResource(projectId, aiId);
      loadData();
    } catch (error) {
      console.error('Error adding AI:', error);
    }
  };

  const handleRemoveAI = async (projectId, aiId) => {
    try {
      await projects.removeAIResource(projectId, aiId);
      loadData();
    } catch (error) {
      console.error('Error removing AI:', error);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    try {
      await projects.addLink(selectedProject.id, linkForm);
      loadData();
      closeLinkModal();
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  const handleRemoveLink = async (projectId, linkId) => {
    try {
      await projects.removeLink(projectId, linkId);
      loadData();
    } catch (error) {
      console.error('Error removing link:', error);
    }
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

  const openLinkModal = (project) => {
    setSelectedProject(project);
    setLinkForm({ title: '', url: '' });
    setShowLinkModal(true);
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
    setSelectedProject(null);
  };

  const toggleProject = (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const getAvailableRepos = (project) => {
    const projectRepoIds = project.repos.map((pr) => pr.repository.id);
    return repoList.filter((r) => !projectRepoIds.includes(r.id));
  };

  const getAvailableAIs = (project) => {
    const projectAIIds = project.aiResources.map((pa) => pa.aiResource.id);
    return aiList.filter((ai) => !projectAIIds.includes(ai.id));
  };

  if (loading) {
    return <div className="text-white">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Proyectos</h1>
        <button
          onClick={() => openProjectModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiPlus /> Nuevo Proyecto
        </button>
      </div>

      <div className="space-y-4">
        {projectList.map((project) => {
          const isExpanded = expandedProjects.has(project.id);
          const availableRepos = getAvailableRepos(project);
          const availableAIs = getAvailableAIs(project);

          return (
            <div
              key={project.id}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleProject(project.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      {isExpanded ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
                    </button>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-gray-400 text-sm mt-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openProjectModal(project)}
                      className="text-gray-400 hover:text-primary-400"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-700 p-4 space-y-4">
                  {/* Repositories */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium flex items-center gap-2">
                        <FiGitBranch /> Repositorios
                      </h4>
                      {availableRepos.length > 0 && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddRepo(project.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="text-sm px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        >
                          <option value="">+ Añadir repo</option>
                          {availableRepos.map((repo) => (
                            <option key={repo.id} value={repo.id}>
                              {repo.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="space-y-2">
                      {project.repos.map((pr) => (
                        <div
                          key={pr.id}
                          className="flex items-center justify-between bg-gray-700 p-3 rounded"
                        >
                          <div>
                            <div className="text-white font-medium">
                              {pr.repository.name}
                            </div>
                            <a 
                              href={pr.repository.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary-400 hover:text-primary-300 hover:underline"
                            >
                              {pr.repository.url}
                            </a>
                          </div>
                          <button
                            onClick={() => handleRemoveRepo(project.id, pr.repository.id)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                      {project.repos.length === 0 && (
                        <p className="text-gray-500 text-sm">No hay repositorios</p>
                      )}
                    </div>
                  </div>

                  {/* AI Resources */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium flex items-center gap-2">
                        <FiCpu /> Recursos IA
                      </h4>
                      {availableAIs.length > 0 && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddAI(project.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="text-sm px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        >
                          <option value="">+ Añadir IA</option>
                          {availableAIs.map((ai) => (
                            <option key={ai.id} value={ai.id}>
                              {ai.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="space-y-2">
                      {project.aiResources.map((pai) => (
                        <div
                          key={pai.id}
                          className="flex items-center justify-between bg-gray-700 p-3 rounded"
                        >
                          <div>
                            <div className="text-white font-medium">
                              {pai.aiResource.name}
                            </div>
                            <a 
                              href={pai.aiResource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary-400 hover:text-primary-300 hover:underline"
                            >
                              {pai.aiResource.url}
                            </a>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveAI(project.id, pai.aiResource.id)
                            }
                            className="text-gray-400 hover:text-red-400"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                      {project.aiResources.length === 0 && (
                        <p className="text-gray-500 text-sm">No hay recursos IA</p>
                      )}
                    </div>
                  </div>

                  {/* Links */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium flex items-center gap-2">
                        <FiLink /> Enlaces
                      </h4>
                      <button
                        onClick={() => openLinkModal(project)}
                        className="text-sm px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
                      >
                        + Añadir enlace
                      </button>
                    </div>
                    <div className="space-y-2">
                      {project.links.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between bg-gray-700 p-3 rounded"
                        >
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:text-primary-300 flex items-center gap-2"
                          >
                            <FiLink />
                            {link.title}
                          </a>
                          <button
                            onClick={() => handleRemoveLink(project.id, link.id)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                      {project.links.length === 0 && (
                        <p className="text-gray-500 text-sm">No hay enlaces</p>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {project.notes && (
                    <div>
                      <h4 className="text-white font-medium flex items-center gap-2 mb-2">
                        <FiFileText /> Notas
                      </h4>
                      <div className="bg-gray-700 p-4 rounded prose prose-invert max-w-none">
                        <ReactMarkdown>{project.notes}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {projectList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No hay proyectos aún</p>
          <button
            onClick={() => openProjectModal()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <FiPlus /> Crear primer proyecto
          </button>
        </div>
      )}

      {/* Project Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={closeProjectModal}
        title={editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
      >
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={projectForm.name}
              onChange={(e) =>
                setProjectForm({ ...projectForm, name: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={projectForm.description}
              onChange={(e) =>
                setProjectForm({ ...projectForm, description: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notas (Markdown)
            </label>
            <textarea
              value={projectForm.notes}
              onChange={(e) =>
                setProjectForm({ ...projectForm, notes: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 font-mono text-sm"
              rows="8"
              placeholder="# Título&#10;&#10;Escribe tus notas en Markdown..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg"
            >
              {editingProject ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={closeProjectModal}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Link Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={closeLinkModal}
        title="Añadir Enlace"
      >
        <form onSubmit={handleAddLink} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={linkForm.title}
              onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL *
            </label>
            <input
              type="url"
              value={linkForm.url}
              onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg"
            >
              Añadir
            </button>
            <button
              type="button"
              onClick={closeLinkModal}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
