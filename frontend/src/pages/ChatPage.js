import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConversation, sendPrivateMessage } from '../services/api';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';

const POLL_INTERVAL = 5000;

export default function ChatPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getConversation(userId);
      setConversation(res.data);
    } catch (err) {
      if (!silent) {
        console.error(err);
        navigate('/messages');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userId, navigate]);

  useEffect(() => {
    loadConversation();
    pollRef.current = setInterval(() => loadConversation(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [loadConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages?.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const optimistic = {
      id: `tmp-${Date.now()}`,
      contenu: message,
      createdAt: new Date().toISOString(),
      expediteur: { id: user?.id, prenom: user?.prenom, photo: user?.photo },
    };

    setConversation(prev => prev
      ? { ...prev, messages: [...(prev.messages || []), optimistic] }
      : prev
    );
    setMessage('');
    setSending(true);

    try {
      await sendPrivateMessage(userId, { contenu: optimistic.contenu });
      loadConversation(true);
    } catch {
      alert("Erreur lors de l'envoi du message");
      setConversation(prev => prev
        ? { ...prev, messages: (prev.messages || []).filter(m => m.id !== optimistic.id) }
        : prev
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <span className="spinner" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p>Conversation non trouvée</p>
      </div>
    );
  }

  const { interlocuteur, messages } = conversation;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={() => navigate('/messages')}
          className="btn btn-secondary"
          style={{ padding: '9px 14px' }}
        >
          <ArrowLeft size={16} />
          Retour
        </button>
        <h1
          className="page-title"
          onClick={() => window.location.href = `/users/${interlocuteur.id}`}
          style={{ margin: 0, cursor: 'pointer', color: 'var(--accent)' }}
        >
          {interlocuteur.prenom} {interlocuteur.nom}
        </h1>
        <div style={{ width: 80 }} />
      </div>

      <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar">
              {interlocuteur.photo ? <img src={interlocuteur.photo} alt="avatar" /> : interlocuteur.prenom[0]}
            </div>
            <div
              onClick={() => window.location.href = `/users/${interlocuteur.id}`}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent)' }}>
                {interlocuteur.prenom} {interlocuteur.nom}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{interlocuteur.email}</div>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {messages?.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 40, margin: 'auto' }}>
              <MessageCircle size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <p>Aucun message pour le moment.</p>
              <p>Démarrez une conversation !</p>
            </div>
          ) : (
            messages?.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-end',
                  justifyContent: msg.expediteur.id === user?.id ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.expediteur.id !== user?.id && (
                  <div className="avatar" style={{ width: 28, height: 28 }}>
                    {msg.expediteur.photo ? <img src={msg.expediteur.photo} alt="avatar" /> : msg.expediteur.prenom[0]}
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '60%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: msg.expediteur.id === user?.id ? 'var(--accent)' : 'var(--bg3)',
                    color: msg.expediteur.id === user?.id ? 'white' : 'var(--text)',
                    wordWrap: 'break-word',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>{msg.contenu}</p>
                  <div style={{
                    fontSize: 11,
                    color: msg.expediteur.id === user?.id ? 'rgba(255,255,255,0.7)' : 'var(--text3)',
                    marginTop: 4,
                  }}>
                    {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} style={{
          padding: 16,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 10,
        }}>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Écris ton message..."
            className="input-field"
            style={{ flex: 1, margin: 0 }}
            disabled={sending}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={sending || !message.trim()}
            style={{ padding: '9px 14px', minWidth: 'auto' }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
