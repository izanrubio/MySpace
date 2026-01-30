import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiEdit2,
    FiTrash2,
    FiGitBranch,
    FiCpu,
    FiLink,
    FiCode,
    FiFileText,
    FiExternalLink,
    FiPlus,
    FiCalendar,
    FiFolder,
    FiShare2,
    FiUserMinus,
    FiUser,
} from 'react-icons/fi';
import { projects, repositories, aiResources, languages } from '../services/api';
import Modal from '../components/Modal';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [repoList, setRepoList] = useState([]);
    const [aiList, setAiList] = useState([]);
    const [languageList, setLanguageList] = useState([]);

    const [projectForm, setProjectForm] = useState({
        name: '',
        description: '',
        notes: '',
    });

    const [linkForm, setLinkForm] = useState({
        title: '',
        url: '',
    });

    const [shareForm, setShareForm] = useState({
        email: '',
        role: 'viewer',
    });

    useEffect(() => {
        loadProject();
        loadResources();
    }, [id]);

    const loadProject = async () => {
        try {
            const response = await projects.getById(id);
            setProject(response.data);
            setProjectForm({
                name: response.data.name,
                description: response.data.description || '',
                notes: response.data.notes || '',
            });
        } catch (error) {
            console.error('Error loading project:', error);
            navigate('/projects');
        } finally {
            setLoading(false);
        }
    };

    const loadResources = async () => {
        try {
            const [reposRes, aiRes, langsRes] = await Promise.all([
                repositories.getAll(),
                aiResources.getAll(),
                languages.getAll(),
            ]);
            setRepoList(reposRes.data);
            setAiList(aiRes.data);
            setLanguageList(langsRes.data);
        } catch (error) {
            console.error('Error loading resources:', error);
        }
    };

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        try {
            await projects.update(id, projectForm);
            loadProject();
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    const handleDeleteProject = async () => {
        if (confirm('¿Seguro que quieres eliminar este proyecto?')) {
            try {
                await projects.delete(id);
                navigate('/projects');
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    };

    const handleAddRepo = async (repoId) => {
        try {
            await projects.addRepository(id, repoId);
            loadProject();
        } catch (error) {
            console.error('Error adding repo:', error);
        }
    };

    const handleRemoveRepo = async (repoId) => {
        try {
            await projects.removeRepository(id, repoId);
            loadProject();
        } catch (error) {
            console.error('Error removing repo:', error);
        }
    };

    const handleAddAI = async (aiId) => {
        try {
            await projects.addAIResource(id, aiId);
            loadProject();
        } catch (error) {
            console.error('Error adding AI:', error);
        }
    };

    const handleRemoveAI = async (aiId) => {
        try {
            await projects.removeAIResource(id, aiId);
            loadProject();
        } catch (error) {
            console.error('Error removing AI:', error);
        }
    };

    const handleAddLink = async (e) => {
        e.preventDefault();
        try {
            await projects.addLink(id, linkForm);
            loadProject();
            setShowLinkModal(false);
            setLinkForm({ title: '', url: '' });
        } catch (error) {
            console.error('Error adding link:', error);
        }
    };

    const handleRemoveLink = async (linkId) => {
        try {
            await projects.removeLink(id, linkId);
            loadProject();
        } catch (error) {
            console.error('Error removing link:', error);
        }
    };

    const handleAddLanguage = async (languageId) => {
        try {
            await projects.addLanguage(id, languageId);
            loadProject();
        } catch (error) {
            console.error('Error adding language:', error);
        }
    };

    const handleRemoveLanguage = async (languageId) => {
        try {
            await projects.removeLanguage(id, languageId);
            loadProject();
        } catch (error) {
            console.error('Error removing language:', error);
        }
    };

    const handleShareProject = async (e) => {
        e.preventDefault();
        try {
            await projects.share(id, shareForm.email, shareForm.role);
            alert('Invitación enviada correctamente');
            setShareForm({ email: '', role: 'viewer' });
            loadProject(); // Recargar para actualizar la lista de compartidos
        } catch (error) {
            console.error('Error sharing project:', error);
            alert(error.response?.data?.error || 'Error al compartir el proyecto');
        }
    };

    const handleUpdateUserRole = async (userId, newRole) => {
        try {
            await projects.updateShareRole(id, userId, newRole);
            loadProject(); // Recargar para ver el cambio
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('Error al actualizar el rol');
        }
    };

    const handleRemoveUserAccess = async (userId) => {
        if (confirm('¿Seguro que quieres remover el acceso de este usuario?')) {
            try {
                await projects.removeShare(id, userId);
                loadProject(); // Recargar para ver el cambio
            } catch (error) {
                console.error('Error removing user access:', error);
                alert('Error al remover el acceso');
            }
        }
    };

    const getAvailableRepos = () => {
        if (!project) return [];
        const projectRepoIds = project.repos?.map((pr) => pr.repository?.id) || [];
        return repoList.filter((r) => !projectRepoIds.includes(r.id));
    };

    const getAvailableAIs = () => {
        if (!project) return [];
        const projectAIIds = project.aiResources?.map((pa) => pa.aiResource?.id) || [];
        return aiList.filter((ai) => !projectAIIds.includes(ai.id));
    };

    const getAvailableLanguages = () => {
        if (!project) return [];
        const projectLangIds = project.languages?.map((pl) => pl.language?.id) || [];
        return languageList.filter((lang) => !projectLangIds.includes(lang.id));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400">Proyecto no encontrado</p>
            </div>
        );
    }

    // Verificar permisos
    const isOwner = project.user && project.user.id === user?.id;
    const isEditor = project.sharedWith?.some(share => share.user.id === user?.id && share.role === 'editor');
    const canEdit = isOwner || isEditor;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => navigate('/projects')}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all mt-1"
                    >
                        <FiArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                                <FiFolder className="text-white" size={28} />
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
                        </div>
                        {project.description && (
                            <p className="text-lg text-slate-600 dark:text-slate-400 ml-16">{project.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 ml-16 text-sm text-slate-500 dark:text-slate-500">
                            <div className="flex items-center gap-1">
                                <FiCalendar size={14} />
                                <span>Creado: {new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <FiCalendar size={14} />
                                <span>Actualizado: {new Date(project.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Solo mostrar botones de edición si tiene permisos */}
                {(isOwner || isEditor) && (
                    <div className="flex gap-2">
                        {isOwner && (
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl transition-all"
                            >
                                <FiShare2 size={18} />
                                Compartir
                            </button>
                        )}
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all"
                        >
                            <FiEdit2 size={18} />
                            Editar
                        </button>
                        {isOwner && (
                            <button
                                onClick={handleDeleteProject}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-all"
                            >
                                <FiTrash2 size={18} />
                                Eliminar
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <FiGitBranch className="text-purple-500" size={20} />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Repositorios</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{project.repos?.length || 0}</p>
                </div>
                <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-pink-500/10">
                            <FiCpu className="text-pink-500" size={20} />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Recursos IA</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{project.aiResources?.length || 0}</p>
                </div>
                <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <FiLink className="text-blue-500" size={20} />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Enlaces</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{project.links?.length || 0}</p>
                </div>
                <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                            <FiCode className="text-amber-500" size={20} />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Lenguajes</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{project.languages?.length || 0}</p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Repositories Section */}
                <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FiGitBranch className="text-purple-500" />
                            Repositorios
                        </h3>
                        {canEdit && getAvailableRepos().length > 0 && (
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleAddRepo(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                className="text-sm px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none"
                            >
                                <option value="">+ Agregar</option>
                                {getAvailableRepos().map((repo) => (
                                    <option key={repo.id} value={repo.id}>
                                        {repo.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="space-y-2">
                        {project.repos?.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-500 text-sm italic">No hay repositorios vinculados</p>
                        ) : (
                            project.repos?.map((pr) => (
                                <div
                                    key={pr.id}
                                    className="flex items-center justify-between bg-slate-50 dark:bg-black/20 p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-black/30 transition-all group"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900 dark:text-white">{pr.repository.name}</p>
                                        <a
                                            href={pr.repository.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                                        >
                                            {pr.repository.url}
                                            <FiExternalLink size={12} />
                                        </a>
                                        {pr.repository.description && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{pr.repository.description}</p>
                                        )}
                                    </div>
                                    {canEdit && (
                                        <button
                                            onClick={() => handleRemoveRepo(pr.repository.id)}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* AI Resources Section */}
                <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FiCpu className="text-pink-500" />
                            Recursos IA
                        </h3>
                        {canEdit && (
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleAddAI(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                className="text-sm px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none"
                                disabled={getAvailableAIs().length === 0}
                            >
                                <option value="">{getAvailableAIs().length === 0 ? 'Sin recursos disponibles' : '+ Agregar'}</option>
                                {getAvailableAIs().map((ai) => (
                                    <option key={ai.id} value={ai.id}>
                                        {ai.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="space-y-2">
                        {project.aiResources?.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-500 text-sm italic">No hay recursos IA vinculados</p>
                        ) : (
                            project.aiResources?.map((pai) => (
                                <div
                                    key={pai.id}
                                    className="flex items-center justify-between bg-slate-50 dark:bg-black/20 p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-black/30 transition-all group"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900 dark:text-white">{pai.aiResource.name}</p>
                                        <a
                                            href={pai.aiResource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                                        >
                                            {pai.aiResource.url}
                                            <FiExternalLink size={12} />
                                        </a>
                                        {pai.aiResource.description && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{pai.aiResource.description}</p>
                                        )}
                                    </div>
                                    {canEdit && (
                                        <button
                                            onClick={() => handleRemoveAI(pai.aiResource.id)}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Links Section */}
                <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FiLink className="text-blue-500" />
                            Enlaces Externos
                        </h3>
                        {canEdit && (
                            <button
                                onClick={() => setShowLinkModal(true)}
                                className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all flex items-center gap-1"
                            >
                                <FiPlus size={14} />
                                Agregar
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {project.links?.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-500 text-sm italic">No hay enlaces agregados</p>
                        ) : (
                            project.links?.map((link) => (
                                <div
                                    key={link.id}
                                    className="flex items-center justify-between bg-slate-50 dark:bg-black/20 p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-black/30 transition-all group"
                                >
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-blue-500 hover:text-blue-400 flex-1"
                                    >
                                        <FiExternalLink size={16} />
                                        <span className="font-medium">{link.title}</span>
                                    </a>
                                    {canEdit && (
                                        <button
                                            onClick={() => handleRemoveLink(link.id)}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Languages Section */}
                <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FiCode className="text-amber-500" />
                            Lenguajes
                        </h3>
                        {canEdit && (
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        handleAddLanguage(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                className="text-sm px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none"
                                disabled={getAvailableLanguages().length === 0}
                            >
                                <option value="">{getAvailableLanguages().length === 0 ? 'Sin lenguajes disponibles' : '+ Agregar'}</option>
                                {getAvailableLanguages().map((lang) => (
                                    <option key={lang.id} value={lang.id}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="space-y-2">
                        {project.languages?.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-500 text-sm italic">No hay lenguajes asignados</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {project.languages?.map((pl) => (
                                    <div
                                        key={pl.id}
                                        className="group relative px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        {pl.language.name}
                                        {canEdit && (
                                            <button
                                                onClick={() => handleRemoveLanguage(pl.language.id)}
                                                className="ml-2 text-slate-400 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <FiTrash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            {project.notes && (
                <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <FiFileText className="text-yellow-500" />
                        Notas del Proyecto
                    </h3>
                    <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-xl prose prose-slate dark:prose-invert max-w-none">
                        <ReactMarkdown>{project.notes}</ReactMarkdown>
                    </div>
                </div>
            )}

            {/* Edit Project Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Proyecto">
                <form onSubmit={handleUpdateProject} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Nombre *</label>
                        <input
                            type="text"
                            value={projectForm.name}
                            onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
                        <textarea
                            value={projectForm.description}
                            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                            rows="2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Notas (Markdown)</label>
                        <textarea
                            value={projectForm.notes}
                            onChange={(e) => setProjectForm({ ...projectForm, notes: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 font-mono text-sm"
                            rows="8"
                            placeholder="# Notas del proyecto..."
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg transition-all"
                        >
                            Actualizar
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="flex-1 px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-medium transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add Link Modal */}
            <Modal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} title="Agregar Enlace">
                <form onSubmit={handleAddLink} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Título *</label>
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
                            Agregar
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowLinkModal(false)}
                            className="flex-1 px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-medium transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Share Project Modal */}
            <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Compartir Proyecto">
                <form onSubmit={handleShareProject} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email del usuario *</label>
                        <input
                            type="email"
                            value={shareForm.email}
                            onChange={(e) => setShareForm({ ...shareForm, email: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                            placeholder="usuario@ejemplo.com"
                            required
                        />
                        <p className="text-xs text-slate-400 mt-2">Introduce el email con el que el usuario se registró</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Rol</label>
                        <select
                            value={shareForm.role}
                            onChange={(e) => setShareForm({ ...shareForm, role: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                        >
                            <option value="viewer">Viewer (Solo lectura)</option>
                            <option value="editor">Editor (Puede editar)</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg transition-all"
                        >
                            Enviar Invitación
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowShareModal(false)}
                            className="flex-1 px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-medium transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>

                {/* Lista de Usuarios con Acceso */}
                {project?.sharedWith && project.sharedWith.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <h4 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <FiUser size={16} />
                            Usuarios con Acceso ({project.sharedWith.length})
                        </h4>
                        <div className="space-y-3">
                            {project.sharedWith.map((share) => (
                                <div
                                    key={share.id}
                                    className="flex items-center justify-between bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-all"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        {share.user.avatarUrl ? (
                                            <img
                                                src={share.user.avatarUrl}
                                                alt={share.user.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                                <FiUser className="text-white" size={14} />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">
                                                {share.user.name || share.user.email}
                                            </p>
                                            <p className="text-xs text-slate-400">{share.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={share.role}
                                            onChange={(e) => handleUpdateUserRole(share.user.id, e.target.value)}
                                            className="text-xs px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                        >
                                            <option value="viewer">Viewer</option>
                                            <option value="editor">Editor</option>
                                        </select>
                                        <button
                                            onClick={() => handleRemoveUserAccess(share.user.id)}
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Remover acceso"
                                        >
                                            <FiUserMinus size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
