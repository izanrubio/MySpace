import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCode, FiLayers } from 'react-icons/fi';
import { languages, projects } from '../services/api';
import Modal from '../components/Modal';

export default function Languages() {
    const [languageList, setLanguageList] = useState([]);
    const [projectList, setProjectList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLanguage, setEditingLanguage] = useState(null);

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
            alert('Error al guardar el lenguaje: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (confirm('¿Seguro que quieres eliminar este lenguaje?')) {
            try {
                await languages.delete(id);
                loadData();
            } catch (error) {
                console.error('Error deleting language:', error);
            }
        }
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

    if (loading) {
        return <div className="text-white">Cargando...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Lenguajes y Tecnologías</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <FiPlus /> Nuevo Lenguaje
                </button>
            </div>

            {languageList.length === 0 ? (
                <div className="text-center py-12">
                    <FiCode className="text-6xl text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-4">
                        No tienes lenguajes guardados aún
                    </p>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg"
                    >
                        Crear tu primer lenguaje
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {languageList.map((lang) => (
                        <div
                            key={lang.id}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-primary-500 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {lang.image ? (
                                        <img
                                            src={lang.image}
                                            alt={lang.name}
                                            className="w-12 h-12 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded bg-primary-600 flex items-center justify-center">
                                            <FiCode className="text-white text-xl" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">{lang.name}</h3>
                                        {lang.category && (
                                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                                                {lang.category}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {lang.projects && lang.projects.length > 0 ? (
                                <div className="mt-3">
                                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                        <FiLayers /> Usado en {lang.projects.length} proyectos:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {lang.projects.slice(0, 3).map(p => (
                                            <span key={p.id} className="text-xs bg-gray-900 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
                                                {p.name}
                                            </span>
                                        ))}
                                        {lang.projects.length > 3 && (
                                            <span className="text-xs text-gray-500 px-1">+{lang.projects.length - 3}</span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-3 text-xs text-gray-500 italic">No asociado a proyectos</p>
                            )}

                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                                <button
                                    onClick={() => openModal(lang)}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                                >
                                    <FiEdit2 /> Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(lang.id)}
                                    className="bg-gray-700 hover:bg-red-600 text-white p-2 rounded-lg"
                                    title="Eliminar"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={editingLanguage ? 'Editar Lenguaje' : 'Nuevo Lenguaje'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nombre del Lenguaje *
                        </label>
                        <input
                            type="text"
                            value={languageForm.name}
                            onChange={(e) => setLanguageForm({ ...languageForm, name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                            placeholder="Ej: React, Python, Docker..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Categoría
                        </label>
                        <select
                            value={languageForm.category}
                            onChange={(e) => setLanguageForm({ ...languageForm, category: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                        >
                            <option value="">Seleccionar categoría...</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            URL de la Imagen/Logo
                        </label>
                        <input
                            type="url"
                            value={languageForm.image}
                            onChange={(e) => setLanguageForm({ ...languageForm, image: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                            placeholder="https://ejemplo.com/logo.png"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Usado en Proyectos
                        </label>
                        <select
                            multiple
                            value={languageForm.projectIds}
                            onChange={handleProjectChange}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 h-32"
                        >
                            {projectList.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                            Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar múltiples proyectos.
                        </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg"
                        >
                            {editingLanguage ? 'Actualizar' : 'Crear'}
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
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
