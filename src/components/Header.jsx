import { Clock, User } from 'lucide-react'

const PAGE_TITLES = {
  dashboard:    'Dashboard',
  activity:     'Activity Monitor',
  discoveries:  'Discoveries',
  workflows:    'Workflows',
  workmap:      'Work Map',
  history:      'History',
  integrations: 'Integrations',
  apps:         'Apps',
  settings:     'Settings',
  profile:      'Profile',
}

export default function Header({ activePage, onNavigate, hoursSaved }) {
  return (
    <header className="app-header">
      <h1 className="header-page-title">{PAGE_TITLES[activePage] || 'Dashboard'}</h1>

      <div className="header-right">
        <div className="hours-saved-chip">
          <Clock size={13} />
          <span><strong>{hoursSaved}h</strong> saved this week</span>
        </div>

        <button
          className="avatar-btn"
          onClick={() => onNavigate('profile')}
          title="View Profile"
        >
          <User size={16} />
        </button>
      </div>
    </header>
  )
}
