/**
 * Quotes Widget Module
 */

const Quotes = {
  container: null,
  quotes: [
    { text: "Das Leben ist das, was passiert, während du eifrig dabei bist, andere Pläne zu machen.", author: "John Lennon" },
    { text: "Der einzige Weg, großartige Arbeit zu leisten, ist zu lieben, was man tut.", author: "Steve Jobs" },
    { text: "In der Mitte von Schwierigkeiten liegen die Möglichkeiten.", author: "Albert Einstein" },
    { text: "Es ist nicht die stärkste Spezies, die überlebt, auch nicht die intelligenteste, sondern die, die am besten auf Veränderungen reagiert.", author: "Charles Darwin" },
    { text: "Erfolg besteht darin, von Misserfolg zu Misserfolg zu gehen, ohne die Begeisterung zu verlieren.", author: "Winston Churchill" },
    { text: "Die Zukunft gehört denen, die an die Schönheit ihrer Träume glauben.", author: "Eleanor Roosevelt" },
    { text: "Der beste Weg, die Zukunft vorherzusagen, ist, sie zu erfinden.", author: "Alan Kay" },
    { text: "Sei die Veränderung, die du in der Welt sehen möchtest.", author: "Mahatma Gandhi" },
    { text: "Es ist besser, ein Original zu sein als eine Kopie.", author: "Unbekannt" },
    { text: "Die einzigen Grenzen sind die, die du dir selbst setzt.", author: "Unbekannt" },
    { text: "Jeder Tag ist eine neue Chance, das zu tun, was du möchtest.", author: "Unbekannt" },
    { text: "Mut ist nicht die Abwesenheit von Angst, sondern der Triumph darüber.", author: "Nelson Mandela" },
    { text: "Das Geheimnis des Erfolges ist, den Standpunkt des Anderen zu verstehen.", author: "Henry Ford" },
    { text: "Phantasie ist wichtiger als Wissen.", author: "Albert Einstein" },
    { text: "Was immer du tust, tu es mit Leidenschaft.", author: "Unbekannt" },
    { text: "Die beste Zeit, einen Baum zu pflanzen, war vor 20 Jahren. Die zweitbeste Zeit ist jetzt.", author: "Chinesisches Sprichwort" },
    { text: "Glaube, dass du es kannst, und du hast schon die Hälfte geschafft.", author: "Theodore Roosevelt" },
    { text: "Das Leben schrumpft oder dehnt sich im Verhältnis zum Mut des Einzelnen.", author: "Anaïs Nin" },
    { text: "Wer aufhört, besser zu werden, hat aufgehört, gut zu sein.", author: "Philip Rosenthal" },
    { text: "Es sind nicht die Jahre in deinem Leben, die zählen, sondern das Leben in deinen Jahren.", author: "Abraham Lincoln" }
  ],
  currentQuote: null,

  /**
   * Initialize quotes widget
   */
  init(container) {
    this.container = container;
    this.selectRandomQuote();
    this.render();
  },

  /**
   * Select a random quote
   */
  selectRandomQuote() {
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    this.currentQuote = this.quotes[randomIndex];
  },

  /**
   * Render quote widget
   */
  render() {
    this.container.innerHTML = `
      <div class="quote-widget">
        <div class="quote-text">"${this.escapeHtml(this.currentQuote.text)}"</div>
        <div class="quote-author">— ${this.escapeHtml(this.currentQuote.author)}</div>
      </div>
    `;
  },

  /**
   * Get new quote
   */
  newQuote() {
    this.selectRandomQuote();
    this.render();
  },

  /**
   * Add custom quote
   */
  addQuote(text, author = 'Unbekannt') {
    this.quotes.push({ text, author });
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Quotes;
}
