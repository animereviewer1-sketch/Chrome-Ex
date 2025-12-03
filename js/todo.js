/**
 * To-Do List functionality
 */
const Todo = {
  containerElement: null,
  listElement: null,
  inputElement: null,
  inputContainerElement: null,
  addBtnElement: null,
  saveBtnElement: null,
  todos: [],

  init() {
    this.containerElement = document.getElementById('todo-widget');
    this.listElement = document.getElementById('todo-list');
    this.inputElement = document.getElementById('todo-input');
    this.inputContainerElement = document.getElementById('todo-input-container');
    this.addBtnElement = document.getElementById('add-todo-btn');
    this.saveBtnElement = document.getElementById('save-todo-btn');

    this.bindEvents();
    this.loadTodos();
  },

  bindEvents() {
    // Toggle input visibility
    this.addBtnElement.addEventListener('click', () => {
      this.inputContainerElement.classList.toggle('hidden');
      if (!this.inputContainerElement.classList.contains('hidden')) {
        this.inputElement.focus();
      }
    });

    // Add todo on Enter key
    this.inputElement.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addTodo();
      }
    });

    // Add todo on button click
    this.saveBtnElement.addEventListener('click', () => {
      this.addTodo();
    });
  },

  async loadTodos() {
    this.todos = await Storage.get('todos', []);
    this.render();
  },

  render() {
    this.listElement.innerHTML = '';
    
    if (this.todos.length === 0) {
      const emptyMessage = document.createElement('li');
      emptyMessage.className = 'todo-item';
      emptyMessage.innerHTML = '<span class="todo-text" style="color: var(--text-muted); font-style: italic;">No tasks yet</span>';
      this.listElement.appendChild(emptyMessage);
      return;
    }
    
    this.todos.forEach((todo, index) => {
      const item = this.createTodoElement(todo, index);
      this.listElement.appendChild(item);
    });
  },

  createTodoElement(todo, index) {
    const li = document.createElement('li');
    li.className = `todo-item${todo.completed ? ' completed' : ''}`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => this.toggleTodo(index));
    
    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'todo-delete';
    deleteBtn.innerHTML = '×';
    deleteBtn.addEventListener('click', () => this.deleteTodo(index));
    
    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteBtn);
    
    return li;
  },

  async addTodo() {
    const text = this.inputElement.value.trim();
    if (text) {
      this.todos.push({ text, completed: false });
      await Storage.set('todos', this.todos);
      this.inputElement.value = '';
      this.inputContainerElement.classList.add('hidden');
      this.render();
    }
  },

  async toggleTodo(index) {
    if (index >= 0 && index < this.todos.length) {
      this.todos[index].completed = !this.todos[index].completed;
      await Storage.set('todos', this.todos);
      this.render();
    }
  },

  async deleteTodo(index) {
    if (index >= 0 && index < this.todos.length) {
      this.todos.splice(index, 1);
      await Storage.set('todos', this.todos);
      this.render();
    }
  },

  async clearCompleted() {
    this.todos = this.todos.filter(todo => !todo.completed);
    await Storage.set('todos', this.todos);
    this.render();
  },

  show() {
    this.containerElement.classList.remove('hidden');
  },

  hide() {
    this.containerElement.classList.add('hidden');
  }
};
