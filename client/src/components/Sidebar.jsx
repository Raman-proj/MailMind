import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaInbox, FaCalendarAlt, FaCog, FaSignOutAlt, FaMagic } from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <FaMagic />
          </div>
          <span className="sidebar-logo-text">MailMind AI</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        
        <NavLink 
          to="/" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <div className="sidebar-link-icon"><FaInbox /></div>
          <span>Inbox</span>
        </NavLink>
        
        <NavLink 
          to="/calendar" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <div className="sidebar-link-icon"><FaCalendarAlt /></div>
          <span>Calendar</span>
        </NavLink>
        
        <div className="sidebar-section-label" style={{ marginTop: '16px' }}>Preferences</div>
        
        <NavLink 
          to="/settings" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <div className="sidebar-link-icon"><FaCog /></div>
          <span>Settings</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="User" />
            ) : (
              <span>{user?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-email">{user?.email || 'user@example.com'}</div>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="btn btn-ghost"
          style={{ width: '100%', marginTop: '12px' }}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;