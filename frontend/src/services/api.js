import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (data) => api.post('/login', data);
export const register = (data) => api.post('/register', data);
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);

// Publications
export const getPublications = () => api.get('/publications');
export const getPublication = (id) => api.get(`/publications/${id}`);
export const createPublication = (data) => api.post('/publications', data);
export const updatePublication = (id, data) => api.put(`/publications/${id}`, data);
export const deletePublication = (id) => api.delete(`/publications/${id}`);
export const likePublication = (id) => api.post(`/publications/${id}/like`);

// Commentaires
export const getCommentaires = (pubId) => api.get(`/publications/${pubId}/commentaires`);
export const createCommentaire = (pubId, data) => api.post(`/publications/${pubId}/commentaires`, data);
export const deleteCommentaire = (pubId, id) => api.delete(`/publications/${pubId}/commentaires/${id}`);

// Groupes
export const getGroupes = () => api.get('/groupes');
export const getGroupe = (id) => api.get(`/groupes/${id}`);
export const createGroupe = (data) => api.post('/groupes', data);
export const joinGroupe = (id) => api.post(`/groupes/${id}/join`);
export const leaveGroupe = (id) => api.post(`/groupes/${id}/leave`);
export const deleteGroupe = (id) => api.delete(`/groupes/${id}`);

// Cours
export const getCours = () => api.get('/cours');
export const getCour = (id) => api.get(`/cours/${id}`);
export const createCours = (data) => api.post('/cours', data);
export const updateCours = (id, data) => api.put(`/cours/${id}`, data);
export const publishCours = (id) => api.patch(`/cours/${id}/publish`);
export const deleteCours = (id) => api.delete(`/cours/${id}`);

// Admin
export const adminGetUsers = () => api.get('/admin/users');
export const adminActivateUser = (id) => api.patch(`/admin/users/${id}/activate`);
export const adminDeactivateUser = (id) => api.patch(`/admin/users/${id}/deactivate`);
export const adminDeleteUser = (id) => api.delete(`/admin/users/${id}`);

export default api;
