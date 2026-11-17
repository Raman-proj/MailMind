import { useNavigate } from 'react-router-dom';
import { FaMagic, FaCalendarAlt } from 'react-icons/fa';

const EmailCard = ({ email }) => {
  const navigate = useNavigate();

  // Format date nicely
  const dateObj = new Date(email.date);
  const now = new Date();
  const isToday = dateObj.toDateString() === now.toDateString();
  const dateStr = isToday 
    ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

  // Get sender initials
  const initials = email.from.name
    ? email.from.name.charAt(0).toUpperCase()
    : email.from.email.charAt(0).toUpperCase();

  return (
    <div 
      className={`email-card ${!email.isRead ? 'unread' : ''}`}
      onClick={() => navigate(`/emails/${email.id}`)}
    >
      <div className="email-card-avatar">
        {initials}
      </div>

      <div className="email-card-content">
        <div className="email-card-top">
          <div className="email-card-from">
            {email.from.name || email.from.email}
          </div>
          <div className="email-card-date">
            {dateStr}
          </div>
        </div>

        <div className="email-card-subject">
          {email.subject || '(No Subject)'}
        </div>

        <div className="email-card-snippet">
          {email.snippet}
        </div>
      </div>
      
      {/* If we had analysis data in the list, we could show badges here */}
    </div>
  );
};

export default EmailCard;