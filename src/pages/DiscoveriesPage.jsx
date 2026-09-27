import WorkflowDiagram from '../components/WorkflowDiagram'
import { useTranslation } from '../LanguageContext'

export default function DiscoveriesPage({
  detectedResult,
  isAnalyzingAi,
  aiAnalysis,
  workflowStatus, // 'pending' | 'approved' | 'rejected' | 'completed'
  onUnderstandWithAI,
  onGenerateWorkflow,
  _onDeleteDiscovery,
}) {
  const { t } = useTranslation()
  const DEMO_STEPS = ['Gmail', 'Download', 'CRM', 'Slack']

  const isRejected = workflowStatus === 'rejected' || workflowStatus === 'Rejected'

  return (
    <div className="page-content">
      {!detectedResult.detected ? (
        <div className="panel">
          <div className="empty-state" style={{ padding: '60px 24px' }}>
            <p>{t('discoveries.noPattern', 'No workflow pattern detected yet.')}</p>
            <small>{t('discoveries.noPatternSub', 'Start recording and submit requests for 3+ customers (e.g. Rahul, Amit, Raj).')}</small>
          </div>
        </div>
      ) : (
        <div className="discoveries-grid">
          {/* Primary Discovery Card */}
          <div className="discovery-card-new">
            <div className="disc-card-header">
              <div>
                <span className={`badge ${isRejected ? 'badge-red' : 'badge-blue'}`} style={{ marginBottom: 8, display: 'inline-block' }}>
                  {isRejected ? t('discoveries.rejected', 'Rejected') : t('discoveries.patternDetected', 'Pattern Detected')}
                </span>
                <h3 className="disc-workflow-name">{detectedResult.workflowName}</h3>
              </div>
              <div className="disc-meta">
                <span className="dim-text">{detectedResult.repetitions}× {t('discoveries.repeated', 'repeated')}</span>
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

            <div className="disc-card-actions" style={{ alignItems: 'center' }}>
              {!isRejected && (
                <>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={onUnderstandWithAI}
                    disabled={isAnalyzingAi}
                  >
                    {isAnalyzingAi ? t('discoveries.analyzing', 'Analyzing…') : t('discoveries.understandWithAi', 'Understand with AI')}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={onGenerateWorkflow}
                    disabled={!aiAnalysis}
                    title={!aiAnalysis ? t('discoveries.runAiFirst', 'Run AI understanding first') : ''}
                  >
                    {t('discoveries.generateWorkflow', 'Generate Workflow')}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* AI Analysis Panel (shows when available and not rejected) */}
          {aiAnalysis && !isRejected && (
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
                      <li key={i}>
                        <span className="act-service">{act.service}</span>
                        <span className="dim-text"> — {act.title}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="ai-field">
                  <span className="field-label-sm">Variables</span>
                  <div className="vars-mini">
                    {aiAnalysis.variables.map((v, i) => (
                      <span key={i} className="var-chip">
                        {v.name} <small>({v.type})</small>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
