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
export const getPublicProfile = (userId) => api.get(`/users/${userId}`);
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

// Messages de groupe
export const getGroupMessages = (id) => api.get(`/groupes/${id}/messages`);
export const sendGroupMessage = (id, data) => api.post(`/groupes/${id}/messages`, data);

// Cours
export const getCours = () => api.get('/cours');
export const getCour = (id) => api.get(`/cours/${id}`);
export const createCours = (data) => api.post('/cours', data);
export const updateCours = (id, data) => api.put(`/cours/${id}`, data);
export const publishCours = (id) => api.patch(`/cours/${id}/publish`);
export const deleteCours = (id) => api.delete(`/cours/${id}`);

// Messagerie privée
export const getConversations = () => api.get('/messages');
export const getConversation = (userId) => api.get(`/messages/${userId}`);
export const sendPrivateMessage = (userId, data) => api.post(`/messages/${userId}`, data);
export const getMessagesUnreadCount = () => api.get('/messages/unread/count');

// Admin
export const adminGetUsers = () => api.get('/admin/users');
export const adminActivateUser = (id) => api.patch(`/admin/users/${id}/activate`);
export const adminDeactivateUser = (id) => api.patch(`/admin/users/${id}/deactivate`);
export const adminDeleteUser = (id) => api.delete(`/admin/users/${id}`);

// Amitié / Friends
export const getFriends = () => api.get('/amis');
export const getPendingRequests = () => api.get('/amis/demandes');
export const getSentRequests = () => api.get('/amis/sent');
export const getSuggestions = () => api.get('/amis/suggestions');
export const sendFriendRequest = (userId) => api.post(`/amis/send/${userId}`);
export const acceptFriendRequest = (amitieId) => api.patch(`/amis/${amitieId}/accept`);
export const rejectFriendRequest = (amitieId) => api.patch(`/amis/${amitieId}/reject`);
export const removeFriend = (userId) => api.delete(`/amis/${userId}`);
export const getRelationshipStatus = (userId) => api.get(`/amis/status/${userId}`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const getUnreadCount = () => api.get('/notifications/unread/count');
export const getUnreadNotifications = () => api.get('/notifications/unread');
export const markNotificationAsRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => api.patch('/notifications/read-all');

// Search
export const searchGlobal = (query, type = 'all') => api.get('/search', { params: { q: query, type } });
export const getSearchSuggestions = (query) => api.get('/search/suggestions', { params: { q: query } });

// Events
export const getEvenements = (filter = 'upcoming', month = null, year = null, type = null) => 
  api.get('/evenements', { params: { filter, month, year, type } });
export const getEvenement = (id) => api.get(`/evenements/${id}`);
export const createEvenement = (data) => api.post('/evenements', data);
export const updateEvenement = (id, data) => api.put(`/evenements/${id}`, data);
export const deleteEvenement = (id) => api.delete(`/evenements/${id}`);
export const inscrireEvenement = (id) => api.post(`/evenements/${id}/inscrire`);
export const quitterEvenement = (id) => api.post(`/evenements/${id}/quitter`);
export const getMyInscriptions = () => api.get('/evenements/mois-inscriptions');

export default api;
