import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { createEvenement } from '../services/api';

export default function EventCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    lieu: '',
    type: 'autre',
    capaciteMax: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.titre.trim()) newErrors.titre = 'Le titre est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.dateDebut) newErrors.dateDebut = 'La date de début est requise';
    if (!formData.dateFin) newErrors.dateFin = 'La date de fin est requise';
    if (!formData.lieu.trim()) newErrors.lieu = 'Le lieu est requis';
    if (formData.capaciteMax && parseInt(formData.capaciteMax) <= 0) {
      newErrors.capaciteMax = 'La capacité doit être positive';
    }

    if (new Date(formData.dateDebut) >= new Date(formData.dateFin)) {
      newErrors.dateFin = 'La date de fin doit être après la date de début';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await createEvenement({
        ...formData,
        capaciteMax: formData.capaciteMax ? parseInt(formData.capaciteMax) : null,
      });
      navigate('/evenements');
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      } else {
        setErrors({ submit: 'Erreur lors de la création de l\'événement' });
      }
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { value: 'exam', label: '📝 Examen' },
    { value: 'sortie', label: '🚌 Sortie' },
    { value: 'atelier', label: '🛠️ Atelier' },
    { value: 'conference', label: '🎤 Conférence' },
    { value: 'autre', label: '📌 Autre' },
  ];

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/evenements')}
        className="btn btn-secondary"
        style={{ marginBottom: 24 }}
      >
        <ArrowLeft size={16} /> Retour au calendrier
      </button>

      {/* Title */}
      <h1 style={{ marginBottom: 32, fontSize: 32, fontWeight: 700 }}>
        <Plus size={32} style={{ marginRight: 12, verticalAlign: 'middle' }} />
        Créer un événement
      </h1>

      {/* Form */}
      <div style={{
        background: 'var(--bg2)', padding: '32px', borderRadius: 12,
        maxWidth: '600px',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Titre */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              Titre
            </label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              maxLength={200}
              placeholder="Ex: Examen de mathématiques"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: errors.titre ? '2px solid var(--accent3)' : '1px solid var(--bg3)',
                background: 'var(--bg)',
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
            {errors.titre && (
              <div style={{ fontSize: 12, color: 'var(--accent3)', marginTop: 4 }}>
                {errors.titre}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={1000}
              placeholder="Décrivez votre événement..."
              rows={4}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: errors.description ? '2px solid var(--accent3)' : '1px solid var(--bg3)',
                background: 'var(--bg)',
                fontSize: 14,
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
            {errors.description && (
              <div style={{ fontSize: 12, color: 'var(--accent3)', marginTop: 4 }}>
                {errors.description}
              </div>
            )}
          </div>

          {/* Type */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              Type d'événement
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid var(--bg3)',
                background: 'var(--bg)',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {types.map(t => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Lieu */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              Lieu
            </label>
            <input
              type="text"
              name="lieu"
              value={formData.lieu}
              onChange={handleChange}
              maxLength={200}
              placeholder="Ex: Amphithéâtre A, Building B"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: errors.lieu ? '2px solid var(--accent3)' : '1px solid var(--bg3)',
                background: 'var(--bg)',
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
            {errors.lieu && (
              <div style={{ fontSize: 12, color: 'var(--accent3)', marginTop: 4 }}>
                {errors.lieu}
              </div>
            )}
          </div>

          {/* Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                Date de début
              </label>
              <input
                type="datetime-local"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: errors.dateDebut ? '2px solid var(--accent3)' : '1px solid var(--bg3)',
                  background: 'var(--bg)',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
              {errors.dateDebut && (
                <div style={{ fontSize: 12, color: 'var(--accent3)', marginTop: 4 }}>
                  {errors.dateDebut}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                Date de fin
              </label>
              <input
                type="datetime-local"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: errors.dateFin ? '2px solid var(--accent3)' : '1px solid var(--bg3)',
                  background: 'var(--bg)',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
              {errors.dateFin && (
                <div style={{ fontSize: 12, color: 'var(--accent3)', marginTop: 4 }}>
                  {errors.dateFin}
                </div>
              )}
            </div>
          </div>

          {/* Capacité */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              Capacité maximale (optionnel)
            </label>
            <input
              type="number"
              name="capaciteMax"
              value={formData.capaciteMax}
              onChange={handleChange}
              min="1"
              placeholder="Laissez vide pour illimité"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: errors.capaciteMax ? '2px solid var(--accent3)' : '1px solid var(--bg3)',
                background: 'var(--bg)',
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
            {errors.capaciteMax && (
              <div style={{ fontSize: 12, color: 'var(--accent3)', marginTop: 4 }}>
                {errors.capaciteMax}
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div style={{
              padding: '12px', background: 'var(--accent3)', color: 'white',
              borderRadius: 8, fontSize: 14,
            }}>
              {errors.submit}
            </div>
          )}

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate('/evenements')}
              className="btn btn-secondary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer l\'événement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
