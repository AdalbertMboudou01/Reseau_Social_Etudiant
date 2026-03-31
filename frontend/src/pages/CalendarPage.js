import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Plus, Book, Users, MapPin, Clock } from 'lucide-react';
import { getEvenements, getMyInscriptions } from '../services/api';

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [evenements, setEvenements] = useState([]);
  const [myInscriptions, setMyInscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('month'); // month, list, my

  useEffect(() => {
    fetchEvenements();
  }, [currentDate, view]);

  const fetchEvenements = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');

      if (view === 'my') {
        const { data } = await getMyInscriptions();
        setMyInscriptions(data);
      } else {
        const { data } = await getEvenements('byMonth', month, year);
        setEvenements(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'exam': return 'var(--accent3)';
      case 'sortie': return 'var(--accent2)';
      case 'atelier': return 'var(--accent)';
      case 'conference': return '#9C27B0';
      default: return 'var(--text3)';
    }
  };

  const formatMonth = (date) => {
    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);
  };

  const getEventsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return evenements.filter(e => e.dateDebut.startsWith(dateStr));
  };

  // Calendar Grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ background: 'var(--bg3)' }} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const eventsForDay = getEventsForDay(day);
      days.push(
        <div
          key={day}
          style={{
            background: 'var(--bg2)', padding: '8px', borderRadius: 8,
            border: '1px solid var(--border)', minHeight: 100,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}
        >
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
            {day}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {eventsForDay.slice(0, 2).map((event, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/evenements/${event.id}`)}
                style={{
                  fontSize: 11, padding: '2px 6px', borderRadius: 4,
                  background: getTypeColor(event.type), color: 'white',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
                title={event.titre}
              >
                {getEventIcon(event.type)} {event.titre}
              </div>
            ))}
            {eventsForDay.length > 2 && (
              <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500 }}>
                +{eventsForDay.length - 2} plus
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Calendar size={28} />
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Calendrier des événements</h1>
        <button
          onClick={() => navigate('/evenements/nouveau')}
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
        >
          <Plus size={16} /> Créer un événement
        </button>
      </div>

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { value: 'month', label: 'Calendrier' },
          { value: 'list', label: 'Liste' },
          { value: 'my', label: 'Mes inscriptions' },
        ].map(btn => (
          <button
            key={btn.value}
            onClick={() => setView(btn.value)}
            className={view === btn.value ? 'btn btn-primary' : 'btn btn-secondary'}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Month Navigation */}
      {view !== 'my' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, padding: '16px', background: 'var(--bg2)', borderRadius: 12,
        }}>
          <button
            onClick={previousMonth}
            className="btn btn-secondary"
            style={{ width: 40, height: 40, padding: 0 }}
          >
            <ChevronLeft size={18} />
          </button>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {formatMonth(currentDate)}
          </div>
          <button
            onClick={nextMonth}
            className="btn btn-secondary"
            style={{ width: 40, height: 40, padding: 0 }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Calendar or List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <span className="spinner" />
        </div>
      ) : view === 'month' ? (
        // Calendar Grid
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12,
          marginBottom: 24,
        }}>
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div
              key={day}
              style={{
                textAlign: 'center', fontWeight: 700, padding: 8,
                color: 'var(--text2)', fontSize: 12,
              }}
            >
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>
      ) : view === 'list' ? (
        // List View
        <div>
          {evenements.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '48px', background: 'var(--bg2)',
              borderRadius: 12,
            }}>
              <Calendar size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)' }}>
                Aucun événement ce mois
              </div>
            </div>
          ) : (
            evenements.map(event => (
              <div
                key={event.id}
                onClick={() => navigate(`/evenements/${event.id}`)}
                style={{
                  padding: '16px', background: 'var(--bg2)', borderRadius: 12,
                  marginBottom: 12, cursor: 'pointer', transition: 'all 0.2s',
                  borderLeft: `4px solid ${getTypeColor(event.type)}`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>
                    {getEventIcon(event.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                      {event.titre}
                    </div>
                    <div style={{
                      display: 'flex', gap: 16, fontSize: 13, color: 'var(--text3)',
                      marginBottom: 8, flexWrap: 'wrap',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} />
                        {new Date(event.dateDebut).toLocaleDateString('fr-FR')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} />
                        {event.lieu}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={14} />
                        {event.nombreInscrits}/{event.capaciteMax || '∞'} inscrits
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                      Par {event.createur.prenom} {event.createur.nom}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // My Inscriptions
        <div>
          {myInscriptions.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '48px', background: 'var(--bg2)',
              borderRadius: 12,
            }}>
              <Calendar size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>
                Vous n'êtes inscrit à aucun événement
              </div>
              <div style={{ fontSize: 14, color: 'var(--text3)' }}>
                Parcourez les événements à venir
              </div>
            </div>
          ) : (
            myInscriptions.map(event => (
              <div
                key={event.id}
                onClick={() => navigate(`/evenements/${event.id}`)}
                style={{
                  padding: '16px', background: 'var(--bg2)', borderRadius: 12,
                  marginBottom: 12, cursor: 'pointer', transition: 'all 0.2s',
                  borderLeft: `4px solid ${getTypeColor(event.type)}`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}
              >
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  {event.titre}
                </div>
                <div style={{
                  display: 'flex', gap: 16, fontSize: 13, color: 'var(--text3)',
                  flexWrap: 'wrap',
                }}>
                  <div>
                    {new Date(event.dateDebut).toLocaleDateString('fr-FR')} à{' '}
                    {new Date(event.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div>{event.lieu}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
