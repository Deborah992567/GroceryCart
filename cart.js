(function () {
  'use strict';

  const STORAGE_KEY = 'groceryBud.items.v2';
  const THEME_KEY = 'groceryBud.theme';

  /* ---------- Categories ---------- */
  const CATEGORIES = {
    produce:   { label: 'Produce', color: '#23b26d' },
    dairy:     { label: 'Dairy',   color: '#56a0f5' },
    bakery:    { label: 'Bakery',  color: '#c98a3d' },
    meat:      { label: 'Meat',    color: '#ef5b5b' },
    pantry:    { label: 'Pantry',  color: '#f5a623' },
    frozen:    { label: 'Frozen',  color: '#5b7cfa' },
    beverage:  { label: 'Beverage',color: '#23a8b2' },
    other:     { label: 'Other',   color: '#8b7bd8' },
  };
  const CATEGORY_ORDER = ['produce', 'dairy', 'bakery', 'meat', 'pantry', 'frozen', 'beverage', 'other'];

  const SUGGESTION_MAP = {
    egg: 'dairy', milk: 'dairy', cheese: 'dairy', yogurt: 'dairy', butter: 'dairy', cream: 'dairy',
    apple: 'produce', banana: 'produce', orange: 'produce', grape: 'produce', tomato: 'produce',
    onion: 'produce', garlic: 'produce', potato: 'produce', carrot: 'produce', lettuce: 'produce',
    spinach: 'produce', brocolli: 'produce', broccoli: 'produce', pepper: 'produce', avocado: 'produce',
    strawberry: 'produce', lemon: 'produce', cucumber: 'produce', mushroom: 'produce',
    bread: 'bakery', bagel: 'bakery', croissant: 'bakery', tortilla: 'bakery', bun: 'bakery',
    chicken: 'meat', beef: 'meat', pork: 'meat', salmon: 'meat', bacon: 'meat', turkey: 'meat',
    rice: 'pantry', pasta: 'pantry', bean: 'pantry', flour: 'pantry', sugar: 'pantry', salt: 'pantry',
    oil: 'pantry', cereal: 'pantry', spice: 'pantry', sauce: 'pantry', noodle: 'pantry', peanut: 'pantry',
    icecream: 'frozen', 'ice cream': 'frozen', pizza: 'frozen', berry: 'frozen', peas: 'frozen',
    water: 'beverage', juice: 'beverage', soda: 'beverage', coffee: 'beverage', tea: 'beverage', beer: 'beverage',
  };

  /* ---------- DOM refs ---------- */
  const form = document.getElementById('form');
  const inputBox = document.getElementById('input-box');
  const searchBox = document.getElementById('search-box');
  const toolbar = document.getElementById('toolbar');
  const actionRow = document.getElementById('actionRow');
  const list = document.getElementById('List');
  const counter = document.getElementById('counter');
  const emptyState = document.getElementById('emptyState');
  const clearBtn = document.getElementById('clear-items');
  const clearCount = document.getElementById('clearCount');
  const toast = document.getElementById('toast');
  const undoBar = document.getElementById('undoBar');
  const undoText = document.getElementById('undoText');
  const undoQuick = document.getElementById('undoQuick');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const shareBtn = document.getElementById('shareBtn');
  const shareDropdown = document.getElementById('shareDropdown');
  const themeToggle = document.getElementById('themeToggle');
  const suggestionRow = document.getElementById('suggestionRow');
  const suggestionChips = document.getElementById('suggestionChips');
  const hiddenDatePicker = document.getElementById('hiddenDatePicker');

  const statTotal = document.getElementById('statTotal');
  const statActive = document.getElementById('statActive');
  const statDone = document.getElementById('statDone');
  const statProgress = document.getElementById('statProgress');
  const progressBar = document.getElementById('progressBar');
  const dateChip = document.getElementById('dateChip');

  const ICONS = {
    check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
    delete: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  };

  let items = [];
  let filter = 'all';
  let query = '';
  let activeDatePickerItem = null;
  let undoBarTimer = null;

  /* ---------- Undo / redo history ---------- */
  const undoStack = [];
  const redoStack = [];
  const HISTORY_LIMIT = 50;

  function pushHistory(action) {
    undoStack.push(action);
    if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
    redoStack.length = 0;
    updateHistoryButtons();
  }
  function undo() {
    const op = undoStack.pop();
    if (!op) return;
    op.undo();
    redoStack.push(op);
    updateHistoryButtons();
  }
  function redo() {
    const op = redoStack.pop();
    if (!op) return;
    op.redo();
    undoStack.push(op);
    updateHistoryButtons();
  }
  function updateHistoryButtons() {
    undoBtn.disabled = undoStack.length === 0;
    redoBtn.disabled = redoStack.length === 0;
  }

  /* ---------- Persistence ---------- */
  function load() {
    try { items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { items = []; }
    if (!Array.isArray(items)) items = [];
  }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {} }

  /* ---------- Theme ---------- */
  function initTheme() {
    let theme = localStorage.getItem(THEME_KEY);
    if (theme !== 'dark' && theme !== 'light') {
      theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  }
  themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
  });

  /* ---------- Helpers ---------- */
  function showToast(msg, type) {
    toast.textContent = msg;
    toast.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  }
  function uid() { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }
  function norm(s) { return (s || '').trim().toLowerCase(); }

  function detectCategory(text) {
    const t = norm(text);
    for (const key in SUGGESTION_MAP) {
      if (t === key || t.includes(key + ' ') || t.includes(' ' + key) || t.endsWith(key)) {
        return SUGGESTION_MAP[key];
      }
    }
    if (t.includes(' dozen ') || /^\d/.test(t)) return 'other';
    return 'other';
  }
  function detectQuantity(text) {
    const m = norm(text).match(/^(\d+(?:\.\d+)?)\s*(dozen|pcs|pack|bag|kg|g|l|oz|lb|pkt)?/);
    if (m) return { qty: parseFloat(m[1]), unit: m[2] || 'pcs' };
    return null;
  }

  function visibleItems() {
    const q = query.trim().toLowerCase();
    return items.filter(it => {
      const f = filter === 'all' ? true : filter === 'done' ? it.done : !it.done;
      const s = q ? it.text.toLowerCase().includes(q) : true;
      return f && s;
    });
  }

  /* ---------- Date helpers ---------- */
  function dueStatus(item) {
    if (!item.due || item.done) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(item.due); due.setHours(0, 0, 0, 0);
    if (due < today) return 'overdue';
    if (due.getTime() === today.getTime()) return 'today';
    return 'future';
  }
  function formatDue(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const opts = { month: 'short', day: 'numeric' };
    const today = new Date(); today.setHours(0,0,0,0);
    const d0 = new Date(dateStr); d0.setHours(0,0,0,0);
    if (d0.getTime() === today.getTime()) return 'Today';
    return d.toLocaleDateString(undefined, opts);
  }

  /* ---------- Render ---------- */
  function render() {
    const shown = visibleItems();
    list.innerHTML = '';
    shown.forEach(it => list.appendChild(createRow(it)));

    const hasList = items.length > 0;
    emptyState.style.display = hasList ? 'none' : 'flex';
    toolbar.hidden = !hasList;
    actionRow.hidden = !hasList;

    const count = items.length;
    const remaining = items.filter(it => !it.done).length;
    const doneCount = items.filter(it => it.done).length;
    counter.textContent = count === 0 ? '0 items' : `${count} ${count === 1 ? 'item' : 'items'} · ${remaining} active`;
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
    else if (dueStatus(item) === 'overdue') li.classList.add('overdue');
    li.dataset.id = item.id;

    const check = document.createElement('button');
    check.type = 'button';
    check.className = 'item-check';
    check.setAttribute('aria-label', 'Toggle done');
    check.innerHTML = ICONS.check;
    check.addEventListener('click', (e) => {
      e.stopPropagation();
      const before = JSON.parse(JSON.stringify(items));
      const becomingDone = !item.done;
      item.done = !item.done;
      save(); render();
      pushHistory({
        undo: () => { items = JSON.parse(JSON.stringify(before)); save(); render(); updateHistoryButtons(); },
        redo: () => { const it = items.find(x => x.id === item.id); if (it) it.done = !it.done; save(); render(); updateHistoryButtons(); }
      });
      if (becomingDone) confettiBurst(e.currentTarget);
    });

    const main = document.createElement('div');
    main.className = 'item-main';

    const row1 = document.createElement('div');
    row1.className = 'item-row-1';

    const text = document.createElement('span');
    text.className = 'item-text';
    text.textContent = item.text;
    text.title = 'Double-click or tap pencil to edit';
    text.addEventListener('dblclick', () => startEdit(text, item));
    text.addEventListener('blur', () => finishEdit(text, item));

    row1.appendChild(text);

    const meta = document.createElement('div');
    meta.className = 'item-meta';

    // category badge
    const catBadge = document.createElement('span');
    const cat = CATEGORIES[item.category] || CATEGORIES.other;
    catBadge.className = 'cat-badge';
    catBadge.style.background = cat.color;
    catBadge.textContent = cat.label;
    catBadge.title = 'Click to change category';
    catBadge.style.cursor = 'pointer';
    catBadge.addEventListener('click', () => cycleCategory(item));
    meta.appendChild(catBadge);

    // quantity stepper
    if (item.qty) {
      const stepper = document.createElement('div');
      stepper.className = 'qty-stepper';
      const minus = document.createElement('button'); minus.type = 'button'; minus.textContent = '−';
      const num = document.createElement('span'); num.className = 'qty-num'; num.textContent = item.qty;
      const plus = document.createElement('button'); plus.type = 'button'; plus.textContent = '+';
      minus.addEventListener('click', (e) => { e.stopPropagation(); changeQty(item, -1); });
      plus.addEventListener('click', (e) => { e.stopPropagation(); changeQty(item, +1); });
      stepper.appendChild(minus); stepper.appendChild(num); stepper.appendChild(plus);
      meta.appendChild(stepper);
      if (item.unit && item.unit !== 'pcs') {
        const note = document.createElement('span'); note.className = 'qty-note'; note.textContent = item.unit;
        meta.appendChild(note);
      }
    }

    // due date chip
    const dueChip = document.createElement('button');
    dueChip.type = 'button';
    dueChip.className = 'due-chip';
    dueChip.innerHTML = ICONS.calendar + ' <span>' + (item.due ? formatDue(item.due) : 'Due') + '</span>';
    const st = dueStatus(item);
    if (st) dueChip.classList.add(st);
    dueChip.addEventListener('click', (e) => {
      e.stopPropagation();
      activeDatePickerItem = item;
      hiddenDatePicker.value = item.due || '';
      hiddenDatePicker.showPicker ? hiddenDatePicker.showPicker() : hiddenDatePicker.focus();
    });
    meta.appendChild(dueChip);

    main.appendChild(row1);
    main.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button'; editBtn.className = 'icon-btn edit';
    editBtn.setAttribute('aria-label', 'Edit item'); editBtn.innerHTML = ICONS.edit;
    editBtn.addEventListener('click', (e) => { e.stopPropagation(); startEdit(text, item); });

    const delBtn = document.createElement('button');
    delBtn.type = 'button'; delBtn.className = 'icon-btn delete';
    delBtn.setAttribute('aria-label', 'Delete item'); delBtn.innerHTML = ICONS.delete;
    delBtn.addEventListener('click', (e) => { e.stopPropagation(); removeItem(item, li); });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(check);
    li.appendChild(main);
    li.appendChild(actions);

    text.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); text.blur(); }
      if (e.key === 'Escape') { cancelEdit(text, item); }
    });

    return li;
  }

  /* ---------- Category cycling ---------- */
  function cycleCategory(item) {
    const before = JSON.parse(JSON.stringify(items));
    const idx = CATEGORY_ORDER.indexOf(item.category);
    item.category = CATEGORY_ORDER[(idx + 1) % CATEGORY_ORDER.length];
    save(); render();
    pushHistory({ undo: () => { items = JSON.parse(JSON.stringify(before)); save(); render(); updateHistoryButtons(); }, redo: cycleLikeRedo(item) });
  }
  function cycleLikeRedo(item) { return () => { const it = items.find(x => x.id === item.id); if (it) { const i = CATEGORY_ORDER.indexOf(it.category); it.category = CATEGORY_ORDER[(i + 1) % CATEGORY_ORDER.length]; } save(); render(); updateHistoryButtons(); }; }

  /* ---------- Quantity ---------- */
  function changeQty(item, delta) {
    const before = JSON.parse(JSON.stringify(items));
    item.qty = Math.max(1, (item.qty || 1) + delta);
    save(); render();
    pushHistory({
      undo: () => { items = JSON.parse(JSON.stringify(before)); save(); render(); updateHistoryButtons(); },
      redo: () => { const it = items.find(x => x.id === item.id); if (it) it.qty = Math.max(1, it.qty + delta); save(); render(); updateHistoryButtons(); }
    });
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
    if (!val) { textEl.textContent = item.text; return; }
    if (val === item.text) return;
    const before = JSON.parse(JSON.stringify(items));
    item.text = val;
    save(); render();
    pushHistory({
      undo: () => { items = JSON.parse(JSON.stringify(before)); save(); render(); updateHistoryButtons(); },
      redo: () => { const it = items.find(x => x.id === item.id); if (it) it.text = val; save(); render(); updateHistoryButtons(); }
    });
    showToast('Item updated');
  }
  function cancelEdit(textEl, item) {
    if (textEl.contentEditable !== 'true') return;
    textEl.contentEditable = 'false';
    currentEdit = null;
    textEl.textContent = item.text;
  }

  /* ---------- Add ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = inputBox.value.trim();
    if (!raw) {
      inputBox.classList.add('shake');
      setTimeout(() => inputBox.classList.remove('shake'), 400);
      showToast('Please enter an item', 'error');
      return;
    }
    const cleaned = raw.replace(/^(\d+(?:\.\d+)?\s*(?:dozen|pcs|pack|bag|kg|g|l|oz|lb|pkt)?)\s+/i, '');
    if (items.some(it => norm(it.text) === norm(raw))) {
      showToast('Item already in list', 'error');
      return;
    }
    const Q = detectQuantity(raw);
    const newItem = {
      id: uid(),
      text: cleaned || raw,
      qty: Q ? Q.qty : null,
      unit: Q ? Q.unit : null,
      category: detectCategory(raw),
      done: false,
      due: null,
    };
    items.push(newItem);
    save(); render();
    inputBox.value = '';
    inputBox.focus();
    const row = [...list.children].find(li => li.querySelector('.item-text') && li.querySelector('.item-text').textContent === newItem.text);
    if (row) row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('Item added');
    pushHistory({
      undo: () => { items = items.filter(x => x.id !== newItem.id); save(); render(); updateHistoryButtons(); },
      redo: () => { items.push(newItem); save(); render(); updateHistoryButtons(); }
    });
    renderSuggestions(raw);
  });

  /* ---------- Remove ---------- */
  function removeItem(item, li) {
    li.classList.add('removing');
    const before = JSON.parse(JSON.stringify(items));
    showUndoBar(item, before);
    setTimeout(() => {
      const stillIdx = items.findIndex(x => x.id === item.id);
      if (stillIdx !== -1) {
        items.splice(stillIdx, 1);
        save(); render();
      }
    }, 260);
    setTimeout(render, 320);
    pushHistory({
      undo: () => { items = JSON.parse(JSON.stringify(before)); save(); render(); updateHistoryButtons(); },
      redo: () => { items = items.filter(x => x.id !== item.id); save(); render(); updateHistoryButtons(); }
    });
  }
  function showUndoBar(item, before) {
    clearTimeout(undoBarTimer);
    undoText.textContent = `"${item.text}" removed`;
    undoBar.hidden = false;
    undoBarTimer = setTimeout(() => { undoBar.hidden = true; }, 4000);
    undoQuick.onclick = () => {
      undoBar.hidden = true;
      items = JSON.parse(JSON.stringify(before));
      save(); render();
      showToast('Item restored');
    };
  }

  /* ---------- Clear completed ---------- */
  clearBtn.addEventListener('click', () => {
    const before = JSON.parse(JSON.stringify(items));
    const completed = items.filter(it => it.done);
    if (completed.length === 0) return;
    items = items.filter(it => !it.done);
    save(); render();
    showToast(completed.length + ' completed cleared');
    pushHistory({
      undo: () => { items = JSON.parse(JSON.stringify(before)); save(); render(); updateHistoryButtons(); },
      redo: () => { items = items.filter(it => !it.done); save(); render(); updateHistoryButtons(); }
    });
  });

  /* ---------- Search & filter ---------- */
  searchBox.addEventListener('input', () => { query = searchBox.value; render(); });
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filter = btn.dataset.filter;
      render();
    });
  });

  /* ---------- Undo / redo buttons ---------- */
  undoBtn.addEventListener('click', () => { undo(); render(); });
  redoBtn.addEventListener('click', () => { redo(); render(); });

  /* ---------- Due date ---------- */
  hiddenDatePicker.addEventListener('change', () => {
    if (!activeDatePickerItem) return;
    const before = JSON.parse(JSON.stringify(items));
    activeDatePickerItem.due = hiddenDatePicker.value || null;
    save(); render();
    if (activeDatePickerItem.due) showToast('Due date set');
    activeDatePickerItem = null;
  });

  /* ---------- Suggestions ---------- */
  inputBox.addEventListener('input', () => { renderSuggestions(inputBox.value); });
  function renderSuggestions(value) {
    const v = norm(value).replace(/^\d+\s*(dozen|pcs|pack|bag|kg|g|l|oz|lb|pkt)?\s+/, '');
    if (!v) { suggestionRow.hidden = true; suggestionChips.innerHTML = ''; return; }
    const matched = [];
    for (const key in SUGGESTION_MAP) {
      if (key.includes(v) && matched.length < 5) matched.push(key);
    }
    const used = new Set(items.map(it => norm(it.text)));
    const candidates = matched.filter(k => !used.has(k));
    if (candidates.length === 0) { suggestionRow.hidden = true; suggestionChips.innerHTML = ''; return; }
    suggestionRow.hidden = false;
    suggestionChips.innerHTML = '';
    candidates.forEach(key => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'suggestion-chip';
      chip.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      chip.addEventListener('click', () => {
        inputBox.value = (v ? key : key);
        inputBox.focus();
        suggestionRow.hidden = true;
      });
      suggestionChips.appendChild(chip);
    });
  }

  /* ---------- Share / export ---------- */
  const shareMenu = document.querySelector('.share-menu');

  function buildShareText() {
    if (!items.length) return 'My Grocery Bud list is empty.';
    return items.map((it, i) => {
      let line = `${i + 1}. ${it.text}`;
      if (it.qty) line += it.unit && it.unit !== 'pcs' ? ` — ${it.qty} ${it.unit}` : ` — x${it.qty}`;
      if (it.due) line += ` (due ${formatDue(it.due)})`;
      if (it.done) line += ' ✓';
      return line;
    }).join('\n');
  }

  shareBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    shareDropdown.hidden = !shareDropdown.hidden;
  });

  document.addEventListener('click', (e) => {
    if (shareMenu && !shareMenu.contains(e.target)) {
      shareDropdown.hidden = true;
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') shareDropdown.hidden = true;
  });

  document.querySelectorAll('[data-share]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const kind = btn.dataset.share;
      if (kind === 'copy') {
        copyText(buildShareText());
      } else if (kind === 'txt') {
        const header = 'Grocery Bud — ' + new Date().toLocaleDateString() + '\n\n';
        triggerDownload(header + buildShareText() + '\n', 'grocery-bud-list.txt', 'text/plain');
      } else if (kind === 'json') {
        const payload = JSON.stringify({ exported: new Date().toISOString(), items }, null, 2);
        triggerDownload(payload, 'grocery-bud-backup.json', 'application/json');
      }
      shareDropdown.hidden = true;
    });
  });

  function copyText(text) {
    const done = () => showToast('Copied to clipboard');
    const fail = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        ok ? done() : showToast('Could not copy', 'error');
      } catch (err) {
        showToast('Could not copy', 'error');
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fail);
    } else {
      fail();
    }
  }

  function triggerDownload(content, filename, mime) {
    const blob = new Blob([content], { type: mime + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Downloading ' + filename);
  }

  /* ---------- Confetti ---------- */
  const CONFETTI_COLORS = ['#2f80ed', '#5b7cfa', '#23b26d', '#f5a623', '#56a0f5', '#7c6cf0', '#ef5b5b', '#8fb9f7'];
  function confettiBurst(originEl) {
    const origin = originEl.getBoundingClientRect();
    const ox = origin.left + origin.width / 2;
    const oy = origin.top + origin.height / 2;
    for (let b = 0; b < 3; b++) {
      const count = 26;
      const pieces = [];
      for (let i = 0; i < count; i++) {
        const el = document.createElement('span');
        el.className = 'confetti';
        const color = CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0];
        const size = 6 + Math.random() * 8;
        const round = Math.random() > 0.5;
        el.style.cssText = `left:${ox}px;top:${oy}px;width:${size}px;height:${size}px;background:${color};border-radius:${round ? '50%' : '2px'}`;
        pieces.push({ el, x: ox, y: oy });
        document.body.appendChild(el);
      }
      setTimeout(() => {
        pieces.forEach((p, i) => {
          const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.6 - 0.3);
          const dist = 90 + Math.random() * 140;
          const tx = Math.cos(angle) * dist;
          const ty = Math.sin(angle) * dist - 30;
          const rot = (Math.random() * 720 - 360).toFixed(0);
          p.el.style.transition = 'transform .9s cubic-bezier(.22,1,.36,1), opacity .9s ease';
          requestAnimationFrame(() => {
            p.el.style.transform = `translate(${tx}px,${ty}px) rotate(${rot}deg)`;
            p.el.style.opacity = '0';
          });
        });
      }, b * 120);
      setTimeout(() => pieces.forEach(p => p.el.remove()), 1600 + b * 120);
    }
  }

  /* ---------- Date chip ---------- */
  function updateDate() {
    const d = new Date();
    dateChip.textContent = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  /* ---------- Init ---------- */
  initTheme();
  load();
  render();
  updateDate();
  updateHistoryButtons();
})();
