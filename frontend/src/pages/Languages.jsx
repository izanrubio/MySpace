import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCode, FiLayers, FiSearch } from 'react-icons/fi';
import { languages, projects } from '../services/api';
import Modal from '../components/Modal';
import AlertModal from '../components/AlertModal';
import ConfirmModal from '../components/ConfirmModal';

export default function Languages() {
    const [languageList, setLanguageList] = useState([]);
    const [projectList, setProjectList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLanguage, setEditingLanguage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const [languageForm, setLanguageForm] = useState({
        name: '',
        category: '',
        image: '',
        projectIds: [],
    });

    const CATEGORIES = [
        'Frontend',
        'Backend',
        'Mobile',
        'Data/IA',
        'Sistemas',
        'Databases',
        'DevOps',
        'Otros'
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [langsRes, projsRes] = await Promise.all([
                languages.getAll(),
                projects.getAll()
            ]);
            setLanguageList(langsRes.data);
            setProjectList(projsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLanguage) {
                await languages.update(editingLanguage.id, languageForm);
            } else {
                await languages.create(languageForm);
            }
            loadData();
            closeModal();
        } catch (error) {
            console.error('Error saving language:', error);
            setAlertModal({ 
                isOpen: true, 
                title: 'Error', 
                message: 'Error al guardar el lenguaje: ' + (error.response?.data?.error || error.message), 
                type: 'error' 
            });
        }
    };

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            title: '¿Eliminar lenguaje?',
            message: '¿Estás seguro que quieres eliminar este lenguaje? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                try {
                    await languages.delete(id);
                    loadData();
                } catch (error) {
                    console.error('Error deleting language:', error);
                }
            }
        });
    };

    const openModal = (language = null) => {
        if (language) {
            setEditingLanguage(language);
            setLanguageForm({
                name: language.name,
                category: language.category || '',
                image: language.image || '',
                projectIds: language.projects ? language.projects.map(p => p.id) : [],
            });
        } else {
            setEditingLanguage(null);
            setLanguageForm({
                name: '',
                category: '',
                image: '',
                projectIds: [],
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingLanguage(null);
    };

    const handleProjectChange = (e) => {
        const options = e.target.options;
        const selectedIds = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedIds.push(options[i].value);
            }
        }
        setLanguageForm({ ...languageForm, projectIds: selectedIds });
    };

    const filteredLanguages = languageList.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Languages & Tech</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage your programming languages and technologies</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all border-none"
                    style={{ border: 'none' }} // Force no border to avoid ugly default borders
                >
                    <FiPlus size={20} />
                    New Language
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search languages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-purple-500 dark:focus:border-purple-500/50 focus:bg-slate-50 dark:focus:bg-white/10 transition-all"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLanguages.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-600 dark:text-slate-400">
                        No languages found
                    </div>
                ) : (
                    filteredLanguages.map((lang) => (
                        <div
                            key={lang.id}
                            className="group bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-purple-500 dark:hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {lang.image ? (
                                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                                            <img
                                                src={lang.image}
                                                alt={lang.name}
                                                className="w-10 h-10 object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                                            <FiCode className="text-white" size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openModal(lang)}
                                        className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                                        title="Edit"
                                        style={{ border: 'none' }}
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(lang.id)}
                                        className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                                        title="Delete"
                                        style={{ border: 'none' }}
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-purple-500 transition-colors">{lang.name}</h3>
                                {lang.category && (
                                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
                                        {lang.category}
                                    </span>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                                {lang.projects && lang.projects.length > 0 ? (
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5 font-medium">
                                            <FiLayers /> Used in {lang.projects.length} projects
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {lang.projects.slice(0, 3).map(p => (
                                                <span key={p.id} className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                                                    {p.name}
                                                </span>
                                            ))}
                                            {lang.projects.length > 3 && (
                                                <span className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                                                    +{lang.projects.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic flex items-center gap-1.5 opacity-60">
                                        <FiLayers /> Not used in any project yet
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={editingLanguage ? 'Edit Language' : 'New Language'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Language Name *
                        </label>
                        <input
                            type="text"
                            value={languageForm.name}
                            onChange={(e) => setLanguageForm({ ...languageForm, name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                            placeholder="Ex: React, Python, Docker..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Category
                        </label>
                        <select
                            value={languageForm.category}
                            onChange={(e) => setLanguageForm({ ...languageForm, category: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none"
                        >
                            <option value="">Select category...</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Image/Logo URL
                        </label>
                        <input
                            type="url"
                            value={languageForm.image}
                            onChange={(e) => setLanguageForm({ ...languageForm, image: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                            placeholder="https://example.com/logo.png"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Used in Projects
                        </label>
                        <select
                            multiple
                            value={languageForm.projectIds}
                            onChange={handleProjectChange}
                            className="w-full px-4 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 h-32"
                        >
                            {projectList.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-400 mt-2">
                            Hold Ctrl (Windows) or Cmd (Mac) to select multiple projects.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg transition-all border-none"
                            style={{ border: 'none' }}
                        >
                            {editingLanguage ? 'Update' : 'Create'}
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
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div>
    );
}
