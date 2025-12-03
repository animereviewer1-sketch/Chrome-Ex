/**
 * Globale Einstellungen
 * Theme, Blur, Grid, Hintergrund, Schriftarten
 */

const SettingsManager = {
    async init() {
        const settings = await StorageManager.getSettings();
        
        // Dark Mode als Standard
        this.applyTheme(settings.theme || 'dark');
        this.applyBlur(settings.blurIntensity || 10);
        this.applyGrid(settings.gridSize || 10, settings.showGridLines || false);
        this.applyFont(settings.font || 'Inter');
        
        if (settings.customBackground) {
            this.applyCustomBackground(settings.customBackground);
        }

        this.initEventListeners();
    },

    initEventListeners() {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const closeBtn = settingsModal.querySelector('.close-btn');

        // Öffnen
        settingsBtn.addEventListener('click', async () => {
            await this.loadCurrentSettings();
            settingsModal.classList.add('active');
        });

        // Schließen
        closeBtn.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });

        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('active');
            }
        });

        // Tabs
        const tabBtns = settingsModal.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const tabId = btn.dataset.tab;
                settingsModal.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });

        // Theme
        const themeSelect = document.getElementById('theme-select');
        themeSelect.addEventListener('change', async () => {
            const theme = themeSelect.value;
            this.applyTheme(theme);
            await StorageManager.updateSetting('theme', theme);
        });

        // Blur mit Live-Preview
        const blurSlider = document.getElementById('blur-intensity');
        const blurValue = document.getElementById('blur-value');
        const blurPreview = document.getElementById('blur-preview');

        blurSlider.addEventListener('input', () => {
            const value = parseInt(blurSlider.value);
            blurValue.textContent = `${value}px`;
            blurPreview.style.backdropFilter = `blur(${value}px)`;
            blurPreview.style.webkitBackdropFilter = `blur(${value}px)`;
        });

        blurSlider.addEventListener('change', async () => {
            const value = parseInt(blurSlider.value);
            this.applyBlur(value);
            await StorageManager.updateSetting('blurIntensity', value);
        });

        // Hintergrund Upload
        const bgUpload = document.getElementById('background-upload');
        bgUpload.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                const base64 = await fileToBase64(e.target.files[0]);
                this.applyCustomBackground(base64);
                await StorageManager.updateSetting('customBackground', base64);
                showNotification('Hintergrund gesetzt', 'success');
            }
        });

        // Hintergrund entfernen
        const removeBg = document.getElementById('remove-background');
        removeBg.addEventListener('click', async () => {
            this.removeCustomBackground();
            await StorageManager.updateSetting('customBackground', null);
            showNotification('Hintergrund entfernt', 'success');
        });

        // Fonts
        const fontCards = settingsModal.querySelectorAll('.font-card');
        fontCards.forEach(card => {
            card.addEventListener('click', async () => {
                fontCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                const font = card.dataset.font;
                this.applyFont(font);
                await StorageManager.updateSetting('font', font);
            });
        });

        // Grid-Einstellungen
        const gridSlider = document.getElementById('grid-size');
        const gridValue = document.getElementById('grid-size-value');
        const showGridCheckbox = document.getElementById('show-grid-lines');

        gridSlider.addEventListener('input', () => {
            const value = parseInt(gridSlider.value);
            gridValue.textContent = `${value}px`;
        });

        gridSlider.addEventListener('change', async () => {
            const value = parseInt(gridSlider.value);
            this.applyGrid(value, showGridCheckbox.checked);
            WidgetManager.updateGridSize(value);
            await StorageManager.updateSetting('gridSize', value);
        });

        showGridCheckbox.addEventListener('change', async () => {
            const settings = await StorageManager.getSettings();
            this.applyGrid(settings.gridSize || 10, showGridCheckbox.checked);
            await StorageManager.updateSetting('showGridLines', showGridCheckbox.checked);
        });

        // Quick Actions
        this.initQuickActions();
    },

    initQuickActions() {
        // Tabs öffnen
        document.getElementById('open-tabs-page').addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('tabs.html') });
        });

        // Lesezeichen öffnen
        document.getElementById('open-bookmarks-page').addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('bookmarks.html') });
        });

        // Cache leeren
        document.getElementById('clear-cache').addEventListener('click', async () => {
            if (confirm('Alle Einstellungen und Widgets löschen?')) {
                await StorageManager.clearAll();
                location.reload();
            }
        });

        // Export
        document.getElementById('export-settings').addEventListener('click', async () => {
            const data = await StorageManager.exportSettings();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dashboard-settings.json';
            a.click();
            
            URL.revokeObjectURL(url);
            showNotification('Einstellungen exportiert', 'success');
        });

        // Import
        document.getElementById('import-settings').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.addEventListener('change', async (e) => {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        const success = await StorageManager.importSettings(event.target.result);
                        if (success) {
                            showNotification('Einstellungen importiert', 'success');
                            location.reload();
                        } else {
                            showNotification('Import fehlgeschlagen', 'error');
                        }
                    };
                    reader.readAsText(e.target.files[0]);
                }
            });
            
            input.click();
        });
    },

    async loadCurrentSettings() {
        const settings = await StorageManager.getSettings();
        
        // Theme
        document.getElementById('theme-select').value = settings.theme || 'dark';
        
        // Blur
        const blurSlider = document.getElementById('blur-intensity');
        const blurValue = document.getElementById('blur-value');
        blurSlider.value = settings.blurIntensity || 10;
        blurValue.textContent = `${settings.blurIntensity || 10}px`;
        
        // Grid
        const gridSlider = document.getElementById('grid-size');
        const gridValue = document.getElementById('grid-size-value');
        gridSlider.value = settings.gridSize || 10;
        gridValue.textContent = `${settings.gridSize || 10}px`;
        document.getElementById('show-grid-lines').checked = settings.showGridLines || false;
        
        // Font
        const fontCards = document.querySelectorAll('.font-card');
        fontCards.forEach(card => {
            card.classList.toggle('active', card.dataset.font === (settings.font || 'Inter'));
        });
    },

    applyTheme(theme) {
        document.body.classList.remove('dark-mode', 'light-mode');
        document.body.classList.add(`${theme}-mode`);
    },

    applyBlur(intensity) {
        document.documentElement.style.setProperty('--blur-intensity', `${intensity}px`);
    },

    applyGrid(size, showLines) {
        document.documentElement.style.setProperty('--grid-size', `${size}px`);
        
        const container = document.getElementById('widget-container');
        container.classList.toggle('show-grid', showLines);
    },

    applyFont(font) {
        document.body.style.fontFamily = `'${font}', -apple-system, BlinkMacSystemFont, sans-serif`;
    },

    applyCustomBackground(base64) {
        const bgElement = document.getElementById('custom-background');
        bgElement.style.backgroundImage = `url(${base64})`;
        document.body.classList.add('has-custom-background');
    },

    removeCustomBackground() {
        const bgElement = document.getElementById('custom-background');
        bgElement.style.backgroundImage = '';
        document.body.classList.remove('has-custom-background');
    }
};

// Global verfügbar machen
window.SettingsManager = SettingsManager;
