/**
 * Workflow Generator Module
 * 
 * Generates reusable, structured workflow specifications from AI Understanding.
 * Abstracted to use generic variables (e.g., customerName, customerRequest, attachment)
 * instead of hardcoded specific values (Rahul, Amit, Raj).
 * 
 * Pure JavaScript logic separated from the React UI layer.
 */

export function generateWorkflow(aiUnderstanding = {}) {
  return {
    id: 'wf-' + Date.now(),
    name: aiUnderstanding.intent || 'Process Customer Request',
    trigger: aiUnderstanding.trigger || 'New customer request received',
    actions: [
      {
        id: 'act-1',
        step: 1,
        title: 'Read customer email',
        icon: '✉️',
        service: 'Gmail',
        description: 'Read the customer email containing ${customerRequest}',
        parameter: 'customerRequest'
      },
      {
        id: 'act-2',
        step: 2,
        title: 'Download attachment',
        icon: '📁',
        service: 'File System',
        description: 'Download attached ${attachment}',
        parameter: 'attachment'
      },
      {
        id: 'act-3',
        step: 3,
        title: 'Find customer in CRM',
        icon: '🔍',
        service: 'CRM',
        description: 'Search for existing record matching ${customerName}',
        parameter: 'customerName'
      },
      {
        id: 'act-4',
        step: 4,
        title: 'Update customer record',
        icon: '👥',
        service: 'CRM',
        description: 'Update customer record for ${customerName} with new details',
        parameter: 'customerName'
      },
      {
        id: 'act-5',
        step: 5,
        title: 'Notify relevant team in Slack',
        icon: '💬',
        service: 'Slack',
        description: 'Send notification alert to #support regarding ${customerName}',
        parameter: 'customerName'
      }
    ],
    condition: aiUnderstanding.condition || 'If customer cannot be found → Request user intervention',
    variables: [
      { name: 'customerName', type: 'string', description: 'Name of the customer sending the request' },
      { name: 'customerRequest', type: 'string', description: 'Summary of the customer inquiry or issue' },
      { name: 'attachment', type: 'file', description: 'Attached document or file name' }
    ],
    status: 'Draft', // Draft | Approved | Rejected
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
}
