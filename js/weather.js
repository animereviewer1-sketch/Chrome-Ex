/**
 * Weather functionality using WeatherAPI.com
 */
const Weather = {
  widgetElement: null,
  tempElement: null,
  locationElement: null,
  iconElement: null,
  windElement: null,
  humidityElement: null,
  uvElement: null,
  apiKey: '',
  location: '',
  tempUnit: 'c',

  weatherIcons: {
    '1000': '☀️', // Sunny/Clear
    '1003': '⛅', // Partly cloudy
    '1006': '☁️', // Cloudy
    '1009': '☁️', // Overcast
    '1030': '🌫️', // Mist
    '1063': '🌦️', // Patchy rain possible
    '1066': '🌨️', // Patchy snow possible
    '1069': '🌨️', // Patchy sleet possible
    '1072': '🌨️', // Patchy freezing drizzle possible
    '1087': '⛈️', // Thundery outbreaks possible
    '1114': '❄️', // Blowing snow
    '1117': '🌨️', // Blizzard
    '1135': '🌫️', // Fog
    '1147': '🌫️', // Freezing fog
    '1150': '🌧️', // Patchy light drizzle
    '1153': '🌧️', // Light drizzle
    '1168': '🌧️', // Freezing drizzle
    '1171': '🌧️', // Heavy freezing drizzle
    '1180': '🌧️', // Patchy light rain
    '1183': '🌧️', // Light rain
    '1186': '🌧️', // Moderate rain at times
    '1189': '🌧️', // Moderate rain
    '1192': '🌧️', // Heavy rain at times
    '1195': '🌧️', // Heavy rain
    '1198': '🌧️', // Light freezing rain
    '1201': '🌧️', // Moderate or heavy freezing rain
    '1204': '🌨️', // Light sleet
    '1207': '🌨️', // Moderate or heavy sleet
    '1210': '🌨️', // Patchy light snow
    '1213': '🌨️', // Light snow
    '1216': '🌨️', // Patchy moderate snow
    '1219': '🌨️', // Moderate snow
    '1222': '❄️', // Patchy heavy snow
    '1225': '❄️', // Heavy snow
    '1237': '🌨️', // Ice pellets
    '1240': '🌧️', // Light rain shower
    '1243': '🌧️', // Moderate or heavy rain shower
    '1246': '🌧️', // Torrential rain shower
    '1249': '🌨️', // Light sleet showers
    '1252': '🌨️', // Moderate or heavy sleet showers
    '1255': '🌨️', // Light snow showers
    '1258': '❄️', // Moderate or heavy snow showers
    '1261': '🌨️', // Light showers of ice pellets
    '1264': '🌨️', // Moderate or heavy showers of ice pellets
    '1273': '⛈️', // Patchy light rain with thunder
    '1276': '⛈️', // Moderate or heavy rain with thunder
    '1279': '⛈️', // Patchy light snow with thunder
    '1282': '⛈️', // Moderate or heavy snow with thunder
    'default': '🌡️'
  },

  init() {
    this.widgetElement = document.getElementById('weather-widget');
    this.tempElement = document.getElementById('temperature');
    this.locationElement = document.getElementById('weather-location');
    this.iconElement = document.getElementById('weather-icon-display');
    this.windElement = document.getElementById('wind-speed');
    this.humidityElement = document.getElementById('humidity');
    this.uvElement = document.getElementById('uv-index');
    
    this.loadSettings();
  },

  async loadSettings() {
    this.apiKey = await Storage.get('weatherApiKey', '');
    this.location = await Storage.get('weatherLocation', '');
    this.tempUnit = await Storage.get('tempUnit', 'c');
    
    if (this.apiKey && this.location) {
      this.fetchWeather();
    } else if (this.apiKey) {
      this.detectLocation();
    }
  },

  setApiKey(key) {
    this.apiKey = key;
    Storage.set('weatherApiKey', key);
  },

  setLocation(location) {
    this.location = location;
    Storage.set('weatherLocation', location);
    if (this.apiKey) {
      this.fetchWeather();
    }
  },

  setTempUnit(unit) {
    this.tempUnit = unit;
    Storage.set('tempUnit', unit);
    if (this.apiKey && this.location) {
      this.fetchWeather();
    }
  },

  detectLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude},${position.coords.longitude}`;
          this.setLocation(coords);
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.locationElement.textContent = 'Location not available';
        }
      );
    }
  },

  async fetchWeather() {
    if (!this.apiKey || !this.location) {
      this.locationElement.textContent = 'Configure in settings';
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
      this.updateDisplay(data);
    } catch (error) {
      console.error('Weather fetch error:', error);
      this.locationElement.textContent = 'Error loading weather';
    }
  },

  updateDisplay(data) {
    const current = data.current;
    const location = data.location;
    
    // Temperature
    const temp = this.tempUnit === 'c' ? current.temp_c : current.temp_f;
    this.tempElement.textContent = Math.round(temp);
    
    // Update temp unit display
    const tempDisplay = this.tempElement.parentElement;
    if (tempDisplay) {
      tempDisplay.innerHTML = `<span id="temperature">${Math.round(temp)}</span>°${this.tempUnit.toUpperCase()}`;
    }
    
    // Location
    this.locationElement.textContent = `${location.name}, ${location.country}`;
    
    // Weather icon
    const conditionCode = current.condition.code.toString();
    this.iconElement.textContent = this.weatherIcons[conditionCode] || this.weatherIcons['default'];
    
    // Details
    this.windElement.textContent = `${Math.round(current.wind_kph)} km/h`;
    this.humidityElement.textContent = `${current.humidity}%`;
    this.uvElement.textContent = current.uv;
  },

  show() {
    this.widgetElement.classList.remove('hidden');
  },

  hide() {
    this.widgetElement.classList.add('hidden');
  }
};
