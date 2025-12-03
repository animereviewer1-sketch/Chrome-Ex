/**
 * Main initialization
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize all modules
  Clock.init();
  Search.init();
  Shortcuts.init();
  Quotes.init();
  Weather.init();
  Todo.init();
  Background.init();
  Settings.init();
  Widgets.init();
  DragDrop.init();
  EditMode.init();

  // Load language settings for modules
  const language = await Storage.get('language', 'de');
  const timeFormat = await Storage.get('timeFormat', '24');
  
  Clock.setLanguage(language);
  Clock.setTimeFormat(timeFormat);
  Quotes.setLanguage(language);

  // Load saved widget positions
  await DragDrop.loadPositions();

  // Set default weather location on first load
  const weatherLocation = await Storage.get('weatherLocation', null);
  if (!weatherLocation) {
    await Storage.set('weatherLocation', 'München, Haidhausen');
  }
});
