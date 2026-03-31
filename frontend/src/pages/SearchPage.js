import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Users, FileText, Folder, BookOpen, ChevronRight } from 'lucide-react';
import { searchGlobal } from '../services/api';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await searchGlobal(query, type);
        setResults(data);
      } catch (err) {
        setError('Erreur lors de la recherche');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, type]);

  const handleTypeChange = (newType) => {
    setSearchParams({ q: query, type: newType });
  };

  const handleNavigate = (item) => {
    switch (item.type) {
      case 'user':
        navigate(`/users/${item.id}`);
        break;
      case 'publication':
        navigate(`/publication/${item.id}`);
        break;
      case 'groupe':
        navigate(`/groupes/${item.id}`);
        break;
      case 'cours':
        navigate(`/cours/${item.id}`);
        break;
      default:
        break;
    }
  };

  const renderUserResult = (user) => (
    <div
      key={`user-${user.id}`}
      onClick={() => handleNavigate(user)}
      className="search-result-item"
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
        background: 'var(--bg2)', borderRadius: 8, cursor: 'pointer',
        transition: 'all 0.2s', marginBottom: 8,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}
    >
      <Users size={20} color="var(--accent)" />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
          {user.prenom} {user.nom}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          {user.email} {user.universite && `• ${user.universite}`}
        </div>
      </div>
      <ChevronRight size={18} color="var(--text3)" />
    </div>
  );

  const renderPublicationResult = (pub) => (
    <div
      key={`pub-${pub.id}`}
      onClick={() => handleNavigate(pub)}
      className="search-result-item"
      style={{
        display: 'flex', gap: 12, padding: '12px',
        background: 'var(--bg2)', borderRadius: 8, cursor: 'pointer',
        transition: 'all 0.2s', marginBottom: 8,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}
    >
      {pub.image && (
        <img src={pub.image} alt="" style={{
          width: 60, height: 60, borderRadius: 6, objectFit: 'cover',
        }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
          {pub.auteur.prenom} {pub.auteur.nom}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
          {pub.contenu}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
          {new Date(pub.createdAt).toLocaleDateString('fr-FR')}
        </div>
      </div>
      <ChevronRight size={18} color="var(--text3)" />
    </div>
  );

  const renderGroupeResult = (groupe) => (
    <div
      key={`groupe-${groupe.id}`}
      onClick={() => handleNavigate(groupe)}
      className="search-result-item"
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
        background: 'var(--bg2)', borderRadius: 8, cursor: 'pointer',
        transition: 'all 0.2s', marginBottom: 8,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}
    >
      <Folder size={20} color="var(--accent2)" />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
          {groupe.nom}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          {groupe.description} • {groupe.membersCount} membre{groupe.membersCount > 1 ? 's' : ''}
        </div>
      </div>
      <ChevronRight size={18} color="var(--text3)" />
    </div>
  );

  const renderCoursResult = (cours) => (
    <div
      key={`cours-${cours.id}`}
      onClick={() => handleNavigate(cours)}
      className="search-result-item"
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
        background: 'var(--bg2)', borderRadius: 8, cursor: 'pointer',
        transition: 'all 0.2s', marginBottom: 8,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}
    >
      <BookOpen size={20} color="var(--accent3)" />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
          {cours.titre}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          {cours.description}
        </div>
      </div>
      <ChevronRight size={18} color="var(--text3)" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Search size={28} />
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Recherche</h1>
        </div>
        {query && (
          <div style={{ fontSize: 14, color: 'var(--text2)' }}>
            Résultats pour "<strong>{query}</strong>"
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { value: 'all', label: 'Tous', icon: '🔍' },
          { value: 'users', label: 'Personnes', icon: '👤' },
          { value: 'publications', label: 'Publications', icon: '📝' },
          { value: 'groupes', label: 'Groupes', icon: '📁' },
          { value: 'cours', label: 'Cours', icon: '📚' },
        ].map(filter => (
          <button
            key={filter.value}
            onClick={() => handleTypeChange(filter.value)}
            className={type === filter.value ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ whiteSpace: 'nowrap' }}
          >
            {filter.icon} {filter.label}
          </button>
        ))}
      </div>

      {/* No Query */}
      {!query && (
        <div style={{
          textAlign: 'center', padding: '64px 24px',
          background: 'var(--bg2)', borderRadius: 12,
        }}>
          <Search size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>
            Entrez au moins 2 caractères
          </div>
          <div style={{ fontSize: 14, color: 'var(--text3)' }}>
            Recherchez des utilisateurs, publications, groupes ou cours
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <span className="spinner" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px', background: 'rgba(255,107,107,0.1)',
          border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8,
          color: 'var(--accent3)', marginBottom: 24,
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <div>
          {/* Users */}
          {results.users && results.users.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontSize: 16, fontWeight: 700, marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Users size={20} /> Personnes ({results.users.length})
              </h2>
              {results.users.map(renderUserResult)}
            </div>
          )}

          {/* Publications */}
          {results.publications && results.publications.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontSize: 16, fontWeight: 700, marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <FileText size={20} /> Publications ({results.publications.length})
              </h2>
              {results.publications.map(renderPublicationResult)}
            </div>
          )}

          {/* Groupes */}
          {results.groupes && results.groupes.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontSize: 16, fontWeight: 700, marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Folder size={20} /> Groupes ({results.groupes.length})
              </h2>
              {results.groupes.map(renderGroupeResult)}
            </div>
          )}

          {/* Cours */}
          {results.cours && results.cours.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontSize: 16, fontWeight: 700, marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <BookOpen size={20} /> Cours ({results.cours.length})
              </h2>
              {results.cours.map(renderCoursResult)}
            </div>
          )}

          {/* No results */}
          {!results.users?.length && !results.publications?.length && 
           !results.groupes?.length && !results.cours?.length && (
            <div style={{
              textAlign: 'center', padding: '48px 24px',
              background: 'var(--bg2)', borderRadius: 12,
            }}>
              <Search size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)' }}>
                Aucun résultat trouvé
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
