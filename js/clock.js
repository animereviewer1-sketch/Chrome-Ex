/**
 * Clock and Date functionality
 */
const Clock = {
  clockElement: null,
  dateElement: null,
  timeFormat: '24',
  language: 'de',

  init() {
    this.clockElement = document.getElementById('clock');
    this.dateElement = document.getElementById('date');
    this.update();
    setInterval(() => this.update(), 1000);
  },

  setTimeFormat(format) {
    this.timeFormat = format;
    this.update();
  },

  setLanguage(lang) {
    this.language = lang;
    this.update();
  },

  update() {
    const now = new Date();
    
    // Update time
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    if (this.timeFormat === '12') {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      this.clockElement.textContent = `${hours}:${minutes} ${ampm}`;
    } else {
      this.clockElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    
    // Update date
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    const locale = this.language === 'de' ? 'de-DE' : 'en-US';
    this.dateElement.textContent = now.toLocaleDateString(locale, options);
  }
};
