import { useState } from 'react'

const SECTIONS = [
  {
    id: 'general',
    title: 'General',
    fields: [
      { label: 'Workspace Name', type: 'text',   value: 'My Workspace' },
      { label: 'Language',       type: 'select', value: 'English', options: ['English', 'Spanish', 'French'] },
      { label: 'Time Zone',      type: 'select', value: 'Asia/Kolkata', options: ['Asia/Kolkata', 'UTC', 'America/New_York'] },
    ]
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    fields: [
      { label: 'Auto-start recording on login', type: 'toggle', value: false },
      { label: 'Idle timeout (minutes)',         type: 'number', value: 2 },
      { label: 'Record UI events',               type: 'toggle', value: true },
    ]
  },
  {
    id: 'automation',
    title: 'Automation',
    fields: [
      { label: 'Require approval before execution', type: 'toggle', value: true },
      { label: 'Step delay (ms)',                    type: 'number', value: 1100 },
    ]
  },
  {
    id: 'notifications',
    title: 'Notifications',
    fields: [
      { label: 'Pattern detected alert', type: 'toggle', value: true },
      { label: 'Automation completed',   type: 'toggle', value: true },
    ]
  },
  {
    id: 'appearance',
    title: 'Appearance',
    fields: [
      { label: 'Theme', type: 'select', value: 'Dark', options: ['Dark', 'System'] },
    ]
  },
]

export default function SettingsPage() {
  return (
    <div className="page-content">
      <div className="settings-layout">
        {SECTIONS.map(section => (
          <div key={section.id} className="panel settings-panel">
            <div className="panel-header">
              <span className="panel-title">{section.title}</span>
            </div>
            <div className="settings-fields">
              {section.fields.map((field, i) => (
                <div key={i} className="settings-field">
                  <label className="settings-label">{field.label}</label>
                  {field.type === 'toggle' ? (
                    <div className={`toggle ${field.value ? 'toggle-on' : ''}`}>
                      <div className="toggle-thumb" />
                    </div>
                  ) : field.type === 'select' ? (
                    <select className="settings-select" defaultValue={field.value}>
                      {field.options.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
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
