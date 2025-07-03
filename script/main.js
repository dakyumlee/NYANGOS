const icons = document.querySelectorAll('.icon');
const windows = document.querySelectorAll('.window');

let zCounter = 100;

icons.forEach(icon => {
  icon.addEventListener('dblclick', () => {
    const targetId = icon.dataset.app;
    const win = document.getElementById(targetId);
    if (win) {
      win.style.display = 'flex';
      win.style.zIndex = ++zCounter;
    }
  });
});

windows.forEach(win => {
  const closeBtn = win.querySelector('.close');
  closeBtn.addEventListener('click', () => {
    win.style.display = 'none';
  });

  const titleBar = win.querySelector('.titlebar');
  let isDragging = false;
  let offsetX, offsetY;

  titleBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    win.style.zIndex = ++zCounter;
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      win.style.left = `${e.clientX - offsetX}px`;
      win.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
});
