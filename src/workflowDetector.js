/**
 * Workflow Detection Engine
 * 
 * Focuses on business-level event patterns rather than raw DOM clicks.
 * Ignores instance-specific data (like customer name, request detail, file name)
 * and focuses on abstract event sequence tokens.
 * 
 * Standard workflow pattern for Customer Request Processing:
 * [
 *   'Customer Request Submitted',
 *   'Email Received',
 *   'Attachment Downloaded',
 *   'CRM Record Updated',
 *   'Slack Notification Sent'
 * ]
 */

export const TARGET_WORKFLOW_SEQUENCE = [
  'Customer Request Submitted',
  'Email Received',
  'Attachment Downloaded',
  'CRM Record Updated',
  'Slack Notification Sent'
]

export function detectRepeatedWorkflow(activities = []) {
  if (!activities || activities.length < 3) {
    return {
      detected: false,
      workflowName: '',
      sequence: [],
      repetitions: 0,
      message: 'Monitoring for repeating patterns (need 3+ repetitions)...'
    }
  }

  // Activities are stored newest-first in the feed; reverse to get chronological order
  const chronoActivities = [...activities].reverse()

  // Filter only high-level business events (exclude low-level UI clicks/inputs)
  // Each business event has an abstract actionType / stepKey
  const businessEvents = chronoActivities.filter(
    (act) => act.category === 'business' || act.actionType || act.stepKey
  )

  // Map to abstract token representations
  const tokens = businessEvents.map((act) => {
    return act.actionType || act.stepKey || act.action
  })

  // 1. Detect target "Process Customer Request" workflow
  // Sequence: Customer Request Submitted -> Email Received -> Attachment Downloaded -> CRM Record Updated -> Slack Notification Sent
  let targetCount = 0
  let patternIdx = 0

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === TARGET_WORKFLOW_SEQUENCE[patternIdx]) {
      patternIdx++
      if (patternIdx === TARGET_WORKFLOW_SEQUENCE.length) {
        targetCount++
        patternIdx = 0
      }
    }
  }

  // Also support the legacy prototype sequence (Gmail -> Download -> CRM -> Slack) for backwards compatibility
  const legacyTarget = ['Gmail', 'Download', 'CRM', 'Slack']
  let legacyCount = 0
  let legacyIdx = 0
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === legacyTarget[legacyIdx]) {
      legacyIdx++
      if (legacyIdx === legacyTarget.length) {
        legacyCount++
        legacyIdx = 0
      }
    }
  }

  if (targetCount >= 3) {
    return {
      detected: true,
      workflowName: 'Process Customer Request',
      sequence: TARGET_WORKFLOW_SEQUENCE,
      repetitions: targetCount,
      message: '🔁 Repeated workflow detected!'
    }
  }

  if (legacyCount >= 3) {
    return {
      detected: true,
      workflowName: 'Process Customer Request',
      sequence: legacyTarget,
      repetitions: legacyCount,
      message: '🔁 Repeated workflow detected!'
    }
  }

  // 2. Generic repeated n-gram detection for any sequence of 2-5 business actions
  for (let len = 5; len >= 2; len--) {
    const counts = new Map()

    for (let i = 0; i <= tokens.length - len; i++) {
      const slice = tokens.slice(i, i + len)
      const key = slice.join(' → ')
      counts.set(key, (counts.get(key) || 0) + 1)
    }

    for (const [key, count] of counts.entries()) {
      if (count >= 3) {
        const seq = key.split(' → ')
        return {
          detected: true,
          workflowName: 'Process Customer Request',
          sequence: seq,
          repetitions: count,
          message: '🔁 Repeated workflow detected!'
        }
      }
    }
  }

  return {
    detected: false,
    workflowName: '',
    sequence: [],
    repetitions: targetCount,
    message: targetCount > 0 
      ? `Detected ${targetCount} of 3 required workflow repetition(s)...`
      : 'No repeated business workflow pattern detected yet (need 3+ repetitions).'
  }
}
