import { useTranslation } from '../LanguageContext'

const APPS = [
  { id: 'browser', name: 'Browser',   descKey: 'browserDesc', desc: 'Monitor and replay browser sessions', status: 'active',   color: '#8b5cf6' },
  { id: 'email',   name: 'Email',     descKey: 'emailDesc',   desc: 'Read incoming emails and attachments', status: 'active',   color: '#ef4444' },
  { id: 'files',   name: 'Files',     descKey: 'filesDesc',   desc: 'Detect file downloads and uploads',    status: 'active',   color: '#f59e0b' },
  { id: 'crm',     name: 'CRM',       descKey: 'crmDesc',     desc: 'Customer record synchronization',      status: 'inactive', color: '#4f7eff' },
  { id: 'slack',   name: 'Messaging', descKey: 'slackDesc',   desc: 'Team notification dispatch',           status: 'active',   color: '#22c55e' },
]

export default function AppsPage() {
  const { t } = useTranslation()

  return (
    <div className="page-content">
      <div className="apps-grid">
        {APPS.map(app => (
          <div key={app.id} className="app-card">
            <div className="app-icon" style={{ background: app.color + '1a', border: `1px solid ${app.color}33` }}>
              <span style={{ color: app.color, fontWeight: 800, fontSize: 16 }}>
                {app.name.slice(0, 1)}
              </span>
            </div>
            <div className="app-body">
              <div className="app-name-row">
                <span className="app-name">{app.name}</span>
                <span className={`badge badge-sm badge-${app.status === 'active' ? 'green' : 'dim'}`}>
                  {app.status === 'active' ? t('apps.active', 'Active') : t('apps.inactive', 'Inactive')}
                </span>
              </div>
              <span className="app-desc dim-text">{t(`apps.${app.descKey}`, app.desc)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
