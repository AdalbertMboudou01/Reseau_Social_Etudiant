import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', password: '', nom: '', prenom: '',
    universite: '', filiere: '', anneeEtude: '', bio: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        ...form,
        anneeEtude: form.anneeEtude ? parseInt(form.anneeEtude) : undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs) {
        setError(Object.values(errs).join('. '));
      } else {
        setError(err.response?.data?.error || 'Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 8 }}>
        {label}
      </label>
      <input
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(0,212,170,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, var(--accent2), var(--accent))',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(0,212,170,0.25)',
          }}>
            <GraduationCap size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Rejoins CampusLink</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Crée ton compte étudiant</p>
        </div>

        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          padding: 32,
        }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle size={48} color="var(--accent2)" style={{ margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>Compte créé avec succès !</h3>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>Redirection vers la connexion...</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 18, marginBottom: 20 }}>Inscription</h2>

              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  {field('Prénom *', 'prenom', 'text', 'Votre prénom')}
                  {field('Nom *', 'nom', 'text', 'Votre nom')}
                </div>

                {field('Email *', 'email', 'email', 'votre@email.com')}
                {field('Mot de passe *', 'password', 'password', 'Minimum 6 caractères')}

                <hr className="divider" />
                <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Informations académiques (optionnel)
                </p>

                {field('Université', 'universite', 'text', 'Ex: Université Paris-Saclay')}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  {field('Filière', 'filiere', 'text', 'Ex: Informatique')}
                  {field('Année d\'étude', 'anneeEtude', 'number', 'Ex: 2')}
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 8 }}>
                    Bio
                  </label>
                  <textarea
                    className="input-field"
                    placeholder="Présente-toi en quelques mots..."
                    rows={3}
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15 }}
                >
                  {loading ? 'Création...' : 'Créer mon compte'}
                </button>
              </form>
            </>
          )}

          <hr className="divider" />
          <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 14 }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
