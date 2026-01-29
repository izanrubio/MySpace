import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiFolder, FiExternalLink, FiCpu, FiSearch, FiHome, FiMoreVertical, FiGrid, FiList } from 'react-icons/fi';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const contextMenuRef = useRef(null);

  const [folderForm, setFolderForm] = useState({
    name: '',
    description: '',
    parentId: '',
  });

  const [aiForm, setAiForm] = useState({
    name: '',
    url: '',
    description: '',
    folderId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        parentId: folderForm.parentId || currentFolderId || null,
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
        folderId: aiForm.folderId || currentFolderId || null,
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
    if (confirm('¿Eliminar esta carpeta y su contenido?')) {
      try {
        await folders.delete(id);
        loadData();
        setContextMenu(null);
      } catch (error) {
        console.error('Error deleting folder:', error);
      }
    }
  };

  const handleDeleteAI = async (id) => {
    if (confirm('¿Eliminar este recurso IA?')) {
      try {
        await aiResources.delete(id);
        loadData();
        setContextMenu(null);
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
      setFolderForm({ name: '', description: '', parentId: currentFolderId || '' });
    }
    setShowFolderModal(true);
    setContextMenu(null);
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
        description: ai.description || '',
        folderId: ai.folderId || '',
      });
    } else {
      setEditingAI(null);
      setAiForm({
        name: '',
        url: '',
        description: '',
        folderId: folderId || currentFolderId || '',
      });
    }
    setShowAIModal(true);
    setContextMenu(null);
  };

  const closeAIModal = () => {
    setShowAIModal(false);
    setEditingAI(null);
  };

  const handleFolderDoubleClick = (folderId) => {
    setCurrentFolderId(folderId);
    setSearchQuery('');
  };

  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      type,
    });
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    let current = currentFolderId;

    while (current) {
      const folder = folderList.find(f => f.id === current);
      if (folder) {
        breadcrumbs.unshift(folder);
        current = folder.parentId;
      } else {
        break;
      }
    }

    return breadcrumbs;
  };

  const getCurrentFolders = () => {
    return folderList.filter(f => f.parentId === currentFolderId);
  };

  const getCurrentAIs = () => {
    return aiList.filter(ai => ai.folderId === currentFolderId);
  };

  const filteredFolders = getCurrentFolders().filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAIs = getCurrentAIs().filter(ai =>
    ai.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ai.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold text-white mb-2">AI Resources</h1>
          <p className="text-slate-400">Manage your AI tools and resources</p>
        </div>
        <div className="flex gap-3">
          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              title="Vista de cuadrícula"
            >
              <FiGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              title="Vista de tabla"
            >
              <FiList size={18} />
            </button>
          </div>

          <button
            onClick={() => openFolderModal()}
            className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
          >
            <FiFolder size={18} />
            Nueva Carpeta
          </button>
          <button
            onClick={() => openAIModal()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
          >
            <FiPlus size={20} />
            Nuevo Recurso IA
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => setCurrentFolderId(null)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <FiHome size={16} />
          <span>Inicio</span>
        </button>
        {getBreadcrumbs().map((folder, index) => (
          <div key={folder.id} className="flex items-center gap-2">
            <span className="text-slate-500">/</span>
            <button
              onClick={() => setCurrentFolderId(folder.id)}
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              {folder.name}
            </button>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar recursos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
        />
      </div>

      {/* Grid/Table View */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div
          className="relative min-h-[500px]"
          onContextMenu={(e) => {
            const isGridOrBackground = e.target.classList.contains('grid') ||
              e.target.classList.contains('context-menu-area') ||
              e.target === e.currentTarget;

            if (isGridOrBackground) {
              e.preventDefault();
              handleContextMenu(e, null, 'empty');
            }
          }}
        >
          <div className="absolute inset-0 context-menu-area" />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 relative z-10">
            {filteredFolders.map((folder) => (
              <div
                key={folder.id}
                onDoubleClick={() => handleFolderDoubleClick(folder.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleContextMenu(e, folder, 'folder');
                }}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                    <FiFolder className="text-white" size={28} />
                  </div>
                  <div className="text-center w-full">
                    <p className="text-sm font-medium text-white truncate">{folder.name}</p>
                    <p className="text-xs text-slate-400">
                      {aiList.filter(ai => ai.folderId === folder.id).length} recursos
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {filteredAIs.map((ai) => (
              <div
                key={ai.id}
                onDoubleClick={() => window.open(ai.url, '_blank')}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleContextMenu(e, ai, 'ai');
                }}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                    <FiCpu className="text-white" size={28} />
                  </div>
                  <div className="text-center w-full">
                    <p className="text-sm font-medium text-white truncate">{ai.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Tipo</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Nombre</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Descripción</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-slate-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Folders */}
              {filteredFolders.map((folder) => (
                <tr
                  key={folder.id}
                  onDoubleClick={() => handleFolderDoubleClick(folder.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleContextMenu(e, folder, 'folder');
                  }}
                  className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                        <FiFolder className="text-white" size={18} />
                      </div>
                      <span className="text-sm text-slate-400">Carpeta</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-white">{folder.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-400 truncate max-w-md">
                      {folder.description || `${aiList.filter(ai => ai.folderId === folder.id).length} recursos`}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openFolderModal(folder);
                        }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="Editar"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* AI Resources */}
              {filteredAIs.map((ai) => (
                <tr
                  key={ai.id}
                  onDoubleClick={() => window.open(ai.url, '_blank')}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleContextMenu(e, ai, 'ai');
                  }}
                  className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                        <FiCpu className="text-white" size={18} />
                      </div>
                      <span className="text-sm text-slate-400">Recurso IA</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-white">{ai.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-400 truncate max-w-md">{ai.description || ai.url}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(ai.url, '_blank');
                        }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="Abrir enlace"
                      >
                        <FiExternalLink size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAIModal(ai);
                        }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="Editar"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAI(ai.id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredFolders.length === 0 && filteredAIs.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <FiFolder className="text-slate-400" size={32} />
          </div>
          <p className="text-slate-400 text-lg">
            {searchQuery ? 'No se encontraron resultados' : 'Esta carpeta está vacía'}
          </p>
          <p className="text-slate-500 text-sm mt-2">
            {searchQuery ? 'Intenta con otra búsqueda' : 'Crea una carpeta o recurso para comenzar'}
          </p>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-2 min-w-[200px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          {contextMenu.type === 'folder' ? (
            <>
              <button
                onClick={() => handleFolderDoubleClick(contextMenu.item.id)}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <FiFolder size={16} />
                Abrir
              </button>
              <button
                onClick={() => openFolderModal(contextMenu.item)}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <FiEdit2 size={16} />
                Editar
              </button>
              <button
                onClick={() => handleDeleteFolder(contextMenu.item.id)}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-3"
              >
                <FiTrash2 size={16} />
                Eliminar
              </button>
            </>
          ) : contextMenu.type === 'ai' ? (
            <>
              <button
                onClick={() => window.open(contextMenu.item.url, '_blank')}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <FiExternalLink size={16} />
                Abrir enlace
              </button>
              <button
                onClick={() => openAIModal(contextMenu.item)}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <FiEdit2 size={16} />
                Editar
              </button>
              <button
                onClick={() => handleDeleteAI(contextMenu.item.id)}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-3"
              >
                <FiTrash2 size={16} />
                Eliminar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openFolderModal()}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <FiFolder size={16} />
                Nueva Carpeta
              </button>
              <button
                onClick={() => openAIModal()}
                className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <FiPlus size={16} />
                Nuevo Recurso IA
              </button>
            </>
          )}
        </div>
      )}

      {/* Folder Modal */}
      <Modal isOpen={showFolderModal} onClose={closeFolderModal} title={editingFolder ? 'Editar Carpeta' : 'Nueva Carpeta'}>
        <form onSubmit={handleFolderSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nombre</label>
            <input
              type="text"
              value={folderForm.name}
              onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
            <textarea
              value={folderForm.description}
              onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              rows="2"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg transition-all"
            >
              {editingFolder ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={closeFolderModal}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Resource Modal */}
      <Modal isOpen={showAIModal} onClose={closeAIModal} title={editingAI ? 'Editar Recurso IA' : 'Nuevo Recurso IA'}>
        <form onSubmit={handleAISubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nombre</label>
            <input
              type="text"
              value={aiForm.name}
              onChange={(e) => setAiForm({ ...aiForm, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">URL</label>
            <input
              type="url"
              value={aiForm.url}
              onChange={(e) => setAiForm({ ...aiForm, url: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Carpeta</label>
            <select
              value={aiForm.folderId}
              onChange={(e) => setAiForm({ ...aiForm, folderId: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
            >
              <option value="">Sin carpeta</option>
              {folderList.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.parentId ? '  └─ ' : ''}{folder.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Descripción</label>
            <textarea
              value={aiForm.description}
              onChange={(e) => setAiForm({ ...aiForm, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              rows="3"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg transition-all"
            >
              {editingAI ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={closeAIModal}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div >
  );
}
