// TESSY AFRICAN HAIR BRAIDING — GALLERY JS

const TOTAL = 25;
let cur = 0;

function openLight(idx) {
  cur = idx;
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lbImg');
  const counter = document.getElementById('lbCounter');

  // Set image immediately
  img.src = 'images/g' + (cur + 1) + '.jpg';
  counter.textContent = (cur + 1) + ' / ' + TOTAL;

  // Show lightbox
  lb.style.display = 'flex';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      lb.classList.add('open');
    });
  });
  document.body.style.overflow = 'hidden';
}

function closeLight() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  setTimeout(() => {
    lb.style.display = 'none';
    document.body.style.overflow = '';
  }, 320);
}

function moveLight(dir) {
  cur = (cur + dir + TOTAL) % TOTAL;
  const img     = document.getElementById('lbImg');
  const counter = document.getElementById('lbCounter');

  // Smooth swap
  img.style.opacity   = '0';
  img.style.transform = 'scale(0.95)';

  setTimeout(() => {
    img.src = 'images/g' + (cur + 1) + '.jpg';
    img.style.opacity   = '1';
    img.style.transform = 'scale(1)';
  }, 180);

  counter.textContent = (cur + 1) + ' / ' + TOTAL;
}

// Keyboard navigation
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb || lb.style.display === 'none') return;
  if (e.key === 'ArrowRight') moveLight(1);
  if (e.key === 'ArrowLeft')  moveLight(-1);
  if (e.key === 'Escape')     closeLight();
});

// Touch swipe on mobile
let txStart = 0;
document.addEventListener('touchstart', e => {
  txStart = e.touches[0].clientX;
}, { passive: true });

document.addEventListener('touchend', e => {
  const lb = document.getElementById('lightbox');
  if (!lb || lb.style.display === 'none') return;
  const diff = txStart - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) moveLight(diff > 0 ? 1 : -1);
}, { passive: true });
