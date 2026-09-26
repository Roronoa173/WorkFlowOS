import WorkflowDiagram from '../components/WorkflowDiagram'

export default function DiscoveriesPage({
  detectedResult,
  isAnalyzingAi,
  aiAnalysis,
  onUnderstandWithAI,
  onGenerateWorkflow,
  onIgnore,
}) {
  const DEMO_STEPS = ['Gmail', 'Download', 'CRM', 'Slack']

  return (
    <div className="page-content">
      {!detectedResult.detected ? (
        <div className="panel">
          <div className="empty-state" style={{ padding: '60px 24px' }}>
            <p>No workflow pattern detected yet.</p>
            <small>Start recording and submit requests for 3+ customers (e.g. Rahul, Amit, Raj).</small>
          </div>
        </div>
      ) : (
        <div className="discoveries-grid">
          {/* Primary Discovery Card */}
          <div className="discovery-card-new">
            <div className="disc-card-header">
              <div>
                <span className="badge badge-blue" style={{ marginBottom: 8, display: 'inline-block' }}>
                  Pattern Detected
                </span>
                <h3 className="disc-workflow-name">{detectedResult.workflowName}</h3>
              </div>
              <div className="disc-meta">
                <span className="dim-text">{detectedResult.repetitions}× repeated</span>
              </div>
            </div>

            {/* Mini diagram */}
            <div style={{ marginBottom: 16 }}>
              <WorkflowDiagram steps={DEMO_STEPS} />
            </div>

            {/* Full sequence chips */}
            <div className="disc-sequence">
              {detectedResult.sequence.map((step, idx) => (
                <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span className="seq-chip">{step}</span>
                  {idx < detectedResult.sequence.length - 1 && (
                    <span className="seq-arrow">→</span>
                  )}
                </span>
              ))}
            </div>

            <div className="disc-card-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={onUnderstandWithAI}
                disabled={isAnalyzingAi}
              >
                {isAnalyzingAi ? 'Analyzing…' : 'Understand with AI'}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onGenerateWorkflow}
                disabled={!aiAnalysis}
                title={!aiAnalysis ? 'Run AI understanding first' : ''}
              >
                Generate Workflow
              </button>
              <button className="btn btn-ghost btn-sm" onClick={onIgnore}>
                Dismiss
              </button>
            </div>
          </div>

          {/* AI Analysis Panel (shows when available) */}
          {aiAnalysis && (
            <div className="panel ai-panel">
              <div className="panel-header">
                <span className="panel-title">AI Understanding</span>
                <span className="badge badge-dim badge-sm">Mock AI</span>
              </div>

              <div className="ai-fields">
                <div className="ai-field">
                  <span className="field-label-sm">Intent</span>
                  <span className="ai-intent">{aiAnalysis.intent}</span>
                </div>
                <div className="ai-field">
                  <span className="field-label-sm">Trigger</span>
                  <div className="trigger-chip">{aiAnalysis.trigger}</div>
                </div>
                <div className="ai-field">
                  <span className="field-label-sm">Actions</span>
                  <ol className="ai-action-list">
                    {aiAnalysis.actions.map((act, i) => (
                      <li key={i} className="ai-action-li">
                        <span className="ai-action-num">{i + 1}</span>
                        {act}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="ai-field">
                  <span className="field-label-sm">Condition</span>
                  <div className="condition-chip">{aiAnalysis.condition}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
