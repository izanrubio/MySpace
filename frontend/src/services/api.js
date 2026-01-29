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
};

// Repositories
export const repositories = {
  getAll: () => api.get('/repositories'),
  getById: (id) => api.get(`/repositories/${id}`),
  create: (data) => api.post('/repositories', data),
  createGitHub: (data) => api.post('/repositories/github', data),
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
  delete: (id) => api.delete(`/projects/${id}`),
  addRepository: (id, repoId) => api.post(`/projects/${id}/repositories`, { repoId }),
  removeRepository: (id, repoId) => api.delete(`/projects/${id}/repositories/${repoId}`),
  addAIResource: (id, aiResourceId) => api.post(`/projects/${id}/ai-resources`, { aiResourceId }),
  removeAIResource: (id, aiResourceId) => api.delete(`/projects/${id}/ai-resources/${aiResourceId}`),
  addLink: (id, data) => api.post(`/projects/${id}/links`, data),
  removeLink: (id, linkId) => api.delete(`/projects/${id}/links/${linkId}`),
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
  generate: (languageName) => api.post('/languages/generate', { languageName }),
};

export default api;
