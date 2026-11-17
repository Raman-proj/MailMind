import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import EmailCard from '../components/EmailCard';

const Inbox = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [pageToken, setPageToken] = useState(null);
  const [pageHistory, setPageHistory] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const fetchEmails = async (token = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.emails.list({ q: query, pageToken: token });
      setEmails(data.emails || []);
      setNextPageToken(data.nextPageToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageToken(null);
    setPageHistory([]);
    fetchEmails(null);
  }, [query]);
  
  useEffect(() => {
    const handleSync = () => {
      setPageToken(null);
      setPageHistory([]);
      fetchEmails(null);
    };
    window.addEventListener('trigger-sync', handleSync);
    return () => window.removeEventListener('trigger-sync', handleSync);
  }, []);

  const handleNext = () => {
    if (nextPageToken) {
      setPageHistory([...pageHistory, pageToken]);
      setPageToken(nextPageToken);
      fetchEmails(nextPageToken);
    }
  };

  const handlePrev = () => {
    if (pageHistory.length > 0) {
      const prevToken = pageHistory[pageHistory.length - 1];
      const newHistory = pageHistory.slice(0, -1);
      setPageHistory(newHistory);
      setPageToken(prevToken);
      fetchEmails(prevToken);
    }
  };

  if (loading && emails.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading emails...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {error && (
        <div style={{ padding: '16px', background: 'rgba(255,0,0,0.1)', color: '#ff5c72', borderBottom: '1px solid rgba(255,0,0,0.2)' }}>
          {error}
        </div>
      )}

      {query && (
        <div style={{ padding: '12px 24px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Showing results for: <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{query}</span>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        {emails.length > 0 ? (
          <div className="email-list">
            {emails.map((email) => (
              <EmailCard key={email.id} email={email} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            <p>No emails found.</p>
          </div>
        )}
      </div>

      {(nextPageToken || pageHistory.length > 0) && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-primary)', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handlePrev}
            disabled={pageHistory.length === 0}
            className="btn btn-secondary"
          >
            Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={!nextPageToken}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Inbox;
