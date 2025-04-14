// DOM Elements
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');
const editModal = document.getElementById('edit-modal');
const editTaskInput = document.getElementById('edit-task-input');
const editPrioritySelect = document.getElementById('edit-priority');
const saveEditButton = document.getElementById('save-edit');
const cancelEditButton = document.getElementById('cancel-edit');

// State
let tasks = [];
let currentFilter = 'all';
let currentEditTaskId = null;

// Initialize the app
function init() {
  loadTasksFromLocalStorage();
  renderTasks();
  setupEventListeners();
  setupTheme();
}

// Event Listeners
function setupEventListeners() {
  // Add task
  addTaskButton.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });

  // Filter tasks
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      setFilter(button.dataset.filter);
    });
  });

  // Theme toggle
  themeToggle.addEventListener('change', toggleTheme);

  // Edit modal
  saveEditButton.addEventListener('click', saveTaskEdit);
  cancelEditButton.addEventListener('click', closeEditModal);

  // Close modal when clicking outside
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
  });
}

// Task Operations
function addTask() {
  const text = taskInput.value.trim();
  if (text === '') return;

  const newTask = {
    id: Date.now().toString(),
    text: text,
    completed: false,
    priority: prioritySelect.value,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  saveTasksToLocalStorage();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  saveTasksToLocalStorage();
  renderTasks();
}

function toggleTaskStatus(taskId) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    saveTasksToLocalStorage();
    renderTasks();
  }
}

function openEditModal(taskId) {
  const task = tasks.find(task => task.id === taskId);
  if (!task) return;

  currentEditTaskId = taskId;
  editTaskInput.value = task.text;
  editPrioritySelect.value = task.priority;
  
  editModal.classList.add('active');
  editTaskInput.focus();
}

function closeEditModal() {
  editModal.classList.remove('active');
  currentEditTaskId = null;
}

function saveTaskEdit() {
  if (!currentEditTaskId) return;
  
  const taskIndex = tasks.findIndex(task => task.id === currentEditTaskId);
  if (taskIndex !== -1) {
    const text = editTaskInput.value.trim();
    if (text === '') return;
    
    tasks[taskIndex].text = text;
    tasks[taskIndex].priority = editPrioritySelect.value;
    
    saveTasksToLocalStorage();
    renderTasks();
    closeEditModal();
  }
}

// Filtering
function setFilter(filter) {
  currentFilter = filter;
  
  // Update active filter button
  filterButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.filter === filter);
  });
  
  renderTasks();
}

function getFilteredTasks() {
  switch (currentFilter) {
    case 'completed':
      return tasks.filter(task => task.completed);
    case 'pending':
      return tasks.filter(task => !task.completed);
    case 'all':
    default:
      return tasks;
  }
}

// Rendering
function renderTasks() {
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = '';

  if (filteredTasks.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.textContent = 'No tasks found';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.padding = '20px';
    emptyMessage.style.color = '#777';
    taskList.appendChild(emptyMessage);
    return;
  }

  filteredTasks.forEach(task => {
    const taskElement = createTaskElement(task);
    taskList.appendChild(taskElement);
  });
}

function createTaskElement(task) {
  const taskItem = document.createElement('div');
  taskItem.className = `task-item priority-${task.priority}`;
  if (task.completed) taskItem.classList.add('completed');

  // Task content (checkbox + text)
  const taskContent = document.createElement('div');
  taskContent.className = 'task-content';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
  
  const textContainer = document.createElement('div');
  
  const taskText = document.createElement('div');
  taskText.className = 'task-text';
  taskText.textContent = task.text;
  
  const taskMeta = document.createElement('div');
  taskMeta.className = 'task-meta';
  
  // Format date
  const createdDate = new Date(task.createdAt);
  const formattedDate = createdDate.toLocaleString();
  
  taskMeta.textContent = `${getPriorityText(task.priority)} • ${formattedDate}`;
  
  textContainer.appendChild(taskText);
  textContainer.appendChild(taskMeta);
  
  taskContent.appendChild(checkbox);
  taskContent.appendChild(textContainer);
  
  // Task actions (edit, delete)
  const taskActions = document.createElement('div');
  taskActions.className = 'task-actions';
  
  const editButton = document.createElement('button');
  editButton.className = 'edit-btn';
  editButton.innerHTML = '<i class="fas fa-edit"></i>';
  editButton.addEventListener('click', () => openEditModal(task.id));
  
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-btn';
  deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
  deleteButton.addEventListener('click', () => deleteTask(task.id));
  
  taskActions.appendChild(editButton);
  taskActions.appendChild(deleteButton);
  
  // Assemble task item
  taskItem.appendChild(taskContent);
  taskItem.appendChild(taskActions);
  
  return taskItem;
}

function getPriorityText(priority) {
  switch (priority) {
    case 'low':
      return 'Low Priority';
    case 'medium':
      return 'Medium Priority';
    case 'high':
      return 'High Priority';
    default:
      return '';
  }
}

// LocalStorage Operations
function saveTasksToLocalStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const storedTasks = localStorage.getItem('tasks');
  tasks = storedTasks ? JSON.parse(storedTasks) : [];
}

// Theme Operations
function setupTheme() {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  document.body.classList.toggle('dark-mode', isDarkMode);
  themeToggle.checked = isDarkMode;
}

function toggleTheme() {
  const isDarkMode = themeToggle.checked;
  document.body.classList.toggle('dark-mode', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);