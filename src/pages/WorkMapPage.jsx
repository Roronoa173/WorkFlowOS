import WorkflowDiagram from '../components/WorkflowDiagram'

export default function WorkMapPage({ generatedWorkflowData, automationState }) {
  if (!generatedWorkflowData) {
    return (
      <div className="page-content">
        <div className="panel">
          <div className="empty-state" style={{ padding: '60px 24px' }}>
            <p>No workflow to visualize yet.</p>
            <small>Generate and approve a workflow first.</small>
          </div>
        </div>
      </div>
    )
  }

  const wf = generatedWorkflowData
  const statusMap = {}
  automationState.actionsState.forEach((act, i) => {
    const stepLabel = wf.actions[i]?.service || wf.actions[i]?.title
    if (stepLabel) statusMap[stepLabel] = act.status
  })

  // Use service names as nodes (short enough for the diagram)
  const steps = wf.actions.map(a => a.service)

  // Display badge: Do not display "Completed" badge on Work Map
  const isCompleted = wf.status === 'Completed' || (automationState.status === 'completed' && automationState.activeWorkflow?.id === wf.id)
  const showBadge = !isCompleted && wf.status !== 'Completed'

  return (
    <div className="page-content">
      <div className="panel">
        <div className="panel-header" style={{ marginBottom: 16 }}>
          <span className="panel-title">{wf.name}</span>
          {showBadge && (
            <span className={`badge badge-${wf.status === 'Approved' ? 'green' : wf.status === 'Rejected' ? 'red' : 'amber'}`}>
              {wf.status}
            </span>
          )}
        </div>

        {/* Trigger display removed for Process Customer Request */}
        {wf.name !== 'Process Customer Request' && wf.trigger && (
          <p className="dim-text" style={{ marginBottom: 24 }}>Trigger: {wf.trigger}</p>
        )}

        {/* Node diagram */}
        <div className="workmap-diagram-area">
          <WorkflowDiagram steps={steps} statusMap={statusMap} />
        </div>

        {/* Node detail list */}
        <div className="workmap-node-list">
          {wf.actions.map((act, i) => {
            const engineAct = automationState.actionsState[i]
            const status    = engineAct ? engineAct.status : 'pending'
            return (
              <div key={act.id} className={`workmap-node-row node-row-${status}`}>
                <div className={`node-status-circle node-circle-${status}`} />
                <div className="node-row-body">
                  <span className="node-row-title">{act.title}</span>
                  <span className="node-row-service dim-text">{act.service}</span>
                </div>
                <span className={`badge badge-sm badge-${status === 'completed' ? 'green' : status === 'running' ? 'blue' : status === 'interrupted' ? 'red' : 'dim'}`}>
                  {status}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
