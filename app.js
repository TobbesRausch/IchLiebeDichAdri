const messageElement = document.querySelector('#message');
const statusElement = document.querySelector('#status');
const photoElement = document.querySelector('#photo-image');
let messages = [];
let photos = [];
let lastMessage = '';
let currentPhoto = '';
let messageAnimation = 0;

function randomItem(items, previous = '') {
  const choices = items.length > 1 ? items.filter((item) => item !== previous) : items;
  return choices[Math.floor(Math.random() * choices.length)];
}

function showMessage(text) {
  const animation = ++messageAnimation;
  messageElement.classList.add('message--leaving');

  window.setTimeout(() => {
    if (animation !== messageAnimation) return;

    messageElement.replaceChildren();
    messageElement.setAttribute('aria-label', text);
    const content = document.createElement('span');
    content.className = 'message__content';
    content.setAttribute('aria-hidden', 'true');
    let letterIndex = 0;
    text.split(/(\s+)/u).forEach((part) => {
      if (/^\s+$/u.test(part)) {
        content.append(document.createTextNode(part));
        return;
      }
      const word = document.createElement('span');
      word.className = 'message__word';
      [...part].forEach((character) => {
        const letter = document.createElement('span');
        letter.className = 'message__letter';
        letter.textContent = character;
        letter.style.setProperty('--letter-index', letterIndex++);
        word.append(letter);
      });
      content.append(word);
    });
    messageElement.append(content);

    messageElement.classList.remove('message--leaving');
    messageElement.classList.add('message--entering');
    const animationDuration = 720 + Math.max(0, letterIndex - 1) * 28;
    window.setTimeout(() => {
      if (animation === messageAnimation) messageElement.classList.remove('message--entering');
    }, animationDuration);
  }, 320);
}

async function loadList(file) {
  try {
    const response = await fetch(`${file}?v=photos-refresh-1`, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Konnte ${file} nicht laden:`, error);
    return [];
  }
}

messages = await loadList('texte.json');
const listedPhotos = await loadList('Fotos/fotos.json');

async function imageIsAvailable(filename) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = `Fotos/${encodeURIComponent(filename)}`;
  });
}

const photoChecks = await Promise.all(
  listedPhotos.map(async (filename) => ({ filename, available: await imageIsAvailable(filename) }))
);
photos = photoChecks.filter((photo) => photo.available).map((photo) => photo.filename);
const missingPhotos = photoChecks.filter((photo) => !photo.available).map((photo) => photo.filename);

function showRandomPhoto() {
  currentPhoto = randomItem(photos, currentPhoto);
  photoElement.src = `Fotos/${encodeURIComponent(currentPhoto)}`;
  photoElement.alt = 'Hochzeitsfoto';
}

if (photos.length) showRandomPhoto();

document.querySelector('#love-button').addEventListener('click', () => {
  if (!messages.length) {
    showMessage('Füge Deine Gründe in texte.json hinzu.');
    return;
  }
  lastMessage = randomItem(messages, lastMessage);
  showMessage(lastMessage);
});

document.querySelector('#kiss-button').addEventListener('click', async () => {
  playKiss();
  if (!photos.length) {
    statusElement.textContent = 'Lege mindestens ein Bild in den Ordner Fotos und trage den Dateinamen in Fotos/fotos.json ein.';
    return;
  }
  showRandomPhoto();
  statusElement.textContent = missingPhotos.length
    ? `Nicht gefunden im Ordner Fotos: ${missingPhotos.join(', ')}`
    : '';
});

function playKiss() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const start = context.currentTime;
  // A tiny synthesized lip-smack, with no separate audio asset required.
  const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.09), context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const volume = context.createGain();
  noise.buffer = noiseBuffer;
  filter.type = 'bandpass'; filter.frequency.value = 1100; filter.Q.value = 1.2;
  volume.gain.setValueAtTime(0.0001, start);
  volume.gain.exponentialRampToValueAtTime(0.24, start + 0.008);
  volume.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);
  noise.connect(filter).connect(volume).connect(context.destination);
  noise.start(start); noise.stop(start + 0.1);
  noise.onended = () => context.close();
}
