// dashboard.js — Versão final pronta (usa /usuarios/{uid}/tasks/{taskId})
console.log("Dashboard.js carregado");

document.addEventListener('DOMContentLoaded', () => {
  // cria #toast se não existir (para evitar erro se HTML não tiver)
  if (!document.getElementById('toast')) {
    const toastDiv = document.createElement('div');
    toastDiv.id = 'toast';
    toastDiv.className = 'toast';
    document.body.appendChild(toastDiv);
  }

  // guarda user atual (setado no onAuthStateChanged)
  window.currentUser = null;

  // espera autenticação
  auth.onAuthStateChanged(user => {
    if (!user) {
      // não autenticado -> login
      window.location.href = 'login.html';
      return;
    }

    window.currentUser = user;
    // carregar dados do usuário + listeners
    loadUserName();
    startRealtimeListeners();
  });

  // proteger acesso a elementos (se não existirem, não quebrar)
  attachFormHandlers();
});

/* -------------------------
   Utilitários / Helpers
   ------------------------- */
function ensureUser() {
  if (!window.currentUser) throw new Error('Usuário não autenticado');
  return window.currentUser.uid;
}

function safeGet(id) {
  return document.getElementById(id);
}

function showToast(message, isError = false) {
  const toast = safeGet('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  if (isError) toast.classList.add('error');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.remove('error');
  }, 3000);
}

function formatDate(dateStr) {
  if (!dateStr) return 'Sem data';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR');
}

/* -------------------------
   Carregar nome do usuário
   ------------------------- */
function loadUserName() {
  const uid = ensureUser();
  db.ref(`usuarios/${uid}`).once('value')
    .then(snap => {
      const data = snap.val() || {};
      const name = data.firstname || data.name || 'Usuário';
      const el = safeGet('userName');
      if (el) el.textContent = name;
    })
    .catch(err => console.error('Erro loadUserName:', err));
}

/* -------------------------
   Listeners Realtime
   ------------------------- */
let tasks = {};      // { taskId: taskObj }
let events = {};     // { date: title } or { eventId: eventObj }
let books = {};      // { bookId: bookObj }
let shopping = {};   // { itemId: itemObj }

function startRealtimeListeners() {
  const uid = ensureUser();

  // tasks por usuário
  db.ref(`usuarios/${uid}/tasks`).on('value', snap => {
    tasks = snap.val() || {};
    renderTaskList();
    renderCalendar();
  });

  // events por usuário (para calendário)
  db.ref(`usuarios/${uid}/events`).on('value', snap => {
    events = snap.val() || {};
    renderCalendar();
  });

  // shopping
  db.ref(`usuarios/${uid}/shopping`).on('value', snap => {
    shopping = snap.val() || {};
    renderShoppingList();
  });

  // books
  db.ref(`usuarios/${uid}/books`).on('value', snap => {
    books = snap.val() || {};
    renderBooksList();
  });
}

/* -------------------------
   RENDER — TAREFAS
   ------------------------- */
function renderTaskList() {
  const list = safeGet('taskList');
  if (!list) return;

  list.innerHTML = '';
  const entries = Object.entries(tasks);

  if (entries.length === 0) {
    list.innerHTML = `<div class="empty-state"><p>Nenhuma tarefa ainda. Crie uma nova!</p></div>`;
    return;
  }

  entries.forEach(([id, task]) => {
    const li = document.createElement('li');
    const classes = ['task-item'];
    if (task.completed) classes.push('completed');
    if (task.priority === 'high') classes.push('priority-high');
    if (task.priority === 'low') classes.push('priority-low');
    // sinalizar amanhã
    if (task.date && isTomorrow(task.date) && !task.completed) classes.push('tomorrow');

    li.className = classes.join(' ');
    li.innerHTML = `
      <div>
        <div class="task-header">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <span class="priority-badge ${task.priority === 'high' ? 'high' : 'low'}">
            ${task.priority === 'high' ? '🔴 Alta' : '🟡 Baixa'}
          </span>
        </div>
        ${task.desc ? `<div class="task-desc">${escapeHtml(task.desc)}</div>` : ''}
        <div class="task-meta">
          <span>📅 ${formatDate(task.date)}</span>
        </div>
        <div class="task-actions">
          <button class="btn btn-success btn-small" onclick="toggleComplete('${id}')">
            ${task.completed ? '↩️ Desmarcar' : '✓ Concluir'}
          </button>
          <button class="btn btn-secondary btn-small" onclick="editTask('${id}')">✏️ Editar</button>
          <button class="btn btn-danger btn-small" onclick="deleteTask('${id}')">🗑️ Excluir</button>
        </div>
      </div>
    `;
    list.appendChild(li);
  });
}

/* -------------------------
   CRUD TAREFAS (usuarios/{uid}/tasks)
   ------------------------- */
function createTaskObjectFromForm() {
  return {
    title: (safeGet('taskTitle')?.value || '').trim(),
    desc: (safeGet('taskDesc')?.value || '').trim(),
    date: (safeGet('taskDate')?.value || '') || '',
    priority: (safeGet('taskPriority')?.value || 'low'),
    completed: false
  };
}

let editingTaskId = null;

function saveTaskToFirebase(taskObj, taskId = null) {
  const uid = ensureUser();
  if (taskId) {
    return db.ref(`usuarios/${uid}/tasks/${taskId}`).update(taskObj);
  } else {
    return db.ref(`usuarios/${uid}/tasks`).push(taskObj);
  }
}

function deleteTaskFromFirebase(taskId) {
  const uid = ensureUser();
  return db.ref(`usuarios/${uid}/tasks/${taskId}`).remove();
}

function toggleCompleteInFirebase(taskId) {
  const uid = ensureUser();
  const t = tasks[taskId];
  if (!t) return Promise.resolve();
  return db.ref(`usuarios/${uid}/tasks/${taskId}`).update({ completed: !t.completed });
}

/* -------------------------
   Form handlers (attach once)
   ------------------------- */
function attachFormHandlers() {
  // taskForm
  const taskForm = safeGet('taskForm');
  if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const taskObj = createTaskObjectFromForm();
        if (!taskObj.title) return showToast('Preencha o título', true);

        if (editingTaskId) {
          await saveTaskToFirebase(taskObj, editingTaskId);
          showToast('Tarefa atualizada!');
        } else {
          await saveTaskToFirebase(taskObj);
          showToast('Tarefa criada!');
        }
        editingTaskId = null;
        closeModal('taskModal');
        taskForm.reset();
      } catch (err) {
        console.error(err);
        showToast('Erro ao salvar tarefa', true);
      }
    });
  }

  // eventForm
  const eventForm = safeGet('eventForm');
  if (eventForm) {
    eventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const uid = ensureUser();
      const title = (safeGet('eventTitle')?.value || '').trim();
      const date = (safeGet('eventDate')?.value || '').trim();
      if (!title || !date) { showToast('Preencha título e data', true); return; }
      db.ref(`usuarios/${uid}/events/${date}`).set(title)
        .then(() => {
          showToast('Evento criado!');
          closeModal('eventModal');
          eventForm.reset();
        })
        .catch(err => {
          console.error(err);
          showToast('Erro ao criar evento', true);
        });
    });
  }
}

/* -------------------------
   Funções globais chamadas pelo HTML (expostas no window)
   ------------------------- */
window.openTaskModal = function () {
  editingTaskId = null;
  const titleEl = safeGet('taskModalTitle');
  if (titleEl) titleEl.textContent = '✨ Nova Tarefa';
  safeGet('taskForm')?.reset();
  safeGet('taskModal')?.classList.add('show');
};

window.openEventModal = function () {
  safeGet('eventForm')?.reset();
  safeGet('eventModal')?.classList.add('show');
};

window.openShoppingModal = function () {
  // implemente modal se adicionar um no HTML; por enquanto apenas abre alert
  showToast('Aba de compras não implementado (ainda).');
};

window.openBookModal = function () {
  showToast('Aba de livros não implementado (ainda).');
};

window.closeModal = function (modalId) {
  safeGet(modalId)?.classList.remove('show');
  if (modalId === 'taskModal') {
    editingTaskId = null;
    safeGet('taskForm')?.reset();
    const titleEl = safeGet('taskModalTitle');
    if (titleEl) titleEl.textContent = '✨ Nova Tarefa';
  }
};

window.openDayModal = function (dateStr, tasksForDay, eventForDay) {
    const modal = safeGet("dayModal");
    const content = safeGet("dayModalContent");
    const title = safeGet("dayModalTitle");

    if (!modal || !content) return;

    title.textContent = `📅 ${formatDate(dateStr)}`;

    let html = "";

    // Evento
    if (eventForDay) {
      html += `<h3>📌 Evento:</h3>
               <p class="event-item">${escapeHtml(eventForDay)}</p>`;
    }

    // Tarefas
    if (tasksForDay.length > 0) {
      html += `<h3>⚠️ Tarefas:</h3><ul>`;
      tasksForDay.forEach(t => {
        html += `
          <li class="task-item">
            <strong>${escapeHtml(t.title)}</strong><br>
            <small>${escapeHtml(t.desc || "")}</small><br>
            <button class="btn btn-success btn-small" onclick="toggleComplete('${t.id}')">Concluir</button>
            <button class="btn btn-secondary btn-small" onclick="editTask('${t.id}')">Editar</button>
          </li>
        `;
      });
      html += `</ul>`;
    }

    if (!eventForDay && tasksForDay.length === 0) {
      html = `<p>Não há nada para este dia.</p>`;
    }

    content.innerHTML = html;
    modal.classList.add("show");
};


window.editTask = function (taskId) {
  const t = tasks[taskId];
  if (!t) return showToast('Tarefa não encontrada', true);
  editingTaskId = taskId;
  if (safeGet('taskTitle')) safeGet('taskTitle').value = t.title || '';
  if (safeGet('taskDesc')) safeGet('taskDesc').value = t.desc || '';
  if (safeGet('taskDate')) safeGet('taskDate').value = t.date || '';
  if (safeGet('taskPriority')) safeGet('taskPriority').value = t.priority || 'low';
  const titleEl = safeGet('taskModalTitle');
  if (titleEl) titleEl.textContent = '✏️ Editar Tarefa';
  safeGet('taskModal')?.classList.add('show');
};

window.deleteTask = function (taskId) {
  if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
  deleteTaskFromFirebase(taskId)
    .then(() => showToast('Tarefa excluída!'))
    .catch(err => {
      console.error(err);
      showToast('Erro ao excluir tarefa', true);
    });
};

window.toggleComplete = function (taskId) {
  toggleCompleteInFirebase(taskId)
    .then(() => {
      const isCompleted = tasks[taskId]?.completed;
      showToast(isCompleted ? 'Tarefa desmarcada!' : 'Tarefa concluída!');
    })
    .catch(err => {
      console.error(err);
      showToast('Erro ao atualizar tarefa', true);
    });
};

window.logout = function () {
  auth.signOut()
    .then(() => { window.location.href = 'login.html'; })
    .catch(err => {
      console.error('Erro ao deslogar', err);
      showToast('Erro ao deslogar', true);
    });
};

/* -------------------------
   Shopping & Books (render simples)
   ------------------------- */
function renderShoppingList() {
  const ul = safeGet('shoppingList');
  if (!ul) return;
  ul.innerHTML = '';
  const entries = Object.entries(shopping);
  if (!entries.length) {
    ul.innerHTML = '<div class="empty-state"><p>Nenhum item na lista.</p></div>';
    return;
  }
  entries.forEach(([id, item]) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
      <div>
        <div class="task-header">
          <div class="task-title">${escapeHtml(item.name || '')}</div>
        </div>
        <div class="task-actions">
          <button class="btn btn-danger btn-small" onclick="removeShoppingItem('${id}')">🗑️ Remover</button>
        </div>
      </div>
    `;
    ul.appendChild(li);
  });
}

window.removeShoppingItem = function (id) {
  const uid = ensureUser();
  db.ref(`usuarios/${uid}/shopping/${id}`).remove()
    .then(() => showToast('Item removido'))
    .catch(err => { console.error(err); showToast('Erro', true); });
};

function renderBooksList() {
  const ul = safeGet('booksList');
  if (!ul) return;
  ul.innerHTML = '';
  const entries = Object.entries(books);
  if (!entries.length) {
    ul.innerHTML = '<div class="empty-state"><p>Nenhum livro adicionado.</p></div>';
    return;
  }
  entries.forEach(([id, book]) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
      <div>
        <div class="task-header">
          <div class="task-title">${escapeHtml(book.title || '')}</div>
        </div>
        <div class="task-actions">
          <button class="btn btn-danger btn-small" onclick="removeBook('${id}')">🗑️ Remover</button>
        </div>
      </div>
    `;
    ul.appendChild(li);
  });
}

window.removeBook = function (id) {
  const uid = ensureUser();
  db.ref(`usuarios/${uid}/books/${id}`).remove()
    .then(() => showToast('Livro removido'))
    .catch(err => { console.error(err); showToast('Erro', true); });
};

/* -------------------------
   Calendário: marca eventos e tarefas
   ------------------------- */
function isTomorrow(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr + 'T00:00:00');
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return d.toDateString() === t.toDateString();
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/* -------------------------
   Calendário: marca tarefas com cores
   ------------------------- */

// diferença de dias entre hoje e uma data
function daysUntil(dateStr) {
    const today = new Date();
    const target = new Date(dateStr + "T00:00:00");
    const diff = target - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  
  function renderCalendar() {
    const calendar = safeGet('calendar');
    if (!calendar) return;
    calendar.innerHTML = '';

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Espaços vazios no início
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        calendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {

        const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const div = document.createElement("div");
        const classes = ["calendar-day"];

        // Hoje
        if (isToday(dayStr)) classes.push("today");

        // Eventos
        const hasEvent = !!events[dayStr];
        if (hasEvent) classes.push("event");

        // Tarefas do dia
        const tasksForDay = Object.values(tasks).filter(
            t => t.date === dayStr && !t.completed
        );

        if (tasksForDay.length > 0) {

            // Calcula dias restantes até o dia da tarefa
            const daysLeft = daysUntil(dayStr);

            if (daysLeft < 0) {
                classes.push("task-red"); // atrasada
            } 
            else if (daysLeft === 0 || daysLeft === 1) {
                classes.push("task-yellow"); // hoje ou amanhã
            } 
            else {
                classes.push("task-green"); // distante
            }
        }

        div.className = classes.join(" ");

        const indicators = [];
        if (hasEvent) indicators.push("📌");
        if (tasksForDay.length > 0) indicators.push("⚠️");

        div.innerHTML = `
            <div class="calendar-day-number">${day}</div>
            ${indicators.length 
                ? `<div class="calendar-day-indicator">${indicators.join(" ")}</div>` 
                : ""
            }
        `;

        // Clicar abre modal de evento com a data
        div.onclick = () => {
            const tasksForDayList = Object.entries(tasks)
              .filter(([id, t]) => t.date === dayStr)
              .map(([id, t]) => ({ id, ...t }));
        
            const eventForDay = events[dayStr] || null;
        
            openDayModal(dayStr, tasksForDayList, eventForDay);
        };
        calendar.appendChild(div);
    }
}

/*
   Pequenas proteções e helpers
   ------------------------- */
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
