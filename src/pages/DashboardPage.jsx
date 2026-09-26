import { Clock, Zap, Play, CheckCircle, TrendingUp } from 'lucide-react'
import WorkflowDiagram from '../components/WorkflowDiagram'

const DEMO_SEQUENCE = ['Gmail', 'Download', 'CRM', 'Slack']

export default function DashboardPage({
  activities,
  detectedResult,
  automationState,
  isRecording,
  onNavigate,
}) {
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
          <h2 className="welcome-heading">Welcome back</h2>
          <p className="welcome-sub">
            {isRecording
              ? 'Recording is active — workflow patterns are being monitored.'
              : 'Start recording to begin monitoring your workflows.'}
          </p>
        </div>
        <div className={`rec-indicator ${isRecording ? 'rec-indicator-on' : ''}`}>
          <span className="rec-dot-sm" />
          {isRecording ? 'Recording' : 'Idle'}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-blue"><Clock size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-value">{hoursSaved}h</span>
            <span className="kpi-label">Hours Saved</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-purple"><Zap size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-value">{detectedResult.detected ? detectedResult.repetitions : 0}</span>
            <span className="kpi-label">Workflows Discovered</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-green"><Play size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-value">{workflowsRun}</span>
            <span className="kpi-label">Automations Run</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-amber"><TrendingUp size={16} /></div>
          <div className="kpi-body">
            <span className="kpi-value">{successRate}</span>
            <span className="kpi-label">Success Rate</span>
          </div>
        </div>
      </div>

      {/* Two-column row */}
      <div className="dashboard-cols">
        {/* Discovery Overview */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Workflow Discovery</span>
            <button className="link-btn" onClick={() => onNavigate('discoveries')}>View all</button>
          </div>
          {detectedResult.detected ? (
            <div>
              <div className="discovery-alert-row">
                <span className="badge badge-blue">Pattern Detected</span>
                <span className="dim-text">{detectedResult.repetitions} repetitions</span>
              </div>
              <p className="discovery-name">{detectedResult.workflowName}</p>
              <WorkflowDiagram steps={DEMO_SEQUENCE} />
            </div>
          ) : (
            <div className="empty-state">
              <p>No repeated pattern detected yet.</p>
              <small>Submit 3+ customer requests to trigger detection.</small>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Recent Activity</span>
            <button className="link-btn" onClick={() => onNavigate('activity')}>View all</button>
          </div>
          {recentActivity.length === 0 ? (
            <div className="empty-state">
              <p>No activity recorded yet.</p>
              <small>Start recording and submit a customer request.</small>
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
            <span className="dash-card-title">Automation Engine</span>
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
    </div>
  )
}
