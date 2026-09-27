import { useTranslation } from '../LanguageContext'

/**
 * SimulatorPage — Customer Request Simulator
 * All logic (handleProcessCustomerRequest, recording gate, etc.) is preserved exactly.
 * This is a pure presentational wrapper — handlers are passed in from App.jsx.
 */
export default function SimulatorPage({
  isRecording,
  customerName,
  setCustomerName,
  customerRequest,
  setCustomerRequest,
  attachmentName,
  setAttachmentName,
  simulatorError,
  setSimulatorError,
  onProcess,
  onQuickFill,
}) {
  const { t } = useTranslation()

  return (
    <div className="page-content">
      <div className="panel simulator-panel">
        <div className="panel-header">
          <div>
            <span className="panel-title">{t('simulator.title', 'Customer Request Simulator')}</span>
            <p className="dim-text" style={{ marginTop: 4 }}>
              {t('simulator.subtitle', 'Submit realistic customer requests to trigger business workflows')}
            </p>
          </div>
          <div className="quick-fill-row">
            <span className="dim-text" style={{ fontSize: 12 }}>{t('common.presets', 'Presets:')}</span>
            <button className="preset-btn" onClick={() => onQuickFill('Rahul', 'Product issue', 'invoice.pdf')}>Rahul</button>
            <button className="preset-btn" onClick={() => onQuickFill('Amit', 'Refund request', 'receipt.png')}>Amit</button>
            <button className="preset-btn" onClick={() => onQuickFill('Raj', 'Account upgrade', 'contract.pdf')}>Raj</button>
          </div>
        </div>

        {!isRecording && (
          <div className="info-banner">
            {t('simulator.notActiveBanner', 'Recording is not active. Start recording from the sidebar before submitting a request.')}
          </div>
        )}

        {simulatorError && (
          <div className="error-banner">{simulatorError}</div>
        )}

        <form onSubmit={onProcess} className="simulator-form-new">
          <div className="sim-fields">
            <div className="sim-field">
              <label htmlFor="cust-name">{t('simulator.customerNameLabel', 'Customer Name')}</label>
              <input
                id="cust-name"
                type="text"
                placeholder={t('simulator.customerNamePlaceholder', 'e.g. Rahul')}
                value={customerName}
                onChange={e => { setCustomerName(e.target.value); setSimulatorError('') }}
                className="form-input"
                required
              />
            </div>
            <div className="sim-field">
              <label htmlFor="cust-req">{t('simulator.customerRequestLabel', 'Customer Request')}</label>
              <input
                id="cust-req"
                type="text"
                placeholder={t('simulator.customerRequestPlaceholder', 'e.g. Product issue')}
                value={customerRequest}
                onChange={e => { setCustomerRequest(e.target.value); setSimulatorError('') }}
                className="form-input"
                required
              />
            </div>
            <div className="sim-field">
              <label htmlFor="cust-att">{t('simulator.attachmentLabel', 'Attachment / File')}</label>
              <input
                id="cust-att"
                type="text"
                placeholder={t('simulator.attachmentPlaceholder', 'e.g. invoice.pdf')}
                value={attachmentName}
                onChange={e => { setAttachmentName(e.target.value); setSimulatorError('') }}
                className="form-input"
                required
              />
            </div>
          </div>
          <div className="sim-submit-row">
            <button type="submit" className="btn btn-primary">
              {t('simulator.submitBtn', 'Process Customer Request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
