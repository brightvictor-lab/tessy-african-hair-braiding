// ================================================
// TESSY AFRICAN HAIR BRAIDING — BOOKING JS
// Steps: Terms→SignIn→Style→DateTime→Phone→Payment→Confirm
// ================================================

// SUPABASE
const SB_URL  = 'YOUR_SUPABASE_URL';
const SB_ANON = 'YOUR_SUPABASE_ANON_KEY';
const sb = supabase.createClient(SB_URL, SB_ANON);

// EMAILJS CREDENTIALS
// Each account has its own public key — initialized separately before sending
// to avoid conflicts causing double emails
const EJ_TESSY_KEY       = 'YOUR_EMAILJS_PUBLIC_KEY';  // Tessy account — welcome to customer
const EJ_TESSY_SERVICE   = 'YOUR_EMAILJS_SERVICE_ID';
const EJ_TESSY_TEMPLATE  = 'YOUR_WELCOME_TEMPLATE_ID';

const EJ_CHELSEA_KEY      = 'YOUR_EMAILJS_PUBLIC_KEY_2'; // Chelsea account — notify Tessy of booking
const EJ_CHELSEA_SERVICE  = 'YOUR_EMAILJS_SERVICE_ID_2';
const EJ_CHELSEA_TEMPLATE = 'YOUR_NOTIFY_TEMPLATE_ID';

// Rabus account keys (used in approve.html and reschedule.html only)
// NOT used here in booking.js

const MO = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// State
const S = {
  style: null, price: null,
  user:  null, phone: null,
  date:  null, time:  null,
  m: new Date().getMonth(),
  y: new Date().getFullYear()
};
const BC = {};

// Track if welcome email already sent this session
let welcomeSent = false;

// ================================================
// INIT
// ================================================
sb.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) setUser(session.user);
}).catch(() => {});

sb.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) setUser(session.user);
  if (event === 'SIGNED_OUT') { S.user = null; welcomeSent = false; }
});

// ================================================
// TERMS SCROLL
// ================================================
(function setupTerms() {
  const scroll = document.getElementById('termsScroll');
  const btn    = document.getElementById('agreeBtn');
  const hint   = document.getElementById('termsHint');
  if (!scroll || !btn) return;

  function check() {
    const atBottom = scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 80;
    const fitsBox  = scroll.scrollHeight <= scroll.clientHeight + 10;
    if (atBottom || fitsBox) {
      btn.disabled = false;
      if (hint) hint.innerHTML = '<i class="fas fa-check-circle" style="color:var(--gold2)"></i> Ready to continue';
    }
  }

  scroll.addEventListener('scroll', check, { passive: true });
  check();
  setTimeout(check, 800);
  setTimeout(check, 1600);
})();

// ================================================
// STEP NAVIGATION — handles 7 steps (0 to 6)
// ================================================
function nextStep(n) {
  const TOTAL = 7; // steps 0-6
  for (let i = 0; i < TOTAL; i++) {
    const c = document.getElementById('card' + i); if (c) c.classList.remove('active');
    const s = document.getElementById('st' + i);   if (s) s.classList.remove('active', 'done');
    const l = document.getElementById('sl' + i);   if (l) l.classList.remove('done');
  }
  for (let i = 0; i < n; i++) {
    const s = document.getElementById('st' + i); if (s) s.classList.add('done');
    const l = document.getElementById('sl' + i); if (l) l.classList.add('done');
  }
  const st = document.getElementById('st' + n); if (st) st.classList.add('active');
  const ca = document.getElementById('card' + n); if (ca) ca.classList.add('active');

  updateSide();
  if (n === 3) buildCal();
  if (n === 6) fillConfirm();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================================================
// GOOGLE SIGN IN
// ================================================
async function googleSignIn() {
  document.getElementById('signInForm').style.display    = 'none';
  document.getElementById('signInLoading').style.display = 'block';
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options:  { redirectTo: window.location.href }
  });
  if (error) {
    document.getElementById('signInForm').style.display    = 'block';
    document.getElementById('signInLoading').style.display = 'none';
    showToast('Sign in failed. Please try again.');
  }
}

function setUser(user) {
  S.user = {
    name:   user.user_metadata?.full_name || user.email,
    email:  user.email,
    avatar: user.user_metadata?.avatar_url
  };

  document.getElementById('signInForm').style.display    = 'none';
  document.getElementById('signInLoading').style.display = 'none';
  const strip = document.getElementById('signedIn');
  strip.classList.add('show');

  const av = document.getElementById('siAv');
  if (S.user.avatar) {
    av.innerHTML = `<img src="${S.user.avatar}" alt="${S.user.name}"/>`;
  } else {
    av.textContent = S.user.name[0].toUpperCase();
  }
  document.getElementById('siName').textContent  = S.user.name;
  document.getElementById('siEmail').textContent = S.user.email;

  // Enable Continue immediately
  document.getElementById('nx1').disabled = false;

  // Send welcome email ONCE per session using Tessy's EmailJS account
  if (!welcomeSent) {
    welcomeSent = true;
    // Use Tessy's key for this send only
    const ej = window.emailjs;
    ej.init(EJ_TESSY_KEY);
    ej.send(EJ_TESSY_SERVICE, EJ_TESSY_TEMPLATE, {
      to_name:   S.user.name,
      to_email:  S.user.email,
      from_name: 'Tessy African Hair Braiding'
    }).catch(() => {});
  }
}

async function signOut() {
  await sb.auth.signOut();
  S.user       = null;
  welcomeSent  = false;
  document.getElementById('signInForm').style.display = 'block';
  document.getElementById('signedIn').classList.remove('show');
  document.getElementById('nx1').disabled = true;
}

// ================================================
// STYLE
// ================================================
function pickStyle(el) {
  document.querySelectorAll('.sty').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
  S.style = el.dataset.s;
  S.price = el.dataset.p;
  document.getElementById('nx2').disabled = false;
  updateSide();
}

// ================================================
// CALENDAR
// ================================================
function buildCal() {
  const { m, y } = S;
  document.getElementById('calMonth').textContent = `${MO[m]} ${y}`;
  const g = document.getElementById('calGrid');
  g.innerHTML = '';
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
    const e = document.createElement('div');
    e.className = 'cal-dh'; e.textContent = d; g.appendChild(e);
  });
  const first = new Date(y, m, 1).getDay();
  const total  = new Date(y, m + 1, 0).getDate();
  const today  = new Date();
  for (let i = 0; i < first; i++) {
    const e = document.createElement('div'); e.className = 'cal-d emp'; g.appendChild(e);
  }
  for (let d = 1; d <= total; d++) {
    const el = document.createElement('div');
    el.className  = 'cal-d'; el.textContent = d;
    const dt   = new Date(y, m, d);
    const past = dt < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const mon  = dt.getDay() === 1;
    if (past || mon) {
      el.classList.add('past');
      if (mon) el.title = 'Closed on Mondays';
    } else {
      if (dt.toDateString() === today.toDateString()) el.classList.add('today');
      el.classList.add('has');
      el.addEventListener('click', () => {
        g.querySelectorAll('.sel').forEach(x => x.classList.remove('sel'));
        el.classList.add('sel');
        const ds = `${MO[m]} ${d}, ${y}`;
        S.date = ds; S.time = null;
        document.getElementById('nx3').disabled = true;
        buildSlots(ds, dt.getDay()); updateSide();
      });
    }
    g.appendChild(el);
  }
}

function chMon(d) {
  S.m += d;
  if (S.m > 11) { S.m = 0;  S.y++; }
  if (S.m < 0)  { S.m = 11; S.y--; }
  buildCal();
}

function buildSlots(ds, dow) {
  document.getElementById('slotsLbl').textContent = ds;
  if (!BC[ds]) BC[ds] = ['10:30 AM', '2:00 PM'].filter(() => Math.random() > 0.5);
  const bk = BC[ds];
  let all;
  if (dow === 6)      all = ['7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];
  else if (dow === 0) all = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM'];
  else                all = ['9:30 AM','10:30 AM','11:30 AM','12:30 PM','1:30 PM','2:30 PM','3:30 PM'];
  document.getElementById('slotsGrid').innerHTML = all.map(s => {
    if (bk.includes(s)) return `<div class="slot booked">${s} · Full</div>`;
    return `<div class="slot" onclick="pickSlot(this,'${s}')">${s}</div>`;
  }).join('');
}

function pickSlot(el, t) {
  document.querySelectorAll('.slot.sel').forEach(x => x.classList.remove('sel'));
  el.classList.add('sel'); S.time = t;
  document.getElementById('nx3').disabled = false; updateSide();
}

// ================================================
// PHONE — validates and enables continue
// ================================================
function validatePhone() {
  const ph  = document.getElementById('phoneInput')?.value.trim();
  S.phone   = ph || null;
  const nx4 = document.getElementById('nx4');
  if (nx4) nx4.disabled = !(ph && ph.length >= 7);
}

// ================================================
// COPY PAYMENT
// ================================================
function copyIt(btn, val, name) {
  navigator.clipboard.writeText(val).then(() => {
    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    btn.classList.add('copied');
    showToast(`${name} copied! 💛`);
    setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; btn.classList.remove('copied'); }, 2500);
  }).catch(() => showToast('Please copy manually'));
}

// ================================================
// FILL CONFIRM
// ================================================
function fillConfirm() {
  document.getElementById('cfStyle').textContent = S.style        || '—';
  document.getElementById('cfDate').textContent  = S.date         || '—';
  document.getElementById('cfTime').textContent  = S.time         || '—';
  document.getElementById('cfName').textContent  = S.user?.name   || '—';
  document.getElementById('cfEmail').textContent = S.user?.email  || '—';
  document.getElementById('cfPhone').textContent = S.phone        || '—';
}

// ================================================
// CONFIRM BOOKING
// ================================================
async function doConfirm() {
  const ref = 'TESSY-' + Math.floor(100000 + Math.random() * 900000);

  // 1. Save to Supabase
  try {
    await sb.from('bookings').insert({
      name:        S.user?.name,
      email:       S.user?.email,
      phone:       S.phone || '',
      style:       S.style,
      date:        S.date,
      time:        S.time,
      status:      'pending',
      booking_ref: ref
    });
  } catch (e) {}

  // 2. Notify Tessy — use Chelsea's key separately to avoid conflict
  try {
    const ej = window.emailjs;
    ej.init(EJ_CHELSEA_KEY);
    await ej.send(EJ_CHELSEA_SERVICE, EJ_CHELSEA_TEMPLATE, {
      customer_name:  S.user?.name,
      customer_email: S.user?.email,
      customer_phone: S.phone || 'Not provided',
      style:          S.style,
      date:           S.date,
      time:           S.time,
      booking_ref:    ref
    });
  } catch (e) {}

  // 3. Show success
  document.getElementById('doneRef').textContent   = `REF: ${ref}`;
  document.getElementById('doneStyle').textContent = S.style;
  document.getElementById('doneDT').textContent    = `${S.date} at ${S.time}`;

  const TOTAL = 7;
  for (let i = 0; i < TOTAL; i++) {
    const c = document.getElementById('card' + i); if (c) c.classList.remove('active');
    const s = document.getElementById('st' + i);   if (s) s.classList.add('done');
    const l = document.getElementById('sl' + i);   if (l) l.classList.add('done');
  }
  const done = document.getElementById('cardDone');
  done.style.display = 'block'; done.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================================================
// SIDEBAR
// ================================================
function updateSide() {
  if (!S.style) return;
  document.getElementById('sideSummary').classList.add('show');
  document.getElementById('ssStyle').textContent = S.style;
  document.getElementById('ssDate').textContent  = S.date  || 'Not selected';
  document.getElementById('ssTime').textContent  = S.time  || 'Not selected';
}

// ================================================
// TOAST
// ================================================
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

buildCal();
