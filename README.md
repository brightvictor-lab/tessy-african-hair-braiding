# Tessy African Hair Braiding — Booking Website

A full booking website for an African hair braiding salon in Lindenwold, NJ. Customers browse styles, sign in with Google, pick a date and time, and submit a booking request — the owner is notified instantly by email and can approve or reschedule in one click.

**🔗 Live site:** https://tessyafricanhairbraiding.netlify.app

---

## Features

- **Google Sign-In** via Supabase Auth, with session persistence across pages
- **7-step booking flow:** Terms → Sign In → Style → Date/Time → Phone → Payment → Confirm
- **Smart calendar** that blocks past dates and closed days, with time slots that vary by day of the week
- **Approve / reschedule flow:** each booking notifies the owner by email; the owner approves or proposes a new time in one click, and the customer is automatically emailed the outcome
- **Filterable gallery** with a full-screen lightbox (keyboard + touch-swipe navigation)
- Fully responsive, luxury black-and-gold design

---

## Tech Stack

- **Front-end:** HTML5, CSS3 (Flexbox / Grid), vanilla JavaScript — no build step
- **Auth & Database:** [Supabase](https://supabase.com) (Postgres + Google OAuth)
- **Transactional email:** [EmailJS](https://www.emailjs.com) (welcome, owner-notify, approve, reschedule)
- **Hosting:** Netlify (static)

---

## Configuration

This repo ships with **placeholder credentials** — no real keys are included. To run it yourself, plug in your own:

**`script.js` and `booking.js`** — Supabase:
```js
const SB_URL  = 'YOUR_SUPABASE_URL';
const SB_ANON = 'YOUR_SUPABASE_ANON_KEY';
```

**`booking.js`, `approve.html`, `reschedule.html`** — EmailJS keys, service IDs, and template IDs (all marked `YOUR_...`).

**`booking.html`** — payment handles (`YOUR_CASHAPP_TAG`).

### Supabase table

```sql
create table bookings (
  id          bigint generated always as identity primary key,
  created_at  timestamptz default now(),
  name        text,
  email       text,
  phone       text,
  style       text,
  date        text,
  time        text,
  status      text default 'pending',
  booking_ref text
);
```

> **Security note:** the Supabase `anon` key is safe to expose in front-end code **only when Row-Level Security (RLS) is enabled** on your tables. Enable RLS and add an insert policy so the public can create bookings but cannot read or modify them.

---

## Running locally

It's a static site — no install needed. Clone the repo, add your credentials, and open `index.html`, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Add your own images to an `/images` folder (`logo.png`, `g1.jpg`–`g25.jpg`).

---

## About

Built by **Victor Bright** — Chronicle Web. One of several production booking sites delivered for US-based salon businesses.
