import { useState } from 'react'
import { Trash2 } from 'lucide-react'

const DEFAULT_ACTIONS = [
  { id: 'act-1', step: 1, title: 'Read customer email', service: 'Gmail', parameter: 'customerRequest' },
  { id: 'act-2', step: 2, title: 'Download attachment', service: 'File System', parameter: 'attachment' },
  { id: 'act-3', step: 3, title: 'Find customer in CRM', service: 'CRM', parameter: 'customerName' },
  { id: 'act-4', step: 4, title: 'Update customer record', service: 'CRM', parameter: 'customerName' },
  { id: 'act-5', step: 5, title: 'Notify relevant team in Slack', service: 'Slack', parameter: 'customerName' }
]

const DEFAULT_VARIABLES = [
  { name: 'customerName', type: 'string', description: 'Extracted customer name' },
  { name: 'customerRequest', type: 'string', description: 'Subject or nature of inquiry' },
  { name: 'attachment', type: 'file', description: 'Attached invoice or document' }
]

export default function WorkflowsPage({
  workflowSessions = [],
  generatedWorkflowData,
  automationState,
  onApprove,
  onReject,
  onExecute,
  onStop,
  onDeleteWorkflow,
}) {
  const [workflowToDelete, setWorkflowToDelete] = useState(null)

  const sessionsToRender = workflowSessions.length > 0
    ? workflowSessions
    : (generatedWorkflowData ? [{
        id: generatedWorkflowData.id || 'wf-1',
        name: generatedWorkflowData.name || 'Workflow 1',
        generatedWorkflowData,
        activities: [],
        automationState
      }] : [])

  if (sessionsToRender.length === 0) {
    return (
      <div className="page-content">
        <div className="panel">
          <div className="empty-state" style={{ padding: '60px 24px' }}>
            <p>No workflows generated yet.</p>
            <small>Press Start in Monitoring to name and begin a workflow session, or go to Discoveries.</small>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      {sessionsToRender.map(session => {
        const wf = session.generatedWorkflowData || (generatedWorkflowData?.id === session.id || generatedWorkflowData?.workflowId === session.id ? generatedWorkflowData : null) || {
          id: session.id,
          name: session.name,
          trigger: 'New customer request received',
          status: 'Draft',
          actions: DEFAULT_ACTIONS,
          variables: DEFAULT_VARIABLES
        }

        const currentAutoState = session.automationState || (automationState?.activeWorkflow?.id === session.id ? automationState : { status: 'idle', actionsState: [], logs: [], message: '' })
        const isRunning = currentAutoState.status === 'running'
        const isCompleted = wf.status === 'Completed' || (currentAutoState.status === 'completed' && currentAutoState.activeWorkflow?.id === wf.id)

        // Session-specific requests / events
        const sessionActivities = session.activities || []
        const customerRequests = sessionActivities.filter(a => a.data?.type === 'customer_request' || a.actionType === 'Customer Request Submitted')

        return (
          <div key={session.id} className="workflow-session-container" style={{ marginBottom: 32 }}>
            {/* Workflow header row */}
            <div className="panel">
              <div className="wf-page-header">
                <div>
                  <h3 className="wf-page-name">{session.name}</h3>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`badge badge-${(wf.status === 'Completed' || isCompleted) ? 'green' : wf.status === 'Approved' ? 'green' : wf.status === 'Rejected' ? 'red' : 'amber'}`}>
                    {isCompleted ? 'Completed' : wf.status}
                  </span>
                  {wf.status === 'Draft' && (
                    <>
                      <button className="btn btn-danger btn-sm" onClick={() => onReject && onReject(session.id)}>
                        Reject
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => onApprove && onApprove(session.id)}>
                        Approve
                      </button>
                    </>
                  )}
                  {wf.status === 'Approved' && !isCompleted && !isRunning && (
                    <button className="btn btn-primary btn-sm" onClick={() => onExecute && onExecute(session.id)}>
                      Run Workflow
                    </button>
                  )}
                  {wf.status === 'Approved' && !isCompleted && isRunning && (
                    <button className="btn btn-danger btn-sm" onClick={() => onStop && onStop(session.id)}>
                      Stop
                    </button>
                  )}
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ color: 'var(--red)', marginLeft: 4 }}
                    title="Delete workflow"
                    onClick={() => setWorkflowToDelete(session)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Dedicated Customer Requests for this specific workflow session */}
              <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>
                    Customer Requests ({customerRequests.length})
                  </span>
                  <span className="badge badge-dim badge-sm">{sessionActivities.length} total events</span>
                </div>
                {customerRequests.length === 0 ? (
                  <p className="dim-text" style={{ fontSize: 12, margin: '8px 0' }}>
                    No customer requests submitted during this workflow session.
                  </p>
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Customer</th>
                          <th>Request</th>
                          <th>Attachment</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerRequests.map((req, idx) => {
                          const cData = req.data || {}
                          return (
                            <tr key={req.id || idx}>
                              <td className="td-num">{idx + 1}</td>
                              <td className="td-bold">{cData.customer || 'Customer'}</td>
                              <td>{cData.request || req.action}</td>
                              <td><code>{cData.attachment || 'document.pdf'}</code></td>
                              <td className="td-time">{req.time}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Actions table */}
              <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>
                    Workflow Actions ({(wf.actions || DEFAULT_ACTIONS).length})
                  </span>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Action</th>
                        <th>Service</th>
                        <th>Parameter</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(wf.actions || DEFAULT_ACTIONS).map((act, i) => {
                        const engineAct = currentAutoState.actionsState?.[i]
                        const status    = engineAct ? engineAct.status : 'pending'
                        return (
                          <tr key={act.id}>
                            <td className="td-num">{act.step}</td>
                            <td className="td-bold">{act.title}</td>
                            <td>{act.service}</td>
                            <td><code>{act.parameter}</code></td>
                            <td>
                              <span className={`badge badge-sm badge-${status === 'completed' ? 'green' : status === 'running' ? 'blue' : status === 'interrupted' ? 'red' : 'dim'}`}>
                                {status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Execution Log */}
            {currentAutoState.logs?.length > 0 && (
              <div className="panel" style={{ marginTop: 16 }}>
                <div className="panel-header">
                  <span className="panel-title">Execution Log ({session.name})</span>
                  {currentAutoState.message && (
                    <span className={`badge badge-${currentAutoState.status === 'completed' ? 'green' : 'red'} badge-sm`}>
                      {currentAutoState.status}
                    </span>
                  )}
                </div>
                <div className="log-console">
                  {currentAutoState.logs.map((log, idx) => (
                    <div key={idx} className={`log-line log-line-${log.type || 'info'}`}>
                      <span className="log-ts">[{log.timestamp}]</span>
                      <span className="log-txt">{log.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Variables — Placed below Execution Log */}
            <div className="panel" style={{ marginTop: 16 }}>
              <div className="panel-header">
                <span className="panel-title">Variables ({session.name})</span>
              </div>
              <div className="vars-list">
                {(wf.variables || DEFAULT_VARIABLES).map(v => (
                  <div key={v.name} className="var-row">
                    <code className="var-name-code">{v.name}</code>
                    <span className="badge badge-dim badge-sm">{v.type}</span>
                    <span className="dim-text">{v.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      {/* Delete Workflow Confirmation Modal */}
      {workflowToDelete && (
        <div className="modal-overlay" onClick={() => setWorkflowToDelete(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Delete Workflow</span>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>
                Are you sure you want to delete {workflowToDelete.name}?
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setWorkflowToDelete(null)}
              >
                No
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (onDeleteWorkflow) onDeleteWorkflow(workflowToDelete.id)
                  setWorkflowToDelete(null)
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
