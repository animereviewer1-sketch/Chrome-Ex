/**
 * To-Do Widget Module
 */

const Todos = {
  container: null,
  todos: [],
  saveTimeout: null,

  /**
   * Initialize todos widget
   */
  async init(container) {
    this.container = container;
    this.todos = await Storage.get('todos') || [];
    this.render();
  },

  /**
   * Render todos widget
   */
  render() {
    const pendingTodos = this.todos.filter(t => !t.completed);
    const completedTodos = this.todos.filter(t => t.completed);

    this.container.innerHTML = `
      <div class="todo-widget">
        <div class="widget-header">
          <span class="widget-title">✅ Aufgaben</span>
          <span class="todo-count">${pendingTodos.length} offen</span>
        </div>
        <div class="widget-content">
          <div class="todo-input-container">
            <input type="text" class="todo-input" placeholder="Neue Aufgabe hinzufügen..." />
          </div>
          <ul class="todo-list">
            ${pendingTodos.map(todo => this.renderTodoItem(todo)).join('')}
            ${completedTodos.map(todo => this.renderTodoItem(todo)).join('')}
          </ul>
        </div>
      </div>
    `;

    this.attachEventListeners();
  },

  /**
   * Render single todo item
   */
  renderTodoItem(todo) {
    return `
      <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-action="toggle">
          ${todo.completed ? '✓' : ''}
        </div>
        <span class="todo-text">${this.escapeHtml(todo.text)}</span>
        <button class="todo-delete" data-action="delete">×</button>
      </li>
    `;
  },

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Input for new todo
    const input = this.container.querySelector('.todo-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        this.addTodo(input.value.trim());
        input.value = '';
      }
    });

    // Todo item actions
    this.container.querySelectorAll('.todo-item').forEach(item => {
      const id = parseInt(item.dataset.id);
      
      item.querySelector('[data-action="toggle"]').addEventListener('click', () => {
        this.toggleTodo(id);
      });

      item.querySelector('[data-action="delete"]').addEventListener('click', () => {
        this.deleteTodo(id);
      });
    });
  },

  /**
   * Add new todo
   */
  async addTodo(text) {
    const newTodo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.todos.unshift(newTodo);
    await this.save();
    this.render();
    return newTodo;
  },

  /**
   * Toggle todo completion
   */
  async toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      todo.completedAt = todo.completed ? new Date().toISOString() : null;
      await this.save();
      this.render();
    }
  },

  /**
   * Delete todo
   */
  async deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    await this.save();
    this.render();
  },

  /**
   * Update todo text
   */
  async updateTodo(id, text) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.text = text;
      await this.save();
      this.render();
    }
  },

  /**
   * Clear completed todos
   */
  async clearCompleted() {
    this.todos = this.todos.filter(t => !t.completed);
    await this.save();
    this.render();
  },

  /**
   * Save todos with debouncing
   */
  async save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(async () => {
      await Storage.set('todos', this.todos);
    }, 500);
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Get all todos
   */
  getAll() {
    return [...this.todos];
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Todos;
}
