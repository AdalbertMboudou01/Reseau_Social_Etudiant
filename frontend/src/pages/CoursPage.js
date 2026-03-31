import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCours, createCours, deleteCours, publishCours } from '../services/api';
import { BookOpen, Plus, X, Trash2, Globe, Lock, FileText, AlertCircle, ExternalLink } from 'lucide-react';

export default function CoursPage() {
  const { user } = useAuth();
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titre: '', description: '', fichier: '', isPublished: true });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadCours(); }, []);

  const loadCours = async () => {
    setLoading(true);
    try {
      const res = await getCours();
      setCours(res.data);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await createCours(form);
      setForm({ titre: '', description: '', fichier: '', isPublished: true });
      setShowForm(false);
      loadCours();
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(errs ? Object.values(errs).join('. ') : 'Erreur lors de la création.');
    } finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce cours ?')) return;
    try {
      await deleteCours(id);
      setCours(c => c.filter(x => x.id !== id));
    } catch {}
  };

  const handlePublish = async (id) => {
    try {
      await publishCours(id);
      loadCours();
    } catch {}
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Cours & Ressources</h1>
          <p className="page-subtitle">Partage et découvre des ressources académiques</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Annuler' : 'Partager un cours'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card fade-in" style={{ marginBottom: 24, border: '1px solid rgba(0,212,170,0.3)' }}>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Nouveau cours</h3>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={15} />
              {error}
            </div>
          )}
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Titre *</label>
              <input className="input-field" placeholder="Ex: Cours d'Algorithmique - L3" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} required />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Description *</label>
              <textarea className="input-field" placeholder="Décris le contenu..." rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} required />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Lien du fichier (optionnel)</label>
              <input className="input-field" placeholder="https://drive.google.com/..." value={form.fichier} onChange={e => setForm({ ...form, fichier: e.target.value })} />
            </div>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="published"
                checked={form.isPublished}
                onChange={e => setForm({ ...form, isPublished: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
              />
              <label htmlFor="published" style={{ fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>
                Publier immédiatement
              </label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating || !form.titre.trim()}>
              {creating ? 'Création...' : 'Partager le cours'}
            </button>
          </form>
        </div>
      )}

      {/* Cours list */}
      {loading ? (
        <span className="spinner" />
      ) : cours.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>Aucun cours partagé</h3>
          <p>Partagez vos ressources pédagogiques !</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {cours.map(c => {
            const isOwner = c.auteur?.id === user?.id;
            return (
              <div key={c.id} className="card fade-in">
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                    background: 'rgba(0,212,170,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(0,212,170,0.2)',
                  }}>
                    <FileText size={20} color="var(--accent2)" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{c.titre}</h3>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 12 }}>
                        {c.isPublished !== undefined && (
                          <span className={`tag ${c.isPublished ? 'tag-green' : 'tag-accent'}`} style={{ fontSize: 11 }}>
                            {c.isPublished ? <Globe size={10} style={{ marginRight: 3 }} /> : <Lock size={10} style={{ marginRight: 3 }} />}
                            {c.isPublished ? 'Publié' : 'Brouillon'}
                          </span>
                        )}
                        {isOwner && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            {!c.isPublished && (
                              <button className="btn btn-success" onClick={() => handlePublish(c.id)} style={{ padding: '5px 10px', fontSize: 12 }}>
                                Publier
                              </button>
                            )}
                            <button className="btn btn-danger" onClick={() => handleDelete(c.id)} style={{ padding: '5px 10px' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.5 }}>
                      {c.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                        Par{' '}
                        <span
                          onClick={() => window.location.href = `/users/${c.auteur.id}`}
                          style={{ cursor: 'pointer', color: 'var(--accent)', fontWeight: 500 }}
                        >
                          {c.auteur.prenom} {c.auteur.nom}
                        </span>
                        {' '}· {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      {c.fichier && (
                        <a
                          href={c.fichier}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ fontSize: 12, padding: '6px 12px', textDecoration: 'none' }}
                        >
                          <ExternalLink size={13} />
                          Ouvrir
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
