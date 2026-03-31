import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFriends, getPendingRequests, getSentRequests, getSuggestions, acceptFriendRequest, rejectFriendRequest, removeFriend, sendFriendRequest } from '../services/api';
import { Users, UserCheck, Clock, Send, Trash2, X, Sparkles, UserPlus } from 'lucide-react';

export default function FriendsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('friends'); // friends, pending, sent, suggestions
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger chaque requête individuellement pour mieux gérer les erreurs
      try {
        const res = await getFriends();
        setFriends(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.error('Erreur getFriends:', err);
        setFriends([]);
      }
      
      try {
        const res = await getPendingRequests();
        setPendingRequests(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.error('Erreur getPendingRequests:', err);
        setPendingRequests([]);
      }
      
      try {
        const res = await getSentRequests();
        setSentRequests(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.error('Erreur getSentRequests:', err);
        setSentRequests([]);
      }
      
      try {
        const res = await getSuggestions();
        setSuggestions(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.error('Erreur getSuggestions:', err);
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Erreur générale:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (amitieId) => {
    setActionLoading(prev => ({ ...prev, [amitieId]: true }));
    try {
      await acceptFriendRequest(amitieId);
      setPendingRequests(prev => prev.filter(r => r.id !== amitieId));
      loadData();
    } catch (err) {
      alert('Erreur');
    } finally {
      setActionLoading(prev => ({ ...prev, [amitieId]: false }));
    }
  };

  const handleReject = async (amitieId) => {
    setActionLoading(prev => ({ ...prev, [amitieId]: true }));
    try {
      await rejectFriendRequest(amitieId);
      setPendingRequests(prev => prev.filter(r => r.id !== amitieId));
    } catch (err) {
      alert('Erreur');
    } finally {
      setActionLoading(prev => ({ ...prev, [amitieId]: false }));
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Êtes-vous sûr ?')) return;
    
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await removeFriend(userId);
      setFriends(prev => prev.filter(f => f.id !== userId));
    } catch (err) {
      alert('Erreur');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleAddSuggestion = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await sendFriendRequest(userId);
      setSuggestions(prev => prev.filter(s => s.id !== userId));
    } catch (err) {
      alert('Erreur lors de l\'envoi de la demande');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const FriendCard = ({ friend, onMessage, onRemove }) => (
    <div className="card fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
        <div className="avatar" style={{ width: 40, height: 40, fontSize: '16px', flexShrink: 0 }}>
          {friend.photo ? <img src={friend.photo} alt="avatar" /> : friend.prenom?.[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            onClick={() => navigate(`/users/${friend.id}`)}
            style={{ fontWeight: 700, fontSize: 14, cursor: 'pointer', color: 'var(--accent)', marginBottom: 2 }}
          >
            {friend.prenom} {friend.nom}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>{friend.email}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={onMessage} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: 12 }}>
          Écrire
        </button>
        <button
          onClick={onRemove}
          className="btn btn-danger"
          style={{ padding: '8px 12px' }}
          title="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  const RequestCard = ({ request, type, onAccept, onReject }) => {
    const person = type === 'pending' ? request.from : request.to;
    
    return (
      <div className="card fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
          <div className="avatar" style={{ width: 40, height: 40, fontSize: '16px', flexShrink: 0 }}>
            {person.photo ? <img src={person.photo} alt="avatar" /> : person.prenom?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              onClick={() => navigate(`/users/${person.id}`)}
              style={{ fontWeight: 700, fontSize: 14, cursor: 'pointer', color: 'var(--accent)', marginBottom: 2 }}
            >
              {person.prenom} {person.nom}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{person.email}</div>
          </div>
        </div>
        {type === 'pending' ? (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => onAccept(request.id)}
              className="btn btn-success"
              style={{ padding: '8px 12px', fontSize: 12, gap: 4 }}
              disabled={actionLoading[request.id]}
            >
              <UserCheck size={14} />
              Accepter
            </button>
            <button
              onClick={() => onReject(request.id)}
              className="btn btn-danger"
              style={{ padding: '8px 12px' }}
              disabled={actionLoading[request.id]}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={14} />
            En attente
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Amis</h1>
          <p className="page-subtitle">Gère tes relations d'amitié</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'friends', label: `Amis (${friends.length})`, icon: UserCheck },
          { key: 'pending', label: `Demandes reçues (${pendingRequests.length})`, icon: Clock },
          { key: 'sent', label: `Demandes envoyées (${sentRequests.length})`, icon: Send },
          { key: 'suggestions', label: `Suggestions (${suggestions.length})`, icon: Sparkles },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 16px',
              borderBottom: tab === key ? '2px solid var(--accent)' : 'none',
              color: tab === key ? 'var(--accent)' : 'var(--text3)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: tab === key ? 600 : 500,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <span className="spinner" />
          <p>Chargement...</p>
        </div>
      ) : tab === 'friends' ? (
        friends.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>Aucun ami</h3>
            <p>Ajoute tes camarades en amis !</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {friends.map(friend => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onMessage={() => navigate(`/chat/${friend.id}`)}
                onRemove={() => handleRemove(friend.id)}
              />
            ))}
          </div>
        )
      ) : tab === 'pending' ? (
        pendingRequests.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <h3>Aucune demande</h3>
            <p>Tu n'as aucune demande d'amitié en attente.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {pendingRequests.map(request => (
              <RequestCard
                key={request.id}
                request={request}
                type="pending"
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        )
      ) : tab === 'sent' ? (
        sentRequests.length === 0 ? (
          <div className="empty-state">
            <Send size={48} />
            <h3>Aucune demande</h3>
            <p>Tu n'as envoyé aucune demande d'amitié.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {sentRequests.map(request => (
              <RequestCard
                key={request.id}
                request={request}
                type="sent"
              />
            ))}
          </div>
        )
      ) : (
        suggestions.length === 0 ? (
          <div className="empty-state">
            <Sparkles size={48} />
            <h3>Aucune suggestion</h3>
            <p>Tu es bien connecté ! Reviens plus tard pour découvrir de nouvelles personnes.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {suggestions.map(suggestion => (
              <div key={suggestion.id} className="card fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                  <div className="avatar" style={{ width: 40, height: 40, fontSize: '16px', flexShrink: 0 }}>
                    {suggestion.photo ? <img src={suggestion.photo} alt="avatar" /> : suggestion.prenom?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      onClick={() => navigate(`/users/${suggestion.id}`)}
                      style={{ fontWeight: 700, fontSize: 14, cursor: 'pointer', color: 'var(--accent)', marginBottom: 2 }}
                    >
                      {suggestion.prenom} {suggestion.nom}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{suggestion.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleAddSuggestion(suggestion.id)}
                  className="btn btn-primary"
                  style={{ padding: '8px 12px', fontSize: 12, gap: 6, whiteSpace: 'nowrap' }}
                  disabled={actionLoading[suggestion.id]}
                >
                  <UserPlus size={14} />
                  Ajouter
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
