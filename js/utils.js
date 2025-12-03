/**
 * Utility-Funktionen für die Chrome Extension
 * Enthält Hilfsfunktionen für ID-Generierung, DOM-Manipulation, etc.
 */

// Generiert eine eindeutige ID für Widgets
function generateUniqueId() {
    return 'widget-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Generiert eine UUID v4
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Formatiert Datum in deutsches Format
function formatDateGerman(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(date).toLocaleDateString('de-DE', options);
}

// Formatiert Zeit in deutsches Format
function formatTimeGerman(date) {
    return new Date(date).toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Debounce-Funktion für Performance-Optimierung
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle-Funktion für Performance-Optimierung
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Konvertiert Datei zu Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Holt Favicon von URL
function getFaviconUrl(url) {
    try {
        const urlObj = new URL(url);
        return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch {
        return null;
    }
}

// Truncate Text mit Ellipsis
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// Erstellt ein DOM-Element mit Attributen und Children
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), value);
        } else if (key === 'dataset' && typeof value === 'object') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else {
            element.setAttribute(key, value);
        }
    });
    
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    });
    
    return element;
}

// Zeigt eine Benachrichtigung an
function showNotification(message, type = 'info', duration = 3000) {
    const notification = createElement('div', {
        className: `notification notification-${type}`,
        style: {
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            background: type === 'error' ? 'var(--danger)' : 
                        type === 'success' ? 'var(--success)' : 
                        'var(--accent-primary)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '9999',
            animation: 'slideUp 0.3s ease'
        }
    }, [message]);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Snap Position zum Raster
function snapToGrid(value, gridSize) {
    return Math.round(value / gridSize) * gridSize;
}

// Berechnet die Stärke eines Passworts
function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Länge
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (password.length >= 16) strength++;
    
    // Vielfalt
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'fair';
    if (strength <= 6) return 'good';
    return 'strong';
}

// Wetter-Icons basierend auf Bedingung
const weatherIcons = {
    'clear': '☀️',
    'sunny': '☀️',
    'partly cloudy': '⛅',
    'cloudy': '☁️',
    'overcast': '☁️',
    'mist': '🌫️',
    'fog': '🌫️',
    'patchy rain': '🌦️',
    'light rain': '🌧️',
    'rain': '🌧️',
    'heavy rain': '🌧️',
    'thunderstorm': '⛈️',
    'thunder': '⛈️',
    'snow': '❄️',
    'light snow': '🌨️',
    'heavy snow': '🌨️',
    'sleet': '🌨️',
    'default': '🌤️'
};

// Holt das passende Wetter-Icon
function getWeatherIcon(condition) {
    const lowerCondition = condition.toLowerCase();
    for (const [key, icon] of Object.entries(weatherIcons)) {
        if (lowerCondition.includes(key)) {
            return icon;
        }
    }
    return weatherIcons['default'];
}

// Export für Module (falls verwendet)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateUniqueId,
        generateUUID,
        formatDateGerman,
        formatTimeGerman,
        debounce,
        throttle,
        fileToBase64,
        getFaviconUrl,
        truncateText,
        createElement,
        showNotification,
        snapToGrid,
        calculatePasswordStrength,
        getWeatherIcon
    };
}
