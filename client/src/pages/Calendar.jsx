import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaCalendarAlt, FaMapMarkerAlt, FaVideo, FaExternalLinkAlt } from 'react-icons/fa';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const now = new Date();
        const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const data = await api.calendar.list({ 
          timeMin: now.toISOString(), 
          timeMax: nextMonth.toISOString() 
        });
        setEvents(data.events || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Upcoming Events</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Next 30 days of scheduled meetings</p>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(255,0,0,0.1)', color: '#ff5c72', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {events.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {events.map((event) => {
              const startDate = new Date(event.start.dateTime || event.start.date);
              const endDate = new Date(event.end.dateTime || event.end.date);
              const isVideo = event.location && (event.location.includes('meet') || event.location.includes('zoom'));

              return (
                <div key={event.id} className="card card-interactive" style={{ display: 'flex', gap: '16px', padding: '20px' }}>
                  <div style={{ width: '120px', flexShrink: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      {startDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{event.summary || 'Untitled Event'}</h3>
                      {event.htmlLink && (
                        <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '6px' }} title="Open in Google Calendar">
                          <FaExternalLinkAlt />
                        </a>
                      )}
                    </div>
                    
                    {event.description && (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        {event.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
                      {event.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {isVideo ? <FaVideo style={{ color: 'var(--accent-cyan)' }} /> : <FaMapMarkerAlt style={{ color: 'var(--text-muted)' }} />}
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {event.attendees && event.attendees.length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>Attendees</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {event.attendees.map((attendee, i) => (
                            <span key={i} style={{ fontSize: '12px', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                              {attendee.email}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
            <FaCalendarAlt style={{ fontSize: '48px', color: 'var(--border-primary)', margin: '0 auto 16px' }} />
            <p>No upcoming events found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;