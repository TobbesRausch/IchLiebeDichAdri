const messageElement = document.querySelector('#message');
const statusElement = document.querySelector('#status');
const photoElement = document.querySelector('#photo-image');
let messages = [];
let messageIndex = -1;
let photos = [];
let photoIndex = -1;

async function loadList(file) {
  try {
    const response = await fetch(`${file}?v=heic-jpeg-1`, { cache: 'no-cache' });
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

function showPhoto(index) {
  photoIndex = index;
  photoElement.src = `Fotos/${encodeURIComponent(photos[photoIndex])}`;
  photoElement.alt = `Hochzeitsfoto ${photoIndex + 1}`;
}

if (photos.length) showPhoto(0);

document.querySelector('#love-button').addEventListener('click', () => {
  if (!messages.length) {
    messageElement.textContent = 'Füge Deine Gründe in texte.json hinzu.';
    return;
  }
  // Show each reason once before starting a new shuffled round.
  if (messageIndex === -1 || messageIndex >= messages.length - 1) {
    messages = [...messages].sort(() => Math.random() - 0.5);
    messageIndex = 0;
  } else messageIndex += 1;
  messageElement.textContent = messages[messageIndex];
});

document.querySelector('#kiss-button').addEventListener('click', async () => {
  playKiss();
  if (!photos.length) {
    statusElement.textContent = 'Lege mindestens ein Bild in den Ordner Fotos und trage den Dateinamen in Fotos/fotos.json ein.';
    return;
  }
  showPhoto((photoIndex + 1) % photos.length);
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
