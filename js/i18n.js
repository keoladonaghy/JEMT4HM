/**
 * JEMT4 Internationalization System
 * Simple, lightweight i18n for English/Hawaiian UI translation
 */
class JEMT4I18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('jemt4-language') || 'en';
        this.translations = {};
        this.supportedLanguages = ['en', 'haw'];
        this.fallbackLanguage = 'en';
        this.translationFiles = ['common', 'homepage']; // Base files to load
        
        // Initialize
        this.loadTranslations().then(() => {
            this.updateDOM();
            this.setupLanguageSwitcher();
        });
    }

    /**
     * Load translation files and merge them
     */
    async loadTranslations() {
        this.translations = {};
        
        // Load all translation files
        for (const file of this.translationFiles) {
            try {
                const response = await fetch(`i18n/${file}.json`);
                if (!response.ok) {
                    throw new Error(`Failed to load ${file}.json`);
                }
                const fileTranslations = await response.json();
                
                // Merge translations for current language
                if (fileTranslations[this.currentLanguage]) {
                    this.translations = {
                        ...this.translations,
                        ...fileTranslations[this.currentLanguage]
                    };
                }
            } catch (error) {
                console.warn(`Error loading ${file}.json:`, error);
                
                // Try to load fallback if current language fails
                if (this.currentLanguage !== this.fallbackLanguage) {
                    try {
                        const response = await fetch(`i18n/${file}.json`);
                        const fileTranslations = await response.json();
                        if (fileTranslations[this.fallbackLanguage]) {
                            this.translations = {
                                ...this.translations,
                                ...fileTranslations[this.fallbackLanguage]
                            };
                        }
                    } catch (fallbackError) {
                        console.error(`Failed to load fallback for ${file}.json:`, fallbackError);
                    }
                }
            }
        }
    }

    /**
     * Translate a key using dot notation
     * @param {string} key - Translation key (e.g., 'navigation.chooseInstrument')
     * @param {Object} params - Optional parameters for interpolation
     * @returns {string} Translated text
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations;
        
        // Navigate through nested object
        for (const k of keys) {
            value = value?.[k];
        }
        
        // Return key if translation not found
        if (value === undefined || value === null) {
            console.warn(`Translation missing for key: ${key}`);
            return key;
        }
        
        // Handle string interpolation {{param}}
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return Object.entries(params).reduce((str, [param, val]) => 
                str.replace(new RegExp(`{{${param}}}`, 'g'), String(val)), value
            );
        }
        
        return value;
    }

    /**
     * Add additional translation file to be loaded
     * @param {string} filename - Translation file name (without .json)
     */
    addTranslationFile(filename) {
        if (!this.translationFiles.includes(filename)) {
            this.translationFiles.push(filename);
        }
    }

    /**
     * Set new language and reload translations
     * @param {string} lang - Language code ('en' or 'haw')
     */
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.error(`Unsupported language: ${lang}`);
            return;
        }
        
        this.currentLanguage = lang;
        localStorage.setItem('jemt4-language', lang);
        
        await this.loadTranslations();
        this.updateDOM();
        this.updateLanguageSwitcher();
        
        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent('jemt4-language-changed', { 
            detail: { language: lang } 
        }));
    }

    /**
     * Update all DOM elements with data-i18n attributes
     */
    updateDOM() {
        // Update text content
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            element.textContent = translation;
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            element.placeholder = translation;
        });

        // Update alt text
        document.querySelectorAll('[data-i18n-alt]').forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            const translation = this.t(key);
            element.alt = translation;
        });

        // Update title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.t(key);
            element.title = translation;
        });
    }

    /**
     * Setup language switcher buttons
     */
    setupLanguageSwitcher() {
        // Create language switcher if it doesn't exist
        this.createLanguageSwitcher();
        
        // Add event listeners to language buttons
        document.querySelectorAll('[data-lang]').forEach(button => {
            button.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });
        
        this.updateLanguageSwitcher();
    }

    /**
     * Create language switcher HTML if not present
     */
    createLanguageSwitcher() {
        if (document.querySelector('.language-switcher')) return;
        
        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';
        switcher.innerHTML = `
            <button class="lang-btn" data-lang="en" data-i18n="language.english">English</button>
            <button class="lang-btn" data-lang="haw" data-i18n="language.hawaiian">'Ōlelo Hawaiʻi</button>
        `;
        
        // Add to header or top of page
        const header = document.querySelector('header') || document.querySelector('.content-wrapper');
        if (header) {
            header.insertBefore(switcher, header.firstChild);
        }
    }

    /**
     * Update language switcher active state
     */
    updateLanguageSwitcher() {
        document.querySelectorAll('[data-lang]').forEach(button => {
            const lang = button.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Check if language is supported
     * @param {string} lang - Language code to check
     * @returns {boolean} Whether language is supported
     */
    isLanguageSupported(lang) {
        return this.supportedLanguages.includes(lang);
    }
}

// Initialize global i18n instance
window.jemt4i18n = new JEMT4I18n();

// Convenience global function
window.t = (key, params) => window.jemt4i18n.t(key, params);