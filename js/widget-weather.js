/**
 * Wetter-Widget
 * Nutzt wttr.in API (kein API-Key nötig)
 * Standard-Standort: München Haidhausen
 */

const WeatherWidget = {
    // Standard-Standort
    defaultLocation: 'München Haidhausen',
    
    // Cache für Wetterdaten
    cache: {},
    cacheTimeout: 10 * 60 * 1000, // 10 Minuten

    async render(widgetId, container) {
        container.innerHTML = `
            <div class="weather-display">
                <div class="widget-loading"></div>
            </div>
        `;

        await this.fetchWeather(widgetId, container);
    },

    async fetchWeather(widgetId, container) {
        const widget = await StorageManager.getWidget(widgetId);
        const location = widget?.location || this.defaultLocation;

        // Cache prüfen
        const cacheKey = location;
        const cached = this.cache[cacheKey];
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            this.displayWeather(container, cached.data, location);
            return;
        }

        try {
            // wttr.in API - kein API-Key nötig
            const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
            
            if (!response.ok) {
                throw new Error('Wetterdaten nicht verfügbar');
            }

            const data = await response.json();
            
            // Cache aktualisieren
            this.cache[cacheKey] = {
                data,
                timestamp: Date.now()
            };

            this.displayWeather(container, data, location);
        } catch (error) {
            console.error('Fehler beim Laden der Wetterdaten:', error);
            this.displayError(container, error.message);
        }
    },

    displayWeather(container, data, location) {
        const current = data.current_condition[0];
        const temp = current.temp_C;
        const feelsLike = current.FeelsLikeC;
        const humidity = current.humidity;
        const windSpeed = current.windspeedKmph;
        const condition = current.weatherDesc[0].value;
        const icon = getWeatherIcon(condition);

        container.innerHTML = `
            <div class="weather-display">
                <div class="weather-icon">${icon}</div>
                <div class="temperature">${temp}°C</div>
                <div class="condition">${condition}</div>
                <div class="location">📍 ${location}</div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <div class="weather-detail-label">Gefühlt</div>
                        <div class="weather-detail-value">${feelsLike}°C</div>
                    </div>
                    <div class="weather-detail">
                        <div class="weather-detail-label">Luftfeuchtigkeit</div>
                        <div class="weather-detail-value">${humidity}%</div>
                    </div>
                    <div class="weather-detail">
                        <div class="weather-detail-label">Wind</div>
                        <div class="weather-detail-value">${windSpeed} km/h</div>
                    </div>
                </div>
            </div>
        `;
    },

    displayError(container, message) {
        container.innerHTML = `
            <div class="widget-error">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${message}</div>
            </div>
        `;
    }
};

// Global verfügbar machen
window.WeatherWidget = WeatherWidget;
