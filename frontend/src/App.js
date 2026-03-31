import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import GroupesPage from './pages/GroupesPage';
import GroupeDetailPage from './pages/GroupeDetailPage';
import CoursPage from './pages/CoursPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import ProfilPage from './pages/ProfilPage';
import PublicProfilPage from './pages/PublicProfilPage';
import FriendsPage from './pages/FriendsPage';
import NotificationCenter from './pages/NotificationCenter';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';
import CalendarPage from './pages/CalendarPage';
import EventDetailPage from './pages/EventDetailPage';
import EventCreatePage from './pages/EventCreatePage';
import './styles/global.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <span className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <span className="spinner" />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
      <Route path="/groupes" element={<PrivateRoute><GroupesPage /></PrivateRoute>} />
      <Route path="/groupes/:id" element={<PrivateRoute><GroupeDetailPage /></PrivateRoute>} />
      <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
      <Route path="/chat/:userId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/amis" element={<PrivateRoute><FriendsPage /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><NotificationCenter /></PrivateRoute>} />
      <Route path="/cours" element={<PrivateRoute><CoursPage /></PrivateRoute>} />
      <Route path="/profil" element={<PrivateRoute><ProfilPage /></PrivateRoute>} />
      <Route path="/users/:userId" element={<PrivateRoute><PublicProfilPage /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
      <Route path="/evenements" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
      <Route path="/evenements/nouveau" element={<PrivateRoute><EventCreatePage /></PrivateRoute>} />
      <Route path="/evenements/:id" element={<PrivateRoute><EventDetailPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
