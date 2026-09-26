import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

// History is derived from automationState — one entry per completed/interrupted run
export default function HistoryPage({ automationState, generatedWorkflowData }) {
  const [expanded, setExpanded] = useState(false)

  const hasRun = automationState.status !== 'idle'

  const entries = hasRun && generatedWorkflowData ? [
    {
      id: 'run-1',
      date: new Date().toLocaleDateString(),
      workflow: generatedWorkflowData.name,
      status: automationState.status,
      actions: automationState.actionsState.length,
      completed: automationState.actionsState.filter(a => a.status === 'completed').length,
      logs: automationState.logs,
    }
  ] : []

  return (
    <div className="page-content">
      <div className="panel">
        {entries.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 24px' }}>
            <p>No execution history yet.</p>
            <small>Run a workflow to see history here.</small>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Workflow</th>
                    <th>Actions</th>
                    <th>Completed</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <>
                      <tr key={entry.id}>
                        <td className="td-time">{entry.date}</td>
                        <td className="td-bold">{entry.workflow}</td>
                        <td>{entry.actions}</td>
                        <td>{entry.completed}</td>
                        <td>
                          <span className={`badge badge-sm badge-${entry.status === 'completed' ? 'green' : entry.status === 'interrupted' ? 'red' : 'blue'}`}>
                            {entry.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="icon-btn"
                            onClick={() => setExpanded(v => !v)}
                            title="Toggle logs"
                          >
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr key={entry.id + '-logs'}>
                          <td colSpan={6} style={{ padding: '0 0 12px 0' }}>
                            <div className="log-console" style={{ margin: '8px 16px' }}>
                              {entry.logs.length === 0 ? (
                                <div className="log-line"><span className="log-txt dim-text">No log entries.</span></div>
                              ) : (
                                entry.logs.map((log, i) => (
                                  <div key={i} className={`log-line log-line-${log.type || 'info'}`}>
                                    <span className="log-ts">[{log.timestamp}]</span>
                                    <span className="log-txt">{log.text}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
