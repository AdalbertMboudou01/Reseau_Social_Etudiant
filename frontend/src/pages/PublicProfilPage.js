import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicProfile, getRelationshipStatus, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } from '../services/api';
import { ArrowLeft, Mail, GraduationCap, BookOpen, Building, Calendar, UserPlus, UserCheck, UserX, Loader } from 'lucide-react';

export default function PublicProfilPage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relationshipStatus, setRelationshipStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [amitieId, setAmitieId] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getPublicProfile(userId);
      setProfile(res.data);
      
      // Get relationship status
      if (currentUser?.id !== parseInt(userId)) {
        const statusRes = await getRelationshipStatus(userId);
        setRelationshipStatus(statusRes.data.statut);
        if (statusRes.data.amitieId) {
          setAmitieId(statusRes.data.amitieId);
        }
      }
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    setStatusLoading(true);
    try {
      await sendFriendRequest(userId);
      setRelationshipStatus('pending_sent');
    } catch (err) {
      alert('Erreur lors de l\'envoi de la demande');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    setStatusLoading(true);
    try {
      await acceptFriendRequest(amitieId);
      setRelationshipStatus('friend');
    } catch (err) {
      alert('Erreur lors de l\'acceptation de la demande');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    setStatusLoading(true);
    try {
      await rejectFriendRequest(amitieId);
      setRelationshipStatus('none');
    } catch (err) {
      alert('Erreur lors du refus de la demande');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet ami ?')) return;
    
    setStatusLoading(true);
    try {
      await removeFriend(userId);
      setRelationshipStatus('none');
    } catch (err) {
      alert('Erreur lors de la suppression');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <span className="spinner" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p>Profil non trouvé</p>
      </div>
    );
  }

  const isCurrentUser = currentUser?.id === parseInt(userId);

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: 24, padding: '9px 14px' }}>
        <ArrowLeft size={16} />
        Retour
      </button>

      <div className="card" style={{ marginBottom: 24 }}>
        {/* Header */}
        <div style={{
          display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24,
          paddingBottom: 24, borderBottom: '1px solid var(--border)'
        }}>
          <div className="avatar" style={{ width: 120, height: 120, fontSize: '48px', flexShrink: 0 }}>
            {profile.photo ? <img src={profile.photo} alt="avatar" /> : profile.prenom?.[0]}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px' }}>
              {profile.prenom} {profile.nom}
            </h1>
            <p style={{ color: 'var(--text3)', fontSize: 14, margin: '0 0 16px' }}>
              {profile.email}
            </p>

            {profile.bio && (
              <p style={{ fontSize: 14, color: 'var(--text2)', margin: '0 0 16px', lineHeight: 1.5 }}>
                {profile.bio}
              </p>
            )}

            {!isCurrentUser && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                {relationshipStatus === 'friend' ? (
                  <>
                    <button
                      onClick={() => navigate(`/chat/${profile.id}`)}
                      className="btn btn-primary"
                      style={{ padding: '9px 14px', gap: 8 }}
                      disabled={statusLoading}
                    >
                      <Mail size={16} />
                      Envoyer un message
                    </button>
                    <button
                      onClick={() => navigate(`/amis`)}
                      className="btn btn-secondary"
                      style={{ padding: '9px 14px', gap: 8 }}
                    >
                      <UserCheck size={16} />
                      Ami
                    </button>
                    <button
                      onClick={handleRemoveFriend}
                      className="btn btn-danger"
                      style={{ padding: '9px 14px' }}
                      disabled={statusLoading}
                      title="Supprimer de mes amis"
                    >
                      <UserX size={16} />
                    </button>
                  </>
                ) : relationshipStatus === 'pending_sent' ? (
                  <button
                    className="btn btn-secondary"
                    disabled
                    style={{ padding: '9px 14px', gap: 8 }}
                  >
                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Demande envoyée
                  </button>
                ) : relationshipStatus === 'pending_received' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={handleAcceptRequest}
                      className="btn btn-success"
                      style={{ padding: '9px 14px', gap: 8 }}
                      disabled={statusLoading}
                    >
                      <UserCheck size={16} />
                      Accepter
                    </button>
                    <button
                      onClick={handleRejectRequest}
                      className="btn btn-danger"
                      style={{ padding: '9px 14px' }}
                      disabled={statusLoading}
                    >
                      <UserX size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSendFriendRequest}
                    className="btn btn-primary"
                    style={{ padding: '9px 14px', gap: 8 }}
                    disabled={statusLoading}
                  >
                    <UserPlus size={16} />
                    Ajouter en ami
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {profile.universite && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Building size={18} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Université
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{profile.universite}</div>
              </div>
            </div>
          )}

          {profile.filiere && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <BookOpen size={18} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Filière
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{profile.filiere}</div>
              </div>
            </div>
          )}

          {profile.anneeEtude && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <GraduationCap size={18} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Année d'étude
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>L{profile.anneeEtude}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Calendar size={18} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                Membre depuis
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
