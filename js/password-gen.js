/**
 * Password Generator Module
 */

const PasswordGenerator = {
  modal: null,
  currentPassword: '',
  history: [],
  
  options: {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  },

  charsets: {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  },

  /**
   * Initialize password generator
   */
  async init() {
    this.history = await Storage.get('passwordHistory') || [];
  },

  /**
   * Show password generator modal
   */
  showModal() {
    this.generatePassword();
    
    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay visible';
    this.modal.innerHTML = `
      <div class="modal" style="max-width: 450px;">
        <div class="modal-header">
          <span class="modal-title">🔐 Passwort-Generator</span>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="password-display">${this.escapeHtml(this.currentPassword)}</div>
          
          <div class="password-strength">
            ${this.renderStrengthBars()}
          </div>
          <div class="strength-text">${this.getStrengthText()}</div>
          
          <div class="password-length">
            <label class="form-label">Länge: <span class="length-value">${this.options.length}</span></label>
            <input type="range" class="form-range length-slider" min="8" max="64" value="${this.options.length}">
          </div>
          
          <div class="password-options">
            <label class="form-checkbox">
              <input type="checkbox" ${this.options.uppercase ? 'checked' : ''} data-option="uppercase">
              A-Z
            </label>
            <label class="form-checkbox">
              <input type="checkbox" ${this.options.lowercase ? 'checked' : ''} data-option="lowercase">
              a-z
            </label>
            <label class="form-checkbox">
              <input type="checkbox" ${this.options.numbers ? 'checked' : ''} data-option="numbers">
              0-9
            </label>
            <label class="form-checkbox">
              <input type="checkbox" ${this.options.symbols ? 'checked' : ''} data-option="symbols">
              !@#$%
            </label>
          </div>
          
          <div class="password-actions">
            <button class="btn btn-secondary regenerate-btn">🔄 Neu generieren</button>
            <button class="btn btn-primary copy-btn">📋 Kopieren</button>
          </div>
          
          ${this.history.length > 0 ? `
            <div class="password-history">
              <h4>Letzte Passwörter</h4>
              <div class="history-list">
                ${this.history.slice(0, 5).map(pw => `
                  <div class="history-item">
                    <span class="history-password">${this.escapeHtml(pw.password.substring(0, 20))}...</span>
                    <button class="btn-icon copy-history" data-password="${this.escapeHtml(pw.password)}">📋</button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.attachEventListeners();
  },

  /**
   * Generate random password
   */
  generatePassword() {
    let charset = '';
    
    if (this.options.uppercase) charset += this.charsets.uppercase;
    if (this.options.lowercase) charset += this.charsets.lowercase;
    if (this.options.numbers) charset += this.charsets.numbers;
    if (this.options.symbols) charset += this.charsets.symbols;
    
    // Ensure at least one charset is selected
    if (charset === '') {
      charset = this.charsets.lowercase;
      this.options.lowercase = true;
    }
    
    // Generate using crypto API for better randomness
    let password = '';
    const array = new Uint32Array(this.options.length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < this.options.length; i++) {
      password += charset[array[i] % charset.length];
    }
    
    this.currentPassword = password;
    return password;
  },

  /**
   * Calculate password strength
   */
  calculateStrength() {
    const pw = this.currentPassword;
    let score = 0;
    
    // Length score
    if (pw.length >= 8) score += 1;
    if (pw.length >= 12) score += 1;
    if (pw.length >= 16) score += 1;
    if (pw.length >= 24) score += 1;
    
    // Character variety
    if (/[a-z]/.test(pw)) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pw)) score += 1;
    
    // Normalize to 0-4 scale
    return Math.min(Math.floor(score / 2), 4);
  },

  /**
   * Get strength text
   */
  getStrengthText() {
    const strength = this.calculateStrength();
    const texts = ['Sehr schwach', 'Schwach', 'Mittel', 'Stark', 'Sehr stark'];
    return `Stärke: ${texts[strength]}`;
  },

  /**
   * Render strength bars
   */
  renderStrengthBars() {
    const strength = this.calculateStrength();
    const colors = ['weak', 'weak', 'medium', 'strong', 'strong'];
    
    return Array(4).fill(0).map((_, i) => `
      <div class="strength-bar ${i < strength ? 'active ' + colors[strength] : ''}"></div>
    `).join('');
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    this.modal.querySelector('.modal-close').addEventListener('click', () => this.hide());

    // Length slider
    const slider = this.modal.querySelector('.length-slider');
    slider.addEventListener('input', (e) => {
      this.options.length = parseInt(e.target.value);
      this.modal.querySelector('.length-value').textContent = this.options.length;
      this.updatePassword();
    });

    // Checkboxes
    this.modal.querySelectorAll('[data-option]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.options[e.target.dataset.option] = e.target.checked;
        this.updatePassword();
      });
    });

    // Regenerate button
    this.modal.querySelector('.regenerate-btn').addEventListener('click', () => {
      this.updatePassword();
    });

    // Copy button
    this.modal.querySelector('.copy-btn').addEventListener('click', () => {
      this.copyToClipboard(this.currentPassword);
    });

    // Copy history
    this.modal.querySelectorAll('.copy-history').forEach(btn => {
      btn.addEventListener('click', () => {
        this.copyToClipboard(btn.dataset.password);
      });
    });

    // ESC to close
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        this.hide();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  },

  /**
   * Update password display
   */
  updatePassword() {
    this.generatePassword();
    this.modal.querySelector('.password-display').textContent = this.currentPassword;
    this.modal.querySelector('.password-strength').innerHTML = this.renderStrengthBars();
    this.modal.querySelector('.strength-text').textContent = this.getStrengthText();
  },

  /**
   * Copy password to clipboard
   */
  async copyToClipboard(password) {
    try {
      await navigator.clipboard.writeText(password);
      Toast.show('Passwort kopiert!', 'success');
      
      // Add to history
      await this.addToHistory(password);
    } catch (error) {
      Toast.show('Kopieren fehlgeschlagen', 'error');
    }
  },

  /**
   * Add password to history
   */
  async addToHistory(password) {
    const entry = {
      password: password,
      timestamp: new Date().toISOString()
    };
    
    // Keep only last 10
    this.history.unshift(entry);
    this.history = this.history.slice(0, 10);
    
    await Storage.set('passwordHistory', this.history);
  },

  /**
   * Hide modal
   */
  hide() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PasswordGenerator;
}
