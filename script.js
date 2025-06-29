const container = document.getElementById("container");
const addNoteBtn = document.getElementById("add-note-btn");
const hideAllBtn = document.getElementById("hide-all-btn");
const hideSelectedBtn = document.getElementById("hide-selected-btn");
const showHiddenBtn = document.getElementById("show-hidden-btn");

let notes = [];
let hiddenNotes = [];
let selectedNotes = [];
let draggedNote = null;

function loadNotes() {
  notes = JSON.parse(localStorage.getItem("notes") || "[]");
  hiddenNotes = JSON.parse(localStorage.getItem("hiddenNotes") || "[]");
  selectedNotes = JSON.parse(localStorage.getItem("selectedNotes") || "[]");

  notes.forEach((note, index) => {
    if (!note.position) note.position = index + 1;
  });

  notes.sort((a, b) => a.position - b.position);
}

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("hiddenNotes", JSON.stringify(hiddenNotes));
  localStorage.setItem("selectedNotes", JSON.stringify(selectedNotes));
  updateButtonStates();
}

function renderNotes() {
  container.innerHTML = "";
  notes.sort((a, b) => a.position - b.position).forEach(note => {
    const isHidden = hiddenNotes.includes(note.id);
    const isSelected = selectedNotes.includes(note.id);
    createNoteElement(note, isHidden, isSelected);
  });
}

function createNoteElement(note, isHidden, isSelected) {
  const noteDiv = document.createElement("div");
  noteDiv.className = `note-row ${isHidden ? 'hidden' : ''}`;
  noteDiv.innerHTML = `
    <div class="note-header">
      <input type="checkbox" class="note-checkbox" ${isSelected ? 'checked' : ''} data-note-id="${note.id}">
      <div class="drag-handle" draggable="true">≡</div>
    </div>
    <div contenteditable="true" class="note-editor">${note.content || ''}</div>
    <div class="note-controls">
      <button class="save-note">Save</button>
      <button class="delete-note">Delete</button>
    </div>
  `;

  const editor = noteDiv.querySelector(".note-editor");
  const saveBtn = noteDiv.querySelector(".save-note");
  const deleteBtn = noteDiv.querySelector(".delete-note");
  const checkbox = noteDiv.querySelector(".note-checkbox");

  saveBtn.addEventListener("click", () => {
    saveNoteContent(note.id, editor);
  });

  editor.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      saveNoteContent(note.id, editor);
    }
  });

  deleteBtn.addEventListener("click", () => deleteNote(note.id, noteDiv));

  checkbox.addEventListener("change", (e) => {
    updateNoteSelection(note.id, e.target.checked);
  });

  const dragHandle = noteDiv.querySelector(".drag-handle");
  dragHandle.addEventListener("dragstart", (e) => {
    draggedNote = noteDiv;
    noteDiv.classList.add("dragging");
    e.dataTransfer.setData("text/plain", note.id);
  });

  dragHandle.addEventListener("dragend", () => {
    if (draggedNote) draggedNote.classList.remove("dragging");
    draggedNote = null;
  });

  container.appendChild(noteDiv);
}

function saveNoteContent(noteId, editor) {
  const content = editor.innerHTML.trim();
  const noteIndex = notes.findIndex(n => n.id === noteId);
  if (noteIndex !== -1) {
    notes[noteIndex].content = content;
    saveNotes();
  }
}

function deleteNote(noteId, noteElement) {
  notes = notes.filter(n => n.id !== noteId);
  hiddenNotes = hiddenNotes.filter(id => id !== noteId);
  selectedNotes = selectedNotes.filter(id => id !== noteId);
  noteElement.remove();
  saveNotes();
}

function updateNoteSelection(noteId, isSelected) {
  if (isSelected) {
    if (!selectedNotes.includes(noteId)) selectedNotes.push(noteId);
  } else {
    selectedNotes = selectedNotes.filter(id => id !== noteId);
  }
  saveNotes();
}

function updateButtonStates() {
  hideAllBtn.disabled = notes.length === 0;
  hideSelectedBtn.disabled = selectedNotes.length === 0;
  showHiddenBtn.disabled = hiddenNotes.length === 0;
}

function generatePosition() {
  return notes.length > 0 ? Math.max(...notes.map(n => n.position)) + 1 : 1;
}

function addNewNote() {
  const newNote = {
    id: Date.now().toString(),
    content: "",
    position: generatePosition()
  };
  notes.push(newNote);
  createNoteElement(newNote, false, false);
  saveNotes();
  updateButtonStates();
}

function hideSelectedNotes() {
  selectedNotes.forEach(id => {
    if (!hiddenNotes.includes(id)) hiddenNotes.push(id);
  });
  saveNotes();
  renderNotes();
}

function hideAllNotes() {
  hiddenNotes = notes.map(note => note.id);
  saveNotes();
  renderNotes();
}

function showHiddenNotes() {
  hiddenNotes = [];
  saveNotes();
  renderNotes();
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.note-row:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function handleDragOver(e) {
  e.preventDefault();
  const afterElement = getDragAfterElement(container, e.clientY);
  if (!draggedNote) return;

  if (afterElement == null) {
    container.appendChild(draggedNote);
  } else {
    container.insertBefore(draggedNote, afterElement);
  }
}

function handleDrop(e) {
  e.preventDefault();
  if (!draggedNote) return;

  draggedNote.classList.remove("dragging");
  draggedNote = null;

  const noteElements = [...container.querySelectorAll(".note-row")];
  noteElements.forEach((el, index) => {
    const noteId = el.querySelector(".note-checkbox").dataset.noteId;
    const note = notes.find(n => n.id === noteId);
    if (note) note.position = index + 1;
  });

  saveNotes();
}

function setupEventListeners() {
  addNoteBtn.addEventListener("click", addNewNote);
  hideSelectedBtn.addEventListener("click", hideSelectedNotes);
  hideAllBtn.addEventListener("click", hideAllNotes);
  showHiddenBtn.addEventListener("click", showHiddenNotes);
  container.addEventListener("dragover", handleDragOver);
  container.addEventListener("drop", handleDrop);
  window.addEventListener("beforeunload", saveNotes);
} 

(function initializeApp() {
  loadNotes();
  renderNotes();
  setupEventListeners();
})();
