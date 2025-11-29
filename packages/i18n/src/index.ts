import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import zh from './locales/zh'
import en from './locales/en'

export const defaultNS = 'common'
export const resources = {
  zh,
  en,
} as const

export const supportedLanguages = [
  { code: 'zh', name: '中文', nativeName: '中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
] as const

export type SupportedLanguage = (typeof supportedLanguages)[number]['code']

export function initI18n(defaultLanguage: SupportedLanguage = 'zh') {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      defaultNS,
      fallbackLng: defaultLanguage,
      supportedLngs: ['zh', 'en'],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'quizflow-language',
      },
    })

  return i18n
}

export function changeLanguage(language: SupportedLanguage) {
  return i18n.changeLanguage(language)
}

export function getCurrentLanguage(): SupportedLanguage {
  return (i18n.language?.split('-')[0] as SupportedLanguage) || 'zh'
}

export { i18n, useTranslation }

// Re-export types for convenience
export type { TFunction } from 'i18next'

// Re-export components
export { LanguageSwitcher, LanguageButtons } from './LanguageSwitcher'
