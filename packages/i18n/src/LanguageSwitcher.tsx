import { useTranslation } from 'react-i18next'
import { supportedLanguages, changeLanguage, getCurrentLanguage, type SupportedLanguage } from './index'

interface LanguageSwitcherProps {
  className?: string
  showLabel?: boolean
}

export function LanguageSwitcher({ className, showLabel = false }: LanguageSwitcherProps) {
  const { t } = useTranslation('common')
  const currentLanguage = getCurrentLanguage()

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value as SupportedLanguage)
  }

  return (
    <div className={className}>
      {showLabel && (
        <label htmlFor="language-select" className="mr-2 text-sm">
          {t('language.switchLanguage')}
        </label>
      )}
      <select
        id="language-select"
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {supportedLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  )
}

interface LanguageButtonsProps {
  className?: string
  buttonClassName?: string
  activeClassName?: string
}

export function LanguageButtons({
  className,
  buttonClassName = 'px-2 py-1 text-sm rounded',
  activeClassName = 'bg-primary text-white',
}: LanguageButtonsProps) {
  const currentLanguage = getCurrentLanguage()

  return (
    <div className={className}>
      {supportedLanguages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`${buttonClassName} ${currentLanguage === lang.code ? activeClassName : ''}`}
        >
          {lang.nativeName}
        </button>
      ))}
    </div>
  )
}
