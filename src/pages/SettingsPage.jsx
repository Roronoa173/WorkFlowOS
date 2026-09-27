import { useTranslation } from '../LanguageContext'

export default function SettingsPage() {
  const { language, setLanguage, t } = useTranslation()

  const langMap = { en: 'English', es: 'Spanish', fr: 'French' }
  const currentLangLabel = langMap[language] || 'English'

  const handleLangChange = (e) => {
    const val = e.target.value
    if (val === 'Spanish') setLanguage('es')
    else if (val === 'French') setLanguage('fr')
    else setLanguage('en')
  }

  const sections = [
    {
      id: 'general',
      title: t('settings.general', 'General'),
      fields: [
        {
          id: 'language',
          label: t('settings.language', 'Language'),
          type: 'select',
          value: currentLangLabel,
          options: ['English', 'Spanish', 'French'],
          onChange: handleLangChange,
        },
        {
          id: 'timeZone',
          label: t('settings.timeZone', 'Time Zone'),
          type: 'select',
          value: 'Asia/Kolkata',
          options: ['Asia/Kolkata', 'UTC', 'America/New_York'],
        },
      ],
    },
    {
      id: 'monitoring',
      title: t('settings.monitoring', 'Monitoring'),
      fields: [
        {
          id: 'autoStart',
          label: t('settings.autoStartRecording', 'Auto-start recording on login'),
          type: 'toggle',
          value: false,
        },
        {
          id: 'recordUi',
          label: t('settings.recordUiEvents', 'Record UI events'),
          type: 'toggle',
          value: true,
        },
      ],
    },
    {
      id: 'automation',
      title: t('settings.automation', 'Automation'),
      fields: [
        {
          id: 'requireApproval',
          label: t('settings.requireApproval', 'Require approval before execution'),
          type: 'toggle',
          value: true,
        },
        {
          id: 'stepDelay',
          label: t('settings.stepDelay', 'Step delay (ms)'),
          type: 'number',
          value: 1100,
        },
      ],
    },
    {
      id: 'notifications',
      title: t('settings.notifications', 'Notifications'),
      fields: [
        {
          id: 'patternAlert',
          label: t('settings.patternDetectedAlert', 'Pattern detected alert'),
          type: 'toggle',
          value: true,
        },
        {
          id: 'automationDone',
          label: t('settings.automationCompleted', 'Automation completed'),
          type: 'toggle',
          value: true,
        },
      ],
    },
    {
      id: 'appearance',
      title: t('settings.appearance', 'Appearance'),
      fields: [
        {
          id: 'theme',
          label: t('settings.theme', 'Theme'),
          type: 'select',
          value: 'Dark',
          options: ['Dark', 'System'],
        },
      ],
    },
  ]

  return (
    <div className="page-content">
      <div className="settings-layout">
        {sections.map(section => (
          <div key={section.id} className="panel settings-panel">
            <div className="panel-header">
              <span className="panel-title">{section.title}</span>
            </div>
            <div className="settings-fields">
              {section.fields.map((field) => (
                <div key={field.id} className="settings-field">
                  <label className="settings-label">{field.label}</label>
                  {field.type === 'toggle' ? (
                    <div className={`toggle ${field.value ? 'toggle-on' : ''}`}>
                      <div className="toggle-thumb" />
                    </div>
                  ) : field.type === 'select' ? (
                    field.onChange ? (
                      <select
                        className="settings-select"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <select
                        className="settings-select"
                        defaultValue={field.value}
                      >
                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )
                  ) : (
                    <input
                      type={field.type}
                      className="settings-input"
                      defaultValue={field.value}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
