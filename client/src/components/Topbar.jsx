import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaSync, FaBell } from 'react-icons/fa';
import { api } from '../services/api';

const Topbar = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [syncing, setSyncing] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      // In this new architecture, emails are fetched directly.
      // A sync could mean refetching the first page.
      // We can emit an event or just refresh the page.
      window.dispatchEvent(new Event('trigger-sync'));
    } finally {
      setTimeout(() => setSyncing(false), 1000);
    }
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">Inbox</h1>
      </div>

      <div className="topbar-right">
        <form onSubmit={handleSearch} className="topbar-search">
          <FaSearch className="topbar-search-icon" />
          <input
            type="text"
            placeholder="Search emails..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <button 
          onClick={handleSync}
          className="topbar-btn"
          disabled={syncing}
          title="Sync Inbox"
        >
          <FaSync className={syncing ? "animate-spin" : ""} style={syncing ? { animation: 'spin 1s linear infinite' } : {}} />
        </button>

        <button className="topbar-btn" title="Notifications">
          <FaBell />
          <span className="badge"></span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;