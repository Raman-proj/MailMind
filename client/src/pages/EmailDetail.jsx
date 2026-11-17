import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import DOMPurify from 'dompurify';
import { FaArrowLeft, FaMagic, FaCalendarPlus, FaPaperPlane, FaReply, FaCheck } from 'react-icons/fa';

const EmailDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [generatingReply, setGeneratingReply] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [replyTone, setReplyTone] = useState('professional');
  const [generatedReply, setGeneratedReply] = useState('');
  
  // Meeting State
  const [meetingState, setMeetingState] = useState(null);
  const [addingToCalendar, setAddingToCalendar] = useState(false);
  const [calendarSuccess, setCalendarSuccess] = useState(false);

  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const data = await api.emails.get(id);
        setEmail(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmail();
  }, [id]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await api.ai.analyze(id);
      setAiAnalysis(result);
      if (result.meeting?.isMeeting) {
        setMeetingState(result.meeting);
      }
    } catch (err) {
      console.error(err);
      setAnalysisError(err.message || 'AI analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateReply = async () => {
    setGeneratingReply(true);
    setReplyError(null);
    try {
      const result = await api.ai.generateReply(id, replyTone);
      setGeneratedReply(result.reply);
    } catch (err) {
      console.error(err);
      setReplyError(err.message || 'Failed to generate reply');
    } finally {
      setGeneratingReply(false);
    }
  };

  const handleSendReply = async () => {
    setSendingReply(true);
    try {
      await api.emails.send(id, {
        to: email.from.email,
        subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
        body: generatedReply,
        threadId: email.threadId,
      });
      setReplySuccess(true);
      setTimeout(() => setReplySuccess(false), 3000);
      setGeneratedReply('');
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleAddToCalendar = async () => {
    setAddingToCalendar(true);
    try {
      const attendees = meetingState.attendees 
        ? meetingState.attendees.map(email => ({ email }))
        : [{ email: email.from.email }];

      const startDate = new Date(`${meetingState.date}T${meetingState.time || '09:00'}`);
      const endDate = new Date(startDate.getTime() + (meetingState.durationMinutes || 60) * 60000);

      const response = await api.calendar.create({
        title: meetingState.title,
        description: `Generated from email: ${email.subject}`,
        location: meetingState.location || '',
        start: { dateTime: startDate.toISOString() },
        end: { dateTime: endDate.toISOString() },
        attendees,
      });
      setCalendarSuccess(true);
      if (response.htmlLink) {
        setMeetingState(prev => ({ ...prev, htmlLink: response.htmlLink }));
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to add to calendar');
    } finally {
      setAddingToCalendar(false);
    }
  };

  const updateMeetingField = (field, value) => {
    setMeetingState(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      Loading email...
    </div>
  );
  if (error) return <div style={{ padding: '32px', color: 'var(--accent-red)' }}>{error}</div>;
  if (!email) return null;

  const htmlContent = email.body?.html 
    ? DOMPurify.sanitize(email.body.html) 
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-subtle)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/')}
          className="btn btn-ghost btn-sm"
        >
          <FaArrowLeft /> Back to Inbox
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {analysisError && (
            <span style={{ color: 'var(--accent-red)', fontSize: '13px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={analysisError}>
              ⚠️ {analysisError}
            </span>
          )}
          {!aiAnalysis && (
            <button 
              onClick={handleAnalyze}
              disabled={analyzing}
              className="btn btn-primary btn-sm"
            >
              {analyzing ? 'Analyzing...' : <><FaMagic /> Analyze with AI</>}
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        {/* Main Email Content */}
        <div className="email-detail" style={{ flex: 1, minWidth: 0 }}>
          <div className="email-detail-header">
            <h1 className="email-detail-subject">{email.subject}</h1>
            
            <div className="email-detail-meta">
              <div className="email-detail-avatar">
                {email.from.name ? email.from.name.charAt(0).toUpperCase() : email.from.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="email-detail-sender-name">{email.from.name || email.from.email}</div>
                <div className="email-detail-sender-email">&lt;{email.from.email}&gt; to {email.to.map(t => t.email).join(', ')}</div>
              </div>
              <div className="email-detail-date">
                {new Date(email.date).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="email-detail-body">
            {htmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            ) : (
              <div>{email.body?.text || email.snippet}</div>
            )}
          </div>
        </div>

        {/* AI Analysis Panel */}
        {aiAnalysis && (
          <div style={{ width: '380px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Analysis Card */}
            <div className="ai-panel" style={{ marginTop: 0 }}>
              <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaMagic style={{ color: 'var(--accent-primary)' }} /> AI Understanding
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Summary</div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{aiAnalysis.summary}</p>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div className="tag tag-purple">{aiAnalysis.intent.replace('_', ' ')}</div>
                <div className={`tag tag-${aiAnalysis.priority === 'high' ? 'red' : aiAnalysis.priority === 'medium' ? 'amber' : 'green'}`}>
                  {aiAnalysis.priority} Priority
                </div>
              </div>

              {aiAnalysis.actionRequired && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Action Required</div>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{aiAnalysis.actionRequired}</p>
                </div>
              )}
            </div>

            {/* Meeting Card */}
            {meetingState && (
              <div className="ai-panel" style={{ marginTop: 0 }}>
                <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCalendarPlus style={{ color: 'var(--accent-cyan)' }} /> Event Details
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    value={meetingState.title || ''}
                    onChange={(e) => updateMeetingField('title', e.target.value)}
                    placeholder="Event Title"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '6px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '14px' }}
                  />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="date"
                      value={meetingState.date || ''}
                      onChange={(e) => updateMeetingField('date', e.target.value)}
                      style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '6px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '14px' }}
                    />
                    <input
                      type="time"
                      value={meetingState.time || ''}
                      onChange={(e) => updateMeetingField('time', e.target.value)}
                      style={{ flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '6px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '14px' }}
                    />
                  </div>
                  <input
                    type="text"
                    value={meetingState.location || ''}
                    onChange={(e) => updateMeetingField('location', e.target.value)}
                    placeholder="Location or Link"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '6px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '14px' }}
                  />
                </div>

                {meetingState.htmlLink ? (
                  <a
                    href={meetingState.htmlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <FaCheck /> Open in Google Calendar
                  </a>
                ) : (
                  <button
                    onClick={handleAddToCalendar}
                    disabled={addingToCalendar}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {addingToCalendar ? 'Adding...' : <><FaCalendarPlus /> Add to Calendar</>}
                  </button>
                )}
              </div>
            )}

            {/* Reply Generator */}
            <div className="ai-panel" style={{ marginTop: 0 }}>
              <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaReply style={{ color: 'var(--accent-green)' }} /> Smart Reply
              </h3>
              
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px', marginBottom: '16px' }}>
                {['professional', 'friendly', 'concise'].map(tone => (
                  <button
                    key={tone}
                    onClick={() => setReplyTone(tone)}
                    style={{
                      flex: 1, padding: '6px', fontSize: '12px', fontWeight: 'bold', textTransform: 'capitalize', borderRadius: '4px',
                      background: replyTone === tone ? 'var(--bg-secondary)' : 'transparent',
                      color: replyTone === tone ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    {tone}
                  </button>
                ))}
              </div>

              {replyError && (
                <div style={{ color: 'var(--accent-red)', fontSize: '12px', marginBottom: '12px' }}>
                  ⚠️ {replyError}
                </div>
              )}

              {!generatedReply ? (
                <button
                  onClick={handleGenerateReply}
                  disabled={generatingReply}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {generatingReply ? 'Generating...' : <><FaMagic style={{ color: 'var(--accent-primary)' }} /> Generate Draft</>}
                </button>
              ) : (
                <div>
                  <textarea
                    value={generatedReply}
                    onChange={(e) => setGeneratedReply(e.target.value)}
                    style={{ width: '100%', height: '180px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', borderRadius: '6px', padding: '12px', color: 'var(--text-primary)', fontSize: '14px', resize: 'none', marginBottom: '16px' }}
                  />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleGenerateReply}
                      disabled={generatingReply}
                      className="btn btn-ghost"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={handleSendReply}
                      disabled={sendingReply || replySuccess}
                      className={`btn ${replySuccess ? 'btn-success' : 'btn-primary'}`}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      {replySuccess ? <FaCheck /> : <FaPaperPlane />}
                      {replySuccess ? 'Sent!' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailDetail;