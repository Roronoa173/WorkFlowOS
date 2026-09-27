import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { getSavedLanguage, STORAGE_KEY, translate, SUPPORTED_LANGUAGES } from './translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getSavedLanguage)

  const setLanguage = useCallback((newLang) => {
    let validLang = 'en'
    if (newLang === 'es' || newLang === 'Spanish') validLang = 'es'
    else if (newLang === 'fr' || newLang === 'French') validLang = 'fr'
    else if (newLang === 'en' || newLang === 'English') validLang = 'en'

    setLanguageState(validLang)
    try {
      localStorage.setItem(STORAGE_KEY, validLang)
    } catch (_e) {
      // storage error ignored
    }
  }, [])

  const t = useCallback((key, params = null, fallback = null) => {
    // allow t('key', fallback) if second arg is string
    if (typeof params === 'string') {
      return translate(language, key, null, params)
    }
    return translate(language, key, params, fallback)
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }), [language, setLanguage, t])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key, params = null, fallback = null) => {
        if (typeof params === 'string') {
          return translate('en', key, null, params)
        }
        return translate('en', key, params, fallback)
      },
      supportedLanguages: SUPPORTED_LANGUAGES,
    }
  }
  return ctx
}
