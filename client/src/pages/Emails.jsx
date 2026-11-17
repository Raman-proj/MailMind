import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import EmailCard from '../components/EmailCard';

export default function Emails() {
  const [emails, setEmails] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('inbox');
  const navigate = useNavigate();

  const fetchEmails = useCallback(async (page = 1) => {
    try {
      const params = { page, limit: 20, folder };
      if (search) params.search = search;
      const res = await api.emails.list(params);
      if (res.success) {
        setEmails(res.data);
        setPagination(res.pagination);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [folder, search]);

  useEffect(() => { setLoading(true); fetchEmails(); }, [fetchEmails]);

  const syncInbox = async () => {
    setSyncing(true);
    try {
      await api.emails.sync();
      await fetchEmails(1);
    } catch (err) { console.error(err); }
    finally { setSyncing(false); }
  };

  const folders = [
    { key: 'inbox', label: 'Inbox' },
    { key: 'sent', label: 'Sent' },
    { key: 'all', label: 'All Mail' }
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Topbar title="Emails" onSearch={setSearch} onSync={syncInbox} syncing={syncing} />
        <div className="app-content fade-in">
          <div className="email-list-header">
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              {folders.map(f => (
                <button
                  key={f.key}
                  className={`btn btn-sm ${folder === f.key ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setFolder(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {pagination.total} emails
            </div>
          </div>

          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : emails.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No emails found</div>
              <div className="empty-state-desc">Sync your inbox or change the folder filter</div>
            </div>
          ) : (
            <>
              <div className="email-list">
                {emails.map(email => (
                  <EmailCard
                    key={email._id}
                    email={email}
                    onClick={() => navigate(`/emails/${email._id}`)}
                  />
                ))}
              </div>
              {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchEmails(pagination.page - 1)}
                  >Previous</button>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {pagination.page} / {pagination.pages}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => fetchEmails(pagination.page + 1)}
                  >Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}