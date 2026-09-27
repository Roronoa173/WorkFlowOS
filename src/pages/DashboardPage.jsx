import { useState } from 'react'
import { Clock, Zap, Play, TrendingUp, ChevronRight, ChevronDown, Trash2 } from 'lucide-react'
import WorkflowDiagram from '../components/WorkflowDiagram'
import SimulatorPage from './SimulatorPage'
import { useTranslation } from '../LanguageContext'

const DEMO_SEQUENCE = ['Gmail', 'Download', 'CRM', 'Slack']

export default function DashboardPage({
  activities,
  detectedResult,
  automationState,
  isRecording,
  workflowSessions = [],
  activeSessionId,
  onNavigate,
  onDeleteWorkflow,
  customerName,
  setCustomerName,
  customerRequest,
  setCustomerRequest,
  attachmentName,
  setAttachmentName,
  simulatorError,
  setSimulatorError,
  onProcessCustomerRequest,
  onQuickFill,
}) {
  const { t } = useTranslation()
  const [expandedSessions, setExpandedSessions] = useState({})
  const [workflowToDelete, setWorkflowToDelete] = useState(null)

  const toggleSession = (id) => {
    setExpandedSessions(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // KPI calculations
  const businessEvents   = activities.filter(a => a.category === 'business')
  const workflowsRun     = automationState.status === 'completed' ? 1 : 0
  const successRate       = workflowsRun > 0 ? '100%' : '—'
  const hoursSaved        = (businessEvents.length * 0.4).toFixed(1)

  // Recent activity (last 6 business events)
  const recentActivity = activities.filter(a => a.category === 'business').slice(0, 6)

  return (
    <div className="page-content">
      {/* Welcome */}
      <div className="dashboard-welcome">
        <div>
          <h2 className="welcome-heading">{t('dashboard.welcomeHeading', 'Welcome back')}</h2>
          <p className="welcome-sub">
            {isRecording
              ? t('dashboard.recActiveSub', 'Recording is active — workflow patterns are being monitored.')
              : t('dashboard.recInactiveSub', 'Start recording to begin monitoring your workflows.')}
          </p>
        </div>
        <div className={`rec-indicator ${isRecording ? 'rec-indicator-on' : ''}`}>
          <span className="rec-dot-sm" />
          {t('common.online', 'Online')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-blue"><Clock size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-value">{hoursSaved}h</span>
            <span className="kpi-label">{t('dashboard.hoursSaved', 'Hours Saved')}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-purple"><Zap size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-value">{detectedResult.detected ? detectedResult.repetitions : 0}</span>
            <span className="kpi-label">{t('dashboard.workflowsDiscovered', 'Workflows Discovered')}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-green"><Play size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-value">{workflowsRun}</span>
            <span className="kpi-label">{t('dashboard.automationsRun', 'Automations Run')}</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-amber"><TrendingUp size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-value">{successRate}</span>
            <span className="kpi-label">{t('dashboard.successRate', 'Success Rate')}</span>
          </div>
        </div>
      </div>

      {/* Customer Request Simulator — Placed below Welcome + KPI stats and above Workflow Lists */}
      <div className="dashboard-sim-bar" style={{ marginTop: 24, marginBottom: 24 }}>
        <SimulatorPage
          isRecording={isRecording}
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerRequest={customerRequest}
          setCustomerRequest={setCustomerRequest}
          attachmentName={attachmentName}
          setAttachmentName={setAttachmentName}
          simulatorError={simulatorError}
          setSimulatorError={setSimulatorError}
          onProcess={onProcessCustomerRequest}
          onQuickFill={onQuickFill}
        />
      </div>

      {/* Dedicated Workflow Lists Section */}
      <div className="dash-card">
        <div className="dash-card-header">
          <span className="dash-card-title">{t('dashboard.workflowLists', 'Workflow Lists')}</span>
          <span className="badge badge-dim badge-sm">{workflowSessions.length} {t('common.total', 'total')}</span>
        </div>
        {workflowSessions.length === 0 ? (
          <div className="empty-state">
            <p>{t('dashboard.noSessions', 'No workflow sessions created yet.')}</p>
            <small>{t('dashboard.noSessionsSub', 'Press Start in Monitoring to name and begin a new workflow session.')}</small>
          </div>
        ) : (
          <div className="dash-wf-list">
            {workflowSessions.map(session => {
              const isExpanded = !!expandedSessions[session.id]
              const sessionActivities = session.activities || []
              const sessionBusiness = sessionActivities.filter(a => a.category === 'business')
              const latestCustomerReq = sessionBusiness.find(a => a.data?.customer)
              const custInfo = latestCustomerReq?.data

              return (
                <div key={session.id} className={`dash-wf-item ${isExpanded ? 'dash-wf-item-open' : ''}`}>
                  <div className="dash-wf-header" onClick={() => toggleSession(session.id)}>
                    <div className="dash-wf-title-row">
                      {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      <span>{session.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {session.id === activeSessionId && isRecording && (
                        <span className="badge badge-green badge-sm">{t('dashboard.activeRecording', 'Active Recording')}</span>
                      )}
                      <span className="dim-text" style={{ fontSize: 11 }}>{session.createdAt}</span>
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ color: 'var(--red)', padding: 4 }}
                        title={t('common.delete', 'Delete')}
                        onClick={(e) => {
                          e.stopPropagation()
                          setWorkflowToDelete(session)
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="dash-wf-body">
                      <div className="dash-wf-meta-grid">
                        <div className="dash-wf-field">
                          <span className="field-label-sm">{t('dashboard.workflowNameLabel', 'Workflow Name')}</span>
                          <span className="field-val">{session.name}</span>
                        </div>
                        <div className="dash-wf-field">
                          <span className="field-label-sm">{t('dashboard.sessionStatusLabel', 'Session Status')}</span>
                          <span className="field-val">{session.id === activeSessionId && isRecording ? t('dashboard.activeRecording', 'Active Recording') : t('dashboard.completedSaved', 'Completed / Saved')}</span>
                        </div>
                        <div className="dash-wf-field">
                          <span className="field-label-sm">{t('dashboard.totalActivitiesLabel', 'Total Activities')}</span>
                          <span className="field-val">{sessionActivities.length} {t('common.events', 'events')} ({sessionBusiness.length} {t('common.business', 'business')})</span>
                        </div>
                        <div className="dash-wf-field">
                          <span className="field-label-sm">{t('dashboard.discoveredStatusLabel', 'Discovered Status')}</span>
                          <span className="field-val">{session.detectedResult?.detected ? `${session.detectedResult.repetitions}x ${t('discoveries.repeated', 'repeated')}` : t('dashboard.monitoringStatus', 'Monitoring')}</span>
                        </div>
                      </div>

                      {custInfo && (
                        <div style={{ marginTop: 4 }}>
                          <span className="field-label-sm" style={{ display: 'block', marginBottom: 4 }}>{t('dashboard.customerInfoLabel', 'Customer Information')}</span>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', background: 'var(--bg-raised)', padding: '8px 12px', borderRadius: 5 }}>
                            <span style={{ fontSize: 12 }}><strong>{t('common.customer', 'Customer')}:</strong> {custInfo.customer}</span>
                            <span style={{ fontSize: 12 }}><strong>{t('common.request', 'Request')}:</strong> {custInfo.request}</span>
                            <span style={{ fontSize: 12 }}><strong>{t('common.attachment', 'Attachment')}:</strong> {custInfo.attachment}</span>
                          </div>
                        </div>
                      )}

                      {sessionBusiness.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                          <span className="field-label-sm" style={{ display: 'block', marginBottom: 6 }}>{t('dashboard.recentActionsLabel', 'Recent Process Actions')}</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {sessionBusiness.slice(0, 4).map(act => (
                              <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                                <span>{act.actionType || act.action} ({act.app})</span>
                                <span>{act.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Two-column row */}
      <div className="dashboard-cols">
        {/* Discovery Overview */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">{t('dashboard.workflowDiscovery', 'Workflow Discovery')}</span>
            <button className="link-btn" onClick={() => onNavigate('discoveries')}>{t('common.viewAll', 'View all')}</button>
          </div>
          {detectedResult.detected ? (
            <div>
              <div className="discovery-alert-row">
                <span className="badge badge-blue">{t('dashboard.patternDetected', 'Pattern Detected')}</span>
                <span className="dim-text">{detectedResult.repetitions} {t('dashboard.repetitions', 'repetitions')}</span>
              </div>
              <p className="discovery-name">{detectedResult.workflowName}</p>
              <WorkflowDiagram steps={DEMO_SEQUENCE} />
            </div>
          ) : (
            <div className="empty-state">
              <p>{t('dashboard.noPattern', 'No repeated pattern detected yet.')}</p>
              <small>{t('dashboard.noPatternSub', 'Submit 3+ customer requests to trigger detection.')}</small>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">{t('dashboard.recentActivity', 'Recent Activity')}</span>
            <button className="link-btn" onClick={() => onNavigate('activity')}>{t('common.viewAll', 'View all')}</button>
          </div>
          {recentActivity.length === 0 ? (
            <div className="empty-state">
              <p>{t('dashboard.noActivity', 'No activity recorded yet.')}</p>
              <small>{t('dashboard.noActivitySub', 'Start recording and submit a customer request.')}</small>
            </div>
          ) : (
            <div className="recent-activity-list">
              {recentActivity.map(act => (
                <div key={act.id} className="recent-act-row">
                  <div className="act-dot act-dot-business" />
                  <div className="act-row-body">
                    <span className="act-row-app">{act.app}</span>
                    <span className="act-row-action">{act.actionType || act.action}</span>
                  </div>
                  <span className="act-row-time">{act.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Automation Status */}
      {automationState.status !== 'idle' && (
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">{t('dashboard.automationEngine', 'Automation Engine')}</span>
            <span className={`badge badge-${automationState.status === 'completed' ? 'green' : automationState.status === 'interrupted' ? 'red' : 'blue'}`}>
              {automationState.status}
            </span>
          </div>
          <p className="dim-text" style={{ marginBottom: 8 }}>{automationState.activeWorkflow?.name}</p>
          <div className="dash-actions-mini">
            {automationState.actionsState.map(act => (
              <div key={act.id} className={`dash-action-row dash-action-${act.status}`}>
                <span className="dash-act-name">{act.title}</span>
                <span className={`badge badge-sm badge-${act.status === 'completed' ? 'green' : act.status === 'running' ? 'blue' : act.status === 'interrupted' ? 'red' : 'dim'}`}>
                  {act.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Workflow Modal */}
      {workflowToDelete && (
        <div className="modal-overlay" onClick={() => setWorkflowToDelete(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{t('dashboard.deleteModalTitle', 'Delete Workflow')}</span>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>
                {t('dashboard.deleteModalPrompt', { name: workflowToDelete.name }, `Are you sure you want to delete ${workflowToDelete.name}?`)}
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setWorkflowToDelete(null)}
              >
                {t('common.no', 'No')}
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (onDeleteWorkflow) onDeleteWorkflow(workflowToDelete.id)
                  setWorkflowToDelete(null)
                }}
              >
                {t('common.yes', 'Yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
