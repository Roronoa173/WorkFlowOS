import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const APP_COLORS = {
  'WorkFlowOS': 'var(--accent)',
  'Gmail':       'var(--red)',
  'File System': 'var(--amber)',
  'CRM':         'var(--purple)',
  'Slack':       'var(--green)',
  'Web Browser': 'var(--text-secondary)',
}

export default function ActivityMonitorPage({
  activities = [],
  workflowSessions = [],
}) {
  const [filter, setFilter] = useState('all') // all | business | raw_ui
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('')

  const selectedSession = workflowSessions.find(w => w.id === selectedWorkflowId)

  // Filter activities by selected workflow first
  const baseActivities = selectedWorkflowId
    ? activities.filter(act => act.workflowId === selectedWorkflowId)
    : activities

  const filtered = baseActivities.filter(act => {
    return (
      filter === 'all' ||
      (filter === 'business' && act.category === 'business') ||
      (filter === 'raw_ui'   && act.category === 'raw_ui')
    )
  })

  return (
    <div className="page-content">
      {/* Toolbar */}
      <div className="monitor-toolbar">
        {/* Full-width workflow dropdown */}
        <div className="wf-dropdown-wrap">
          <select
            className="wf-dropdown-select"
            value={selectedWorkflowId}
            onChange={e => setSelectedWorkflowId(e.target.value)}
          >
            <option value="">All Workflows</option>
            {workflowSessions.map(wf => (
              <option key={wf.id} value={wf.id}>
                {wf.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="wf-dropdown-chevron" />
        </div>

        <div className="filter-tabs">
          {['all', 'business', 'raw_ui'].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'filter-tab-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'business' ? 'Business' : 'UI Events'}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Feed Table */}
      <div className="panel">
        {selectedSession && (
          <div className="panel-header">
            <span className="panel-title">{selectedSession.name}</span>
            <span className="badge badge-dim badge-sm">{filtered.length} events</span>
          </div>
        )}
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 24px' }}>
              <p>{baseActivities.length === 0
                ? 'No activities recorded for this workflow.'
                : 'No activities match the current filter.'}</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Source</th>
                  <th>Action</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(act => (
                  <tr key={act.id}>
                    <td className="td-time">{act.time}</td>
                    <td>
                      <span
                        className="source-dot"
                        style={{ background: APP_COLORS[act.app] || 'var(--text-secondary)' }}
                      />
                      {act.app}
                    </td>
                    <td className="td-action">{act.action}</td>
                    <td>
                      {act.category === 'business' ? (
                        <span className="badge badge-blue badge-sm">{act.actionType || 'Business'}</span>
                      ) : (
                        <span className="badge badge-dim badge-sm">UI</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
