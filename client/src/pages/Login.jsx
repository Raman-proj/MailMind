import { FaMagic, FaCalendarAlt, FaReply, FaGoogle } from 'react-icons/fa';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent-primary), #a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: 'white', boxShadow: '0 8px 32px rgba(108, 92, 231, 0.3)' }}>
            <FaMagic />
          </div>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px', background: 'linear-gradient(135deg, var(--text-primary), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Your inbox, understood.
        </h1>
        
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.5' }}>
          AI that understands your emails, writes thoughtful replies, and turns meeting requests into calendar events.
        </p>

        <a 
          href="/api/auth/google" 
          className="btn btn-primary"
          style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', fontSize: '16px', borderRadius: '8px' }}
        >
          <FaGoogle /> Continue with Google
        </a>

        <div style={{ marginTop: '32px', textAlign: 'left', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FaMagic style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Automated AI Understanding</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FaReply style={{ color: 'var(--accent-green)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Context-Aware Smart Replies</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaCalendarAlt style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>One-Click Meeting Scheduling</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;