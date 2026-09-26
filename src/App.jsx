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

  // ── Named Workflow Sessions (Dashboard requirement)
  const [workflowSessions, setWorkflowSessions] = useState([])
  const [activeSessionId, setActiveSessionId]   = useState(null)
  const [isNameModalOpen, setIsNameModalOpen]   = useState(false)
  const [pendingWorkflowName, setPendingWorkflowName] = useState('')

  const activeSessionIdRef = useRef(activeSessionId)
  const workflowSessionsRef = useRef(workflowSessions)
  useEffect(() => {
    activeSessionIdRef.current = activeSessionId
    workflowSessionsRef.current = workflowSessions
  }, [activeSessionId, workflowSessions])

  // ── Persistent History Records (survive workflow deletion)
  const [historyRecords, setHistoryRecords] = useState([])

  // ── Recording navigation warning
  const [navWarningTarget, setNavWarningTarget] = useState(null)

  // ── Process Control Request State ('pending' | 'approved' | 'rejected' | 'completed')
  const [discoveryState, setDiscoveryState] = useState({
    deleted: false,
    status: 'pending' // pending | approved | rejected | completed
  })

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

      const currentActiveId = activeSessionIdRef.current
      const currentSession = workflowSessionsRef.current.find(s => s.id === currentActiveId)

      const newEvent = {
        id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        workflowId: currentActiveId || undefined,
        workflowName: currentSession ? currentSession.name : undefined,
        app: 'Web Browser',
        action: `Clicked "${label}" (${target.tagName.toLowerCase()})`,
        time: formatTimestamp(),
        type: 'recorded',
        category: 'raw_ui'
      }
      setActivities(prev => [newEvent, ...prev])
      if (currentActiveId) {
        setWorkflowSessions(prev => prev.map(s => {
          if (s.id === currentActiveId) {
            return {
              ...s,
              activities: [newEvent, ...(s.activities || [])]
            }
          }
          return s
        }))
      }
    }

    window.addEventListener('click', handleClick, true)
    return () => window.removeEventListener('click', handleClick, true)
  }, [isRecording])

  // ─── Pattern detection (memoised)
  const detectedResult = useMemo(() => {
    if (discoveryState.deleted) {
      return { detected: false, workflowName: '', sequence: [], repetitions: 0, message: '' }
    }
    const rawResult = detectRepeatedWorkflow(activities)
    return rawResult
  }, [activities, discoveryState.deleted])

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
    setWorkflowSessions([])
    setActiveSessionId(null)
    setIsNameModalOpen(false)
    setPendingWorkflowName('')
    setDiscoveryState({ deleted: false, status: 'pending' })
    setAiAnalysis(null)
    setGeneratedWorkflowData(null)
    setSimulatorError('')
    setAutomationState({ status: 'idle', activeWorkflow: null, actionsState: [], logs: [], message: '' })
    setHistoryRecords([])
    if (engineHandleRef.current) engineHandleRef.current.stop()
  }

  // ─── Recording handlers (Step 1 & 2: Start opens popup modal)
  const handleStartRecording = () => {
    // If not currently recording, open modal to ask for workflow name
    setPendingWorkflowName(`Workflow ${workflowSessions.length + 1}`)
    setIsNameModalOpen(true)
  }

  const handleConfirmStartRecording = (customName) => {
    const finalName = (customName && customName.trim()) || `Workflow ${workflowSessions.length + 1}`
    const newSessionId = 'wf-sess-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)
    
    const initialWorkflow = generateWorkflow({ intent: finalName })
    initialWorkflow.id = newSessionId
    initialWorkflow.workflowId = newSessionId
    initialWorkflow.name = finalName
    initialWorkflow.status = 'Draft'

    const initialAutomation = {
      status: 'idle',
      activeWorkflow: initialWorkflow,
      actionsState: initialWorkflow.actions.map(act => ({ ...act, status: 'pending' })),
      logs: [],
      message: ''
    }

    const newSession = {
      id: newSessionId,
      name: finalName,
      status: 'active',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      activities: [],
      detectedResult: null,
      discoveryState: { deleted: false, status: 'pending' },
      generatedWorkflowData: initialWorkflow,
      automationState: initialAutomation,
    }

    setWorkflowSessions(prev => [newSession, ...prev])
    setActiveSessionId(newSessionId)
    setGeneratedWorkflowData(initialWorkflow)
    setAutomationState(initialAutomation)
    setIsNameModalOpen(false)
    setIsRecording(true)
    setMonitoringStatus('active')
    setSimulatorError('')
    clearTimeout(idleTimerRef.current)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setMonitoringStatus('idle')
    if (activeSessionId) {
      setWorkflowSessions(prev => prev.map(s => 
        s.id === activeSessionId ? { ...s, status: 'saved' } : s
      ))
    }
  }

  // Helper to record new activities to global activities list AND active session
  const addActivities = (newItems) => {
    const currentActiveId = activeSessionIdRef.current
    const currentSession = workflowSessionsRef.current.find(s => s.id === currentActiveId)
    
    const taggedItems = newItems.map(item => ({
      ...item,
      workflowId: item.workflowId || currentActiveId || undefined,
      workflowName: item.workflowName || (currentSession ? currentSession.name : undefined)
    }))

    setActivities(prev => [...taggedItems, ...prev])
    if (currentActiveId) {
      setWorkflowSessions(prev => prev.map(s => {
        if (s.id === currentActiveId) {
          const updatedActs = [...taggedItems, ...(s.activities || [])]
          const updatedDetection = detectRepeatedWorkflow(updatedActs)
          return {
            ...s,
            activities: updatedActs,
            detectedResult: updatedDetection
          }
        }
        return s
      }))
    }
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

    const currentActiveId = activeSessionIdRef.current || activeSessionId
    const currentSession = workflowSessionsRef.current.find(s => s.id === currentActiveId)

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const cust = customerName.trim() || 'Anonymous Customer'
    const req  = customerRequest.trim() || 'General Inquiry'
    const att  = attachmentName.trim() || 'document.pdf'

    const structuredEventData = { type: 'customer_request', action: 'submit_request', customer: cust, request: req, attachment: att }

    const businessSequence = [
      {
        id: 'evt-1-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
        workflowId: currentActiveId,
        workflowName: currentSession ? currentSession.name : undefined,
        app: 'WorkFlowOS', actionType: 'Customer Request Submitted',
        action: `Customer Request Submitted (${cust} - "${req}")`,
        time: timeStr, type: 'recorded', category: 'business', data: structuredEventData
      },
      {
        id: 'evt-2-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
        workflowId: currentActiveId,
        workflowName: currentSession ? currentSession.name : undefined,
        app: 'Gmail', actionType: 'Email Received',
        action: `Email Received from ${cust}`,
        time: timeStr, type: 'recorded', category: 'business'
      },
      {
        id: 'evt-3-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
        workflowId: currentActiveId,
        workflowName: currentSession ? currentSession.name : undefined,
        app: 'File System', actionType: 'Attachment Downloaded',
        action: `Attachment Downloaded ("${att}")`,
        time: timeStr, type: 'recorded', category: 'business'
      },
      {
        id: 'evt-4-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
        workflowId: currentActiveId,
        workflowName: currentSession ? currentSession.name : undefined,
        app: 'CRM', actionType: 'CRM Record Updated',
        action: `CRM Record Updated for ${cust}`,
        time: timeStr, type: 'recorded', category: 'business'
      },
      {
        id: 'evt-5-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
        workflowId: currentActiveId,
        workflowName: currentSession ? currentSession.name : undefined,
        app: 'Slack', actionType: 'Slack Notification Sent',
        action: `Slack Notification Sent to #support`,
        time: timeStr, type: 'recorded', category: 'business'
      }
    ]

    addActivities(businessSequence)
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
    setDiscoveryState({ deleted: false, status: 'pending' })
    setSimulatorError('')
    setAutomationState({ status: 'idle', activeWorkflow: null, actionsState: [], logs: [], message: '' })
  }


  const handleDeleteWorkflow = (workflowId) => {
    // 1. Capture snapshot of the session/workflow being deleted to store in History (Recycle Bin)
    const sessionToDelete = workflowSessionsRef.current?.find(s => s.id === workflowId) 
      || workflowSessions.find(s => s.id === workflowId)

    const targetWf = sessionToDelete?.generatedWorkflowData 
      || (generatedWorkflowData?.id === workflowId || generatedWorkflowData?.workflowId === workflowId ? generatedWorkflowData : null)
    
    const targetAutoState = sessionToDelete?.automationState 
      || (automationState?.activeWorkflow?.id === workflowId ? automationState : null)

    const workflowName = sessionToDelete?.name || targetWf?.name || 'Workflow'

    // Determine total and completed actions
    const totalActions = targetWf?.actions?.length 
      || targetAutoState?.actionsState?.length 
      || 5

    const completedActions = targetAutoState?.actionsState?.filter(a => a.status === 'completed').length 
      || (targetWf?.status === 'Completed' || targetAutoState?.status === 'completed' ? totalActions : 0)

    // Determine final status
    let finalStatus = 'Draft'
    if (targetWf?.status === 'Completed' || targetAutoState?.status === 'completed') {
      finalStatus = 'Completed'
    } else if (targetAutoState?.status === 'interrupted') {
      finalStatus = 'Interrupted'
    } else if (targetWf?.status === 'Rejected' || sessionToDelete?.discoveryState?.status === 'rejected') {
      finalStatus = 'Rejected'
    } else if (targetWf?.status === 'Approved') {
      finalStatus = 'Approved'
    } else if (targetWf?.status) {
      finalStatus = targetWf.status
    }

    // Push into historyRecords (Recycle Bin)
    const newHistoryRecord = {
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      workflowId: workflowId,
      workflowName: workflowName,
      date: new Date().toLocaleDateString('en-GB'),
      actions: totalActions,
      completed: completedActions,
      status: finalStatus,
    }

    setHistoryRecords(prev => [...prev, newHistoryRecord])

    setWorkflowSessions(prev => prev.filter(s => s.id !== workflowId))
    setActivities(prev => prev.filter(a => a.workflowId !== workflowId))
    if (activeSessionId === workflowId) {
      setActiveSessionId(null)
    }
    if (generatedWorkflowData && (generatedWorkflowData.id === workflowId || generatedWorkflowData.workflowId === workflowId)) {
      setGeneratedWorkflowData(null)
      setDiscoveryState({ deleted: false, status: 'pending' })
    }
    if (automationState.activeWorkflow?.id === workflowId) {
      if (engineHandleRef.current) engineHandleRef.current.stop()
      setAutomationState({ status: 'idle', activeWorkflow: null, actionsState: [], logs: [], message: '' })
    }
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
    const currentActiveId = activeSessionIdRef.current || activeSessionId
    const currentSession = workflowSessionsRef.current.find(s => s.id === currentActiveId)
    const currentName = currentSession ? currentSession.name : `Workflow ${workflowSessions.length + 1}`

    const newWorkflow = generateWorkflow(aiAnalysis || { intent: currentName })
    if (currentActiveId) {
      newWorkflow.id = currentActiveId
      newWorkflow.workflowId = currentActiveId
    }
    newWorkflow.name = currentName
    setGeneratedWorkflowData(newWorkflow)

    setWorkflowSessions(prev => {
      if (prev.length > 0 && currentActiveId) {
        return prev.map(s => {
          if (s.id === currentActiveId) {
            return {
              ...s,
              generatedWorkflowData: newWorkflow,
              discoveryState: { ...s.discoveryState, status: 'pending' }
            }
          }
          return s
        })
      } else if (prev.length > 0) {
        return prev.map((s, idx) => {
          if (idx === 0) {
            return {
              ...s,
              generatedWorkflowData: newWorkflow,
              discoveryState: { ...s.discoveryState, status: 'pending' }
            }
          }
          return s
        })
      } else {
        const newSessionId = 'wf-sess-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4)
        newWorkflow.id = newSessionId
        newWorkflow.workflowId = newSessionId
        return [{
          id: newSessionId,
          name: newWorkflow.name,
          status: 'saved',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          activities: activities.map(a => ({ ...a, workflowId: newSessionId })),
          detectedResult,
          discoveryState: { deleted: false, status: 'pending' },
          generatedWorkflowData: newWorkflow,
          automationState: { status: 'idle', activeWorkflow: null, actionsState: [], logs: [], message: '' }
        }]
      }
    })

    setActivePage('workflows')
  }

  const handleApproveWorkflow = (targetWorkflowId) => {
    const idToUpdate = targetWorkflowId || activeSessionId
    setWorkflowSessions(prev => prev.map(s => {
      if (s.id === idToUpdate) {
        const currentWf = s.generatedWorkflowData || generateWorkflow({ intent: s.name })
        return {
          ...s,
          generatedWorkflowData: { ...currentWf, status: 'Approved' },
          discoveryState: { ...s.discoveryState, status: 'approved' }
        }
      }
      return s
    }))
    if (!idToUpdate || idToUpdate === activeSessionId || (generatedWorkflowData && generatedWorkflowData.id === idToUpdate)) {
      setGeneratedWorkflowData(prev => prev ? ({ ...prev, status: 'Approved' }) : null)
      setDiscoveryState(prev => ({ ...prev, status: 'approved' }))
    }
  }

  const handleRejectWorkflow = (targetWorkflowId) => {
    const idToUpdate = targetWorkflowId || activeSessionId
    if (engineHandleRef.current && automationState.activeWorkflow?.id === idToUpdate) {
      engineHandleRef.current.stop()
    }
    setWorkflowSessions(prev => prev.map(s => {
      if (s.id === idToUpdate) {
        const currentWf = s.generatedWorkflowData || generateWorkflow({ intent: s.name })
        return {
          ...s,
          generatedWorkflowData: { ...currentWf, status: 'Rejected' },
          discoveryState: { ...s.discoveryState, status: 'rejected' }
        }
      }
      return s
    }))
    if (!idToUpdate || idToUpdate === activeSessionId || (generatedWorkflowData && generatedWorkflowData.id === idToUpdate)) {
      setGeneratedWorkflowData(prev => prev ? ({ ...prev, status: 'Rejected' }) : null)
      setDiscoveryState(prev => ({ ...prev, status: 'rejected' }))
    }
  }

  const handleDeleteDiscovery = () => {
    setDiscoveryState({ deleted: true, status: 'pending' })
    setAiAnalysis(null)
    setGeneratedWorkflowData(null)
    setAutomationState({ status: 'idle', activeWorkflow: null, actionsState: [], logs: [], message: '' })
  }

  const handleDeleteHistoryRecord = (histId) => {
    setHistoryRecords(prev => prev.filter(r => r.id !== histId))
  }

  // ─── Automation Engine (FIX 2: onInterrupted preserved exactly)
  const handleExecuteWorkflow = (targetWorkflowId) => {
    const idToRun = targetWorkflowId || activeSessionId
    const targetSession = workflowSessions.find(s => s.id === idToRun)
    const targetWf = targetSession?.generatedWorkflowData || generatedWorkflowData

    if (!targetWf || targetWf.status !== 'Approved') return
    if (targetWf.status === 'Completed' || targetWf.isCompleted) return
    if (engineHandleRef.current) engineHandleRef.current.stop()

    const initialActions = targetWf.actions.map(act => ({ ...act, status: 'pending' }))
    const runningState = {
      status: 'running',
      activeWorkflow: targetWf,
      actionsState: initialActions,
      logs: [],
      message: ''
    }

    setAutomationState(runningState)
    if (idToRun) {
      setWorkflowSessions(prev => prev.map(s => {
        if (s.id === idToRun) {
          return { ...s, automationState: runningState }
        }
        return s
      }))
    }

    const handle = executeWorkflow(targetWf, {
      onActionUpdate: ({ actionsState }) => {
        setAutomationState(prev => ({ ...prev, actionsState }))
        if (idToRun) {
          setWorkflowSessions(prev => prev.map(s => {
            if (s.id === idToRun) {
              return {
                ...s,
                automationState: {
                  ...(s.automationState || {}),
                  actionsState
                }
              }
            }
            return s
          }))
        }
      },
      onLog: (logEntry) => {
        setAutomationState(prev => ({ ...prev, logs: [...prev.logs, logEntry] }))
        if (idToRun) {
          setWorkflowSessions(prev => prev.map(s => {
            if (s.id === idToRun) {
              return {
                ...s,
                automationState: {
                  ...(s.automationState || {}),
                  logs: [...(s.automationState?.logs || []), logEntry]
                }
              }
            }
            return s
          }))
        }
      },
      onComplete: ({ totalActions, completedActions }) => {
        const completedMsg = `Workflow Completed: ${completedActions} / ${totalActions} actions completed`
        setAutomationState(prev => ({
          ...prev, status: 'completed',
          message: completedMsg
        }))
        setGeneratedWorkflowData(prev => prev ? ({ ...prev, status: 'Completed', isCompleted: true }) : null)
        setDiscoveryState(prev => ({ ...prev, status: 'completed' }))
        if (idToRun) {
          setWorkflowSessions(prev => prev.map(s => {
            if (s.id === idToRun) {
              return {
                ...s,
                generatedWorkflowData: s.generatedWorkflowData ? { ...s.generatedWorkflowData, status: 'Completed', isCompleted: true } : null,
                discoveryState: { ...s.discoveryState, status: 'completed' },
                automationState: {
                  ...(s.automationState || {}),
                  status: 'completed',
                  message: completedMsg
                }
              }
            }
            return s
          }))
        }
      },
      onInterrupted: ({ actionsState }) => {
        const interruptedMsg = 'Workflow execution was interrupted by the user.'
        setAutomationState(prev => ({
          ...prev, status: 'interrupted', actionsState,
          message: interruptedMsg
        }))
        if (idToRun) {
          setWorkflowSessions(prev => prev.map(s => {
            if (s.id === idToRun) {
              return {
                ...s,
                automationState: {
                  ...(s.automationState || {}),
                  status: 'interrupted',
                  actionsState,
                  message: interruptedMsg
                }
              }
            }
            return s
          }))
        }
      },
      onError: (errMsg) => {
        setAutomationState(prev => ({ ...prev, status: 'error', message: errMsg }))
        if (idToRun) {
          setWorkflowSessions(prev => prev.map(s => {
            if (s.id === idToRun) {
              return {
                ...s,
                automationState: {
                  ...(s.automationState || {}),
                  status: 'error',
                  message: errMsg
                }
              }
            }
            return s
          }))
        }
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
            workflowSessions={workflowSessions}
            activeSessionId={activeSessionId}
            onNavigate={setActivePage}
            onDeleteWorkflow={handleDeleteWorkflow}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerRequest={customerRequest}
            setCustomerRequest={setCustomerRequest}
            attachmentName={attachmentName}
            setAttachmentName={setAttachmentName}
            simulatorError={simulatorError}
            setSimulatorError={setSimulatorError}
            onProcessCustomerRequest={handleProcessCustomerRequest}
            onQuickFill={handleQuickFill}
          />
        )
      case 'activity':
        return (
          <ActivityMonitorPage
            activities={activities}
            workflowSessions={workflowSessions}
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
            workflowStatus={discoveryState.status}
            onUnderstandWithAI={handleUnderstandWithAI}
            onGenerateWorkflow={handleGenerateWorkflow}
            onDeleteDiscovery={handleDeleteDiscovery}
          />
        )
      case 'workflows':
        return (
          <WorkflowsPage
            workflowSessions={workflowSessions}
            generatedWorkflowData={generatedWorkflowData}
            automationState={automationState}
            onApprove={handleApproveWorkflow}
            onReject={handleRejectWorkflow}
            onExecute={handleExecuteWorkflow}
            onStop={handleStopAutomation}
            onDeleteWorkflow={handleDeleteWorkflow}
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
            historyRecords={historyRecords}
            onDeleteHistoryRecord={handleDeleteHistoryRecord}
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
            workflowSessions={workflowSessions}
            activeSessionId={activeSessionId}
            onNavigate={setActivePage}
            onDeleteWorkflow={handleDeleteWorkflow}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerRequest={customerRequest}
            setCustomerRequest={setCustomerRequest}
            attachmentName={attachmentName}
            setAttachmentName={setAttachmentName}
            simulatorError={simulatorError}
            setSimulatorError={setSimulatorError}
            onProcessCustomerRequest={handleProcessCustomerRequest}
            onQuickFill={handleQuickFill}
          />
        )
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          if (isRecording && page !== activePage) {
            setNavWarningTarget(page)
          } else {
            setActivePage(page)
          }
        }}
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
          {renderPage()}
        </div>
      </div>

      {/* Name Workflow Modal for Recording Session */}
      {isNameModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNameModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">What would you like to name this workflow?</span>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleConfirmStartRecording(pendingWorkflowName) }}>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Workflow 1"
                  value={pendingWorkflowName}
                  onChange={e => setPendingWorkflowName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsNameModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Start Recording
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recording Navigation Warning Modal */}
      {navWarningTarget && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <span className="modal-title">Recording in Progress</span>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                Recording is still active. Please stop the recording before leaving this page.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setNavWarningTarget(null)}
              >
                Stay Here
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  setActivePage(navWarningTarget)
                  setNavWarningTarget(null)
                }}
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
