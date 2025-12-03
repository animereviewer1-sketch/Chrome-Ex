/**
 * Theme System Module
 */

const Themes = {
  currentTheme: 'minimal',
  currentFont: 'roboto',
  blurIntensity: 50,
  
  themes: {
    cyberpunk: {
      name: 'Cyberpunk',
      description: 'Neon Pink/Cyan mit Glow-Effekten'
    },
    pastel: {
      name: 'Pastel',
      description: 'Sanfte Pastellfarben'
    },
    minimal: {
      name: 'Minimal',
      description: 'Schwarz/Weiß, klare Linien'
    },
    ocean: {
      name: 'Ocean',
      description: 'Blau/Türkis Töne'
    },
    forest: {
      name: 'Forest',
      description: 'Grün/Braun Natur-Töne'
    },
    sunset: {
      name: 'Sunset',
      description: 'Orange/Pink/Lila Gradienten'
    },
    neon: {
      name: 'Neon',
      description: 'Helle Neon-Farben'
    },
    dark: {
      name: 'Dark Mode',
      description: 'OLED-freundlich dunkel'
    }
  },

  fonts: {
    roboto: { name: 'Roboto', class: 'font-roboto' },
    poppins: { name: 'Poppins', class: 'font-poppins' },
    inter: { name: 'Inter', class: 'font-inter' },
    montserrat: { name: 'Montserrat', class: 'font-montserrat' },
    opensans: { name: 'Open Sans', class: 'font-opensans' },
    lato: { name: 'Lato', class: 'font-lato' },
    raleway: { name: 'Raleway', class: 'font-raleway' },
    ubuntu: { name: 'Ubuntu', class: 'font-ubuntu' },
    playfair: { name: 'Playfair Display', class: 'font-playfair' },
    firacode: { name: 'Fira Code', class: 'font-firacode' }
  },

  /**
   * Initialize theme system
   */
  async init() {
    this.currentTheme = await Storage.get('theme') || 'minimal';
    this.currentFont = await Storage.get('font') || 'roboto';
    this.blurIntensity = await Storage.get('blurIntensity') || 50;
    
    this.applyTheme(this.currentTheme);
    this.applyFont(this.currentFont);
    this.applyBlur(this.blurIntensity);
  },

  /**
   * Apply theme to document
   */
  applyTheme(themeName) {
    if (!this.themes[themeName]) {
      themeName = 'minimal';
    }
    
    document.documentElement.setAttribute('data-theme', themeName);
    this.currentTheme = themeName;
  },

  /**
   * Set and save theme
   */
  async setTheme(themeName) {
    this.applyTheme(themeName);
    await Storage.set('theme', themeName);
  },

  /**
   * Apply font to document
   */
  applyFont(fontName) {
    const font = this.fonts[fontName];
    if (!font) {
      fontName = 'roboto';
    }
    
    // Remove all font classes
    Object.values(this.fonts).forEach(f => {
      document.body.classList.remove(f.class);
    });
    
    // Add new font class
    document.body.classList.add(this.fonts[fontName].class);
    this.currentFont = fontName;
  },

  /**
   * Set and save font
   */
  async setFont(fontName) {
    this.applyFont(fontName);
    await Storage.set('font', fontName);
  },

  /**
   * Apply blur intensity
   */
  applyBlur(intensity) {
    const blurValue = Math.round(intensity * 0.2); // 0-100 -> 0-20px
    document.documentElement.style.setProperty('--blur-intensity', `${blurValue}px`);
    this.blurIntensity = intensity;
  },

  /**
   * Set and save blur intensity
   */
  async setBlur(intensity) {
    this.applyBlur(intensity);
    await Storage.set('blurIntensity', intensity);
  },

  /**
   * Get current theme info
   */
  getCurrentTheme() {
    return {
      name: this.currentTheme,
      ...this.themes[this.currentTheme]
    };
  },

  /**
   * Get all themes
   */
  getAllThemes() {
    return Object.entries(this.themes).map(([key, value]) => ({
      id: key,
      ...value
    }));
  },

  /**
   * Get all fonts
   */
  getAllFonts() {
    return Object.entries(this.fonts).map(([key, value]) => ({
      id: key,
      ...value
    }));
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Themes;
}
