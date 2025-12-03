/**
 * Passwort-Generator Widget
 * Generiert sichere Passwörter mit anpassbaren Optionen
 * Zeigt Stärke-Indikator
 */

const PasswordWidget = {
    options: {
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    },

    async render(widgetId, container) {
        const widget = await StorageManager.getWidget(widgetId);
        const savedOptions = widget?.passwordOptions || this.options;
        Object.assign(this.options, savedOptions);

        const password = this.generatePassword();

        container.innerHTML = `
            <div class="password-generator">
                <div class="password-display">
                    <span class="password-text" id="password-text-${widgetId}">${password}</span>
                    <button class="copy-btn" data-widget-id="${widgetId}" title="Kopieren">📋</button>
                </div>
                
                <div class="password-options">
                    <div class="option-row">
                        <span class="option-label">Länge</span>
                        <div class="length-slider">
                            <input type="range" id="password-length-${widgetId}" 
                                   min="8" max="64" value="${this.options.length}">
                            <span class="length-value" id="length-value-${widgetId}">${this.options.length}</span>
                        </div>
                    </div>
                    
                    <div class="option-row">
                        <span class="option-label">Großbuchstaben (A-Z)</span>
                        <input type="checkbox" id="opt-uppercase-${widgetId}" 
                               ${this.options.uppercase ? 'checked' : ''}>
                    </div>
                    
                    <div class="option-row">
                        <span class="option-label">Kleinbuchstaben (a-z)</span>
                        <input type="checkbox" id="opt-lowercase-${widgetId}" 
                               ${this.options.lowercase ? 'checked' : ''}>
                    </div>
                    
                    <div class="option-row">
                        <span class="option-label">Zahlen (0-9)</span>
                        <input type="checkbox" id="opt-numbers-${widgetId}" 
                               ${this.options.numbers ? 'checked' : ''}>
                    </div>
                    
                    <div class="option-row">
                        <span class="option-label">Symbole (!@#$%)</span>
                        <input type="checkbox" id="opt-symbols-${widgetId}" 
                               ${this.options.symbols ? 'checked' : ''}>
                    </div>
                </div>
                
                <div class="strength-indicator">
                    <div class="strength-bar">
                        <div class="strength-fill ${calculatePasswordStrength(password)}" 
                             id="strength-fill-${widgetId}"></div>
                    </div>
                    <div class="strength-text" id="strength-text-${widgetId}">
                        ${this.getStrengthText(password)}
                    </div>
                </div>
                
                <button class="generate-btn" data-widget-id="${widgetId}">
                    🔄 Neues Passwort generieren
                </button>
            </div>
        `;

        this.initEventListeners(widgetId, container);
    },

    generatePassword() {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let chars = '';
        let password = '';

        if (this.options.uppercase) chars += uppercase;
        if (this.options.lowercase) chars += lowercase;
        if (this.options.numbers) chars += numbers;
        if (this.options.symbols) chars += symbols;

        if (chars.length === 0) {
            chars = lowercase; // Fallback
        }

        // Crypto-sichere Zufallszahlen wenn verfügbar
        const array = new Uint32Array(this.options.length);
        crypto.getRandomValues(array);

        for (let i = 0; i < this.options.length; i++) {
            password += chars[array[i] % chars.length];
        }

        return password;
    },

    getStrengthText(password) {
        const strength = calculatePasswordStrength(password);
        const texts = {
            'weak': 'Schwach - Nicht empfohlen',
            'fair': 'Mittel - Könnte besser sein',
            'good': 'Gut - Ziemlich sicher',
            'strong': 'Stark - Sehr sicher'
        };
        return texts[strength] || 'Unbekannt';
    },

    initEventListeners(widgetId, container) {
        // Längen-Slider
        const lengthSlider = container.querySelector(`#password-length-${widgetId}`);
        const lengthValue = container.querySelector(`#length-value-${widgetId}`);

        lengthSlider.addEventListener('input', () => {
            this.options.length = parseInt(lengthSlider.value);
            lengthValue.textContent = this.options.length;
            this.regeneratePassword(widgetId, container);
        });

        // Checkboxen
        const checkboxes = ['uppercase', 'lowercase', 'numbers', 'symbols'];
        checkboxes.forEach(opt => {
            const checkbox = container.querySelector(`#opt-${opt}-${widgetId}`);
            checkbox.addEventListener('change', () => {
                this.options[opt] = checkbox.checked;
                this.regeneratePassword(widgetId, container);
            });
        });

        // Generieren Button
        const generateBtn = container.querySelector('.generate-btn');
        generateBtn.addEventListener('click', () => {
            this.regeneratePassword(widgetId, container);
        });

        // Kopieren Button
        const copyBtn = container.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => {
            const passwordText = container.querySelector(`#password-text-${widgetId}`);
            navigator.clipboard.writeText(passwordText.textContent).then(() => {
                showNotification('Passwort kopiert!', 'success');
            }).catch(() => {
                showNotification('Kopieren fehlgeschlagen', 'error');
            });
        });
    },

    async regeneratePassword(widgetId, container) {
        const password = this.generatePassword();
        const passwordText = container.querySelector(`#password-text-${widgetId}`);
        const strengthFill = container.querySelector(`#strength-fill-${widgetId}`);
        const strengthText = container.querySelector(`#strength-text-${widgetId}`);

        passwordText.textContent = password;
        
        const strength = calculatePasswordStrength(password);
        strengthFill.className = `strength-fill ${strength}`;
        strengthText.textContent = this.getStrengthText(password);

        // Optionen speichern
        const widget = await StorageManager.getWidget(widgetId);
        if (widget) {
            widget.passwordOptions = { ...this.options };
            await StorageManager.saveWidget(widgetId, widget);
        }
    }
};

// Global verfügbar machen
window.PasswordWidget = PasswordWidget;
