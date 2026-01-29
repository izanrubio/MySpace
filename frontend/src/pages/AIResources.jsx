import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiFolder, FiChevronRight, FiChevronDown, FiExternalLink, FiCpu, FiSearch } from 'react-icons/fi';
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
  const [searchQuery, setSearchQuery] = useState('');

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
    if (confirm('Delete this folder and its contents?')) {
      try {
        await folders.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting folder:', error);
      }
    }
  };

  const handleDeleteAI = async (id) => {
    if (confirm('Delete this AI resource?')) {
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

  const getUnfiledAIs = () => {
    return aiList.filter((ai) => !ai.folderId);
  };

  const filteredAIs = getUnfiledAIs().filter(ai =>
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

  const getTypeColor = (type) => {
    const colors = {
      'web': 'from-blue-500 to-cyan-500',
      'local': 'from-green-500 to-emerald-500',
      'api': 'from-orange-500 to-red-500',
    };
    return colors[type] || 'from-purple-500 to-pink-500';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Resources</h1>
          <p className="text-slate-400">Manage your AI tools and resources</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openFolderModal()}
            className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
          >
            <FiFolder size={18} />
            New Folder
          </button>
          <button
            onClick={() => openAIModal()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
          >
            <FiPlus size={20} />
            New AI Resource
          </button>
        </div>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search AI resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
        />
      </div>

      <div className="space-y-6">
        {/* Folders Section */}
        {folderList.length > 0 && (
          <div className="space-y-4">
            {folderList.filter(folder => !folder.parentId).map((folder) => (
              <div key={folder.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                {/* Folder Header */}
                <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleFolder(folder.id)}>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                      <FiFolder className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{folder.name}</h3>
                      {folder.description && (
                        <p className="text-sm text-slate-400">{folder.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {aiList.filter(ai => ai.folderId === folder.id).length} recursos
                      </span>
                      {expandedFolders.has(folder.id) ? (
                        <FiChevronDown className="text-slate-400" size={20} />
                      ) : (
                        <FiChevronRight className="text-slate-400" size={20} />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openFolderModal(folder);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/10 transition-all"
                      title="Edit Folder"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-all"
                      title="Delete Folder"
                    >
                      <FiTrash2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAIModal(null, folder.id);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-white/10 transition-all"
                      title="Add AI Resource"
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>
                </div>

                {/* Folder Contents */}
                {expandedFolders.has(folder.id) && (
                  <div className="p-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {aiList
                        .filter((ai) => ai.folderId === folder.id)
                        .filter(ai =>
                          ai.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ai.description?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((ai) => (
                          <div
                            key={ai.id}
                            className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${getTypeColor(ai.type)} shadow-lg`}>
                                <FiCpu className="text-white" size={16} />
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openAIModal(ai)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/10 transition-all"
                                  title="Edit"
                                >
                                  <FiEdit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteAI(ai.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-all"
                                  title="Delete"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </div>

                            <h4 className="text-base font-semibold text-white mb-2">{ai.name}</h4>

                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-slate-300 font-medium uppercase">
                                {ai.type}
                              </span>
                            </div>

                            {ai.description && (
                              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{ai.description}</p>
                            )}

                            <a
                              href={ai.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <FiExternalLink size={12} />
                              <span className="truncate">{ai.url}</span>
                            </a>
                          </div>
                        ))}
                    </div>
                    {aiList.filter((ai) => ai.folderId === folder.id).length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        No AI resources in this folder
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Unfiled AI Resources */}
        {filteredAIs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Unfiled Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAIs.map((ai) => (
                <div
                  key={ai.id}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${getTypeColor(ai.type)} shadow-lg`}>
                      <FiCpu className="text-white" size={20} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openAIModal(ai)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/10 transition-all"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAI(ai.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition-all"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{ai.name}</h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-white/10 rounded-lg text-xs text-slate-300 font-medium uppercase">
                      {ai.type}
                    </span>
                  </div>

                  {ai.description && (
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{ai.description}</p>
                  )}

                  <a
                    href={ai.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <FiExternalLink size={14} />
                    <span className="truncate">{ai.url}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {folderList.length === 0 && filteredAIs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No AI resources or folders found. Create your first folder or AI resource to get started!
          </div>
        )}
      </div>

      <Modal isOpen={showFolderModal} onClose={closeFolderModal} title={editingFolder ? 'Edit Folder' : 'New Folder'}>
        <form onSubmit={handleFolderSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input
              type="text"
              value={folderForm.name}
              onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
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
              {editingFolder ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={closeFolderModal}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAIModal} onClose={closeAIModal} title={editingAI ? 'Edit AI Resource' : 'New AI Resource'}>
        <form onSubmit={handleAISubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input
              type="text"
              value={aiForm.name}
              onChange={(e) => setAiForm({ ...aiForm, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              required
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
            <select
              value={aiForm.type}
              onChange={(e) => setAiForm({ ...aiForm, type: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
              required
            >
              <option value="web">Web</option>
              <option value="local">Local</option>
              <option value="api">API</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
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
              {editingAI ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={closeAIModal}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
