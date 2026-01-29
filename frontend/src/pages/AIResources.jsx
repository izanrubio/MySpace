import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiFolder, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { folders, aiResources } from '../services/api';
import Modal from '../components/Modal';

export default function AIResources() {
  const [folderList, setFolderList] = useState([]);
  const [aiList, setAiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editingAI, setEditingAI] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const [folderForm, setFolderForm] = useState({
    name: '',
    description: '',
    parentId: '',
  });

  const [aiForm, setAiForm] = useState({
    name: '',
    url: '',
    type: 'web',
    description: '',
    folderId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [foldersRes, aiRes] = await Promise.all([
        folders.getAll(),
        aiResources.getAll(),
      ]);
      setFolderList(foldersRes.data);
      setAiList(aiRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...folderForm,
        parentId: folderForm.parentId || null,
      };

      if (editingFolder) {
        await folders.update(editingFolder.id, data);
      } else {
        await folders.create(data);
      }
      loadData();
      closeFolderModal();
    } catch (error) {
      console.error('Error saving folder:', error);
      alert('Error al guardar la carpeta: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAISubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...aiForm,
        folderId: aiForm.folderId || null,
      };

      if (editingAI) {
        await aiResources.update(editingAI.id, data);
      } else {
        await aiResources.create(data);
      }
      loadData();
      closeAIModal();
    } catch (error) {
      console.error('Error saving AI resource:', error);
      alert('Error al guardar el recurso IA: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteFolder = async (id) => {
    if (confirm('¿Seguro? Esto eliminará la carpeta y sus recursos.')) {
      try {
        await folders.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting folder:', error);
      }
    }
  };

  const handleDeleteAI = async (id) => {
    if (confirm('¿Seguro que quieres eliminar este recurso IA?')) {
      try {
        await aiResources.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting AI resource:', error);
      }
    }
  };

  const openFolderModal = (folder = null) => {
    if (folder) {
      setEditingFolder(folder);
      setFolderForm({
        name: folder.name,
        description: folder.description || '',
        parentId: folder.parentId || '',
      });
    } else {
      setEditingFolder(null);
      setFolderForm({ name: '', description: '', parentId: '' });
    }
    setShowFolderModal(true);
  };

  const closeFolderModal = () => {
    setShowFolderModal(false);
    setEditingFolder(null);
  };

  const openAIModal = (ai = null, folderId = '') => {
    if (ai) {
      setEditingAI(ai);
      setAiForm({
        name: ai.name,
        url: ai.url,
        type: ai.type || 'web',
        description: ai.description || '',
        folderId: ai.folderId || '',
      });
    } else {
      setEditingAI(null);
      setAiForm({
        name: '',
        url: '',
        type: 'web',
        description: '',
        folderId: folderId || '',
      });
    }
    setShowAIModal(true);
  };

  const closeAIModal = () => {
    setShowAIModal(false);
    setEditingAI(null);
  };

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getFolderChildren = (parentId) => {
    return folderList.filter((f) => f.parentId === parentId);
  };

  const getFolderAIs = (folderId) => {
    return aiList.filter((ai) => ai.folderId === folderId);
  };

  const getUnfiledAIs = () => {
    return aiList.filter((ai) => !ai.folderId);
  };

  const renderFolder = (folder, level = 0) => {
    const children = getFolderChildren(folder.id);
    const ais = getFolderAIs(folder.id);
    const isExpanded = expandedFolders.has(folder.id);

    return (
      <div key={folder.id} style={{ marginLeft: `${level * 20}px` }} className="mb-2">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-primary-500 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => toggleFolder(folder.id)}
                className="text-gray-400 hover:text-white"
              >
                {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
              </button>
              <FiFolder className="text-primary-400" />
              <span className="text-white font-medium">{folder.name}</span>
              {folder.description && (
                <span className="text-gray-400 text-sm">- {folder.description}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openAIModal(null, folder.id)}
                className="text-gray-400 hover:text-green-400 text-sm"
                title="Añadir IA"
              >
                <FiPlus />
              </button>
              <button
                onClick={() => openFolderModal(folder)}
                className="text-gray-400 hover:text-primary-400"
              >
                <FiEdit2 />
              </button>
              <button
                onClick={() => handleDeleteFolder(folder.id)}
                className="text-gray-400 hover:text-red-400"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-3 ml-6 space-y-2">
              {ais.map((ai) => (
                <div
                  key={ai.id}
                  className="bg-gray-700 rounded p-3 border border-gray-600"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{ai.name}</h4>
                      <a
                        href={ai.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-400 hover:text-primary-300 hover:underline"
                      >
                        {ai.url}
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAIModal(ai)}
                        className="text-gray-400 hover:text-primary-400"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteAI(ai.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {children.map((child) => renderFolder(child, level + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-white">Cargando...</div>;
  }

  const rootFolders = folderList.filter((f) => !f.parentId);
  const unfiledAIs = getUnfiledAIs();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Recursos IA</h1>
        <div className="flex gap-2">
          <button
            onClick={() => openFolderModal()}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiFolder /> Nueva Carpeta
          </button>
          <button
            onClick={() => openAIModal()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiPlus /> Nuevo Recurso IA
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {rootFolders.map((folder) => renderFolder(folder))}

        {unfiledAIs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-white font-semibold mb-3">Sin carpeta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unfiledAIs.map((ai) => (
                <div
                  key={ai.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-medium">{ai.name}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAIModal(ai)}
                        className="text-gray-400 hover:text-primary-400"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteAI(ai.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <a
                    href={ai.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-400 hover:text-primary-300 hover:underline block mb-2"
                  >
                    {ai.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Folder Modal */}
      <Modal
        isOpen={showFolderModal}
        onClose={closeFolderModal}
        title={editingFolder ? 'Editar Carpeta' : 'Nueva Carpeta'}
      >
        <form onSubmit={handleFolderSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={folderForm.name}
              onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={folderForm.description}
              onChange={(e) =>
                setFolderForm({ ...folderForm, description: e.target.value })
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              rows="2"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg"
            >
              {editingFolder ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={closeFolderModal}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Resource Modal */}
      <Modal
        isOpen={showAIModal}
        onClose={closeAIModal}
        title={editingAI ? 'Editar Recurso IA' : 'Nuevo Recurso IA'}
      >
        <form onSubmit={handleAISubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={aiForm.name}
              onChange={(e) => setAiForm({ ...aiForm, name: e.target.value })}
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
              value={aiForm.url}
              onChange={(e) => setAiForm({ ...aiForm, url: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo *
            </label>
            <select
              value={aiForm.type}
              onChange={(e) => setAiForm({ ...aiForm, type: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              required
            >
              <option value="web">Web</option>
              <option value="local">Local</option>
              <option value="api">API</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={aiForm.description}
              onChange={(e) => setAiForm({ ...aiForm, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Carpeta
            </label>
            <select
              value={aiForm.folderId}
              onChange={(e) => setAiForm({ ...aiForm, folderId: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">Sin carpeta</option>
              {folderList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg"
            >
              {editingAI ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={closeAIModal}
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
