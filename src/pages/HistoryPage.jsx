import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslation } from '../LanguageContext'

export default function HistoryPage({
  historyRecords = [],
  onDeleteHistoryRecord,
}) {
  const { t } = useTranslation()
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null) // { id, workflowName }

  // Unique workflow names for the dropdown
  const uniqueWorkflows = []
  const seen = new Set()
  for (const r of historyRecords) {
    if (!seen.has(r.workflowId)) {
      seen.add(r.workflowId)
      uniqueWorkflows.push({ id: r.workflowId, name: r.workflowName })
    }
  }

  const filtered = selectedWorkflowId
    ? historyRecords.filter(r => r.workflowId === selectedWorkflowId)
    : historyRecords

  const handleDeleteClick = (record) => {
    setConfirmDelete({ id: record.id, workflowName: record.workflowName })
  }

  const handleConfirmYes = () => {
    if (confirmDelete && onDeleteHistoryRecord) {
      onDeleteHistoryRecord(confirmDelete.id)
    }
    setConfirmDelete(null)
  }

  const statusBadgeClass = (status) => {
    if (status === 'Completed' || status === 'Approved') return 'badge badge-green badge-sm'
    if (status === 'Interrupted') return 'badge badge-red badge-sm'
    if (status === 'Rejected')   return 'badge badge-red badge-sm'
    return 'badge badge-dim badge-sm'
  }

  const formatStatus = (status) => {
    if (status === 'Completed') return t('common.completed', 'Completed')
    if (status === 'Approved') return t('workflows.approved', 'Approved')
    if (status === 'Rejected') return t('workflows.rejected', 'Rejected')
    if (status === 'Interrupted') return t('common.interrupted', 'Interrupted')
    return status
  }

  return (
    <div className="page-content">
      {/* Workflow filter dropdown */}
      <div className="monitor-toolbar">
        <div className="wf-dropdown-wrap">
          <select
            className="wf-dropdown-select"
            value={selectedWorkflowId}
            onChange={e => setSelectedWorkflowId(e.target.value)}
          >
            <option value="">{t('history.allWorkflows', 'All Workflows')}</option>
            {uniqueWorkflows.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="wf-dropdown-chevron"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <div className="panel">
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 24px' }}>
            <p>{t('history.noHistory', 'No execution history yet.')}</p>
            <small>{t('history.noHistorySub', 'Deleted workflows will appear here in the recycle bin.')}</small>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('history.tableDate', 'Date')}</th>
                  <th>{t('history.tableWorkflow', 'Workflow')}</th>
                  <th>{t('history.tableActions', 'Actions')}</th>
                  <th>{t('history.tableCompleted', 'Completed')}</th>
                  <th>{t('history.tableStatus', 'Status')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(record => (
                  <tr key={record.id}>
                    <td className="td-time">{record.date}</td>
                    <td className="td-bold">{record.workflowName}</td>
                    <td className="td-num">{record.actions}</td>
                    <td className="td-num">{record.completed}</td>
                    <td>
                      <span className={statusBadgeClass(record.status)}>
                        {formatStatus(record.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="icon-btn"
                        style={{ color: 'var(--red)', borderColor: 'var(--red-border)' }}
                        title={t('common.delete', 'Delete')}
                        onClick={() => handleDeleteClick(record)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <span className="modal-title">{t('history.deleteModalTitle', 'Delete Workflow History')}</span>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                {t('history.deleteModalPrompt', { name: confirmDelete.workflowName }, `Are you sure you want to permanently delete ${confirmDelete.workflowName}?`)}
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmDelete(null)}
              >
                {t('common.no', 'No')}
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleConfirmYes}
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
