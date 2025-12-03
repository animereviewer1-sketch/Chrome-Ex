/**
 * Weather Widget Module
 * Uses WeatherAPI.com for weather data
 * Default location: Munich Haidhausen
 */

const Weather = {
  container: null,
  location: 'Munich Haidhausen',
  apiKey: '',
  data: null,
  refreshInterval: null,
  REFRESH_RATE: 30 * 60 * 1000, // 30 minutes

  /**
   * Initialize weather widget
   */
  async init(container, settings = {}) {
    this.container = container;
    this.location = settings.location || 'Munich Haidhausen';
    this.apiKey = settings.apiKey || '';
    
    this.render();
    await this.fetchWeather();
    this.startRefreshInterval();
  },

  /**
   * Render weather HTML
   */
  render() {
    this.container.innerHTML = `
      <div class="weather-widget">
        <div class="weather-loading">
          <div class="spinner"></div>
        </div>
        <div class="weather-content" style="display: none;">
          <div class="weather-icon"></div>
          <div class="weather-info">
            <div class="weather-temp"></div>
            <div class="weather-desc"></div>
            <div class="weather-location"></div>
          </div>
        </div>
        <div class="weather-details" style="display: none;">
          <span class="weather-humidity">💧 --</span>
          <span class="weather-wind">💨 --</span>
        </div>
        <div class="weather-error" style="display: none;">
          <span>⚠️ Weather unavailable</span>
        </div>
      </div>
    `;
  },

  /**
   * Fetch weather data from API
   */
  async fetchWeather() {
    // Try to get cached data first
    const cached = await this.getCachedData();
    
    if (!this.apiKey) {
      // Use mock data if no API key
      this.displayMockData();
      return;
    }

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${encodeURIComponent(this.location)}&aqi=yes`
      );
      
      if (!response.ok) {
        throw new Error('Weather API error');
      }

      const data = await response.json();
      this.data = data;
      this.cacheData(data);
      this.displayWeather(data);
    } catch (error) {
      console.error('Weather fetch error:', error);
      
      if (cached) {
        this.displayWeather(cached);
      } else {
        this.displayError();
      }
    }
  },

  /**
   * Display weather data
   */
  displayWeather(data) {
    const loading = this.container.querySelector('.weather-loading');
    const content = this.container.querySelector('.weather-content');
    const details = this.container.querySelector('.weather-details');
    const error = this.container.querySelector('.weather-error');
    
    loading.style.display = 'none';
    error.style.display = 'none';
    content.style.display = 'flex';
    details.style.display = 'flex';

    const current = data.current;
    const location = data.location;

    // Update content
    this.container.querySelector('.weather-icon').textContent = this.getWeatherEmoji(current.condition.code, current.is_day);
    this.container.querySelector('.weather-temp').textContent = `${Math.round(current.temp_c)}°C`;
    this.container.querySelector('.weather-desc').textContent = current.condition.text;
    this.container.querySelector('.weather-location').textContent = `${location.name}`;
    this.container.querySelector('.weather-humidity').textContent = `💧 ${current.humidity}%`;
    this.container.querySelector('.weather-wind').textContent = `💨 ${current.wind_kph} km/h`;
  },

  /**
   * Display mock data when no API key
   */
  displayMockData() {
    const mockData = {
      location: { name: 'München' },
      current: {
        temp_c: 18,
        condition: { text: 'Partly cloudy', code: 1003 },
        humidity: 65,
        wind_kph: 12,
        is_day: 1
      }
    };
    this.displayWeather(mockData);
  },

  /**
   * Display error state
   */
  displayError() {
    const loading = this.container.querySelector('.weather-loading');
    const content = this.container.querySelector('.weather-content');
    const details = this.container.querySelector('.weather-details');
    const error = this.container.querySelector('.weather-error');
    
    loading.style.display = 'none';
    content.style.display = 'none';
    details.style.display = 'none';
    error.style.display = 'block';
  },

  /**
   * Get weather emoji based on condition code
   */
  getWeatherEmoji(code, isDay) {
    const conditions = {
      1000: isDay ? '☀️' : '🌙', // Sunny/Clear
      1003: isDay ? '⛅' : '☁️', // Partly cloudy
      1006: '☁️', // Cloudy
      1009: '☁️', // Overcast
      1030: '🌫️', // Mist
      1063: '🌧️', // Patchy rain
      1066: '🌨️', // Patchy snow
      1069: '🌧️', // Patchy sleet
      1072: '🌧️', // Patchy freezing drizzle
      1087: '⛈️', // Thundery outbreaks
      1114: '🌨️', // Blowing snow
      1117: '🌨️', // Blizzard
      1135: '🌫️', // Fog
      1147: '🌫️', // Freezing fog
      1150: '🌧️', // Light drizzle
      1153: '🌧️', // Light drizzle
      1168: '🌧️', // Freezing drizzle
      1171: '🌧️', // Heavy freezing drizzle
      1180: '🌧️', // Light rain
      1183: '🌧️', // Light rain
      1186: '🌧️', // Moderate rain
      1189: '🌧️', // Moderate rain
      1192: '🌧️', // Heavy rain
      1195: '🌧️', // Heavy rain
      1198: '🌧️', // Light freezing rain
      1201: '🌧️', // Moderate freezing rain
      1204: '🌨️', // Light sleet
      1207: '🌨️', // Moderate sleet
      1210: '🌨️', // Light snow
      1213: '🌨️', // Light snow
      1216: '🌨️', // Moderate snow
      1219: '🌨️', // Moderate snow
      1222: '❄️', // Heavy snow
      1225: '❄️', // Heavy snow
      1237: '🌨️', // Ice pellets
      1240: '🌧️', // Light rain shower
      1243: '🌧️', // Moderate rain shower
      1246: '🌧️', // Torrential rain
      1249: '🌨️', // Light sleet showers
      1252: '🌨️', // Moderate sleet showers
      1255: '🌨️', // Light snow showers
      1258: '🌨️', // Moderate snow showers
      1261: '🌨️', // Light ice pellet showers
      1264: '🌨️', // Moderate ice pellet showers
      1273: '⛈️', // Light rain with thunder
      1276: '⛈️', // Moderate rain with thunder
      1279: '⛈️', // Light snow with thunder
      1282: '⛈️'  // Moderate snow with thunder
    };
    
    return conditions[code] || '🌡️';
  },

  /**
   * Cache weather data
   */
  async cacheData(data) {
    try {
      await Storage.set('weatherCache', {
        data: data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Cache error:', error);
    }
  },

  /**
   * Get cached weather data
   */
  async getCachedData() {
    try {
      const cached = await Storage.get('weatherCache');
      if (cached && Date.now() - cached.timestamp < this.REFRESH_RATE) {
        return cached.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Start refresh interval
   */
  startRefreshInterval() {
    this.refreshInterval = setInterval(() => {
      this.fetchWeather();
    }, this.REFRESH_RATE);
  },

  /**
   * Update location
   */
  async setLocation(location) {
    this.location = location;
    await Storage.set('weatherLocation', location);
    await this.fetchWeather();
  },

  /**
   * Update API key
   */
  async setApiKey(key) {
    this.apiKey = key;
    await Storage.set('weatherApiKey', key);
    await this.fetchWeather();
  },

  /**
   * Cleanup
   */
  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Weather;
}
