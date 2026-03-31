import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { getSearchSuggestions } from '../services/api';

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch suggestions
  useEffect(() => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const { data } = await getSearchSuggestions(query);
        setSuggestions(data);
      } catch (error) {
        console.error('Erreur suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setQuery('');
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    switch (suggestion.type) {
      case 'user':
        navigate(`/users/${suggestion.id}`);
        break;
      case 'groupe':
        navigate(`/groupes/${suggestion.id}`);
        break;
      case 'cours':
        navigate(`/cours/${suggestion.id}`);
        break;
      default:
        break;
    }
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <form onSubmit={handleSearch} style={{ width: '100%' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg3)', borderRadius: 10, padding: '8px 12px',
          border: isOpen ? '2px solid var(--accent)' : '1px solid var(--border)',
          transition: 'all 0.2s',
        }}>
          <Search size={18} color="var(--text3)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => query && setIsOpen(true)}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 14,
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text3)', padding: 0,
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 10, marginTop: 8, zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxHeight: 400, overflowY: 'auto',
        }}>
          {loading && (
            <div style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text3)' }}>
              Chargement...
            </div>
          )}

          {!loading && suggestions.length === 0 && query && (
            <div style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text3)' }}>
              Aucune suggestion
            </div>
          )}

          {!loading && suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '12px 16px', cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{suggestion.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                    {suggestion.text}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {suggestion.type === 'user' ? 'Personne' : 
                     suggestion.type === 'groupe' ? 'Groupe' : 'Cours'}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!loading && query && suggestions.length > 0 && (
            <div
              onClick={handleSearch}
              style={{
                padding: '12px 16px', cursor: 'pointer',
                background: 'var(--accent)', color: 'white',
                textAlign: 'center', fontWeight: 500, fontSize: 13,
              }}
            >
              Voir tous les résultats pour "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
