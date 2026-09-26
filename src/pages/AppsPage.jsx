const APPS = [
  { id: 'browser', name: 'Browser',      desc: 'Monitor and replay browser sessions',  status: 'active',    color: '#8b5cf6' },
  { id: 'email',   name: 'Email',        desc: 'Read incoming emails and attachments',  status: 'active',    color: '#ef4444' },
  { id: 'files',   name: 'Files',        desc: 'Detect file downloads and uploads',     status: 'active',    color: '#f59e0b' },
  { id: 'crm',     name: 'CRM',          desc: 'Customer record synchronization',       status: 'inactive',  color: '#4f7eff' },
  { id: 'slack',   name: 'Messaging',    desc: 'Team notification dispatch',            status: 'active',    color: '#22c55e' },
]

export default function AppsPage() {
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
                  {app.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <span className="app-desc dim-text">{app.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
