import { useState, useEffect, useMemo, useRef } from 'react'
import './App.css'
import { detectRepeatedWorkflow } from './workflowDetector'
import { understandWorkflow }     from './aiWorkflowUnderstanding'
import { generateWorkflow }       from './workflowGenerator'
import { executeWorkflow }        from './automationEngine'

import Sidebar   from './components/Sidebar'
import Header    from './components/Header'
import LoginPage from './pages/LoginPage'

import DashboardPage       from './pages/DashboardPage'
import ActivityMonitorPage from './pages/ActivityMonitorPage'
import DiscoveriesPage     from './pages/DiscoveriesPage'
import WorkflowsPage       from './pages/WorkflowsPage'
import WorkMapPage         from './pages/WorkMapPage'
import HistoryPage         from './pages/HistoryPage'
import IntegrationsPage    from './pages/IntegrationsPage'
import AppsPage            from './pages/AppsPage'
import SettingsPage        from './pages/SettingsPage'
import ProfilePage         from './pages/ProfilePage'
import SimulatorPage       from './pages/SimulatorPage'

// ─── Auth ────────────────────────────────────────────────────────────────────

function App() {
  // ── Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser]             = useState(null)

  // ── Navigation
  const [activePage, setActivePage] = useState('dashboard')

  // ── Recording
  const [isRecording, setIsRecording] = useState(false)

  // ── Idle timer (2 min → Idle if monitoring not started)
  const idleTimerRef = useRef(null)
  const [monitoringStatus, setMonitoringStatus] = useState('idle') // idle | active | idle-timeout

  // ── Simulator form
  const [customerName,    setCustomerName]    = useState('Rahul')
  const [customerRequest, setCustomerRequest] = useState('Product issue')
  const [attachmentName,  setAttachmentName]  = useState('invoice.pdf')
  const [simulatorError,  setSimulatorError]  = useState('')

  // ── Activities
  const [activities, setActivities] = useState([])

  // ── AI Understanding
  const [aiAnalysis,    setAiAnalysis]    = useState(null)
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false)

  // ── Generated Workflow
  const [generatedWorkflowData, setGeneratedWorkflowData] = useState(null)

  // ── Automation Engine
  const [automationState, setAutomationState] = useState({
    status: 'idle', // idle | running | completed | interrupted | error
    activeWorkflow: null,
    actionsState: [],
    logs: [],
    message: ''
  })
  const engineHandleRef = useRef(null)

  // ─── Idle timer: if not started within 2 min of login, set monitoringStatus to idle-timeout
  useEffect(() => {
    if (!isLoggedIn) return
    idleTimerRef.current = setTimeout(() => {
      if (!isRecording) {
        setMonitoringStatus('idle-timeout')
      }
    }, 2 * 60 * 1000)
    return () => clearTimeout(idleTimerRef.current)
  }, [isLoggedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── DOM recording listeners
  useEffect(() => {
    if (!isRecording) return

    const formatTimestamp = () => {
      const now = new Date()
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }

    const handleClick = (e) => {
      const target = e.target
      // Exclude internal controls from raw event capture
      if (
        target.closest &&
        (target.closest('.sidebar') ||
          target.closest('.app-header') ||
          target.closest('.simulator-panel') ||
          target.closest('.workflow-generator-card') ||
          target.closest('.automation-engine-card'))
      ) return

      let label = target.innerText?.trim() || target.getAttribute('aria-label') || target.tagName.toLowerCase()
      if (label.length > 25) label = label.slice(0, 25) + '...'

      const newEvent = {
        id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        app: 'Web Browser',
        action: `Clicked "${label}" (${target.tagName.toLowerCase()})`,
        time: formatTimestamp(),
        type: 'recorded',
        category: 'raw_ui'
      }
      setActivities(prev => [newEvent, ...prev])
    }

    window.addEventListener('click', handleClick, true)
    return () => window.removeEventListener('click', handleClick, true)
  }, [isRecording])

  // ─── Pattern detection (memoised)
  const detectedResult = useMemo(() => detectRepeatedWorkflow(activities), [activities])

  // ─── Hours saved (derived)
  const hoursSaved = (activities.filter(a => a.category === 'business').length * 0.4).toFixed(1)

  // ─── Auth handlers
  const handleLogin  = (userData) => { setUser(userData); setIsLoggedIn(true) }
  const handleSignOut = () => {
    setIsLoggedIn(false)
    setUser(null)
    setActivePage('dashboard')
    setIsRecording(false)
    setActivities([])
    setAiAnalysis(null)
    setGeneratedWorkflowData(null)
    setSimulatorError('')
    setAutomationState({ status: 'idle', activeWorkflow: null, actionsState: [], logs: [], message: '' })
    if (engineHandleRef.current) engineHandleRef.current.stop()
  }

  // ─── Recording handlers
  const handleStartRecording = () => {
    setIsRecording(true)
    setMonitoringStatus('active')
    setSimulatorError('')
    clearTimeout(idleTimerRef.current)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setMonitoringStatus('idle')
  }

  // ─── Customer Request Submission (FIX 1: recording gate preserved exactly)
  const handleProcessCustomerRequest = (e) => {
    if (e && e.preventDefault) e.preventDefault()

    // FIX 1: Enforce recording must be active
    if (!isRecording) {
      setSimulatorError('Start recording before processing the customer request.')
      return
    }

    setSimulatorError('')

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const cust = customerName.trim() || 'Anonymous Customer'
    const req  = customerRequest.trim() || 'General Inquiry'
    const att  = attachmentName.trim() || 'document.pdf'

    const structuredEventData = { type: 'customer_request', action: 'submit_request', customer: cust, request: req, attachment: att }

    const businessSequence = [
      {
        id: 'evt-1-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
        app: 'WorkFlowOS', actionType: 'Customer Request Submitted',
        action: `Customer Request Submitted (${cust} - "${req}")`,
        time: timeStr, type: 'recorded', category: 'business', data: structuredEventData
      },
      {
        id: 'evt-2-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
        app: 'Gmail', actionType: 'Email Received',
        action: `Email Received from ${cust}`,
        time: timeStr, type: 'recorded', category: 'business'
      },
      {
        id: 'evt-3-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
        app: 'File System', actionType: 'Attachment Downloaded',
        action: `Attachment Downloaded ("${att}")`,
        time: timeStr, type: 'recorded', category: 'business'
      },
      {
        id: 'evt-4-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
        app: 'CRM', actionType: 'CRM Record Updated',
        action: `CRM Record Updated for ${cust}`,
        time: timeStr, type: 'recorded', category: 'business'
      },
      {
        id: 'evt-5-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
        app: 'Slack', actionType: 'Slack Notification Sent',
        action: `Slack Notification Sent to #support`,
        time: timeStr, type: 'recorded', category: 'business'
      }
    ]

    setActivities(prev => [...businessSequence, ...prev])
  }

  const handleQuickFill = (name, req, file) => {
    setCustomerName(name)
    setCustomerRequest(req)
    setAttachmentName(file)
    setSimulatorError('')
  }

  const handleClearActivities = () => {
    if (engineHandleRef.current) engineHandleRef.current.stop()
    setActivities([])
    setAiAnalysis(null)
    setGeneratedWorkflowData(null)
    setSimulatorError('')
    setAutomationState({ status: 'idle', activeWorkflow: null, actionsState: [], logs: [], message: '' })
  }

  // ─── AI / Workflow handlers
  const handleUnderstandWithAI = () => {
    setIsAnalyzingAi(true)
    setTimeout(() => {
      const result = understandWorkflow(activities, detectedResult.sequence)
      setAiAnalysis(result)
      setIsAnalyzingAi(false)
    }, 400)
  }

  const handleGenerateWorkflow = () => {
    const newWorkflow = generateWorkflow(aiAnalysis || {})
    setGeneratedWorkflowData(newWorkflow)
    setActivePage('workflows')
  }

  const handleApproveGeneratedWorkflow = () => {
    if (!generatedWorkflowData) return
    setGeneratedWorkflowData(prev => ({ ...prev, status: 'Approved' }))
  }

  const handleRejectGeneratedWorkflow = () => {
    if (!generatedWorkflowData) return
    if (engineHandleRef.current) engineHandleRef.current.stop()
    setGeneratedWorkflowData(prev => ({ ...prev, status: 'Rejected' }))
  }

  // ─── Automation Engine (FIX 2: onInterrupted preserved exactly)
  const handleExecuteWorkflow = () => {
    if (!generatedWorkflowData || generatedWorkflowData.status !== 'Approved') return
    if (engineHandleRef.current) engineHandleRef.current.stop()

    const initialActions = generatedWorkflowData.actions.map(act => ({ ...act, status: 'pending' }))
    setAutomationState({
      status: 'running', activeWorkflow: generatedWorkflowData,
      actionsState: initialActions, logs: [], message: ''
    })

    const handle = executeWorkflow(generatedWorkflowData, {
      onActionUpdate: ({ actionsState }) => {
        setAutomationState(prev => ({ ...prev, actionsState }))
      },
      onLog: (logEntry) => {
        setAutomationState(prev => ({ ...prev, logs: [...prev.logs, logEntry] }))
      },
      onComplete: ({ totalActions, completedActions }) => {
        setAutomationState(prev => ({
          ...prev, status: 'completed',
          message: `Workflow Completed: ${completedActions} / ${totalActions} actions completed`
        }))
      },
      // FIX 2: onInterrupted (not onStop) — exact original wiring
      onInterrupted: ({ actionsState }) => {
        setAutomationState(prev => ({
          ...prev, status: 'interrupted', actionsState,
          message: 'Workflow execution was interrupted by the user.'
        }))
      },
      onError: (errMsg) => {
        setAutomationState(prev => ({ ...prev, status: 'error', message: errMsg }))
      }
    })
    engineHandleRef.current = handle
  }

  const handleStopAutomation = () => {
    if (engineHandleRef.current) engineHandleRef.current.stop()
  }

  // ─── Render: Login
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  // ─── Render: Authenticated shell
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            activities={activities}
            detectedResult={detectedResult}
            automationState={automationState}
            isRecording={isRecording}
            onNavigate={setActivePage}
          />
        )
      case 'activity':
        return (
          <ActivityMonitorPage
            activities={activities}
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onClear={handleClearActivities}
          />
        )
      case 'simulator':
        return (
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
            onProcess={handleProcessCustomerRequest}
            onQuickFill={handleQuickFill}
          />
        )
      case 'discoveries':
        return (
          <DiscoveriesPage
            detectedResult={detectedResult}
            isAnalyzingAi={isAnalyzingAi}
            aiAnalysis={aiAnalysis}
            onUnderstandWithAI={handleUnderstandWithAI}
            onGenerateWorkflow={handleGenerateWorkflow}
            onIgnore={() => {}}
          />
        )
      case 'workflows':
        return (
          <WorkflowsPage
            generatedWorkflowData={generatedWorkflowData}
            automationState={automationState}
            onApprove={handleApproveGeneratedWorkflow}
            onReject={handleRejectGeneratedWorkflow}
            onExecute={handleExecuteWorkflow}
            onStop={handleStopAutomation}
          />
        )
      case 'workmap':
        return (
          <WorkMapPage
            generatedWorkflowData={generatedWorkflowData}
            automationState={automationState}
          />
        )
      case 'history':
        return (
          <HistoryPage
            automationState={automationState}
            generatedWorkflowData={generatedWorkflowData}
          />
        )
      case 'integrations':
        return <IntegrationsPage />
      case 'apps':
        return <AppsPage />
      case 'settings':
        return <SettingsPage />
      case 'profile':
        return (
          <ProfilePage
            user={user}
            activities={activities}
            automationState={automationState}
            onSignOut={handleSignOut}
          />
        )
      default:
        return (
          <DashboardPage
            activities={activities}
            detectedResult={detectedResult}
            automationState={automationState}
            isRecording={isRecording}
            onNavigate={setActivePage}
          />
        )
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onClearActivities={handleClearActivities}
        automationStatus={automationState.status}
      />

      <div className="app-main">
        <Header
          activePage={activePage}
          onNavigate={setActivePage}
          hoursSaved={hoursSaved}
        />

        <div className="app-content">
          {/* Customer Request Simulator always accessible via sidebar — show as inline card on dashboard */}
          {activePage === 'dashboard' && (
            <div className="dashboard-sim-bar">
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
                onProcess={handleProcessCustomerRequest}
                onQuickFill={handleQuickFill}
              />
            </div>
          )}
          {renderPage()}
        </div>
      </div>
    </div>
  )
}

export default App
