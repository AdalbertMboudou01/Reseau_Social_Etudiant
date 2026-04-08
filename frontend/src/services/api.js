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

// ── Simple in-memory GET cache (TTL = 10 s) ──────────────────────────────────
const _cache = new Map();
const CACHE_TTL = 10_000;

export function cachedGet(url, params = {}) {
  const key = url + JSON.stringify(params);
  const hit = _cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return Promise.resolve(hit.data);
  const req = api.get(url, { params }).then(res => {
    _cache.set(key, { ts: Date.now(), data: res });
    return res;
  });
  return req;
}

export function invalidateCache(prefix) {
  for (const key of _cache.keys()) {
    if (key.startsWith(prefix)) _cache.delete(key);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

// Auth
export const login = (data) => api.post('/login', data);
export const register = (data) => api.post('/register', data);
export const getProfile = () => cachedGet('/profile');
export const getPublicProfile = (userId) => cachedGet(`/users/${userId}`);
export const updateProfile = (data) => { invalidateCache('/profile'); return api.put('/profile', data); };

// Publications
export const getPublications = (params = {}) => cachedGet('/publications', params);
export const getPublication = (id) => cachedGet(`/publications/${id}`);
export const createPublication = (data) => { invalidateCache('/publications'); return api.post('/publications', data); };
export const updatePublication = (id, data) => { invalidateCache('/publications'); return api.put(`/publications/${id}`, data); };
export const deletePublication = (id) => { invalidateCache('/publications'); return api.delete(`/publications/${id}`); };
export const likePublication = (id) => api.post(`/publications/${id}/like`);

// Commentaires
export const getCommentaires = (pubId) => cachedGet(`/publications/${pubId}/commentaires`);
export const createCommentaire = (pubId, data) => { invalidateCache(`/publications/${pubId}/commentaires`); return api.post(`/publications/${pubId}/commentaires`, data); };
export const deleteCommentaire = (pubId, id) => { invalidateCache(`/publications/${pubId}/commentaires`); return api.delete(`/publications/${pubId}/commentaires/${id}`); };

// Groupes
export const getGroupes = () => cachedGet('/groupes');
export const getGroupe = (id) => cachedGet(`/groupes/${id}`);
export const createGroupe = (data) => { invalidateCache('/groupes'); return api.post('/groupes', data); };
export const joinGroupe = (id) => { invalidateCache('/groupes'); return api.post(`/groupes/${id}/join`); };
export const leaveGroupe = (id) => { invalidateCache('/groupes'); return api.post(`/groupes/${id}/leave`); };
export const deleteGroupe = (id) => { invalidateCache('/groupes'); return api.delete(`/groupes/${id}`); };

// Messages de groupe
export const getGroupMessages = (id) => api.get(`/groupes/${id}/messages`);
export const sendGroupMessage = (id, data) => api.post(`/groupes/${id}/messages`, data);

// Cours
export const getCours = () => cachedGet('/cours');
export const getCour = (id) => cachedGet(`/cours/${id}`);
export const createCours = (data) => { invalidateCache('/cours'); return api.post('/cours', data); };
export const updateCours = (id, data) => { invalidateCache('/cours'); return api.put(`/cours/${id}`, data); };
export const publishCours = (id) => { invalidateCache('/cours'); return api.patch(`/cours/${id}/publish`); };
export const deleteCours = (id) => { invalidateCache('/cours'); return api.delete(`/cours/${id}`); };

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
export const getFriends = () => cachedGet('/amis');
export const getPendingRequests = () => cachedGet('/amis/demandes');
export const getSentRequests = () => cachedGet('/amis/sent');
export const getSuggestions = () => cachedGet('/amis/suggestions');
export const sendFriendRequest = (userId) => { invalidateCache('/amis'); return api.post(`/amis/send/${userId}`); };
export const acceptFriendRequest = (amitieId) => { invalidateCache('/amis'); return api.patch(`/amis/${amitieId}/accept`); };
export const rejectFriendRequest = (amitieId) => { invalidateCache('/amis'); return api.patch(`/amis/${amitieId}/reject`); };
export const removeFriend = (userId) => { invalidateCache('/amis'); return api.delete(`/amis/${userId}`); };
export const getRelationshipStatus = (userId) => cachedGet(`/amis/status/${userId}`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const getUnreadCount = () => cachedGet('/notifications/unread/count');
export const getUnreadNotifications = () => api.get('/notifications/unread');
export const markNotificationAsRead = (id) => { invalidateCache('/notifications'); return api.patch(`/notifications/${id}/read`); };
export const markAllNotificationsAsRead = () => { invalidateCache('/notifications'); return api.patch('/notifications/read-all'); };

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
