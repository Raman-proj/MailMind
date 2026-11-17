import { useAuth } from '../context/AuthContext';
import { FaCog, FaRobot } from 'react-icons/fa';

const Settings = () => {
  const { user } = useAuth();
  // We'll keep the preferences local for the demo as before
  
  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your AI preferences</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <FaCog style={{ color: 'var(--text-muted)' }} /> Account
        </h2>
        
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="User" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
          ) : (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{user?.name}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{user?.email}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <FaRobot style={{ color: 'var(--accent-primary)' }} /> AI Preferences
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Default Reply Tone</label>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>This sets the default tone used when generating AI replies.</p>
            <select className="btn btn-secondary" style={{ padding: '8px 16px', width: '200px' }}>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="concise">Concise</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;