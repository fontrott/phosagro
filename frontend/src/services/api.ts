import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const templatesApi = {
  getAll: (params?: { content_type?: string; orientation?: string; is_active?: string }) =>
    api.get('/templates', { params }),
  getById: (id: number) => api.get(`/templates/${id}`),
  getContentTypes: () => api.get('/templates/content-types'),
  getCategories: () => api.get('/templates/categories'),
};

export const projectsApi = {
  getUserProjects: (userId: number) => api.get(`/projects/user/${userId}`),
  getById: (id: number) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: number, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
  addObject: (projectId: number, objectData: any) => 
    api.post(`/projects/${projectId}/objects`, objectData),
  addText: (projectId: number, textData: any) => 
    api.post(`/projects/${projectId}/texts`, textData),
  updateObject: (projectId: number, poId: number, data: any) => 
    api.put(`/projects/${projectId}/objects/${poId}`, data),
  updateText: (projectId: number, ptId: number, data: any) => 
    api.put(`/projects/${projectId}/texts/${ptId}`, data),
  deleteObject: (projectId: number, poId: number) => 
    api.delete(`/projects/${projectId}/objects/${poId}`),
  deleteText: (projectId: number, ptId: number) => 
    api.delete(`/projects/${projectId}/texts/${ptId}`),
};

export const objectsApi = {
  getAll: (params?: { is_public?: string; created_by?: string }) => 
    api.get('/objects', { params }),
  upload: (file: File, data: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', data.name || '');
    formData.append('is_public', data.is_public !== false ? 'true' : 'false');
    if (data.created_by) formData.append('created_by', data.created_by.toString());
    return api.post('/objects/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const backgroundsApi = {
  getAll: (params?: { is_public?: string; created_by?: string }) => 
    api.get('/backgrounds', { params }),
  upload: (file: File, data: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_public', data.is_public !== false ? 'true' : 'false');
    if (data.created_by) formData.append('created_by', data.created_by.toString());
    return api.post('/backgrounds/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const fontsApi = {
  getAll: () => api.get('/fonts'),
};

export const recipientsApi = {
  getUserRecipients: (userId: number) => api.get(`/recipients/user/${userId}`),
  getUserGroups: (userId: number) => api.get(`/recipients/groups/user/${userId}`),
  createRecipient: (data: any) => api.post('/recipients', data),
  createGroup: (data: any) => api.post('/recipients/groups', data),
  sendProject: (data: { project_id: number; recipient_id?: number; group_id?: number }) => 
    api.post('/recipients/send', data),
};

export const exportsApi = {
  create: (data: { project_id: number; format: string; file_url: string }) => 
    api.post('/exports', data),
  getProjectExports: (projectId: number) => api.get(`/exports/project/${projectId}`),
};

export default api;
