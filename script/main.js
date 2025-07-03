const desktop = document.getElementById('desktop');
const icons = document.querySelectorAll('.icon');
const windows = document.querySelectorAll('.window');

let zIndex = 10;

icons.forEach(icon => {
  icon.addEventListener('dblclick', () => {
    const targetId = icon.getAttribute('data-target');
    const win = document.getElementById(targetId);
    if (win) {
      win.style.display = 'flex';
      win.style.zIndex = ++zIndex;
    }
  });
});

windows.forEach(win => {
  const titlebar = win.querySelector('.titlebar');
  const closeBtn = win.querySelector('.close');

  closeBtn.addEventListener('click', () => {
    win.style.display = 'none';
  });

  titlebar.addEventListener('mousedown', e => {
    win.style.zIndex = ++zIndex;
    let offsetX = e.clientX - win.getBoundingClientRect().left;
    let offsetY = e.clientY - win.getBoundingClientRect().top;

    function moveHandler(e) {
      win.style.left = `${e.clientX - offsetX}px`;
      win.style.top = `${e.clientY - offsetY}px`;
    }

    function upHandler() {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    }

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  });
});
