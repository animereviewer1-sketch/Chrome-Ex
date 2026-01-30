# Chrome-Ex - Custom New Tab Extension

Eine vollständig anpassbare New Tab Seite für Chrome mit Widgets, Themes und vielen Features.

## 🌟 Features

### Kritische Fixes
1. **Icons automatisch von URL laden** - Favicons werden automatisch via Google Favicon API geladen
2. **Edit-Modus über Einstellungen** - Saubere Startseite, Bearbeitung nur nach Aktivierung
3. **Schnellzugriff Grid-Layout** - Icons nebeneinander mit Namen darunter
4. **Modal schließt nur bei X oder Speichern** - Kein versehentliches Schließen
5. **Keine Widget-Titel** - Clean Design ohne störende Überschriften
6. **Custom Hintergrund funktional** - Eigene Bilder als Hintergrund
7. **Tabs & Lesezeichen als Shortcut** - Schnellzugriff auf offene Tabs und Bookmarks

### Neue Features
8. **8 Farbschemas** - Dark Mode, Cyberpunk, Pastel, Minimal, Ocean, Forest, Sunset, Neon
9. **Animierte Hintergründe** - Partikel, Gradient-Animationen
10. **Google Fonts** - 10 verschiedene Schriftarten
11. **Widget-Effekte kombinierbar** - Glow, Neon, 3D (kombinierbar)
12. **Notizen mit schönem Design** - Dunkles, modernes Note-Editor Design
13. **Widget-Opazität** - Transparenz pro Widget einstellbar
14. **Auto-Hide Widgets** - Widgets erscheinen nur bei Hover
15. **Widget-Bereiche fixiert** - Oben, Mitte oder Unten fixieren
16. **Multi-Page Support** - Mehrere Seiten mit Strg+1-9 Shortcuts
17. **Quick Actions (Strg+K)** - Schnellzugriff auf alle Aktionen
18. **Passwort-Generator** - Sichere Passwörter mit Stärke-Anzeige
19. **Offline-Modus** - Service Worker für Offline-Nutzung

## 📦 Installation

1. Chrome öffnen und `chrome://extensions/` aufrufen
2. "Entwicklermodus" aktivieren (oben rechts)
3. "Entpackte Erweiterung laden" klicken
4. Den Ordner mit der Extension auswählen

## 🎮 Tastenkürzel

- **Strg+K** - Quick Actions öffnen
- **Strg+1-9** - Zwischen Seiten wechseln
- **Escape** - Modals schließen

## 📁 Projektstruktur

```
Chrome-Ex/
├── manifest.json       # Chrome Extension Manifest V3
├── newtab.html         # Haupt-HTML
├── css/
│   └── newtab.css      # Alle Styles inkl. 8 Themes
├── js/
│   ├── newtab.js       # Haupt-JavaScript
│   └── service-worker.js # Offline-Modus
├── lib/
│   └── particles.min.js # Partikel-Animation
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── default.png
└── pages/
    ├── tabs.html       # Offene Tabs Seite
    └── bookmarks.html  # Lesezeichen Seite
```

## 🎨 Verfügbare Themes

1. **Dark Mode** (Standard) - Dunkles Lila/Blau
2. **Cyberpunk** - Neon Pink/Cyan
3. **Pastel** - Sanfte Pastellfarben
4. **Minimal** - Schwarz/Weiß
5. **Ocean** - Blau/Türkis
6. **Forest** - Grün/Braun
7. **Sunset** - Orange/Pink/Lila
8. **Neon** - Helle Neon-Farben

## 📝 Widget-Typen

- **Uhr** - Zeit und Datum
- **Schnellzugriff** - Links mit Icons
- **Notizen** - Persönliche Notizen
- **Wetter** - Wetteranzeige (Demo)
- **Passwort-Generator** - Sichere Passwörter generieren

## 🔧 Einstellungen

Zugang über das Zahnrad-Symbol (⚙️) unten rechts:

- Edit-Modus aktivieren/deaktivieren
- Theme auswählen
- Schriftart ändern
- Hintergrund anpassen
- Seiten verwalten
- Import/Export der Einstellungen

## 📜 Lizenz

MIT License