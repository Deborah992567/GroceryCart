(function () {
  'use strict';

  const form = document.getElementById('form');
  const inputBox = document.getElementById('input-box');
  const list = document.getElementById('List');
  const clearBtn = document.getElementById('clear-items');
  const counter = document.getElementById('counter');
  const toast = document.getElementById('toast');
  const scene = document.getElementById('scene');
  const card = document.querySelector('.card');

  const EDIT_ICON = 'image/OIP (2).jpg';
  const DELETE_ICON = 'image/OIP (4).jpg';

  let toastTimer = null;

  function updateCounter() {
    const count = list.children.length;
    counter.textContent = count + (count === 1 ? ' item' : ' items');
    counter.textContent = count === 0 ? '0 items' : count + (count === 1 ? ' item' : ' items');
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function addItem(text) {
    const li = document.createElement('li');

    const textSpan = document.createElement('span');
    textSpan.className = 'item-text';
    textSpan.textContent = text;

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const editIcon = document.createElement('img');
    editIcon.src = EDIT_ICON;
    editIcon.className = 'emoji';
    editIcon.alt = 'Done';
    editIcon.title = 'Mark done';

    const deleteIcon = document.createElement('img');
    deleteIcon.src = DELETE_ICON;
    deleteIcon.className = 'emoji';
    deleteIcon.alt = 'Delete';
    deleteIcon.title = 'Delete item';

    editIcon.addEventListener('click', () => {
      textSpan.style.textDecoration = 'line-through';
      textSpan.style.opacity = '0.6';
      editIcon.style.pointerEvents = 'none';
      showToast('Done, good job! 🎉');
    });

    deleteIcon.addEventListener('click', () => {
      li.classList.add('removing');
      li.addEventListener('transitionend', () => {
        li.remove();
        updateCounter();
      }, { once: true });
      setTimeout(() => {
        if (li.parentNode) {
          li.remove();
          updateCounter();
        }
      }, 350);
    });

    actions.appendChild(editIcon);
    actions.appendChild(deleteIcon);

    li.appendChild(textSpan);
    li.appendChild(actions);

    list.appendChild(li);
    updateCounter();

    li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const value = inputBox.value.trim();

    if (value === '') {
      inputBox.classList.add('shake');
      setTimeout(() => inputBox.classList.remove('shake'), 450);
      showToast('Please enter an item');
      return;
    }

    inputBox.classList.add('pop');
    addItem(value);
    inputBox.value = '';
    inputBox.focus();
    setTimeout(() => inputBox.classList.remove('pop'), 300);
    showToast('✓ Item added');
  });

  clearBtn.addEventListener('click', function () {
    if (list.children.length === 0) {
      showToast('No items to clear');
      return;
    }

    const items = Array.from(list.children);
    items.forEach((li, i) => {
      li.classList.add('removing');
      setTimeout(() => {
        li.remove();
        if (i === items.length - 1) updateCounter();
      }, 60 * i + 250);
    });
    showToast('All items cleared');
  });

  let lastX = 0;
  let lastY = 0;
  let ticking = false;

  function handleTilt(x, y) {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rotateY = ((x - cx) / rect.width) * 14;
    const rotateX = ((cy - y) / rect.height) * 14;
    scene.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
  }

  document.addEventListener('mousemove', (e) => {
    lastX = e.clientX;
    lastY = e.clientY;
    if (!ticking) {
      requestAnimationFrame(() => {
        handleTilt(lastX, lastY);
        ticking = false;
      });
      ticking = true;
    }
  });

  card.addEventListener('mouseleave', () => {
    scene.style.transform = 'rotateY(0deg) rotateX(0deg)';
    scene.style.transition = 'transform 0.5s ease';
    setTimeout(() => (scene.style.transition = 'transform 0.15s ease-out'), 500);
  });

  updateCounter();
})();
