import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConversations } from '../services/api';
import { MessageCircle, Users } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Mes Messages</h1>
        <p className="page-subtitle">Conversations privées avec tes camarades</p>
      </div>

      {loading ? (
        <span className="spinner" />
      ) : conversations.length === 0 ? (
        <div className="empty-state">
          <MessageCircle size={48} />
          <h3>Aucun message</h3>
          <p>Commence une conversation avec tes camarades !</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => navigate(`/chat/${conv.id}`)}
              className="card fade-in"
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg3)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg2)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div className="avatar">
                  {conv.photo ? <img src={conv.photo} alt="avatar" /> : conv.prenom[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {conv.prenom} {conv.nom}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>{conv.email}</div>
                </div>
                <MessageCircle size={18} color="var(--accent)" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
