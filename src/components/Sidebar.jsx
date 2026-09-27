import {
  LayoutDashboard,
  Activity,
  Compass,
  GitBranch,
  Map,
  History,
  Plug,
  Grid,
  Settings,
  Circle,
  Square,
  Cpu,
  ChevronRight
} from 'lucide-react'
import { useTranslation } from '../LanguageContext'

export default function Sidebar({
  activePage,
  onNavigate,
  isRecording,
  onStartRecording,
  onStopRecording,
  onClearActivities,
  automationStatus,
}) {
  const { t } = useTranslation()

  const navItems = [
    { id: 'dashboard',       label: t('nav.dashboard', 'Dashboard'),              Icon: LayoutDashboard },
    { id: 'activity',        label: t('nav.activity', 'Activity Monitor'),        Icon: Activity },
    { id: 'discoveries',     label: t('nav.discoveries', 'Discoveries'),          Icon: Compass },
    { id: 'workflows',       label: t('nav.workflows', 'Workflows'),              Icon: GitBranch },
    { id: 'workmap',         label: t('nav.workmap', 'Work Map'),                 Icon: Map },
    { id: 'history',         label: t('nav.history', 'History'),                  Icon: History },
    { id: 'integrations',    label: t('nav.integrations', 'Integrations'),        Icon: Plug },
    { id: 'apps',            label: t('nav.apps', 'Apps'),                        Icon: Grid },
    { id: 'settings',        label: t('nav.settings', 'Settings'),                Icon: Settings },
  ]

  const engineStatusLabel = {
    idle: t('common.idle', 'Idle'),
    running: t('common.running', 'Running'),
    completed: t('common.completed', 'Completed'),
    interrupted: t('common.interrupted', 'Interrupted'),
    error: t('common.error', 'Error'),
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
        <div className="logo-mark">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="5" cy="12" r="3" fill="var(--accent)" />
            <circle cx="19" cy="5" r="3" fill="var(--accent)" opacity="0.7" />
            <circle cx="19" cy="19" r="3" fill="var(--accent)" opacity="0.5" />
            <line x1="7.8" y1="10.8" x2="16.4" y2="6.8" stroke="var(--accent)" strokeWidth="1.4" strokeOpacity="0.5" />
            <line x1="7.8" y1="13.2" x2="16.4" y2="17.2" stroke="var(--accent)" strokeWidth="1.4" strokeOpacity="0.5" />
          </svg>
        </div>
        <span className="logo-text">WorkFlowOS</span>
      </div>

      {/* Monitoring Controls */}
      <div className="sidebar-section">
        <span className="sidebar-section-label">{t('nav.monitoring', 'Monitoring')}</span>
        <div className="monitoring-controls">
          <div className="recording-status-row">
            <span className={`rec-dot ${isRecording ? 'rec-dot-active' : ''}`} />
            <span className="rec-label">{t('common.online', 'Online')}</span>
          </div>
          <div className="monitoring-btns">
            {!isRecording ? (
              <button className="mon-btn mon-btn-start" onClick={onStartRecording}>
                <Circle size={8} fill="currentColor" />
                {t('common.start', 'Start')}
              </button>
            ) : (
              <button className="mon-btn mon-btn-stop" onClick={onStopRecording}>
                <Square size={8} fill="currentColor" />
                {t('common.stop', 'Stop')}
              </button>
            )}
            <button className="mon-btn mon-btn-clear" onClick={onClearActivities} title={t('common.clear', 'Clear all activities')}>
              {t('common.clear', 'Clear')}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-item ${activePage === id ? 'nav-item-active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={15} />
            <span>{label}</span>
            {activePage === id && <ChevronRight size={12} className="nav-chevron" />}
          </button>
        ))}
      </nav>

      {/* Engine Status */}
      <div className="sidebar-footer">
        <div className="engine-status-block">
          <Cpu size={13} />
          <div className="engine-status-text">
            <span className="engine-status-label">{t('nav.appEngine', 'App Engine')}</span>
            <span className={`engine-status-val status-${automationStatus}`}>
              {engineStatusLabel[automationStatus] || automationStatus}
            </span>
          </div>
        </div>
        <div className="sidebar-version">v1.0.0</div>
      </div>
    </aside>
  )
}
