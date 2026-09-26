const INTEGRATIONS = [
  { id: 'gmail',   name: 'Gmail',        desc: 'Read and send emails',              status: 'connected',  color: '#ef4444' },
  { id: 'drive',   name: 'Google Drive', desc: 'Access and download files',         status: 'connected',  color: '#f59e0b' },
  { id: 'slack',   name: 'Slack',        desc: 'Send team notifications',           status: 'connected',  color: '#22c55e' },
  { id: 'crm',     name: 'CRM',          desc: 'Update customer records',           status: 'available',  color: '#4f7eff' },
  { id: 'browser', name: 'Browser',      desc: 'Monitor browser activity',          status: 'available',  color: '#8b5cf6' },
  { id: 'files',   name: 'File System',  desc: 'Read and write local files',        status: 'available',  color: '#64748b' },
  { id: 'jira',    name: 'Jira',         desc: 'Sync project tasks',                status: 'coming_soon', color: '#4f7eff' },
  { id: 'notion',  name: 'Notion',       desc: 'Sync notes and databases',          status: 'coming_soon', color: '#e8eaed' },
  { id: 'hubspot', name: 'HubSpot',      desc: 'Advanced CRM integration',          status: 'coming_soon', color: '#f97316' },
]

const STATUS_LABEL = { connected: 'Connected', available: 'Available', coming_soon: 'Coming Soon' }
const STATUS_BADGE  = { connected: 'green',     available: 'blue',      coming_soon: 'dim' }

export default function IntegrationsPage() {
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
              <span className="int-desc dim-text">{int.desc}</span>
            </div>
            <span className={`badge badge-sm badge-${STATUS_BADGE[int.status]}`}>
              {STATUS_LABEL[int.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
