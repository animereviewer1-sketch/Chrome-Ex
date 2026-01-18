// Datenstrukturen
let quickAccessLinks = [];
let notes = [];
let calendarEvents = [];
let currentDate = new Date();
let calendarView = 'month'; // 'week' oder 'month'
let editingIconIndex = -1;

// Initialisierung beim Laden
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initializeEventListeners();
  renderQuickAccess();
  renderNotes();
  renderCalendar();
});

// Daten laden aus Chrome Storage
function loadData() {
  chrome.storage.local.get(['quickAccessLinks', 'notes', 'calendarEvents'], (result) => {
    quickAccessLinks = result.quickAccessLinks || getDefaultQuickAccessLinks();
    notes = result.notes || [];
    calendarEvents = result.calendarEvents || [];
    
    renderQuickAccess();
    renderNotes();
    renderCalendar();
    renderEventsList();
  });
}

// Daten speichern in Chrome Storage
function saveData() {
  chrome.storage.local.set({
    quickAccessLinks: quickAccessLinks,
    notes: notes,
    calendarEvents: calendarEvents
  });
}

// Standard Quick Access Links
function getDefaultQuickAccessLinks() {
  return [
    {
      name: 'Google',
      url: 'https://www.google.com',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHBhdGggZmlsbD0iI0ZGQzEwNyIgZD0iTTQzLjYxMSwyMC4wODNINDJWMjBIMjR2OGgxMS4zMDNjLTEuNjQ5LDQuNjU3LTYuMDgsOC04LjMwMyw4Yy02LjYyNywwLTEyLTUuMzczLTEyLTEyYzAtNi42MjcsNS4zNzMtMTIsMTItMTJjMy4wNTksMCw1Ljg0MiwxLjE1NCw3Ljk2MSwzLjAzOWw1LjY1Ny01LjY1N0MzNC4wNDYsNi4wNTMsMjkuMjY4LDQsMjQsNEMxMi45NTUsNCw0LDEyLjk1NSw0LDI0YzAsMTEuMDQ1LDguOTU1LDIwLDIwLDIwYzExLjA0NSwwLDIwLTguOTU1LDIwLTIwQzQ0LDIyLjY1OSw0My44NjIsMjEuMzUsNDMuNjExLDIwLjA4M3oiLz48cGF0aCBmaWxsPSIjRkYzRDAwIiBkPSJNNi4zMDYsMTQuNjkxbDYuNTcxLDQuODE5QzE0LjY1NSwxNS4xMDgsMTguOTYxLDEyLDI0LDEyYzMuMDU5LDAsNS44NDIsMS4xNTQsNy45NjEsMy4wMzlsNS42NTctNS42NTdDMzQuMDQ2LDYuMDUzLDI5LjI2OCw0LDI0LDRDMTYuMzE4LDQsOS42NTYsOC4zMzcsNi4zMDYsMTQuNjkxeiIvPjxwYXRoIGZpbGw9IiM0Q0FGNTAiIGQ9Ik0yNCw0NGM1LjE2NiwwLDkuODYtMS45NzcsMTMuNDA5LTUuMTkybC02LjE5LTUuMjM4QzI5LjIxMSwzNS4wOTEsMjYuNzE1LDM2LDI0LDM2Yy00LjIxLDAtNy42NDQtMy4zMjgtOS4xMy03Ljk3N2wtNi41MzcsNC44QzkuNjMsMzkuMjczLDE2LjMxOCw0NCwyNCw0NHoiLz48cGF0aCBmaWxsPSIjMTk3NkQyIiBkPSJNNDMuNjExLDIwLjA4M0g0MlYyMEgyNHY4aDExLjMwM2MtMC43OTIsMi4yMzctMi4yMzEsNC4xNjYtNC4wODcsNS41NzFjMC4wMDEtMC4wMDEsMC4wMDItMC4wMDEsMC4wMDMtMC4wMDJsNi4xOSw1LjIzOEMzNi45NzEsMzkuMjA1LDQ0LDM0LDQ0LDI0QzQ0LDIyLjY1OSw0My44NjIsMjEuMzUsNDMuNjExLDIwLjA4M3oiLz48L3N2Zz4='
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHBhdGggZmlsbD0iI0ZGMzAwMCIgZD0iTTQzLjIsMzMuOWMtMC40LDIuMS0yLjEsMy43LTQuMiw0Yy0zLjMsMC41LTguOCwxLjEtMTUsMTEuMWMtNi4xLDAtMTEuNi0wLjYtMTUtMS4xYy0yLjEtMC4zLTMuOC0xLjktNC4yLTRDNC40LDMxLjYsNCwyOC4yLDQsMjRjMCw0LjIsMC40LDcuNiwwLjgsOS45YzAuNCwyLjEsMi4xLDMuNyw0LjIsNGMzLjMsMC41LDguOCwxLjEsMTUsMS4xczExLjYtMC42LDE1LTEuMWMyLjEtMC4zLDMuOC0xLjksNC4yLTRjMC40LTIuMywwLjgtNS43LDAuOC05LjlDNDQsMjguMiw0My42LDMxLjYsNDMuMiwzMy45eiIvPjxwYXRoIGZpbGw9IiNGRkMxMDciIGQ9Ik0yMCwzMWw4LTdMMjAsMTdWMzF6Ii8+PC9zdmc+'
    },
    {
      name: 'Twitch',
      url: 'https://www.twitch.tv',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHBhdGggZmlsbD0iIzZBNENCQyIgZD0iTTExLDhoMjZ2MThsLTYsNmgtOGwtNSw1di01SDExVjh6IE0yMywyOGgzdi04aC0zVjI4eiBNMzAsMjhoM3YtOGgtM1YyOHoiLz48L3N2Zz4='
    },
    {
      name: 'GitHub',
      url: 'https://github.com',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHBhdGggZmlsbD0iIzIxMjEyMSIgZD0iTTI0LDRDMTIuOTUsNCw0LDEyLjk1LDQsMjRjMCw4LjgyLDUuNzEsMTYuMjgsMTMuNjIsMTguOTJjMSwwLjE4LDEuMzYtMC40MywxLjM2LTAuOTVjMC0wLjQ3LTAuMDItMi4wMi0wLjAzLTMuNjZjLTUuNTcsMS4yMS02Ljc0LTIuNjktNi43NC0yLjY5Yy0wLjkxLTIuMzEtMi4yMi0yLjkyLTIuMjItMi45MmMtMS44MS0xLjI0LDAuMTQtMS4yMSwwLjE0LTEuMjFjMiwwLjE0LDMuMDYsMi4wNiwzLjA2LDIuMDZjMS43OCwzLjA1LDQuNjcsMi4xNyw1LjgxLDEuNjZjMC4xOC0xLjI5LDAuNy0yLjE3LDEuMjctMi42N2MtNC40My0wLjUtOS4xMS0yLjIyLTkuMTEtOS44N2MwLTIuMTgsMC43OC00LjAsMi4wNS01LjRjLTAuMjEtMC41MS0wLjg5LTIuNTMsMC4yLTUuMjhjMCwwLDEuNjctMC41NCw1LjQ3LDIuMDRjMS41OS0wLjQ0LDMuMy0wLjY2LDUuMDEtMC42N2MxLjcsMC4wMSwzLjQxLDAuMjMsNS4wMSwwLjY3YzMuOC0yLjU4LDUuNDYtMi4wNCw1LjQ2LTIuMDRjMS4wOSwyLjc1LDAuNCw0Ljc3LDAuMiw1LjI4YzEuMjcsMS40LDIuMDQsMy4yMiwyLjA0LDUuNGMwLDcuNjctNC42OCw5LjM2LTkuMTMsOS44NmMwLjcyLDAuNjIsMS4zNiwxLjg0LDEuMzYsMy43YzAsMi42Ny0wLjAyLDQuODMtMC4wMiw1LjQ4YzAsMC41MywwLjM2LDEuMTUsMS4zOCwwLjk1QzM4LjI5LDQwLjI4LDQ0LDMyLjgyLDQ0LDI0QzQ0LDEyLjk1LDM1LjA1LDQsMjQsNHoiLz48L3N2Zz4='
    },
    {
      name: 'Local Kitchen',
      url: 'https://www.local-kitchen.de',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHBhdGggZmlsbD0iI0ZGOTgwMCIgZD0iTTI0LDRMOCwyMGgzMkwyNCw0eiBNMTIsMjJoMjR2MjBIMTJWMjJ6IE0yMCwyNmg4djEwaC04VjI2eiIvPjwvc3ZnPg=='
    },
    {
      name: 'Offene Tabs',
      url: 'chrome://newtab',
      icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHBhdGggZmlsbD0iIzQyQTVGNSIgZD0iTTQwLDEySDE4bC00LTRIOGMtMi4yLDAtNCwxLjgtNCw0djMyYzAsMi4yLDEuOCw0LDQsNGgzMmMyLjIsMCw0LTEuOCw0LTRWMTZDNDQsMTMuOCw0Mi4yLDEyLDQwLDEyeiIvPjwvc3ZnPg=='
    }
  ];
}

// Event Listeners initialisieren
function initializeEventListeners() {
  // Quick Access
  document.getElementById('addQuickAccessBtn').addEventListener('click', openIconModal);
  
  // Notizen
  document.getElementById('addNoteBtn').addEventListener('click', addNote);
  document.getElementById('searchNotes').addEventListener('input', searchNotes);
  document.getElementById('detailedNoteBtn').addEventListener('click', addDetailedNote);
  
  // Kalender
  document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
  document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
  document.getElementById('toggleView').addEventListener('click', toggleCalendarView);
  document.getElementById('addEventBtn').addEventListener('click', addEvent);
  
  // Modal
  document.querySelector('.close').addEventListener('click', closeIconModal);
  document.getElementById('saveIconBtn').addEventListener('click', saveIcon);
  document.getElementById('iconUpload').addEventListener('change', handleIconUpload);
  
  // Modal schließen bei Klick außerhalb
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('iconModal');
    if (e.target === modal) {
      closeIconModal();
    }
  });
}

// Quick Access rendern
function renderQuickAccess() {
  const grid = document.getElementById('quickAccessGrid');
  grid.innerHTML = '';
  
  quickAccessLinks.forEach((link, index) => {
    const item = document.createElement('a');
    item.className = 'quick-access-item';
    item.href = link.url;
    item.target = '_blank';
    
    const icon = document.createElement('img');
    icon.className = 'quick-access-icon';
    icon.src = link.icon;
    icon.alt = link.name;
    
    const name = document.createElement('div');
    name.className = 'quick-access-name';
    name.textContent = link.name;
    
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-edit-btn';
    editBtn.textContent = '✎';
    editBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      editIcon(index);
    };
    
    item.appendChild(icon);
    item.appendChild(name);
    item.appendChild(editBtn);
    grid.appendChild(item);
  });
}

// Icon Modal öffnen
function openIconModal(index = -1) {
  editingIconIndex = index;
  const modal = document.getElementById('iconModal');
  
  if (index >= 0) {
    // Bestehendes Icon bearbeiten
    const link = quickAccessLinks[index];
    document.getElementById('iconName').value = link.name;
    document.getElementById('iconUrl').value = link.url;
    document.getElementById('iconPreview').innerHTML = `<img src="${link.icon}" alt="Preview">`;
  } else {
    // Neues Icon
    document.getElementById('iconName').value = '';
    document.getElementById('iconUrl').value = '';
    document.getElementById('iconPreview').innerHTML = '';
  }
  
  modal.style.display = 'block';
}

function closeIconModal() {
  document.getElementById('iconModal').style.display = 'none';
}

function editIcon(index) {
  openIconModal(index);
}

// Icon Upload behandeln
function handleIconUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = document.getElementById('iconPreview');
      preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  }
}

// Icon speichern
function saveIcon() {
  const name = document.getElementById('iconName').value.trim();
  const url = document.getElementById('iconUrl').value.trim();
  const previewImg = document.getElementById('iconPreview').querySelector('img');
  
  if (!name || !url) {
    alert('Bitte Name und URL eingeben!');
    return;
  }
  
  const icon = previewImg ? previewImg.src : 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHBhdGggZmlsbD0iIzQyQTVGNSIgZD0iTTI0LDRDMTIuOTUsNCw0LDEyLjk1LDQsMjRzOC45NSwyMCwyMCwyMHMyMC04Ljk1LDIwLTIwUzM1LjA1LDQsMjQsNHoiLz48L3N2Zz4=';
  
  const newLink = { name, url, icon };
  
  if (editingIconIndex >= 0) {
    quickAccessLinks[editingIconIndex] = newLink;
  } else {
    quickAccessLinks.push(newLink);
  }
  
  saveData();
  renderQuickAccess();
  closeIconModal();
}

// Notizen hinzufügen
function addNote() {
  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();
  
  if (!title && !content) {
    alert('Bitte Titel oder Inhalt eingeben!');
    return;
  }
  
  const note = {
    id: Date.now(),
    title: title || 'Unbenannt',
    content: content,
    date: new Date().toLocaleString('de-DE')
  };
  
  notes.unshift(note);
  saveData();
  renderNotes();
  
  // Felder leeren
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteContent').value = '';
}

function addDetailedNote() {
  addNote();
}

// Notizen rendern
function renderNotes() {
  const searchQuery = document.getElementById('searchNotes').value.toLowerCase();
  const filteredNotes = searchQuery ? 
    notes.filter(note => 
      note.title.toLowerCase().includes(searchQuery) ||
      note.content.toLowerCase().includes(searchQuery)
    ) : notes;
  
  const list = document.getElementById('notesList');
  list.innerHTML = '';
  
  filteredNotes.forEach((note) => {
    const item = document.createElement('div');
    item.className = 'note-item';
    
    const title = document.createElement('h4');
    title.textContent = note.title;
    
    const content = document.createElement('p');
    content.textContent = note.content;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'note-delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.onclick = () => deleteNote(note.id);
    
    item.appendChild(title);
    item.appendChild(content);
    item.appendChild(deleteBtn);
    list.appendChild(item);
  });
}

function deleteNote(id) {
  notes = notes.filter(note => note.id !== id);
  saveData();
  renderNotes();
}

// Notizen suchen
function searchNotes() {
  renderNotes();
}

// Kalender rendern
function renderCalendar() {
  const view = document.getElementById('calendarView');
  const monthDisplay = document.getElementById('currentMonth');
  
  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  
  monthDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  
  if (calendarView === 'month') {
    renderMonthView(view);
  } else {
    renderWeekView(view);
  }
}

function renderMonthView(container) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  let html = '<div class="calendar-grid">';
  
  // Wochentage
  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  dayNames.forEach(day => {
    html += `<div class="calendar-day-header">${day}</div>`;
  });
  
  // Leere Tage am Anfang
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day other-month"></div>';
  }
  
  // Tage des Monats
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = date.toDateString() === today.toDateString();
    const hasEvent = calendarEvents.some(event => event.date === dateStr);
    
    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (hasEvent) classes += ' has-event';
    
    const eventIcon = hasEvent ? 
      calendarEvents.find(e => e.date === dateStr)?.icon || '•' : '';
    
    html += `<div class="${classes}">
              <div>${day}</div>
              ${eventIcon ? `<div class="event-indicator">${eventIcon}</div>` : ''}
            </div>`;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

function renderWeekView(container) {
  // Vereinfachte Wochenansicht
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  let html = '<div class="calendar-grid">';
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = date.toDateString() === today.toDateString();
    const hasEvent = calendarEvents.some(event => event.date === dateStr);
    
    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (hasEvent) classes += ' has-event';
    
    html += `<div class="${classes}">
              <div>${dayNames[i]}</div>
              <div>${date.getDate()}</div>
            </div>`;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  renderCalendar();
}

function toggleCalendarView() {
  calendarView = calendarView === 'month' ? 'week' : 'month';
  renderCalendar();
}

// Event hinzufügen
function addEvent() {
  const title = document.getElementById('eventTitle').value.trim();
  const date = document.getElementById('eventDate').value;
  const description = document.getElementById('eventDescription').value.trim();
  const color = document.getElementById('eventColor').value;
  const icon = document.getElementById('eventIcon').value.trim();
  
  if (!title || !date) {
    alert('Bitte Titel und Datum eingeben!');
    return;
  }
  
  const event = {
    id: Date.now(),
    title,
    date,
    description,
    color,
    icon: icon || '📅'
  };
  
  calendarEvents.push(event);
  saveData();
  renderCalendar();
  renderEventsList();
  
  // Felder leeren
  document.getElementById('eventTitle').value = '';
  document.getElementById('eventDate').value = '';
  document.getElementById('eventDescription').value = '';
  document.getElementById('eventIcon').value = '';
  
  // Alarm für Event setzen
  chrome.alarms.create(`event-${event.id}`, {
    when: new Date(event.date).getTime()
  });
}

// Events Liste rendern
function renderEventsList() {
  const list = document.getElementById('eventsList');
  list.innerHTML = '';
  
  // Events nach Datum sortieren
  const sortedEvents = [...calendarEvents].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  sortedEvents.forEach((event) => {
    const item = document.createElement('div');
    item.className = 'event-item';
    item.style.borderLeftColor = event.color;
    
    const header = document.createElement('div');
    header.className = 'event-item-header';
    
    const icon = document.createElement('span');
    icon.className = 'event-icon';
    icon.textContent = event.icon;
    
    const title = document.createElement('div');
    title.className = 'event-title';
    title.textContent = event.title;
    
    const countdown = document.createElement('div');
    countdown.className = 'event-countdown';
    countdown.textContent = getCountdown(event.date);
    
    header.appendChild(icon);
    header.appendChild(title);
    header.appendChild(countdown);
    
    const dateDiv = document.createElement('div');
    dateDiv.className = 'event-date';
    dateDiv.textContent = new Date(event.date).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'event-delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.onclick = () => deleteEvent(event.id);
    
    item.appendChild(header);
    item.appendChild(dateDiv);
    
    if (event.description) {
      const desc = document.createElement('div');
      desc.className = 'event-description';
      desc.textContent = event.description;
      item.appendChild(desc);
    }
    
    item.appendChild(deleteBtn);
    list.appendChild(item);
  });
}

function deleteEvent(id) {
  calendarEvents = calendarEvents.filter(event => event.id !== id);
  chrome.alarms.clear(`event-${id}`);
  saveData();
  renderCalendar();
  renderEventsList();
}

// Countdown berechnen
function getCountdown(eventDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(eventDate);
  event.setHours(0, 0, 0, 0);
  const diffTime = event - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `vor ${Math.abs(diffDays)} Tagen`;
  } else if (diffDays === 0) {
    return 'Heute!';
  } else if (diffDays === 1) {
    return 'Morgen';
  } else {
    return `in ${diffDays} Tagen`;
  }
}
