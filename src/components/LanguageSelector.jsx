import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
];

export const LanguageSelector = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = React.useState(false);

    const currentLang = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className="language-selector">
            <button
                className="language-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select language"
            >
                <span className="flag">{currentLang.flag}</span>
                <span className="lang-code">{currentLang.code.toUpperCase()}</span>
                <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="language-dropdown">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            className={`lang-option ${lang.code === i18n.language ? 'active' : ''}`}
                            onClick={() => handleLanguageChange(lang.code)}
                        >
                            <span className="flag">{lang.flag}</span>
                            <span className="lang-name">{lang.name}</span>
                            {lang.code === i18n.language && <span className="checkmark">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
