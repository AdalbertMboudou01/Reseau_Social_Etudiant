import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import { User, Edit3, Save, X, GraduationCap, Mail, Building, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

export default function ProfilPage() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    bio: user?.bio || '',
    photo: user?.photo || '',
    universite: user?.universite || '',
    filiere: user?.filiere || '',
    anneeEtude: user?.anneeEtude || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const res = await updateProfile({ ...form, anneeEtude: form.anneeEtude ? parseInt(form.anneeEtude) : undefined });
      setUser({ ...user, ...res.data.user });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errs = err.response?.data?.errors;
      setError(errs ? Object.values(errs).join('. ') : 'Erreur lors de la mise à jour.');
    } finally { setSaving(false); }
  };

  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase();

  const InfoRow = ({ icon: Icon, label, value }) => value ? (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9, background: 'var(--bg3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={15} color="var(--accent)" />
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text)' }}>{value}</div>
      </div>
    </div>
  ) : null;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Mon Profil</h1>
        <p className="page-subtitle">Gérez vos informations personnelles</p>
      </div>

      {/* Profile header card */}
      <div className="card" style={{
        marginBottom: 20,
        background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(0,212,170,0.05) 100%)',
        border: '1px solid rgba(108,99,255,0.2)',
      }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div className="avatar xl" style={{ flexShrink: 0 }}>
            {user?.photo ? <img src={user.photo} alt="" /> : initials}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
              {user?.prenom} {user?.nom}
            </h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 8 }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {user?.roles?.map(r => (
                <span key={r} className={`tag ${r === 'ROLE_ADMIN' ? 'tag-red' : 'tag-accent'}`}>
                  {r === 'ROLE_ADMIN' ? '⚡ Admin' : r === 'ROLE_ETUDIANT' ? '🎓 Étudiant' : r}
                </span>
              ))}
            </div>
          </div>
          {!editing && (
            <button className="btn btn-secondary" onClick={() => setEditing(true)}>
              <Edit3 size={15} />
              Modifier
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="alert alert-success fade-in">
          <CheckCircle size={15} />
          Profil mis à jour avec succès !
        </div>
      )}

      {/* Edit form */}
      {editing ? (
        <div className="card fade-in" style={{ marginBottom: 20, border: '1px solid rgba(108,99,255,0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16 }}>Modifier le profil</h3>
            <button
              onClick={() => { setEditing(false); setError(''); }}
              style={{ background: 'none', color: 'var(--text3)', padding: 6, borderRadius: 8 }}
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Prénom</label>
                <input className="input-field" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Nom</label>
                <input className="input-field" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Photo (URL)</label>
              <input className="input-field" placeholder="https://..." value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Bio</label>
              <textarea className="input-field" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Université</label>
              <input className="input-field" value={form.universite} onChange={e => setForm({ ...form, universite: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Filière</label>
                <input className="input-field" value={form.filiere} onChange={e => setForm({ ...form, filiere: e.target.value })} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Année d'étude</label>
                <input type="number" className="input-field" value={form.anneeEtude} onChange={e => setForm({ ...form, anneeEtude: e.target.value })} min={1} max={8} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={15} />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setError(''); }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Info display */
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Informations</h3>
          {user?.bio && (
            <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--bg3)', borderRadius: 10, fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, borderLeft: '3px solid var(--accent)' }}>
              {user.bio}
            </div>
          )}
          <InfoRow icon={Mail} label="Email" value={user?.email} />
          <InfoRow icon={Building} label="Université" value={user?.universite} />
          <InfoRow icon={BookOpen} label="Filière" value={user?.filiere} />
          <InfoRow icon={GraduationCap} label="Année d'étude" value={user?.anneeEtude ? `${user.anneeEtude}ème année` : null} />
          <InfoRow icon={User} label="Membre depuis" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : null} />

          {!user?.bio && !user?.universite && !user?.filiere && (
            <div style={{ color: 'var(--text3)', fontSize: 14, padding: '16px 0' }}>
              Ton profil est vide. <button onClick={() => setEditing(true)} style={{ background: 'none', color: 'var(--accent)', fontSize: 14 }}>Complète-le !</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
