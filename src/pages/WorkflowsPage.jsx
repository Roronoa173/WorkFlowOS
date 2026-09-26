export default function WorkflowsPage({
  generatedWorkflowData,
  automationState,
  onApprove,
  onReject,
  onExecute,
  onStop,
}) {
  if (!generatedWorkflowData) {
    return (
      <div className="page-content">
        <div className="panel">
          <div className="empty-state" style={{ padding: '60px 24px' }}>
            <p>No workflows generated yet.</p>
            <small>Go to Discoveries → Understand with AI → Generate Workflow.</small>
          </div>
        </div>
      </div>
    )
  }

  const wf = generatedWorkflowData
  const isRunning = automationState.status === 'running'

  return (
    <div className="page-content">
      {/* Workflow header row */}
      <div className="panel">
        <div className="wf-page-header">
          <div>
            <h3 className="wf-page-name">{wf.name}</h3>
            <p className="dim-text" style={{ marginTop: 4 }}>Trigger: {wf.trigger}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`badge badge-${wf.status === 'Approved' ? 'green' : wf.status === 'Rejected' ? 'red' : 'amber'}`}>
              {wf.status}
            </span>
            {wf.status === 'Draft' && (
              <>
                <button className="btn btn-danger btn-sm" onClick={onReject}>Reject</button>
                <button className="btn btn-primary btn-sm" onClick={onApprove}>Approve</button>
              </>
            )}
            {wf.status === 'Approved' && !isRunning && (
              <button className="btn btn-primary btn-sm" onClick={onExecute}>
                Run Workflow
              </button>
            )}
            {wf.status === 'Approved' && isRunning && (
              <button className="btn btn-danger btn-sm" onClick={onStop}>
                Stop
              </button>
            )}
          </div>
        </div>

        {/* Actions table */}
        <div className="table-wrap" style={{ marginTop: 20 }}>
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
              {wf.actions.map((act, i) => {
                const engineAct = automationState.actionsState[i]
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

      {/* Variables */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Variables</span>
        </div>
        <div className="vars-list">
          {wf.variables.map(v => (
            <div key={v.name} className="var-row">
              <code className="var-name-code">{v.name}</code>
              <span className="badge badge-dim badge-sm">{v.type}</span>
              <span className="dim-text">{v.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Log */}
      {automationState.logs.length > 0 && (
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Execution Log</span>
            {automationState.message && (
              <span className={`badge badge-${automationState.status === 'completed' ? 'green' : 'red'} badge-sm`}>
                {automationState.status}
              </span>
            )}
          </div>
          <div className="log-console">
            {automationState.logs.map((log, idx) => (
              <div key={idx} className={`log-line log-line-${log.type || 'info'}`}>
                <span className="log-ts">[{log.timestamp}]</span>
                <span className="log-txt">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
