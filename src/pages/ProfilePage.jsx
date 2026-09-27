import { User, LogOut } from 'lucide-react'
import { useTranslation } from '../LanguageContext'

export default function ProfilePage({ user, activities, automationState, onSignOut }) {
  const { t } = useTranslation()
  const businessEvents = activities.filter(a => a.category === 'business')
  const hoursSaved     = (businessEvents.length * 0.4).toFixed(1)
  const workflowsRun   = automationState.status !== 'idle' ? 1 : 0
  const joinDate       = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })

  return (
    <div className="page-content">
      <div className="profile-layout">
        {/* Profile card */}
        <div className="panel profile-card">
          <div className="profile-avatar-area">
            <div className="profile-avatar">
              <User size={32} />
            </div>
            <div>
              <h3 className="profile-name">{user?.name || t('profile.demoUser', 'Demo User')}</h3>
              <p className="dim-text">{user?.email || 'demo@workflowos.ai'}</p>
              <p className="dim-text" style={{ marginTop: 4, fontSize: 12 }}>{t('profile.memberSince', 'Member since')} {joinDate}</p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-val">{hoursSaved}h</span>
              <span className="dim-text">{t('profile.hoursSaved', 'Hours Saved')}</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-val">{businessEvents.length}</span>
              <span className="dim-text">{t('profile.eventsRecorded', 'Events Recorded')}</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-val">{workflowsRun}</span>
              <span className="dim-text">{t('profile.automationsRun', 'Automations Run')}</span>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn btn-secondary">{t('profile.editProfile', 'Edit Profile')}</button>
            <button className="btn btn-danger" onClick={onSignOut}>
              <LogOut size={14} />
              {t('profile.signOut', 'Sign Out')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
