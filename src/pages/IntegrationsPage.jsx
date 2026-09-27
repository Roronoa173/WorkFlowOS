import { useTranslation } from '../LanguageContext'

const INTEGRATIONS = [
  { id: 'gmail',   name: 'Gmail',        descKey: 'gmailDesc',   desc: 'Read and send emails',              status: 'connected',   color: '#ef4444' },
  { id: 'drive',   name: 'Google Drive', descKey: 'driveDesc',   desc: 'Access and download files',         status: 'connected',   color: '#f59e0b' },
  { id: 'slack',   name: 'Slack',        descKey: 'slackDesc',   desc: 'Send team notifications',           status: 'connected',   color: '#22c55e' },
  { id: 'crm',     name: 'CRM',          descKey: 'crmDesc',     desc: 'Update customer records',           status: 'available',   color: '#4f7eff' },
  { id: 'browser', name: 'Browser',      descKey: 'browserDesc', desc: 'Monitor browser activity',          status: 'available',   color: '#8b5cf6' },
  { id: 'files',   name: 'File System',  descKey: 'filesDesc',   desc: 'Read and write local files',        status: 'available',   color: '#64748b' },
  { id: 'jira',    name: 'Jira',         descKey: 'jiraDesc',    desc: 'Sync project tasks',                status: 'coming_soon', color: '#4f7eff' },
  { id: 'notion',  name: 'Notion',       descKey: 'notionDesc',  desc: 'Sync notes and databases',          status: 'coming_soon', color: '#e8eaed' },
  { id: 'hubspot', name: 'HubSpot',      descKey: 'hubspotDesc', desc: 'Advanced CRM integration',          status: 'coming_soon', color: '#f97316' },
]

const STATUS_BADGE = { connected: 'green', available: 'blue', coming_soon: 'dim' }

export default function IntegrationsPage() {
  const { t } = useTranslation()

  const statusLabel = {
    connected:   t('integrations.connected', 'Connected'),
    available:   t('integrations.available', 'Available'),
    coming_soon: t('integrations.comingSoon', 'Coming Soon'),
  }

  return (
    <div className="page-content">
      <div className="integrations-grid">
        {INTEGRATIONS.map(int => (
          <div key={int.id} className="integration-card">
            <div className="int-icon" style={{ background: int.color + '22', border: `1px solid ${int.color}44` }}>
              <span style={{ color: int.color, fontWeight: 700, fontSize: 13 }}>
                {int.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="int-body">
              <span className="int-name">{int.name}</span>
              <span className="int-desc dim-text">{t(`integrations.${int.descKey}`, int.desc)}</span>
            </div>
            <span className={`badge badge-sm badge-${STATUS_BADGE[int.status]}`}>
              {statusLabel[int.status] || int.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
