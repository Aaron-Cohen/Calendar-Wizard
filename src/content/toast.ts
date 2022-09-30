import {toastMessageDuration} from './constants';
export function toast(
    message : string,
) {
  const grid =
    document.getElementById('event-grid') ||
    document.getElementById('content') ||
    document.body;

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = 'show';

  const text = document.createElement('div');
  text.innerText = message;

  const exitButton = document.createElement('button');
  exitButton.innerText = 'x';
  exitButton.id = 'toast-button';

  exitButton.onclick = () => {
    toast.className = toast.className.replace('show', '');
    grid.removeChild(toast);
    text.remove();
    exitButton.remove();
    clearTimeout(timeout);
  };

  toast.appendChild(exitButton);
  toast.appendChild(text);
  grid.appendChild(toast);

  const timeout = setTimeout(() => {
    toast.className = toast.className.replace('show', '');
    grid.removeChild(toast);
    text.remove();
    exitButton.remove();
  }, toastMessageDuration);
}
