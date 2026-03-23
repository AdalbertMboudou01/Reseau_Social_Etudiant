import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminGetUsers, adminActivateUser, adminDeactivateUser, adminDeleteUser } from '../services/api';
import { ShieldCheck, Users, UserCheck, UserX, Trash2, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (!isAdmin()) return;
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminGetUsers();
      setUsers(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs.');
    } finally { setLoading(false); }
  };

  const setLoading2 = (id, val) => setActionLoading(prev => ({ ...prev, [id]: val }));

  const handleActivate = async (id) => {
    setLoading2(id, true);
    try { await adminActivateUser(id); loadUsers(); } catch {}
    finally { setLoading2(id, false); }
  };

  const handleDeactivate = async (id) => {
    setLoading2(id, true);
    try { await adminDeactivateUser(id); loadUsers(); } catch {}
    finally { setLoading2(id, false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer définitivement cet utilisateur ?')) return;
    setLoading2(id, 'delete');
    try {
      await adminDeleteUser(id);
      setUsers(u => u.filter(x => x.id !== id));
    } catch {} finally { setLoading2(id, false); }
  };

  if (!isAdmin()) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} />
        <h3>Accès refusé</h3>
        <p>Vous n'avez pas les droits d'administration.</p>
      </div>
    );
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.roles?.includes('ROLE_ADMIN')).length,
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <ShieldCheck size={22} color="var(--accent3)" />
          <h1 className="page-title" style={{ marginBottom: 0 }}>Administration</h1>
        </div>
        <p className="page-subtitle">Gestion des utilisateurs de la plateforme</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total', value: stats.total, color: 'var(--accent)', icon: Users },
          { label: 'Actifs', value: stats.active, color: 'var(--accent2)', icon: UserCheck },
          { label: 'Inactifs', value: stats.inactive, color: 'var(--accent3)', icon: UserX },
          { label: 'Admins', value: stats.admins, color: '#ffc000', icon: ShieldCheck },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: 16 }}>
            <Icon size={20} color={color} style={{ margin: '0 auto 8px', display: 'block' }} />
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Users table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15 }}>Utilisateurs ({users.length})</h3>
        </div>

        {loading ? (
          <span className="spinner" />
        ) : (
          <div>
            {users.map((u, i) => {
              const busy = actionLoading[u.id];
              const initials = `${u.prenom?.[0] || ''}${u.nom?.[0] || ''}`.toUpperCase();
              return (
                <div key={u.id} style={{
                  display: 'flex', gap: 14, alignItems: 'center',
                  padding: '14px 20px',
                  borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="avatar" style={{
                    background: u.isActive
                      ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                      : 'var(--bg3)',
                    border: u.isActive ? 'none' : '1px solid var(--border)',
                  }}>
                    {initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {u.prenom} {u.nom}
                      </span>
                      {u.roles?.includes('ROLE_ADMIN') && (
                        <span className="tag tag-red" style={{ fontSize: 11, padding: '2px 8px' }}>Admin</span>
                      )}
                      <span className={`tag ${u.isActive ? 'tag-green' : ''}`} style={{
                        fontSize: 11, padding: '2px 8px',
                        ...(u.isActive ? {} : { background: 'var(--bg3)', color: 'var(--text3)' })
                      }}>
                        {u.isActive ? '● Actif' : '○ Inactif'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      {u.email} · Inscrit le {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {u.isActive ? (
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleDeactivate(u.id)}
                        disabled={busy}
                        style={{ fontSize: 12, padding: '6px 12px' }}
                      >
                        <UserX size={13} />
                        {busy ? '...' : 'Désactiver'}
                      </button>
                    ) : (
                      <button
                        className="btn btn-success"
                        onClick={() => handleActivate(u.id)}
                        disabled={busy}
                        style={{ fontSize: 12, padding: '6px 12px' }}
                      >
                        <UserCheck size={13} />
                        {busy ? '...' : 'Activer'}
                      </button>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(u.id)}
                      disabled={busy === 'delete'}
                      style={{ padding: '6px 10px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
