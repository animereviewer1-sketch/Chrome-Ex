# SuperStart - Chrome Extension

🚀 Eine moderne, anpassbare New Tab Seite für Chrome - ähnlich wie [SuperStart New Tab Page](https://chromewebstore.google.com/detail/superstart-new-tab-page/eajimemccdpladcgbfeideelblbkicl).

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Chrome](https://img.shields.io/badge/Chrome-Manifest%20V3-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📸 Screenshots

<!-- Screenshots werden hier eingefügt / Screenshots will be added here -->
*Screenshots coming soon...*

## ✨ Features

### 🎨 Anpassbares Design
- **Hell/Dunkel Modus** - Automatische oder manuelle Theme-Auswahl
- **7 vordefinierte Farbverläufe** - Sunset, Ocean, Forest, Purple Dream, Fire, Midnight, Aurora
- **Eigene Hintergrundbilder** - Fügen Sie Ihre eigenen Bilder via URL ein

### ⏰ Uhr & Datum
- **Große, gut lesbare Uhr** - Immer im Blickfeld
- **Aktuelles Datum** - Mit deutschem Datumsformat
- **12h/24h Format** - Wählen Sie Ihr bevorzugtes Zeitformat

### 🔍 Suchleiste
- **Zentrale Suchleiste** - Schneller Zugriff auf Web-Suchen
- **Mehrere Suchmaschinen** - Google, DuckDuckGo, Bing
- **Tastatur-Shortcuts** - Drücken Sie `/` für schnellen Fokus

### 📚 Schnellzugriff
- **Grid-Layout** - Übersichtliche Darstellung Ihrer Favoriten
- **Favicons** - Automatisches Laden von Website-Icons
- **Hinzufügen/Bearbeiten/Löschen** - Volle Kontrolle über Ihre Links
- **Standard-Lesezeichen** - Google, YouTube, GitHub, Gmail, Twitter

### 💬 Motivationszitate
- **10 inspirierende Zitate** - Täglich neue Motivation
- **Deutsche Zitate** - Von bekannten Persönlichkeiten

### ⚙️ Einstellungsseite
- **Theme-Auswahl** - Hell/Dunkel Modus
- **Hintergrund-Einstellungen** - Gradienten oder eigene Bilder
- **Widget-Steuerung** - Ein-/Ausblenden von Elementen
- **Import/Export** - Sichern und Wiederherstellen Ihrer Einstellungen

## 🛠️ Installation

### Developer Mode (Empfohlen für Entwicklung)

1. **Repository klonen oder herunterladen**
   ```bash
   git clone https://github.com/animereviewer1-sketch/Chrome-Ex.git
   ```

2. **Chrome Extensions-Seite öffnen**
   - Öffnen Sie Chrome
   - Navigieren Sie zu `chrome://extensions/`

3. **Entwicklermodus aktivieren**
   - Klicken Sie auf den Toggle "Entwicklermodus" oben rechts

4. **Extension laden**
   - Klicken Sie auf "Entpackte Erweiterung laden"
   - Wählen Sie den Ordner `Chrome-Ex` aus

5. **Fertig!**
   - Öffnen Sie einen neuen Tab, um SuperStart zu sehen

## 📁 Dateistruktur

```
Chrome-Ex/
├── manifest.json          # Chrome Extension Manifest V3
├── README.md              # Diese Dokumentation
├── icons/
│   ├── icon16.png         # 16x16 Icon
│   ├── icon48.png         # 48x48 Icon
│   └── icon128.png        # 128x128 Icon
├── css/
│   ├── newtab.css         # Styles für New Tab Seite
│   └── settings.css       # Styles für Einstellungsseite
├── js/
│   ├── newtab.js          # Logik für New Tab Seite
│   ├── settings.js        # Logik für Einstellungsseite
│   └── storage.js         # Chrome Storage API Wrapper
├── newtab.html            # New Tab Seite
└── settings.html          # Einstellungsseite
```

## 🎨 Verfügbare Gradienten

| Name | Beschreibung | Farben |
|------|--------------|--------|
| **Sunset** | Warme Abenddämmerung | Orange → Rosa → Rot |
| **Ocean** | Tiefes Meer | Blau → Lila → Cyan |
| **Forest** | Frischer Wald | Grün → Türkis → Smaragd |
| **Purple Dream** | Traumhaftes Lila | Lila → Pink → Violett |
| **Fire** | Loderndes Feuer | Rot → Orange → Gelb |
| **Midnight** | Mitternacht | Dunkelblau → Indigo → Schwarz |
| **Aurora** | Nordlichter | Cyan → Lila → Pink → Orange → Gelb |

## ⌨️ Tastenkürzel

| Taste | Aktion |
|-------|--------|
| `/` | Suchleiste fokussieren |
| `Escape` | Modal schließen |
| `Enter` | Suche ausführen |

## 💾 Datenspeicherung

- **`chrome.storage.sync`** - Einstellungen (synchronisiert über Geräte)
- **`chrome.storage.local`** - Lesezeichen (lokale Speicherung)
- **localStorage Fallback** - Für Entwicklung ohne Chrome APIs

## 🔧 Technologie-Stack

- **Manifest V3** - Neuester Chrome Extension Standard
- **Vanilla JavaScript** - Keine Framework-Abhängigkeiten
- **Modern CSS** - CSS Grid, Flexbox, CSS Custom Properties
- **Chrome Storage API** - Persistente Datenspeicherung
- **Google Favicon API** - Automatisches Laden von Favicons

## 🌐 Unterstützte Browser

- Chrome (Version 88+)
- Chromium-basierte Browser (Edge, Brave, Opera)

## 📝 Verwendung

### Lesezeichen hinzufügen
1. Klicken Sie auf das `+` Symbol im Schnellzugriff-Bereich
2. Geben Sie Name und URL ein
3. Klicken Sie auf "Speichern"

### Lesezeichen bearbeiten
1. Fahren Sie mit der Maus über ein Lesezeichen
2. Klicken Sie auf das Stift-Symbol
3. Bearbeiten Sie die Daten und speichern Sie

### Einstellungen ändern
1. Klicken Sie auf das Zahnrad-Symbol unten rechts
2. Passen Sie die Einstellungen nach Wunsch an
3. Änderungen werden automatisch gespeichert

### Einstellungen exportieren/importieren
1. Öffnen Sie die Einstellungsseite
2. Klicken Sie auf "Exportieren" zum Sichern
3. Klicken Sie auf "Importieren" zum Wiederherstellen

## 🤝 Beitragen

Beiträge sind willkommen! Bitte erstellen Sie einen Issue oder Pull Request.

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Pushen Sie den Branch (`git push origin feature/AmazingFeature`)
5. Öffnen Sie einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die [LICENSE](LICENSE) Datei für Details.

```
MIT License

Copyright (c) 2024 SuperStart Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👥 Autoren

- **SuperStart Team** - *Initiale Entwicklung*

## 🙏 Danksagungen

- Inspiriert von [SuperStart New Tab Page](https://chromewebstore.google.com/detail/superstart-new-tab-page/eajimemccdpladcgbfeideelblbkicl)
- Icons erstellt mit Python/PNG
- Favicons bereitgestellt von Google Favicon API

---

⭐ Wenn Ihnen dieses Projekt gefällt, geben Sie ihm einen Stern auf GitHub!