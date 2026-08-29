(function () {
  'use strict';

  const STORAGE_KEY = 'groceryBud.items.v1';

  const form = document.getElementById('form');
  const inputBox = document.getElementById('input-box');
  const searchBox = document.getElementById('search-box');
  const toolbar = document.getElementById('toolbar');
  const list = document.getElementById('List');
  const counter = document.getElementById('counter');
  const emptyState = document.getElementById('emptyState');
  const clearBtn = document.getElementById('clear-items');
  const clearCount = document.getElementById('clearCount');
  const toast = document.getElementById('toast');
  const undoBar = document.getElementById('undoBar');
  const undoText = document.getElementById('undoText');
  const undoBtn = document.getElementById('undoBtn');
  const statTotal = document.getElementById('statTotal');
  const statActive = document.getElementById('statActive');
  const statDone = document.getElementById('statDone');
  const statProgress = document.getElementById('statProgress');
  const progressBar = document.getElementById('progressBar');
  const dateChip = document.getElementById('dateChip');

  const ICONS = {
    check: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`,
    delete: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></svg>`
  };

  let items = [];
  let filter = 'all';
  let query = '';
  let lastRemoved = null;
  let undoBarTimer = null;

  /* ---------- Persistence ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      items = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(items)) items = [];
    } catch (e) {
      items = [];
    }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
    catch (e) { /* ignore quota errors */ }
  }

  /* ---------- Helpers ---------- */
  function showToast(msg, type) {
    toast.textContent = msg;
    toast.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function visibleItems() {
    const q = query.trim().toLowerCase();
    return items.filter(it => {
      const f = filter === 'all'
        ? true
        : filter === 'done' ? it.done : !it.done;
      const s = q ? it.text.toLowerCase().includes(q) : true;
      return f && s;
    });
  }

  /* ---------- Render ---------- */
  function render() {
    const shown = visibleItems();
    list.innerHTML = '';

    shown.forEach(it => list.appendChild(createRow(it)));

    const allDone = items.length > 0 && items.every(it => it.done);
    const hasList = items.length > 0;
    emptyState.style.display = hasList ? 'none' : 'flex';
    toolbar.hidden = !hasList;

    const count = items.length;
    const remaining = items.filter(it => !it.done).length;
    counter.textContent = count === 0
      ? '0 items'
      : `${count} ${count === 1 ? 'item' : 'items'} · ${remaining} active`;

    const doneCount = items.filter(it => it.done).length;
    clearBtn.disabled = doneCount === 0;
    clearCount.textContent = doneCount > 0 ? `(${doneCount})` : '';

    const percent = count === 0 ? 0 : Math.round((doneCount / count) * 100);
    statTotal.textContent = count;
    statActive.textContent = remaining;
    statDone.textContent = doneCount;
    statProgress.textContent = percent + '%';
    progressBar.style.width = percent + '%';
  }

  function createRow(item) {
    const li = document.createElement('li');
    if (item.done) li.classList.add('done');
    li.dataset.id = item.id;

    const check = document.createElement('button');
    check.type = 'button';
    check.className = 'item-check';
    check.setAttribute('aria-label', 'Toggle done');
    check.innerHTML = ICONS.check;
    check.addEventListener('click', () => {
      item.done = !item.done;
      save();
      render();
    });

    const text = document.createElement('span');
    text.className = 'item-text';
    text.textContent = item.text;
    text.title = 'Double-click to edit';
    text.addEventListener('dblclick', () => startEdit(text, item));
    text.addEventListener('blur', () => finishEdit(text, item));

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'icon-btn edit';
    editBtn.setAttribute('aria-label', 'Edit item');
    editBtn.innerHTML = ICONS.edit;
    editBtn.addEventListener('click', (e) => { e.stopPropagation(); startEdit(text, item); });

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'icon-btn delete';
    delBtn.setAttribute('aria-label', 'Delete item');
    delBtn.innerHTML = ICONS.delete;
    delBtn.addEventListener('click', (e) => { e.stopPropagation(); removeItem(item, li); });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(check);
    li.appendChild(text);
    li.appendChild(actions);

    text.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); text.blur(); }
      if (e.key === 'Escape') { cancelEdit(text, item); }
    });

    return li;
  }

  /* ---------- Edit ---------- */
  let currentEdit = null;
  function startEdit(textEl, item) {
    if (currentEdit) currentEdit.blur();
    currentEdit = textEl;
    textEl.contentEditable = 'true';
    textEl.focus();
    const range = document.createRange();
    range.selectNodeContents(textEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  function finishEdit(textEl, item) {
    if (textEl.contentEditable !== 'true') return;
    textEl.contentEditable = 'false';
    currentEdit = null;
    const val = textEl.textContent.trim();
    if (!val) { restoreText(textEl, item); return; }
    item.text = val;
    save();
    render();
    showToast('Item updated', 'success');
  }
  function cancelEdit(textEl, item) {
    if (textEl.contentEditable !== 'true') return;
    textEl.contentEditable = 'false';
    currentEdit = null;
    restoreText(textEl, item);
  }
  function restoreText(textEl, item) {
    textEl.textContent = item.text;
  }

  /* ---------- Add ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = inputBox.value.trim();
    if (!value) {
      inputBox.classList.add('shake');
      setTimeout(() => inputBox.classList.remove('shake'), 400);
      showToast('Please enter an item', 'error');
      return;
    }
    if (items.some(it => it.text.toLowerCase() === value.toLowerCase())) {
      showToast('Item already in list', 'error');
      return;
    }
    items.push({ id: Date.now() + '-' + Math.random().toString(36).slice(2, 7), text: value, done: false });
    save();
    render();
    inputBox.value = '';
    inputBox.focus();
    const row = [...list.children].find(li => li.querySelector('.item-text').textContent === value);
    if (row) { row.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    showToast('Item added', 'success');
  });

  /* ---------- Remove (with undo) ---------- */
  function removeItem(item, li) {
    li.classList.add('removing');
    const idx = items.indexOf(item);
    lastRemoved = { item, idx };
    clearTimeout(undoBarTimer);
    undoText.textContent = `"${item.text}" removed`;
    undoBar.hidden = false;
    undoBarTimer = setTimeout(() => { undoBar.hidden = true; lastRemoved = null; }, 4000);

    setTimeout(() => {
      // Only remove if item is still here (undo may have re-added)
      const stillIdx = items.findIndex(it => it.id === item.id);
      if (stillIdx !== -1) {
        items.splice(stillIdx, 1);
        save();
        render();
      }
    }, 260);
    // Also re-render immediately to keep counters consistent after animation
    setTimeout(render, 300);
  }

  undoBtn.addEventListener('click', () => {
    if (!lastRemoved) return;
    const at = Math.min(lastRemoved.idx, items.length);
    items.splice(at, 0, lastRemoved.item);
    save();
    render();
    undoBar.hidden = true;
    lastRemoved = null;
    showToast('Item restored', 'success');
  });

  /* ---------- Clear completed ---------- */
  clearBtn.addEventListener('click', () => {
    const before = items.filter(it => it.done);
    if (before.length === 0) return;
    items = items.filter(it => !it.done);
    save();
    render();
    showToast(`${before.length} completed item${before.length > 1 ? 's' : ''} cleared`, 'success');
  });

  /* ---------- Search & filter ---------- */
  searchBox.addEventListener('input', () => {
    query = searchBox.value;
    render();
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filter = btn.dataset.filter;
      render();
    });
  });

  /* ---------- Date chip ---------- */
  function updateDate() {
    const d = new Date();
    dateChip.textContent = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  /* ---------- Init ---------- */
  load();
  render();
  updateDate();
})();
