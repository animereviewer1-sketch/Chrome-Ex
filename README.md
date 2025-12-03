# SuperTab - New Tab Page Chrome Extension

A beautiful, modern Chrome Extension that replaces your new tab page with a customizable dashboard featuring glassmorphism design, weather widget, to-do list, and more.

![SuperTab Preview](https://github.com/user-attachments/assets/eebcf2e6-32ef-43db-a20a-65bae46b86c3)

## Features

### ✨ Core Features
- **Real-time Clock & Date** - Displays current time and date with configurable 12/24-hour format
- **Google Search Bar** - Quick search with multiple search engine support (Google, Bing, DuckDuckGo, Yahoo)
- **Quick Shortcuts** - Customizable shortcuts to your favorite websites
- **Inspirational Quotes** - Random motivational quotes in German or English

### 🎨 Custom Backgrounds
- Upload your own background images
- Manage saved backgrounds
- Beautiful default gradient as fallback

### 🌤️ Weather Widget
- Current temperature display
- Wind speed, humidity, and UV index
- Weather icons based on conditions
- Supports WeatherAPI.com integration
- Location detection or manual entry
- Celsius/Fahrenheit toggle

### ✅ To-Do List
- Add and manage tasks
- Mark tasks as complete
- Delete tasks
- Persistent storage

### ⚙️ Settings Menu
- **Background**: Upload and manage custom backgrounds
- **Weather**: Configure API key, location, and temperature unit
- **Display**: Time format (12h/24h) and language (German/English)
- **Widgets**: Toggle visibility of weather, to-do, and quotes
- **Shortcuts**: Add, edit, and delete shortcuts

### 💎 Glassmorphism UI
- Modern translucent design
- Backdrop blur effects
- Smooth animations and transitions
- Responsive layout for all screen sizes

## Installation

### From Source
1. Clone this repository:
   ```bash
   git clone https://github.com/animereviewer1-sketch/Chrome-Ex.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the cloned folder
5. Open a new tab to see SuperTab in action!

## Configuration

### Weather Setup
1. Get a free API key from [WeatherAPI.com](https://www.weatherapi.com/)
2. Click the settings icon (⚙️) in the top right
3. Enter your API key in the Weather section
4. Enter your location (city name or coordinates)
5. Click "Save Settings"

### Customization
- **Shortcuts**: Add/edit shortcuts in Settings > Shortcuts
- **Background**: Upload images in Settings > Background
- **Language**: Switch between German and English in Settings > Display

## File Structure

```
Chrome-Ex/
├── manifest.json        # Chrome Extension manifest (V3)
├── newtab.html          # Main HTML page
├── css/
│   └── styles.css       # Glassmorphism styling
├── js/
│   ├── main.js          # Main initialization
│   ├── storage.js       # Storage utilities
│   ├── clock.js         # Clock and date
│   ├── search.js        # Search functionality
│   ├── shortcuts.js     # Shortcuts management
│   ├── quotes.js        # Quote display
│   ├── weather.js       # Weather widget
│   ├── todo.js          # To-Do list
│   ├── background.js    # Background management
│   └── settings.js      # Settings modal
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Technologies

- **HTML5** - Semantic markup
- **CSS3** - Glassmorphism effects, flexbox, grid, animations
- **JavaScript (ES6+)** - Modular, async/await, modern syntax
- **Chrome Extension API** - Storage, geolocation
- **WeatherAPI.com** - Weather data

## Browser Support

- Google Chrome (Manifest V3)
- Microsoft Edge (Chromium-based)
- Other Chromium-based browsers

## License

MIT License - feel free to use and modify!