import { Search, Trash2 } from 'lucide-react'
import { useState } from 'react'

const APP_COLORS = {
  'WorkFlowOS': 'var(--accent)',
  'Gmail':       'var(--red)',
  'File System': 'var(--amber)',
  'CRM':         'var(--purple)',
  'Slack':       'var(--green)',
  'Web Browser': 'var(--text-secondary)',
}

export default function ActivityMonitorPage({ activities, isRecording, onStartRecording, onStopRecording, onClear }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | business | raw_ui

  const filtered = activities.filter(act => {
    const matchFilter =
      filter === 'all' ||
      (filter === 'business' && act.category === 'business') ||
      (filter === 'raw_ui'   && act.category === 'raw_ui')
    const matchSearch =
      !search ||
      act.app?.toLowerCase().includes(search.toLowerCase()) ||
      act.action?.toLowerCase().includes(search.toLowerCase()) ||
      act.actionType?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="page-content">
      {/* Toolbar */}
      <div className="monitor-toolbar">
        <div className="search-box">
          <Search size={13} />
          <input
            type="text"
            placeholder="Search activities…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
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

        <div className="monitor-toolbar-right">
          {!isRecording ? (
            <button className="mon-btn mon-btn-start" onClick={onStartRecording}>
              <span className="rec-dot-sm" style={{ background: '#fff' }} />
              Start Recording
            </button>
          ) : (
            <button className="mon-btn mon-btn-stop" onClick={onStopRecording}>
              Stop Recording
            </button>
          )}
          <button className="icon-btn" onClick={onClear} title="Clear feed">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Activity Feed Table */}
      <div className="panel">
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 24px' }}>
              <p>{activities.length === 0
                ? 'No activities recorded yet. Start recording and submit a customer request.'
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
