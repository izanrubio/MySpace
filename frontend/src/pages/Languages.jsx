import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCode, FiStar, FiBookOpen } from 'react-icons/fi';
import { languages } from '../services/api';
import Modal from '../components/Modal';
import ReactMarkdown from 'react-markdown';

export default function Languages() {
    const [languageList, setLanguageList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingLanguage, setEditingLanguage] = useState(null);
    const [viewingLanguage, setViewingLanguage] = useState(null);
    const [generating, setGenerating] = useState(false);

    const [languageForm, setLanguageForm] = useState({
        name: '',
        description: '',
        content: '',
        image: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await languages.getAll();
            setLanguageList(res.data);
        } catch (error) {
            console.error('Error loading languages:', error);
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

    const handleGenerate = async () => {
        if (!languageForm.name) {
            alert('Por favor, ingresa el nombre del lenguaje primero');
            return;
        }

        setGenerating(true);
        try {
            const res = await languages.generate(languageForm.name);
            setLanguageForm({
                ...languageForm,
                content: res.data.content,
            });
        } catch (error) {
            console.error('Error generating content:', error);
            alert('Error al generar el contenido');
        } finally {
            setGenerating(false);
        }
    };

    const openModal = (language = null) => {
        if (language) {
            setEditingLanguage(language);
            setLanguageForm({
                name: language.name,
                description: language.description || '',
                content: language.content || '',
                image: language.image || '',
            });
        } else {
            setEditingLanguage(null);
            setLanguageForm({
                name: '',
                description: '',
                content: '',
                image: '',
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingLanguage(null);
    };

    const openViewModal = (language) => {
        setViewingLanguage(language);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setViewingLanguage(null);
    };

    if (loading) {
        return <div className="text-white">Cargando...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Lenguajes de Programación</h1>
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
                                        {lang.description && (
                                            <p className="text-gray-400 text-sm">{lang.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => openViewModal(lang)}
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                                >
                                    <FiBookOpen /> Ver Documentación
                                </button>
                                <button
                                    onClick={() => openModal(lang)}
                                    className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg"
                                    title="Editar"
                                >
                                    <FiEdit2 />
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
                            placeholder="Ej: PHP, Python, JavaScript..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Descripción Corta
                        </label>
                        <input
                            type="text"
                            value={languageForm.description}
                            onChange={(e) => setLanguageForm({ ...languageForm, description: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                            placeholder="Breve descripción del lenguaje"
                        />
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
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Documentación (Markdown) *
                            </label>
                            <button
                                type="button"
                                onClick={handleGenerate}
                                disabled={generating || !languageForm.name}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                            >
                                <FiStar className={generating ? 'animate-spin' : ''} />
                                {generating ? 'Generando...' : 'Generar con IA'}
                            </button>
                        </div>
                        <textarea
                            value={languageForm.content}
                            onChange={(e) => setLanguageForm({ ...languageForm, content: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500 font-mono text-sm"
                            rows="12"
                            placeholder="# Título&#10;&#10;## Instalación&#10;&#10;```bash&#10;npm install...&#10;```"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Puedes usar Markdown para formatear el contenido
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

            {/* View Documentation Modal */}
            <Modal
                isOpen={showViewModal}
                onClose={closeViewModal}
                title={viewingLanguage?.name || 'Documentación'}
            >
                <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                        className="markdown-content"
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mb-4" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white mb-3 mt-6" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-white mb-2 mt-4" {...props} />,
                            p: ({ node, ...props }) => <p className="text-gray-300 mb-3" {...props} />,
                            code: ({ node, inline, ...props }) =>
                                inline ? (
                                    <code className="bg-gray-800 text-primary-400 px-1 py-0.5 rounded text-sm" {...props} />
                                ) : (
                                    <code className="block bg-gray-900 text-gray-300 p-3 rounded-lg overflow-x-auto text-sm" {...props} />
                                ),
                            pre: ({ node, ...props }) => <pre className="bg-gray-900 rounded-lg mb-4" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1" {...props} />,
                            a: ({ node, ...props }) => <a className="text-primary-400 hover:text-primary-300 underline" {...props} />,
                        }}
                    >
                        {viewingLanguage?.content || ''}
                    </ReactMarkdown>
                </div>
            </Modal>
        </div>
    );
}
