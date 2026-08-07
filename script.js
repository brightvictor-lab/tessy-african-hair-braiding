// TESSY AFRICAN HAIR BRAIDING — MAIN SCRIPT

const SB_URL  = 'YOUR_SUPABASE_URL';
const SB_ANON = 'YOUR_SUPABASE_ANON_KEY';

let sb;
try { sb = supabase.createClient(SB_URL, SB_ANON); } catch(e) {}

// ---- LOADER — waits for window load, works offline ----
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('out');
  }, 4500);
});

// ---- SESSION (only when online) ----
try {
  sb.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) showUser(session.user);
  }).catch(() => {});

  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) showUser(session.user);
  });
} catch(e) {}

// ---- GOOGLE SIGN IN ----
async function googleSignIn() {
  try {
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href }
    });
  } catch(e) {}
}

function showUser(user) {
  const btn = document.getElementById('signinBtn');
  if (btn) btn.style.display = 'none';
  const nu = document.getElementById('navUser');
  if (nu) nu.style.display = 'flex';
  const name = user.user_metadata?.full_name || user.email;
  const av = document.getElementById('navAv');
  if (av) {
    if (user.user_metadata?.avatar_url) {
      av.innerHTML = `<img src="${user.user_metadata.avatar_url}" alt="${name}"/>`;
    } else {
      av.textContent = name[0].toUpperCase();
    }
  }
  const nn = document.getElementById('navName');
  if (nn) nn.textContent = name.split(' ')[0];
}

// ---- NAV SCROLL ----
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('solid', window.scrollY > 60);
}, { passive: true });

// ---- HAMBURGER ----
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => menu.classList.toggle('open'));
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => menu.classList.remove('open'));
    });
  }
});

// ---- SCROLL REVEAL ----
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); ro.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

// ---- TOAST ----
let tt;
function showToast(m) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = m;
  t.classList.add('show');
  clearTimeout(tt);
  tt = setTimeout(() => t.classList.remove('show'), 3500);
}
