# Custom New Tab Chrome Extension

Eine umfangreiche und vollständig anpassbare Chrome Extension für die neue Tab-Seite mit Widgets, Themes und vielen Funktionen.

## ✨ Features

### 🎨 Themes & Design
- **8 vordefinierte Farbschemas**: Cyberpunk, Pastel, Minimal, Ocean, Forest, Sunset, Neon, Dark Mode
- **10 Schriftarten** zur Auswahl (Roboto, Poppins, Inter, Montserrat, etc.)
- **Blur-Intensität Slider** für Glasmorphism-Effekte
- **Animierte Hintergründe** mit CSS-Animationen
- **Custom Backgrounds** - Eigene Bilder hochladen

### 📊 Widgets
- ⏰ **Uhr** - Zeit, Datum und Begrüßung
- 🌤️ **Wetter** - Aktuelles Wetter (Standard: München Haidhausen)
- 🔍 **Suche** - Google Suche
- 🔗 **Schnellzugriffe** - Anpassbare Shortcuts
- 💭 **Zitat** - Inspirierende Zitate
- ✅ **Aufgaben** - To-Do Liste
- 📝 **Notizen** - Schnelle Notizen mit Auto-Save
- ⏲️ **Countdown** - Countdown zu Events

### ⚙️ Widget-Anpassung
- **Drag & Drop** Positionierung
- **Größen-Presets**: Klein, Mittel, Groß
- **Snap-to-Grid** im Edit-Modus
- **Sichtbares Raster** (8x8 bis 24x24)

### 🚀 Erweiterte Funktionen
- **Quick Actions** (Strg+K) - Schnelle Aktionen
- **Tab-Suche** - Offene Tabs durchsuchen
- **Lesezeichen-Suche** - Browser-Bookmarks durchsuchen
- **Passwort-Generator** - Sichere Passwörter generieren
- **Multi-Page Support** - Mehrere Layouts erstellen
- **Export/Import** - Einstellungen sichern und wiederherstellen
- **Offline-Modus** - Funktioniert ohne Internet

## 🛠️ Installation

### Entwicklungsmodus
1. Repository klonen:
   ```bash
   git clone https://github.com/animereviewer1-sketch/Chrome-Ex.git
   ```
2. Chrome öffnen und `chrome://extensions` aufrufen
3. "Entwicklermodus" aktivieren
4. "Entpackte Erweiterung laden" klicken
5. Den Ordner `Chrome-Ex` auswählen

### Aus dem Chrome Web Store
*(Noch nicht verfügbar)*

## 📁 Dateistruktur

```
Chrome-Ex/
├── manifest.json          # Chrome Extension Manifest V3
├── newtab.html           # Neue Tab Seite
├── settings.html         # Einstellungsseite
├── css/
│   ├── newtab.css        # Hauptstyles
│   ├── settings.css      # Einstellungsseite Styles
│   ├── themes.css        # Theme-Definitionen
│   ├── animations.css    # Animationen
│   └── grid.css          # Grid-System
├── js/
│   ├── storage.js        # Chrome Storage API
│   ├── newtab.js         # Hauptlogik
│   ├── settings.js       # Einstellungslogik
│   ├── themes.js         # Theme-System
│   ├── clock.js          # Uhr-Widget
│   ├── weather.js        # Wetter-Widget
│   ├── shortcuts.js      # Schnellzugriffe
│   ├── quotes.js         # Zitate
│   ├── todos.js          # Aufgaben
│   ├── notes.js          # Notizen
│   ├── countdown.js      # Countdown
│   ├── edit-mode.js      # Edit-Modus
│   ├── drag-drop.js      # Drag & Drop
│   ├── quick-actions.js  # Quick Actions (Strg+K)
│   ├── tabs-search.js    # Tab-Suche
│   ├── bookmarks.js      # Lesezeichen
│   ├── password-gen.js   # Passwort-Generator
│   └── offline.js        # Offline-Modus
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## ⌨️ Tastenkombinationen

| Tastenkombination | Aktion |
|-------------------|--------|
| `Strg + K` | Quick Actions öffnen |
| `Strg + 1-9` | Zwischen Seiten wechseln |
| `Esc` | Modal schließen |

## 🔐 Berechtigungen

- `storage` - Einstellungen speichern
- `tabs` - Tab-Suche
- `bookmarks` - Lesezeichen durchsuchen
- `alarms` - Hintergrund-Updates

## 📝 Wetter API

Für Live-Wetterdaten wird ein kostenloser API-Key von [WeatherAPI.com](https://www.weatherapi.com) benötigt. Ohne API-Key werden Mock-Daten angezeigt.

## 🎯 Standard-Konfiguration

Bei der ersten Installation:
- **Theme**: Minimal
- **Schriftart**: Roboto
- **Blur**: 50%
- **Widgets**: Uhr, Wetter, Suche, Schnellzugriffe, Zitat
- **Wetter-Standort**: München Haidhausen

## 📄 Lizenz

MIT License

## 🤝 Beitragen

Pull Requests sind willkommen! Für größere Änderungen bitte zuerst ein Issue erstellen.