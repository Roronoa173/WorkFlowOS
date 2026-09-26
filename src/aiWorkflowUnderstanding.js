/**
 * Mock AI Workflow Understanding Service
 * 
 * Analyzes the detected business workflow structure and returns
 * structured intent, trigger, discrete actions, and edge condition.
 * 
 * Separated from the UI layer.
 */

export function understandWorkflow(activities = [], detectedSequence = []) {
  // Extract dynamic details if available from the activities feed
  const lastCustomerEvent = activities.find(
    (act) => act.data && act.data.customer
  )

  const sampleCustomer = lastCustomerEvent ? lastCustomerEvent.data.customer : 'Customer'
  const sampleRequest = lastCustomerEvent ? lastCustomerEvent.data.request : 'inquiry'

  return {
    intent: "Process Customer Request",
    trigger: "New customer request received",
    summary: `Automatically handle inbound customer requests (e.g., "${sampleCustomer}" regarding "${sampleRequest}"), extract attachments, synchronize CRM data, and alert the team.`,
    actions: [
      "Process submitted customer request",
      "Read incoming customer email",
      "Download attached documentation / files",
      "Look up & update customer record in CRM",
      "Notify the support channel in Slack"
    ],
    condition: "If the customer cannot be found in the CRM, request user intervention",
    isMock: true,
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
}
