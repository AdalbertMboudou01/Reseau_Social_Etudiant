import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, getProfile } from '../services/api';
import { GraduationCap, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      const token = res.data.token;
      localStorage.setItem('token', token);
      const profileRes = await getProfile();
      loginUser(token, profileRes.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', left: '-10%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 32px rgba(108,99,255,0.3)',
          }}>
            <GraduationCap size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>CampusLink</h1>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>Connecte-toi à ta communauté étudiante</p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: 32,
        }}>
          <h2 style={{ fontSize: 20, marginBottom: 24 }}>Connexion</h2>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 8 }}>
                Adresse email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="votre@email.com"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  style={{ paddingLeft: 42 }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 8 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingLeft: 42 }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15 }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <hr className="divider" />

          <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 14 }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
