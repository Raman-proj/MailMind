import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import EmailCard from '../components/EmailCard';
import { HiOutlineSparkles, HiOutlineCalendarDays, HiOutlineEnvelope, HiOutlineArrowTrendingUp } from 'react-icons/hi2';

export default function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [stats, setStats] = useState({ total: 0, meetings: 0, analyzed: 0, events: 0 });
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEmails = async () => {
    try {
      const res = await api.emails.list({ page: 1, limit: 10, folder: 'inbox' });
      if (res.success) setEmails(res.data);
    } catch (err) { console.error(err); }
  };

  const syncInbox = async () => {
    setSyncing(true);
    try {
      await api.emails.sync();
      await fetchEmails();
    } catch (err) { console.error(err); }
    finally { setSyncing(false); }
  };

  useEffect(() => {
    const init = async () => {
      await fetchEmails();
      try {
        const [emailRes, calRes] = await Promise.allSettled([
          api.emails.list({ page: 1, limit: 100, folder: 'inbox' }),
          api.calendar.getEvents()
        ]);
        const total = emailRes.status === 'fulfilled' && emailRes.value.success ? emailRes.value.pagination?.total || 0 : 0;
        const meetingCount = emailRes.status === 'fulfilled' && emailRes.value.success
          ? emailRes.value.data.filter(e => e.aiAnalysis?.isMeetingRequest).length : 0;
        const analyzedCount = emailRes.status === 'fulfilled' && emailRes.value.success
          ? emailRes.value.data.filter(e => e.aiAnalysis?.summary).length : 0;
        const eventCount = calRes.status === 'fulfilled' && calRes.value.success ? calRes.value.data.length : 0;
        setStats({ total, meetings: meetingCount, analyzed: analyzedCount, events: eventCount });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <div className="app-layout"><Sidebar /><main className="app-main"><div className="loading-container"><div className="spinner"></div></div></main></div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Topbar title="Dashboard" onSync={syncInbox} syncing={syncing} />
        <div className="app-content fade-in">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon purple"><HiOutlineEnvelope /></div>
              <div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Inbox Emails</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><HiOutlineCalendarDays /></div>
              <div>
                <div className="stat-value">{stats.meetings}</div>
                <div className="stat-label">Meeting Requests</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon cyan"><HiOutlineSparkles /></div>
              <div>
                <div className="stat-value">{stats.analyzed}</div>
                <div className="stat-label">AI Analyzed</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber"><HiOutlineArrowTrendingUp /></div>
              <div>
                <div className="stat-value">{stats.events}</div>
                <div className="stat-label">Calendar Events</div>
              </div>
            </div>
          </div>

          <div className="email-list-header">
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Inbox</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Latest emails from your inbox</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/emails')}>
              View All
            </button>
          </div>

          {emails.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No emails yet</div>
              <div className="empty-state-desc">Click "Sync Inbox" to fetch your latest emails from Gmail</div>
              <button className="btn btn-primary" onClick={syncInbox} disabled={syncing}>
                {syncing ? 'Syncing...' : 'Sync Inbox Now'}
              </button>
            </div>
          ) : (
            <div className="email-list">
              {emails.slice(0, 8).map(email => (
                <EmailCard key={email._id} email={email} onClick={() => navigate(`/emails/${email._id}`)} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}