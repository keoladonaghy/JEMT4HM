/**
 * JEMT4 Settings Modal System
 * Handles settings modal, language selection, and primary instrument preferences
 */
class JEMT4Settings {
    constructor() {
        this.settingsTranslations = {};
        this.currentLanguage = window.jemt4i18n?.getCurrentLanguage() || 'en';
        this.primaryInstrument = localStorage.getItem('jemt4-primary-instrument') || 'none';
        
        // Initialize when i18n is ready
        this.initWhenReady();
    }

    /**
     * Wait for i18n to be ready, then initialize
     */
    initWhenReady() {
        if (window.jemt4i18n) {
            // Add settings translation file to i18n system
            window.jemt4i18n.addTranslationFile('settings');
            
            this.loadSettingsTranslations().then(() => {
                this.createSettingsModal();
                this.setupEventListeners();
            });
        } else {
            setTimeout(() => this.initWhenReady(), 100);
        }
    }

    /**
     * Load settings-specific translations
     */
    async loadSettingsTranslations() {
        try {
            const response = await fetch('i18n/settings.json');
            this.settingsTranslations = await response.json();
        } catch (error) {
            console.error('Failed to load settings translations:', error);
            this.settingsTranslations = { en: {}, haw: {} };
        }
    }

    /**
     * Get translated text for settings
     */
    st(key) {
        const keys = key.split('.');
        let value = this.settingsTranslations[this.currentLanguage];
        
        for (const k of keys) {
            value = value?.[k];
        }
        
        // Fallback to English
        if (!value && this.currentLanguage !== 'en') {
            value = this.settingsTranslations.en;
            for (const k of keys) {
                value = value?.[k];
            }
        }
        
        return value || key;
    }

    /**
     * Create settings gear button and modal
     */
    createSettingsModal() {
        // Create settings gear button
        const settingsButton = document.createElement('button');
        settingsButton.className = 'settings-btn';
        settingsButton.innerHTML = '⚙️';
        settingsButton.title = 'Settings';
        settingsButton.setAttribute('aria-label', 'Open Settings');
        
        // Position it in the header row
        const headerRow = document.querySelector('.header-row');
        if (headerRow) {
            headerRow.appendChild(settingsButton);
        }

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.id = 'settings-modal';
        modal.innerHTML = this.getModalHTML();
        
        document.body.appendChild(modal);
        
        // Add event listeners
        settingsButton.addEventListener('click', () => this.openModal());
    }

    /**
     * Generate modal HTML
     */
    getModalHTML() {
        return `
            <div class="settings-modal-overlay">
                <div class="settings-modal-content">
                    <div class="settings-modal-header">
                        <h3 class="settings-modal-title">${this.st('title')}</h3>
                        <button class="settings-modal-close" aria-label="Close">×</button>
                    </div>
                    
                    <div class="settings-modal-body">
                        <!-- Language Section -->
                        <div class="settings-section">
                            <h4 class="settings-section-title">${this.st('language.title')}</h4>
                            <p class="settings-section-description">${this.st('language.description')}</p>
                            <div class="settings-radio-group">
                                <label class="settings-radio-label">
                                    <input type="radio" name="language" value="en" ${this.currentLanguage === 'en' ? 'checked' : ''}>
                                    <span class="settings-radio-text">${this.st('language.english')}</span>
                                </label>
                                <label class="settings-radio-label">
                                    <input type="radio" name="language" value="haw" ${this.currentLanguage === 'haw' ? 'checked' : ''}>
                                    <span class="settings-radio-text">${this.st('language.hawaiian')}</span>
                                </label>
                            </div>
                        </div>

                        <!-- Primary Instrument Section -->
                        <div class="settings-section">
                            <h4 class="settings-section-title">${this.st('primaryInstrument.title')}</h4>
                            <p class="settings-section-description">${this.st('primaryInstrument.description')}</p>
                            <div class="settings-radio-group">
                                <label class="settings-radio-label">
                                    <input type="radio" name="primaryInstrument" value="none" ${this.primaryInstrument === 'none' ? 'checked' : ''}>
                                    <span class="settings-radio-text">${this.st('primaryInstrument.none')}</span>
                                </label>
                                <label class="settings-radio-label">
                                    <input type="radio" name="primaryInstrument" value="ukulele" ${this.primaryInstrument === 'ukulele' ? 'checked' : ''}>
                                    <span class="settings-radio-text">${this.st('primaryInstrument.ukulele')}</span>
                                </label>
                                <label class="settings-radio-label">
                                    <input type="radio" name="primaryInstrument" value="guitar" ${this.primaryInstrument === 'guitar' ? 'checked' : ''}>
                                    <span class="settings-radio-text">${this.st('primaryInstrument.guitar')}</span>
                                </label>
                                <label class="settings-radio-label">
                                    <input type="radio" name="primaryInstrument" value="acousticBass" ${this.primaryInstrument === 'acousticBass' ? 'checked' : ''}>
                                    <span class="settings-radio-text">${this.st('primaryInstrument.acousticBass')}</span>
                                </label>
                                <label class="settings-radio-label">
                                    <input type="radio" name="primaryInstrument" value="electricBass" ${this.primaryInstrument === 'electricBass' ? 'checked' : ''}>
                                    <span class="settings-radio-text">${this.st('primaryInstrument.electricBass')}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-modal-footer">
                        <button class="settings-btn-cancel">${this.st('buttons.cancel')}</button>
                        <button class="settings-btn-save">${this.st('buttons.save')}</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Language change listener
        window.addEventListener('jemt4-language-changed', (e) => {
            this.currentLanguage = e.detail.language;
            this.updateModalContent();
        });

        // Modal event listeners
        document.addEventListener('click', (e) => {
            if (e.target.matches('.settings-modal-close, .settings-btn-cancel')) {
                this.closeModal();
            }
            
            if (e.target.matches('.settings-btn-save')) {
                this.saveSettings();
            }
            
            // Close modal if clicking overlay
            if (e.target.matches('.settings-modal-overlay')) {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.closeModal();
            }
        });
    }

    /**
     * Open settings modal
     */
    openModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Focus on modal for accessibility
            const firstInput = modal.querySelector('input[type="radio"]:checked');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    /**
     * Close settings modal
     */
    closeModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * Check if modal is open
     */
    isModalOpen() {
        const modal = document.getElementById('settings-modal');
        return modal && modal.style.display === 'flex';
    }

    /**
     * Save settings from modal
     */
    saveSettings() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;

        // Get selected language
        const selectedLanguage = modal.querySelector('input[name="language"]:checked')?.value;
        if (selectedLanguage && selectedLanguage !== this.currentLanguage) {
            window.jemt4i18n.setLanguage(selectedLanguage);
        }

        // Get selected primary instrument
        const selectedInstrument = modal.querySelector('input[name="primaryInstrument"]:checked')?.value;
        if (selectedInstrument) {
            this.primaryInstrument = selectedInstrument;
            localStorage.setItem('jemt4-primary-instrument', selectedInstrument);
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('jemt4-primary-instrument-changed', {
                detail: { instrument: selectedInstrument }
            }));
        }

        this.closeModal();
    }

    /**
     * Update modal content when language changes
     */
    updateModalContent() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            const content = modal.querySelector('.settings-modal-content');
            if (content) {
                content.innerHTML = this.getModalHTML().match(/<div class="settings-modal-content">(.*)<\/div>/s)[1];
            }
        }
    }

    /**
     * Get current primary instrument
     */
    getPrimaryInstrument() {
        return this.primaryInstrument;
    }
}

// Initialize settings when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.jemt4Settings = new JEMT4Settings();
});