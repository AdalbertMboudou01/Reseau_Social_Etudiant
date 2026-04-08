import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import './styles/global.css';
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const GroupesPage = lazy(() => import('./pages/GroupesPage'));
const GroupeDetailPage = lazy(() => import('./pages/GroupeDetailPage'));
const CoursPage = lazy(() => import('./pages/CoursPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const ProfilPage = lazy(() => import('./pages/ProfilPage'));
const PublicProfilPage = lazy(() => import('./pages/PublicProfilPage'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const NotificationCenter = lazy(() => import('./pages/NotificationCenter'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const EventCreatePage = lazy(() => import('./pages/EventCreatePage'));

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
    <Suspense fallback={<span className="spinner" />}>
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
    </Suspense>
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
