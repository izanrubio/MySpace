import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  syncGitHub: () => api.post('/auth/github/sync'),
};

// Repositories
export const repositories = {
  getAll: () => api.get('/repositories'),
  getById: (id) => api.get(`/repositories/${id}`),
  create: (data) => api.post('/repositories', data),
  createGitHub: (data) => api.post('/repositories/github', data),
  sync: () => api.post('/repositories/sync'),
  update: (id, data) => api.put(`/repositories/${id}`, data),
  delete: (id) => api.delete(`/repositories/${id}`),
};

// Folders
export const folders = {
  getAll: () => api.get('/folders'),
  getById: (id) => api.get(`/folders/${id}`),
  create: (data) => api.post('/folders', data),
  update: (id, data) => api.put(`/folders/${id}`, data),
  delete: (id) => api.delete(`/folders/${id}`),
};

// AI Resources
export const aiResources = {
  getAll: (folderId) => api.get('/ai-resources', { params: { folderId } }),
  getById: (id) => api.get(`/ai-resources/${id}`),
  create: (data) => api.post('/ai-resources', data),
  update: (id, data) => api.put(`/ai-resources/${id}`, data),
  delete: (id) => api.delete(`/ai-resources/${id}`),
};

// Projects
export const projects = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  updateStatus: (id, status) => api.patch(`/projects/${id}/status`, { status }),
  delete: (id) => api.delete(`/projects/${id}`),
  addRepository: (id, repoId) => api.post(`/projects/${id}/repositories`, { repoId }),
  removeRepository: (id, repoId) => api.delete(`/projects/${id}/repositories/${repoId}`),
  addAIResource: (id, aiResourceId) => api.post(`/projects/${id}/ai-resources`, { aiResourceId }),
  removeAIResource: (id, aiResourceId) => api.delete(`/projects/${id}/ai-resources/${aiResourceId}`),
  addLanguage: (id, languageId) => api.post(`/projects/${id}/languages`, { languageId }),
  removeLanguage: (id, languageId) => api.delete(`/projects/${id}/languages/${languageId}`),
  addLink: (id, data) => api.post(`/projects/${id}/links`, data),
  removeLink: (id, linkId) => api.delete(`/projects/${id}/links/${linkId}`),
  share: (id, email, role) => api.post(`/projects/${id}/share`, { email, role }),
  getShares: (id) => api.get(`/projects/${id}/shares`),
  updateShareRole: (id, userId, role) => api.put(`/projects/${id}/shares/${userId}`, { role }),
  removeShare: (id, userId) => api.delete(`/projects/${id}/shares/${userId}`),
};

// Search
export const search = {
  global: (q, tags) => api.get('/search', { params: { q, tags } }),
  getTags: () => api.get('/search/tags'),
};

// Languages
export const languages = {
  getAll: () => api.get('/languages'),
  getById: (id) => api.get(`/languages/${id}`),
  create: (data) => api.post('/languages', data),
  update: (id, data) => api.put(`/languages/${id}`, data),
  delete: (id) => api.delete(`/languages/${id}`),
};

// Notifications
export const notifications = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  accept: (id) => api.post(`/notifications/${id}/accept`),
  reject: (id) => api.post(`/notifications/${id}/reject`),
};

export default api;
