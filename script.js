// script.js — premium UI features: generate, lock, copy, save
const paletteEl = document.getElementById('palette');
const generateBtn = document.getElementById('generateBtn');
const saveBtn = document.getElementById('saveBtn');
const savedContainer = document.getElementById('saved');
const toast = document.getElementById('toast');
const copiedHexSpan = document.getElementById('copiedHex');

const PALETTE_SIZE = 5;          // number of colors
let current = [];                // {hex, locked}
let saved = JSON.parse(localStorage.getItem('savedPalettes') || '[]');

// utility: generate single hex
function generateColor(){
  const hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6,'0');
  return `#${hex}`;
}

// render palette UI from current array
function renderPalette(){
  paletteEl.innerHTML = '';
  current.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'color-card';
    card.style.background = c.hex;
    card.dataset.index = i;

    // lock icon
    const lock = document.createElement('div');
    lock.className = 'lock' + (c.locked ? ' locked' : '');
    lock.innerHTML = c.locked ? '🔒' : '🔓';
    lock.title = c.locked ? 'Unlock color' : 'Lock color';
    lock.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLock(i);
    });
    card.appendChild(lock);

    // hex label
    const hex = document.createElement('div');
    hex.className = 'hex';
    hex.textContent = c.hex;
    hex.title = 'Click to copy';
    // copy on click
    hex.addEventListener('click', (ev) => {
      ev.stopPropagation();
      copyToClipboard(c.hex);
    });

    card.appendChild(hex);

    // clicking the card also copies color
    card.addEventListener('click', () => copyToClipboard(c.hex));

    paletteEl.appendChild(card);
  });
}

// toggle lock of color
function toggleLock(i){
  current[i].locked = !current[i].locked;
  renderPalette();
}

// copy with toast
function copyToClipboard(hex){
  navigator.clipboard.writeText(hex).then(() => {
    copiedHexSpan.textContent = hex;
    toast.classList.add('show');
    setTimeout(()=> toast.classList.remove('show'), 1500);
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = hex;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    copiedHexSpan.textContent = hex;
    toast.classList.add('show');
    setTimeout(()=> toast.classList.remove('show'), 1500);
  });
}

// generate or refill palette
function generatePalette(){
  if(!current.length){
    current = Array.from({length: PALETTE_SIZE}).map(()=>({hex:generateColor(), locked:false}));
  } else {
    current = current.map(c => c.locked ? c : { hex: generateColor(), locked:false });
  }
  renderPalette();
}

// save palette to localStorage
function saveCurrent(){
  const hexes = current.map(c => c.hex);
  saved.unshift(hexes);
  // keep max 8
  if(saved.length > 8) saved.pop();
  localStorage.setItem('savedPalettes', JSON.stringify(saved));
  renderSaved();
}

// render saved list
function renderSaved(){
  savedContainer.innerHTML = '';
  saved.forEach((p, idx) => {
    const mini = document.createElement('div');
    mini.className = 'mini';
    mini.style.background = `linear-gradient(90deg, ${p.join(',')})`;
    mini.title = p.join('    ');
    mini.addEventListener('click', () => {
      current = p.map(h => ({hex:h, locked:false}));
      renderPalette();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    savedContainer.appendChild(mini);
  });
}

// initialize
function init(){
  // create blank palette
  current = Array.from({length: PALETTE_SIZE}).map(()=>({hex:generateColor(), locked:false}));
  renderPalette();
  renderSaved();
}

// events
generateBtn.addEventListener('click', generatePalette);
saveBtn.addEventListener('click', saveCurrent);

init();
