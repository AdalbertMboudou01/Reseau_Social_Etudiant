import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getPublications, createPublication, deletePublication,
  likePublication, getCommentaires, createCommentaire, deleteCommentaire
} from '../services/api';
import {
  Heart, MessageCircle, Trash2, Send, Image, AlertCircle,
  MoreHorizontal, Plus, X
} from 'lucide-react';

const PAGE_SIZE = 10;

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

const Avatar = memo(function Avatar({ user, size = '' }) {
  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase();
  return (
    <div className={`avatar ${size}`}>
      {user?.photo ? <img src={user.photo} alt="" /> : initials}
    </div>
  );
});

const CommentSection = memo(function CommentSection({ pub, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const res = await getCommentaires(pub.id);
      setComments(res.data);
    } catch {}
  }, [pub.id]);

  useEffect(() => {
    if (open) loadComments();
  }, [open, loadComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      await createCommentaire(pub.id, { contenu: text });
      setText('');
      loadComments();
    } catch {} finally { setLoading(false); }
  };

  const handleDelete = async (cId) => {
    try {
      await deleteCommentaire(pub.id, cId);
      setComments(c => c.filter(x => x.id !== cId));
    } catch {}
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', color: 'var(--text2)',
          fontSize: 13, fontWeight: 500,
          padding: '6px 0',
        }}
      >
        <MessageCircle size={16} />
        {open ? 'Masquer' : `Commentaires`}
      </button>

      {open && (
        <div style={{ marginTop: 12 }} className="fade-in">
          {comments.length === 0 && (
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 12 }}>
              Aucun commentaire. Soyez le premier !
            </p>
          )}
          {comments.map(c => (
            <div key={c.id} style={{
              display: 'flex', gap: 10, marginBottom: 12,
              background: 'var(--bg3)', borderRadius: 10, padding: '10px 12px',
            }}>
              <Avatar user={c.auteur} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span
                    onClick={() => window.location.href = `/users/${c.auteur.id}`}
                    style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--accent)' }}
                  >
                    {c.auteur.prenom} {c.auteur.nom}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{timeAgo(c.createdAt)}</span>
                    {(currentUser?.id === c.auteur.id) && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{ background: 'none', color: 'var(--text3)', padding: 2 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{c.contenu}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Avatar user={currentUser} />
            <div style={{ flex: 1, display: 'flex', gap: 8 }}>
              <input
                className="input-field"
                placeholder="Écrire un commentaire..."
                value={text}
                onChange={e => setText(e.target.value)}
                style={{ flex: 1, padding: '9px 14px', fontSize: 13 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !text.trim()}
                style={{ padding: '9px 14px' }}
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
});

const PostCard = memo(function PostCard({ pub, currentUser, onDelete, onLike }) {
  const isOwner = currentUser?.id === pub.auteur.id;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="card fade-in" style={{ marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar user={pub.auteur} />
          <div>
            <div
              onClick={() => window.location.href = `/users/${pub.auteur.id}`}
              style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer', color: 'var(--accent)', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {pub.auteur.prenom} {pub.auteur.nom}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{timeAgo(pub.createdAt)}</div>
          </div>
        </div>
        {isOwner && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', color: 'var(--text3)', padding: 6, borderRadius: 8 }}
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '100%',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 10, padding: 6, zIndex: 10,
                minWidth: 140,
                boxShadow: 'var(--shadow)',
              }}>
                <button
                  onClick={() => { onDelete(pub.id); setMenuOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    background: 'none', color: 'var(--accent3)', fontSize: 13,
                  }}
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p style={{ fontSize: 15, lineHeight: 1.65, marginBottom: 12, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
        {pub.contenu}
      </p>

      {pub.image && (
        <div style={{ marginBottom: 14, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img src={pub.image} alt="post" style={{ width: '100%', display: 'block', maxHeight: 360, objectFit: 'cover' }} />
        </div>
      )}

      <hr className="divider" style={{ margin: '12px 0' }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <button
          onClick={() => onLike(pub.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', fontSize: 13, fontWeight: 500,
            color: pub.liked ? '#ff6b6b' : 'var(--text2)',
            transition: 'color 0.2s',
          }}
        >
          <Heart size={16} fill={pub.liked ? '#ff6b6b' : 'none'} />
          {pub.likesCount > 0 && pub.likesCount}
          J'aime
        </button>

        <CommentSection pub={pub} currentUser={currentUser} />
      </div>
    </div>
  );
});

export default function HomePage() {
  const { user } = useAuth();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadPubs = useCallback(async (pageToLoad = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await getPublications({ page: pageToLoad, limit: PAGE_SIZE });
      const items = res.data.items || [];
      const pagination = res.data.pagination || {};

      setError('');
      setPublications(prev => (append ? [...prev, ...items] : items));
      setCurrentPage(pagination.page || pageToLoad);
      setHasMore(Boolean(pagination.hasMore));
    } catch {
      setError('Erreur lors du chargement des publications.');
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadPubs();
  }, [loadPubs]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);
    setError('');
    try {
      await createPublication({ contenu: newPost, image: imageUrl || undefined });
      setNewPost('');
      setImageUrl('');
      setShowImageInput(false);
      loadPubs(1);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la publication.');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    try {
      await deletePublication(id);
      setPublications(p => p.filter(x => x.id !== id));
    } catch {}
  }, []);

  const handleLike = useCallback(async (id) => {
    try {
      const res = await likePublication(id);
      setPublications(prev => prev.map(p => {
        if (p.id !== id) return p;
        return {
          ...p,
          liked: res.data.liked,
          likesCount: res.data.liked ? p.likesCount + 1 : p.likesCount - 1,
        };
      }));
    } catch {}
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadPubs(currentPage + 1, true);
    }
  }, [currentPage, hasMore, loadPubs, loadingMore]);

  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase();

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Fil d'actualité</h1>
        <p className="page-subtitle">Partage et découvre les actualités de ta communauté</p>
      </div>

      {/* Compose */}
      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handlePost}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div className="avatar">
              {user?.photo ? <img src={user.photo} alt="" /> : initials}
            </div>
            <textarea
              className="input-field"
              placeholder={`Quoi de neuf, ${user?.prenom} ?`}
              rows={3}
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              style={{ flex: 1, resize: 'vertical' }}
            />
          </div>

          {showImageInput && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                className="input-field"
                placeholder="URL de l'image (https://...)"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => { setShowImageInput(false); setImageUrl(''); }}
                style={{ background: 'var(--bg3)', color: 'var(--text2)', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 12 }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', color: 'var(--text3)', fontSize: 13,
                padding: '6px 10px', borderRadius: 8,
              }}
            >
              <Image size={16} /> Image
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={posting || !newPost.trim()}
            >
              <Plus size={16} />
              {posting ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      {loading ? (
        <span className="spinner" />
      ) : publications.length === 0 ? (
        <div className="empty-state">
          <MessageCircle size={48} />
          <h3>Aucune publication</h3>
          <p>Soyez le premier à partager quelque chose !</p>
        </div>
      ) : (
        <>
          {publications.map(pub => (
            <PostCard
              key={pub.id}
              pub={pub}
              currentUser={user}
              onDelete={handleDelete}
              onLike={handleLike}
            />
          ))}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
              <button
                className="btn btn-secondary"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Chargement...' : 'Charger plus'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
