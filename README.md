# Chrome Extension - Schnellzugriff & Notizen

Eine vollständige Chrome Extension mit anpassbaren Schnellzugriff-Icons, Notizen-System mit Suche und erweiterten Kalender-Funktionen.

## 🎯 Features

### 1. Schnellzugriff-Icons (Quick Access)
- ✅ Anpassbare Icons (Name, URL, Icon-Upload)
- ✅ Vollständiger Klickbereich - Das gesamte Icon + Text ist anklickbar
- ✅ Unterstützung für transparente Hintergründe
- ✅ Standard-Icons: Google, YouTube, Twitch, GitHub, Local Kitchen, Offene Tabs
- ✅ Bearbeitungsfunktion für alle Icons

### 2. Notizen-System (Schnelle Notizen)
- ✅ Textfeld zum Eingeben neuer Notizen (Titel + Inhalt)
- ✅ "+ Neue Notiz" Button
- ✅ **Suchfeld** für Live-Filterung
  - Suche nach Wörtern im Titel ODER Text
  - Echtzeit-Filterung während der Eingabe
- ✅ Notizen-Liste mit Anzeige
- ✅ "+ Ausführliche Notiz" Button
- ✅ Design mit blauem Hintergrund

### 3. Kalender mit erweiterten Funktionen
- ✅ Wochen- und Monatsansicht
- ✅ **Events mit Farben & Icons**: Jedes Event kann eine individuelle Farbe und ein Icon erhalten
- ✅ **Popup-Benachrichtigungen**: 
  - Wenn ein Termin-Datum erreicht wird, erscheint eine Popup-Benachrichtigung
  - Das Popup bleibt sichtbar bis der User es wegklickt ODER der Tag vorbei ist
  - Popup zeigt Event-Titel, Beschreibung und Icon an
- ✅ **Countdown zu Events**: 
  - Zeigt z.B. "in 19 Tagen" oder "Morgen"
  - Countdown wird automatisch berechnet

## 🛠️ Installation

### Methode 1: Lokale Installation (Entwicklermodus)

1. **Repository klonen oder herunterladen**
   ```bash
   git clone https://github.com/animereviewer1-sketch/Chrome-Ex.git
   cd Chrome-Ex
   ```

2. **Chrome öffnen und zu den Extensions navigieren**
   - Öffne Chrome Browser
   - Gehe zu `chrome://extensions/`
   - Oder: Menü (⋮) → Weitere Tools → Erweiterungen

3. **Entwicklermodus aktivieren**
   - Schalte den "Entwicklermodus" oben rechts ein

4. **Extension laden**
   - Klicke auf "Entpackte Erweiterung laden"
   - Wähle den Ordner mit den Extension-Dateien aus
   - Die Extension sollte nun installiert sein!

5. **Extension verwenden**
   - Klicke auf das Extension-Icon in der Chrome-Toolbar
   - Oder: Pinne die Extension für schnellen Zugriff an

## 📁 Projektstruktur

```
Chrome-Ex/
├── manifest.json           # Chrome Extension Manifest V3
├── popup.html             # Haupt-UI der Extension
├── popup.js               # Logik für Popup und Features
├── styles.css             # Styling und Design
├── background.js          # Service Worker für Benachrichtigungen
├── icons/                 # Extension Icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── assets/                # Assets wie Hintergrundbilder
│   └── background.jpg
└── README.md             # Diese Datei
```

## 💾 Datenspeicherung

Die Extension verwendet `chrome.storage.local` für persistente Datenspeicherung:
- **quickAccessLinks**: Schnellzugriff-Icons
- **notes**: Gespeicherte Notizen
- **calendarEvents**: Kalender-Events mit allen Details
- **shownNotifications**: Tracking für angezeigte Benachrichtigungen

Alle Daten bleiben nach Browser-Neustart erhalten und werden automatisch gespeichert.

## 🎨 Design

- Modernes, clean UI mit Schatten und abgerundeten Ecken
- Blaue Farbpalette (#4A90E2, #357ABD)
- Hintergrundbild im Anime-Stil
- Responsive Design für verschiedene Popup-Größen
- Smooth Hover-Effekte und Transitions

## 📝 Verwendung

### Schnellzugriff-Icons
1. Klicke auf "+ Neues Icon hinzufügen"
2. Gib Name und URL ein
3. Optional: Lade ein eigenes Icon hoch
4. Klicke auf "Speichern"
5. Bestehende Icons: Hover über Icon → Klick auf Bearbeiten-Button (✎)

### Notizen
1. Gib einen Titel und Inhalt ein
2. Klicke "+ Neue Notiz"
3. Suche nach Notizen über das Suchfeld
4. Löschen: Klick auf das X in der Notiz

### Kalender & Events
1. Fülle Event-Formular aus (Titel, Datum, Beschreibung)
2. Wähle eine Farbe und ein Icon (Emoji)
3. Klicke "+ Event hinzufügen"
4. Der Countdown wird automatisch berechnet
5. Am Event-Tag erscheint eine Benachrichtigung

## 🔔 Benachrichtigungen

Die Extension nutzt Chrome's Notification API:
- Benachrichtigungen erscheinen automatisch am Event-Tag
- `requireInteraction: true` → Benachrichtigung bleibt bis zum Wegklicken
- Automatisches Löschen alter Benachrichtigungen um Mitternacht
- Täglich werden Events geprüft

## 🧪 Testing

- ✅ Schnellzugriff-Icons sind vollständig klickbar (Icon + Text)
- ✅ Notizen-Suche funktioniert in Titel und Text
- ✅ Events haben Farben & Icons
- ✅ Popup-Benachrichtigungen erscheinen am Event-Tag
- ✅ Countdown wird korrekt berechnet
- ✅ Daten bleiben nach Browser-Neustart erhalten

## 🔧 Technologien

- **Manifest V3**: Neueste Chrome Extension API
- **JavaScript (ES6+)**: Moderne JavaScript-Features
- **Chrome Storage API**: Persistente Datenspeicherung
- **Chrome Alarms API**: Zeitgesteuerte Events
- **Chrome Notifications API**: System-Benachrichtigungen
- **CSS3**: Moderne Styling-Features

## 📄 Lizenz

Dieses Projekt ist Open Source und frei verfügbar.

## 🤝 Mitwirken

Beiträge sind willkommen! Bitte erstelle einen Pull Request oder öffne ein Issue für Verbesserungsvorschläge.

## 📞 Support

Bei Fragen oder Problemen erstelle bitte ein Issue im GitHub Repository.