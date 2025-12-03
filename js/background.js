/**
 * Background management functionality
 */
const Background = {
  containerElement: null,
  savedBackgroundsElement: null,
  backgrounds: [],
  currentBackground: null,

  // Default backgrounds (gradient)
  defaultBackground: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',

  init() {
    this.containerElement = document.getElementById('background-container');
    this.savedBackgroundsElement = document.getElementById('saved-backgrounds');
    this.loadBackgrounds();
  },

  async loadBackgrounds() {
    this.backgrounds = await Storage.get('backgrounds', []);
    this.currentBackground = await Storage.get('currentBackground', null);
    this.applyBackground();
    this.renderSavedBackgrounds();
  },

  applyBackground() {
    if (this.currentBackground) {
      this.containerElement.style.backgroundImage = `url(${this.currentBackground})`;
      this.containerElement.style.background = '';
      this.containerElement.style.backgroundImage = `url(${this.currentBackground})`;
      this.containerElement.style.backgroundSize = 'cover';
      this.containerElement.style.backgroundPosition = 'center';
    } else {
      this.containerElement.style.backgroundImage = 'none';
      this.containerElement.style.background = this.defaultBackground;
    }
  },

  renderSavedBackgrounds() {
    if (!this.savedBackgroundsElement) return;
    
    this.savedBackgroundsElement.innerHTML = '';
    
    this.backgrounds.forEach((bg, index) => {
      const thumb = document.createElement('div');
      thumb.className = `bg-thumb${bg === this.currentBackground ? ' active' : ''}`;
      
      const img = document.createElement('img');
      img.src = bg;
      img.alt = `Background ${index + 1}`;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-bg';
      deleteBtn.innerHTML = '×';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteBackground(index);
      });
      
      thumb.appendChild(img);
      thumb.appendChild(deleteBtn);
      thumb.addEventListener('click', () => this.selectBackground(bg));
      
      this.savedBackgroundsElement.appendChild(thumb);
    });
  },

  async uploadBackground(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Invalid file type'));
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;
        
        // Resize image to reduce storage size
        const resized = await this.resizeImage(dataUrl, 1920, 1080);
        
        this.backgrounds.push(resized);
        await Storage.set('backgrounds', this.backgrounds);
        
        // Set as current background
        await this.selectBackground(resized);
        
        this.renderSavedBackgrounds();
        resolve(resized);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  resizeImage(dataUrl, maxWidth, maxHeight) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = dataUrl;
    });
  },

  async selectBackground(bg) {
    this.currentBackground = bg;
    await Storage.set('currentBackground', bg);
    this.applyBackground();
    this.renderSavedBackgrounds();
  },

  async deleteBackground(index) {
    if (index >= 0 && index < this.backgrounds.length) {
      const deletedBg = this.backgrounds[index];
      this.backgrounds.splice(index, 1);
      await Storage.set('backgrounds', this.backgrounds);
      
      // If deleted background was current, reset to default
      if (deletedBg === this.currentBackground) {
        await this.resetToDefault();
      } else {
        this.renderSavedBackgrounds();
      }
    }
  },

  async resetToDefault() {
    this.currentBackground = null;
    await Storage.set('currentBackground', null);
    this.applyBackground();
    this.renderSavedBackgrounds();
  }
};
