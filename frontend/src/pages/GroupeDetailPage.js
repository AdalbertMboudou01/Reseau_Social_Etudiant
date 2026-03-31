import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGroupe, leaveGroupe, sendGroupMessage } from '../services/api';
import { Users, ArrowLeft, LogOut, MessageCircle, Send } from 'lucide-react';

export default function GroupeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groupe, setGroupe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadGroupe();
  }, [id]);

  const loadGroupe = async () => {
    setLoading(true);
    try {
      const res = await getGroupe(id);
      setGroupe(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/groupes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Êtes-vous sûr de vouloir quitter ce groupe ?')) return;

    try {
      await leaveGroupe(id);
      navigate('/groupes');
    } catch (err) {
      alert('Erreur lors de la sortie du groupe');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await sendGroupMessage(id, { contenu: message });
      setMessage('');
      // Recharger les messages
      loadGroupe();
    } catch (err) {
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const isMember = () => {
    return groupe?.membres?.some(m => m.id === user?.id);
  };

  const isCreateur = () => groupe?.createur?.id === user?.id;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <span className="spinner" />
      </div>
    );
  }

  if (!groupe) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h2>Groupe introuvable</h2>
        <button className="btn btn-primary" onClick={() => navigate('/groupes')}>
          Retour aux groupes
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/groupes')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text2)',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ArrowLeft size={20} />
          Retour
        </button>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{groupe.nom}</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            {groupe.membresCount} membre{groupe.membresCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        {/* Chat area */}
        <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageCircle size={20} />
              Conversations
            </h3>
          </div>

          {/* Messages area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            {groupe.messages?.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>
                <MessageCircle size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <p>Aucun message dans ce groupe.</p>
                <p>Soyez le premier à démarrer la conversation !</p>
              </div>
            ) : (
              groupe.messages?.map(message => (
                <div key={message.id} style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}>
                    {message.auteur.prenom[0]}{message.auteur.nom[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span
                        onClick={() => window.location.href = `/users/${message.auteur.id}`}
                        style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer', color: 'var(--accent)' }}
                      >
                        {message.auteur.prenom} {message.auteur.nom}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.5 }}>
                      {message.contenu}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message input */}
          {isMember() && (
            <form onSubmit={handleSendMessage} style={{
              padding: 20,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 12,
            }}>
              <input
                type="text"
                className="input-field"
                placeholder="Tapez votre message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending || !message.trim()}
                style={{ padding: '12px 16px' }}
              >
                <Send size={16} />
              </button>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Group info */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12 }}>À propos</h3>
            {groupe.description && (
              <p style={{ color: 'var(--text2)', marginBottom: 16, lineHeight: 1.5 }}>
                {groupe.description}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text3)' }}>
              <Users size={16} />
              Créé par{' '}
              <span
                onClick={() => window.location.href = `/users/${groupe.createur.id}`}
                style={{ cursor: 'pointer', color: 'var(--accent)', fontWeight: 600 }}
              >
                {groupe.createur.prenom} {groupe.createur.nom}
              </span>
            </div>
          </div>

          {/* Members */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12 }}>Membres ({groupe.membresCount})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {groupe.membres?.map(membre => (
                <div key={membre.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 8,
                  borderRadius: 8,
                  background: 'var(--bg2)',
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 600,
                  }}>
                    {membre.prenom[0]}{membre.nom[0]}
                  </div>
                  <div>
                    <div
                      onClick={() => window.location.href = `/users/${membre.id}`}
                      style={{ fontWeight: 500, fontSize: 14, cursor: 'pointer', color: 'var(--accent)' }}
                    >
                      {membre.prenom} {membre.nom}
                    </div>
                    {membre.id === groupe.createur.id && (
                      <span style={{
                        fontSize: 12,
                        color: 'var(--accent)',
                        background: 'rgba(108,99,255,0.1)',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}>
                        Créateur
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {isMember() && !isCreateur() && (
            <div className="card">
              <button
                className="btn btn-secondary"
                onClick={handleLeave}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LogOut size={16} style={{ marginRight: 8 }} />
                Quitter le groupe
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}