/**
 * Automation Engine Module
 * 
 * Safely simulates sequential asynchronous execution of an approved workflow.
 * Decoupled from the React UI layer.
 * 
 * States supported for individual actions:
 * - 'pending'
 * - 'running'
 * - 'completed'
 * - 'interrupted'
 * - 'failed'
 * 
 * Engine states:
 * - 'idle'
 * - 'running'
 * - 'completed'
 * - 'interrupted'
 * - 'error'
 */

export function executeWorkflow(workflow, callbacks = {}) {
  const { onActionUpdate, onLog, onComplete, onInterrupted, onError } = callbacks

  // Guard: Workflow must be approved before execution
  if (!workflow || workflow.status !== 'Approved') {
    const errorMsg = 'Execution blocked: Workflow must be in Approved status to run.'
    if (onError) onError(errorMsg)
    return { stop: () => {} }
  }

  let isStopped = false
  let currentTimer = null
  let activeIndex = -1

  const timestamp = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  // Clone actions and initialize status to pending
  const actions = (workflow.actions || []).map((action) => ({
    ...action,
    status: 'pending' // pending | running | completed | interrupted | failed
  }))

  const executeStep = (index) => {
    if (isStopped) {
      return
    }

    // Check if all actions finished
    if (index >= actions.length) {
      activeIndex = -1
      if (onComplete) {
        onComplete({
          totalActions: actions.length,
          completedActions: actions.filter((a) => a.status === 'completed').length,
          timestamp: timestamp()
        })
      }
      return
    }

    activeIndex = index
    const currentAction = actions[index]

    // 1. Mark action as running
    currentAction.status = 'running'
    const tsRunning = timestamp()

    if (onActionUpdate) {
      onActionUpdate({
        actionIndex: index,
        actionId: currentAction.id,
        status: 'running',
        actionsState: [...actions]
      })
    }
    if (onLog) {
      onLog({
        type: 'running',
        text: `⏳ Step ${currentAction.step}/${actions.length}: Running "${currentAction.title}"...`,
        timestamp: tsRunning
      })
    }

    // 2. Simulate action execution with visible delay (1100ms)
    currentTimer = setTimeout(() => {
      if (isStopped) {
        return
      }

      // Mark action as completed
      currentAction.status = 'completed'
      const tsCompleted = timestamp()

      if (onActionUpdate) {
        onActionUpdate({
          actionIndex: index,
          actionId: currentAction.id,
          status: 'completed',
          actionsState: [...actions]
        })
      }
      if (onLog) {
        onLog({
          type: 'completed',
          text: `✓ Step ${currentAction.step}/${actions.length}: "${currentAction.title}" completed successfully.`,
          timestamp: tsCompleted
        })
      }

      // 3. Pause briefly before moving to next action (400ms transition)
      currentTimer = setTimeout(() => {
        if (!isStopped) {
          executeStep(index + 1)
        }
      }, 400)
    }, 1100)
  }

  // Kick off execution on first step
  if (onLog) {
    onLog({
      type: 'info',
      text: `🚀 Initiated workflow execution: "${workflow.name}"`,
      timestamp: timestamp()
    })
  }
  executeStep(0)

  // Return handle to safely stop automation immediately
  return {
    stop: () => {
      if (isStopped) return
      isStopped = true

      if (currentTimer) {
        clearTimeout(currentTimer)
        currentTimer = null
      }

      const stopTimestamp = timestamp()

      // If an action was actively running when stopped, mark it interrupted
      if (activeIndex >= 0 && activeIndex < actions.length) {
        if (actions[activeIndex].status === 'running') {
          actions[activeIndex].status = 'interrupted'
        }
      }

      // Keep all subsequent actions as 'pending'
      for (let i = activeIndex + 1; i < actions.length; i++) {
        if (actions[i].status !== 'completed') {
          actions[i].status = 'pending'
        }
      }

      // Notify UI with final action states
      if (onActionUpdate) {
        onActionUpdate({
          actionIndex: activeIndex,
          actionId: activeIndex >= 0 ? actions[activeIndex]?.id : null,
          status: 'interrupted',
          actionsState: [...actions]
        })
      }

      // Log interruption entries
      if (onLog) {
        onLog({
          type: 'error',
          text: '❌ Automation Interrupted',
          timestamp: stopTimestamp
        })
        onLog({
          type: 'warning',
          text: '⚠️ Workflow execution was interrupted by the user.',
          timestamp: stopTimestamp
        })
      }

      // Emit interruption event
      if (onInterrupted) {
        onInterrupted({
          interruptedAtIndex: activeIndex,
          interruptedAction: activeIndex >= 0 ? actions[activeIndex] : null,
          actionsState: [...actions],
          timestamp: stopTimestamp
        })
      }
    }
  }
}
