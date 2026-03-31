import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Eye } from 'lucide-react';
import { getNotifications, getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        let data;
        if (filter === 'unread') {
          const response = await getUnreadNotifications();
          data = response.data;
        } else {
          const response = await getNotifications(page);
          data = response.data;
        }
        setNotifications(data);
        setHasMore(data.length >= 50);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [filter, page]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, lue: true, readAt: new Date().toISOString() } : n
      ));
    } catch (error) {
      console.error('Erreur lors de la marque comme lu:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ 
        ...n, 
        lue: true, 
        readAt: new Date().toISOString() 
      })));
    } catch (error) {
      console.error('Erreur lors de la marque de toutes comme lues:', error);
    }
  };

  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case 'like':
        return `/publication/${notification.relatedId}`;
      case 'comment':
        return `/publication/${notification.relatedId}`;
      case 'message':
        return `/messages`;
      case 'friend_request':
        return `/amis`;
      case 'group_invite':
        return `/groupes/${notification.relatedId}`;
      default:
        return '#';
    }
  };

  const getNotificationMessage = (notification) => {
    const authorName = notification.auteur?.prenom && notification.auteur?.nom
      ? `${notification.auteur.prenom} ${notification.auteur.nom}`
      : 'Quelqu\'un';

    switch (notification.type) {
      case 'like':
        return `${authorName} a aimé votre publication`;
      case 'comment':
        return `${authorName} a commenté votre publication`;
      case 'message':
        return `Nouveau message de ${authorName}`;
      case 'friend_request':
        return `${authorName} vous a envoyé une demande d'amitié`;
      case 'group_invite':
        return `${authorName} vous a invité à un groupe`;
      default:
        return notification.contenu || 'Nouvelle notification';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'message':
        return '✉️';
      case 'friend_request':
        return '👥';
      case 'group_invite':
        return '📁';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}m`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return date.toLocaleDateString('fr-FR');
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.lue)
    : notifications;

  const unreadCount = notifications.filter(n => !n.lue).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Bell size={24} />
          <h1 style={{ margin: 0 }}>Centre de notifications</h1>
        </div>
        
        {unreadCount > 0 && (
          <div style={{ fontSize: 14, color: 'var(--text2)' }}>
            {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => { setFilter('all'); setPage(1); }}
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, minWidth: 120 }}
        >
          Toutes ({notifications.length})
        </button>
        <button
          onClick={() => { setFilter('unread'); setPage(1); }}
          className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, minWidth: 120 }}
        >
          Non lues ({unreadCount})
        </button>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: 120 }}
          >
            <CheckCircle size={16} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div>
        {loading && (
          <div style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--text2)' }}>
            Chargement...
          </div>
        )}

        {!loading && filteredNotifications.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 24px',
            background: 'var(--bg2)', borderRadius: 12,
          }}>
            <Bell size={48} style={{ marginBottom: 16, color: 'var(--text3)', opacity: 0.5 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>
              Aucune notification
            </div>
            <div style={{ fontSize: 14, color: 'var(--text3)' }}>
              {filter === 'unread' ? 'Vous êtes à jour!' : 'Vous recevrez des notifications ici'}
            </div>
          </div>
        )}

        {!loading && filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => {
              const link = getNotificationLink(notification);
              if (link !== '#') {
                if (!notification.lue) {
                  handleMarkAsRead(notification.id);
                }
                navigate(link);
              }
            }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px',
              background: notification.lue ? 'var(--bg2)' : 'var(--accent-light)',
              borderLeft: `4px solid ${notification.lue ? 'transparent' : 'var(--accent)'}`,
              borderRadius: 8, marginBottom: 12,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = notification.lue ? 'var(--bg3)' : 'rgba(var(--accent-rgb), 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = notification.lue ? 'var(--bg2)' : 'var(--accent-light)';
            }}
          >
            {/* Icon */}
            <div style={{ fontSize: 24, marginTop: 2 }}>
              {getNotificationIcon(notification.type)}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 600, marginBottom: 4,
                color: 'var(--text)',
              }}>
                {getNotificationMessage(notification)}
              </div>
              <div style={{
                fontSize: 12, color: 'var(--text3)',
              }}>
                {formatDate(notification.createdAt)}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {!notification.lue && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification.id);
                  }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 4, display: 'flex', alignItems: 'center',
                    color: 'var(--accent)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent2)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
                  title="Marquer comme lu"
                >
                  <Eye size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {!loading && hasMore && (
        <button
          onClick={() => setPage(page + 1)}
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: 24 }}
        >
          Plus de notifications
        </button>
      )}
    </div>
  );
}
