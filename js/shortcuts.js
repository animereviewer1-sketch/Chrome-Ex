/**
 * Shortcuts functionality
 */
const Shortcuts = {
  containerElement: null,
  shortcuts: [],

  init() {
    this.containerElement = document.getElementById('shortcuts-container');
    this.loadShortcuts();
  },

  async loadShortcuts() {
    this.shortcuts = await Storage.get('shortcuts', DEFAULT_SHORTCUTS);
    this.render();
  },

  render() {
    this.containerElement.innerHTML = '';
    
    this.shortcuts.forEach((shortcut, index) => {
      const item = this.createShortcutElement(shortcut, index);
      this.containerElement.appendChild(item);
    });
  },

  createShortcutElement(shortcut, index) {
    const link = document.createElement('a');
    link.href = shortcut.url;
    link.className = 'shortcut-item fade-in';
    link.style.animationDelay = `${index * 0.05}s`;
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'shortcut-icon';
    
    // Check if icon is URL or emoji
    if (shortcut.icon.startsWith('http') || shortcut.icon.startsWith('data:')) {
      const img = document.createElement('img');
      img.src = shortcut.icon;
      img.alt = shortcut.name;
      img.onerror = () => {
        iconDiv.textContent = '';
        iconDiv.appendChild(this.createDefaultIconElement(shortcut.url));
      };
      iconDiv.appendChild(img);
    } else if (shortcut.icon) {
      iconDiv.textContent = shortcut.icon;
    } else {
      iconDiv.appendChild(this.createDefaultIconElement(shortcut.url));
    }
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'shortcut-name';
    nameDiv.textContent = shortcut.name;
    
    link.appendChild(iconDiv);
    link.appendChild(nameDiv);
    
    return link;
  },

  createDefaultIconElement(url) {
    try {
      const domain = new URL(url).hostname;
      const img = document.createElement('img');
      img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
      img.alt = 'icon';
      return img;
    } catch (e) {
      const span = document.createElement('span');
      span.textContent = '🔗';
      return span;
    }
  },

  getDefaultIcon(url) {
    try {
      const domain = new URL(url).hostname;
      return `<img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64" alt="icon">`;
    } catch (e) {
      return '🔗';
    }
  },

  async addShortcut(name, url, icon) {
    const shortcut = { name, url, icon: icon || '' };
    this.shortcuts.push(shortcut);
    await Storage.set('shortcuts', this.shortcuts);
    this.render();
  },

  async updateShortcut(index, name, url, icon) {
    if (index >= 0 && index < this.shortcuts.length) {
      this.shortcuts[index] = { name, url, icon: icon || '' };
      await Storage.set('shortcuts', this.shortcuts);
      this.render();
    }
  },

  async deleteShortcut(index) {
    if (index >= 0 && index < this.shortcuts.length) {
      this.shortcuts.splice(index, 1);
      await Storage.set('shortcuts', this.shortcuts);
      this.render();
    }
  },

  async resetToDefaults() {
    this.shortcuts = [...DEFAULT_SHORTCUTS];
    await Storage.set('shortcuts', this.shortcuts);
    this.render();
  }
};
