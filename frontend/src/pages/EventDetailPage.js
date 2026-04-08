import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Share2, Check } from 'lucide-react';
import { getEvenement, inscrireEvenement, quitterEvenement } from '../services/api';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getEvenement(id);
      setEvent(data);
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleRegister = async () => {
    const wasInscrit = event.estInscrit;
    // Optimistic update
    setEvent(prev => ({
      ...prev,
      estInscrit: !wasInscrit,
      nombreInscrits: wasInscrit ? prev.nombreInscrits - 1 : prev.nombreInscrits + 1,
      estPlein: prev.capaciteMax
        ? (!wasInscrit ? prev.nombreInscrits + 1 : prev.nombreInscrits - 1) >= prev.capaciteMax
        : false,
    }));
    setIsRegistering(true);
    try {
      if (wasInscrit) {
        await quitterEvenement(id);
      } else {
        await inscrireEvenement(id);
      }
      // Sync silencieux pour récupérer les vraies données
      const { data } = await getEvenement(id);
      setEvent(data);
    } catch (error) {
      console.error('Erreur:', error);
      // Rollback
      setEvent(prev => ({
        ...prev,
        estInscrit: wasInscrit,
        nombreInscrits: wasInscrit ? prev.nombreInscrits + 1 : prev.nombreInscrits - 1,
      }));
      alert(error.response?.data?.error || 'Erreur');
    } finally {
      setIsRegistering(false);
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'exam': return '📝';
      case 'sortie': return '🚌';
      case 'atelier': return '🛠️';
      case 'conference': return '🎤';
      default: return '📌';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'exam': return 'Examen';
      case 'sortie': return 'Sortie';
      case 'atelier': return 'Atelier';
      case 'conference': return 'Conférence';
      default: return 'Événement';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px' }}>
        <span className="spinner" />
        <div style={{ marginTop: 16, color: 'var(--text3)' }}>Chargement de l'événement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 16, color: 'var(--accent3)', marginBottom: 16 }}>❌ Erreur</div>
        <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>{error}</div>
        <button
          onClick={() => navigate('/evenements')}
          className="btn btn-secondary"
        >
          Retour au calendrier
        </button>
      </div>
    );
  }

  if (!event || !event.createur) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 16, color: 'var(--text2)' }}>Événement non trouvé</div>
      </div>
    );
  }

  const startDate = new Date(event.dateDebut);
  const endDate = new Date(event.dateFin);

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

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 16,
        marginBottom: 32, padding: '24px', background: 'var(--bg2)', borderRadius: 12,
      }}>
        <div style={{ fontSize: 48 }}>
          {getEventIcon(event.type)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, marginBottom: 4 }}>
            {getTypeLabel(event.type)}
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            {event.titre}
          </h1>
          <div style={{ fontSize: 14, color: 'var(--text2)' }}>
            Par <strong>{event.createur?.prenom} {event.createur?.nom}</strong>
          </div>
        </div>
        <button
          onClick={handleRegister}
          disabled={isRegistering || (event.estPlein && !event.estInscrit)}
          className={event.estInscrit ? 'btn btn-secondary' : 'btn btn-primary'}
          style={{ minWidth: 150 }}
        >
          {isRegistering ? (
            'Chargement...'
          ) : event.estInscrit ? (
            <>
              <Check size={16} /> Inscrit
            </>
          ) : event.estPlein ? (
            'Complet'
          ) : (
            'S\'inscrire'
          )}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Description */}
        <div>
          <div style={{
            background: 'var(--bg2)', padding: '24px', borderRadius: 12,
            marginBottom: 24,
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, fontWeight: 700 }}>
              Description
            </h2>
            <div style={{ color: 'var(--text2)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {event.description}
            </div>
          </div>

          {/* Details */}
          <div style={{
            background: 'var(--bg2)', padding: '24px', borderRadius: 12,
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, fontWeight: 700 }}>
              Détails
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Clock size={20} color="var(--accent)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 2 }}>
                    Date et heure
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {startDate.toLocaleDateString('fr-FR', {
                      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text2)' }}>
                    {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {' '}
                    {endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <MapPin size={20} color="var(--accent2)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 2 }}>
                    Lieu
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {event.lieu}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Users size={20} color="var(--accent3)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 2 }}>
                    Participants
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {event.nombreInscrits} {event.capaciteMax && `/ ${event.capaciteMax}`} inscrits
                  </div>
                  {event.estPlein && (
                    <div style={{ fontSize: 12, color: 'var(--accent3)', marginTop: 4 }}>
                      ⚠️ Événement complet
                    </div>
                  )}
                </div>
              </div>

              {event.groupe && (
                <div style={{
                  padding: '12px', background: 'var(--bg3)', borderRadius: 8,
                  borderLeft: '3px solid var(--accent)',
                }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>
                    Groupe associé
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--accent)' }}>
                    {event.groupe.nom}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Organizer */}
          <div style={{
            background: 'var(--bg2)', padding: '16px', borderRadius: 12,
            marginBottom: 24,
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 14, fontWeight: 700 }}>
              Organisateur
            </h3>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', transition: 'opacity 0.2s',
            }}
            onClick={() => navigate(`/users/${event.createur.id}`)}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.7}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: event.createur?.photo ? `url(${event.createur.photo})` : 'var(--accent)',
                backgroundSize: 'cover', backgroundPosition: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700,
              }}>
                {!event.createur?.photo && `${event.createur?.prenom?.[0] || '?'}${event.createur?.nom?.[0] || '?'}`}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {event.createur?.prenom} {event.createur?.nom}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {event.createur?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Share */}
          <button
            className="btn btn-secondary"
            style={{ width: '100%' }}
            onClick={() => {
              const text = `${event.titre} - ${startDate.toLocaleDateString('fr-FR')} à ${event.lieu}`;
              navigator.share?.({ title: event.titre, text }) ||
              navigator.clipboard.writeText(`${window.location.href}`);
            }}
          >
            <Share2 size={16} /> Partager
          </button>
        </div>
      </div>
    </div>
  );
}
