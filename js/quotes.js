/**
 * Quotes functionality
 */
const Quotes = {
  textElement: null,
  authorElement: null,
  language: 'de',

  quotes: {
    de: [
      { text: "Die einzige Konstante im Leben ist die Veränderung.", author: "Heraklit" },
      { text: "Es ist nicht genug zu wissen, man muss auch anwenden. Es ist nicht genug zu wollen, man muss auch tun.", author: "Johann Wolfgang von Goethe" },
      { text: "Phantasie ist wichtiger als Wissen, denn Wissen ist begrenzt.", author: "Albert Einstein" },
      { text: "Der beste Weg, die Zukunft vorherzusagen, ist, sie zu erfinden.", author: "Alan Kay" },
      { text: "Erfolg besteht darin, dass man genau die Fähigkeiten hat, die im Moment gefragt sind.", author: "Henry Ford" },
      { text: "Das Leben ist wie Fahrrad fahren. Um die Balance zu halten, musst du in Bewegung bleiben.", author: "Albert Einstein" },
      { text: "Der einzige Weg, großartige Arbeit zu leisten, ist zu lieben, was man tut.", author: "Steve Jobs" },
      { text: "Sei du selbst die Veränderung, die du dir wünschst für diese Welt.", author: "Mahatma Gandhi" },
      { text: "Es ist nicht die stärkste Spezies, die überlebt, noch die intelligenteste, sondern die, die am besten auf Veränderungen reagiert.", author: "Charles Darwin" },
      { text: "Bildung ist die mächtigste Waffe, die du verwenden kannst, um die Welt zu verändern.", author: "Nelson Mandela" }
    ],
    en: [
      { text: "The only constant in life is change.", author: "Heraclitus" },
      { text: "It is not enough to know, one must also apply. It is not enough to want, one must also do.", author: "Johann Wolfgang von Goethe" },
      { text: "Imagination is more important than knowledge, for knowledge is limited.", author: "Albert Einstein" },
      { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
      { text: "Success consists of having exactly the skills that are needed at the moment.", author: "Henry Ford" },
      { text: "Life is like riding a bicycle. To keep your balance, you must keep moving.", author: "Albert Einstein" },
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
      { text: "It is not the strongest species that survives, nor the most intelligent, but the one most responsive to change.", author: "Charles Darwin" },
      { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" }
    ]
  },

  init() {
    this.textElement = document.getElementById('quote-text');
    this.authorElement = document.getElementById('quote-author');
    this.displayRandomQuote();
  },

  setLanguage(lang) {
    this.language = lang;
    this.displayRandomQuote();
  },

  displayRandomQuote() {
    const quoteList = this.quotes[this.language] || this.quotes['en'];
    const randomIndex = Math.floor(Math.random() * quoteList.length);
    const quote = quoteList[randomIndex];
    
    this.textElement.textContent = `"${quote.text}"`;
    this.authorElement.textContent = `— ${quote.author}`;
  }
};
