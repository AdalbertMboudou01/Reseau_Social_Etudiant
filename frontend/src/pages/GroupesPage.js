import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGroupes, createGroupe, joinGroupe, leaveGroupe } from '../services/api';
import { Users, Plus, AlertCircle, X, LogIn, LogOut, Crown } from 'lucide-react';

export default function GroupesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => { loadGroupes(); }, []);

  const loadGroupes = async () => {
    setLoading(true);
    try {
      const res = await getGroupes();
      setGroupes(res.data);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await createGroupe(form);
      setForm({ nom: '', description: '' });
      setShowForm(false);
      loadGroupes();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création.');
    } finally { setCreating(false); }
  };

  const handleJoin = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await joinGroupe(id);
      loadGroupes();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleLeave = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await leaveGroupe(id);
      loadGroupes();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const isMember = (groupe) => {
    return groupe.membres?.some(m => m.id === user?.id);
  };

  const isCreateur = (groupe) => groupe.createur?.id === user?.id;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Groupes</h1>
          <p className="page-subtitle">Rejoins des groupes d'étudiants selon tes intérêts</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Annuler' : 'Créer un groupe'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card fade-in" style={{ marginBottom: 24, border: '1px solid rgba(108,99,255,0.3)' }}>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Nouveau groupe</h3>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={15} />
              {error}
            </div>
          )}
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
                Nom du groupe *
              </label>
              <input
                className="input-field"
                placeholder="Ex: Informatique L3 - Sorbonne"
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
                Description
              </label>
              <textarea
                className="input-field"
                placeholder="Décris l'objectif de ce groupe..."
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating || !form.nom.trim()}
            >
              {creating ? 'Création...' : 'Créer le groupe'}
            </button>
          </form>
        </div>
      )}

      {/* Groups list */}
      {loading ? (
        <span className="spinner" />
      ) : groupes.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>Aucun groupe</h3>
          <p>Soyez le premier à créer un groupe !</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {groupes.map(groupe => {
            const member = isMember(groupe);
            const creator = isCreateur(groupe);
            const busy = actionLoading[groupe.id];

            return (
              <div key={groupe.id} className="card fade-in" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                gap: 16,
              }}>
                {/* Cliquable group content */}
                <div
                  style={{ display: 'flex', gap: 14, flex: 1, minWidth: 0, cursor: 'pointer' }}
                  onClick={() => navigate(`/groupes/${groupe.id}`)}
                >
                  {/* Icon */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,170,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--border)',
                  }}>
                    <Users size={20} color="var(--accent)" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700 }}>{groupe.nom}</h3>
                      {creator && (
                        <span className="tag" style={{ background: 'rgba(255,200,0,0.12)', color: '#ffc000', fontSize: 11, padding: '2px 8px' }}>
                          <Crown size={10} style={{ marginRight: 4 }} />
                          Créateur
                        </span>
                      )}
                      {member && !creator && (
                        <span className="tag tag-green" style={{ fontSize: 11, padding: '2px 8px' }}>
                          Membre
                        </span>
                      )}
                    </div>

                    {groupe.description && (
                      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8, lineHeight: 1.5 }}>
                        {groupe.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={12} />
                        {groupe.membresCount} membre{groupe.membresCount !== 1 ? 's' : ''}
                      </span>
                      <span>
                        Par{' '}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/users/${groupe.createur.id}`;
                          }}
                          style={{ cursor: 'pointer', color: 'var(--accent)', fontWeight: 500 }}
                        >
                          {groupe.createur.prenom} {groupe.createur.nom}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div onClick={e => e.stopPropagation()}>
                  {!creator && (
                    member ? (
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleLeave(groupe.id)}
                        disabled={busy}
                        style={{ whiteSpace: 'nowrap', fontSize: 13 }}
                      >
                        <LogOut size={14} />
                        {busy ? '...' : 'Quitter'}
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleJoin(groupe.id)}
                        disabled={busy}
                        style={{ whiteSpace: 'nowrap', fontSize: 13 }}
                      >
                        <LogIn size={14} />
                        {busy ? '...' : 'Rejoindre'}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
