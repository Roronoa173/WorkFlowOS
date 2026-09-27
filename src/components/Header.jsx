import { Clock, User } from 'lucide-react'
import { useTranslation } from '../LanguageContext'

export default function Header({ activePage, onNavigate, hoursSaved }) {
  const { t } = useTranslation()

  const pageTitles = {
    dashboard:    t('nav.dashboard', 'Dashboard'),
    activity:     t('nav.activity', 'Activity Monitor'),
    discoveries:  t('nav.discoveries', 'Discoveries'),
    workflows:    t('nav.workflows', 'Workflows'),
    workmap:      t('nav.workmap', 'Work Map'),
    history:      t('nav.history', 'History'),
    integrations: t('nav.integrations', 'Integrations'),
    apps:         t('nav.apps', 'Apps'),
    settings:     t('nav.settings', 'Settings'),
    profile:      t('nav.profile', 'Profile'),
  }

  return (
    <header className="app-header">
      <h1 className="header-page-title">{pageTitles[activePage] || pageTitles.dashboard}</h1>

      <div className="header-right">
        <div className="hours-saved-chip">
          <Clock size={13} />
          <span><strong>{hoursSaved}h</strong> {t('nav.hoursSavedWeek', 'saved this week')}</span>
        </div>

        <button
          className="avatar-btn"
          onClick={() => onNavigate('profile')}
          title={t('nav.viewProfile', 'View Profile')}
        >
          <User size={16} />
        </button>
      </div>
    </header>
  )
}
