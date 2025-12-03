/**
 * Clock Widget Module
 */

const Clock = {
  container: null,
  timeElement: null,
  dateElement: null,
  greetingElement: null,
  interval: null,

  /**
   * Initialize clock widget
   */
  init(container) {
    this.container = container;
    this.render();
    this.update();
    this.startInterval();
  },

  /**
   * Render clock HTML
   */
  render() {
    this.container.innerHTML = `
      <div class="clock-widget">
        <div class="clock-time"></div>
        <div class="clock-date"></div>
        <div class="clock-greeting"></div>
      </div>
    `;
    
    this.timeElement = this.container.querySelector('.clock-time');
    this.dateElement = this.container.querySelector('.clock-date');
    this.greetingElement = this.container.querySelector('.clock-greeting');
  },

  /**
   * Update clock display
   */
  update() {
    const now = new Date();
    
    // Format time
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.timeElement.textContent = `${hours}:${minutes}`;
    
    // Format date
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    this.dateElement.textContent = now.toLocaleDateString('de-DE', options);
    
    // Update greeting
    this.greetingElement.textContent = this.getGreeting(now.getHours());
  },

  /**
   * Get appropriate greeting based on time
   */
  getGreeting(hour) {
    if (hour >= 5 && hour < 12) {
      return 'Guten Morgen';
    } else if (hour >= 12 && hour < 18) {
      return 'Guten Tag';
    } else if (hour >= 18 && hour < 22) {
      return 'Guten Abend';
    } else {
      return 'Gute Nacht';
    }
  },

  /**
   * Start update interval
   */
  startInterval() {
    // Update every second for accurate time
    this.interval = setInterval(() => this.update(), 1000);
  },

  /**
   * Stop interval
   */
  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Clock;
}
