// DOM layer: tour panels, floor plan, language, cursor, project sheet, loader.
import { T, STOPS, KEYS, ROOMS, PROJECTS, SHOWCASES, WORK, EDU, LINKS, projectName, projectIndex } from './content.js';

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad2 = (n) => String(n).padStart(2, '0');
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const ARROW = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" stroke="currentColor" stroke-width="1.5"/></svg>';

function storeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function storeSet(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } }

export function createUI() {
  const listeners = { lang: [], open: [], close: [], sound: [], game: [] };
  const emit = (name, ...a) => listeners[name].forEach((fn) => fn(...a));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lang = storeGet('jdg-lang') || ((navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en');
  if (!T[lang]) lang = 'en';

  const tour = $('#tour');
  const plan = $('#plan');
  const ficha = $('#ficha');
  let anchors = [];
  let panels = [];
  let planButtons = [];
  let visitor = null;
  let openProject = -1;

  // ---------- rendering ----------
  function roomLabel(room) {
    const t = T[lang];
    return `${t.ui.room} ${pad2(room + 1)} · ${t.rooms[ROOMS[room]]}`;
  }

  function panelFor(stop, i) {
    const t = T[lang];
    if (stop.id === 'entrance') {
      const w = t.hero.words;
      return `
        <div class="hero-copy" data-panel="${i}">
          <p class="eyebrow reveal">${esc(t.hero.eyebrow)}</p>
          <h1 class="reveal"><span>${esc(w[0])}</span> <span class="iri">${esc(w[1])}</span> <span>${esc(w[2])}</span> <span class="iri">${esc(w[3])}</span></h1>
          <p class="hero-sub reveal">${esc(t.hero.sub)}</p>
          <p class="hero-sub fallback-note">${esc(t.ui.fallback)}</p>
        </div>
        <div class="cue" aria-hidden="true"><i></i><span>${esc(t.ui.scroll)}</span></div>`;
    }
    if (stop.id === 'about') {
      return `
        <article class="panel" data-panel="${i}">
          <div class="cat"><span class="inv">JDG-A01</span><span>${esc(roomLabel(1))}</span></div>
          <div class="who">
            <img src="assets/portrait.webp" alt="${esc(t.about.portrait)}" width="76" height="101">
            <div><p class="artist">${esc(t.about.portrait)}</p><h2>Juan David</h2></div>
          </div>
          ${t.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
          <div class="chips">${t.about.interests.map((x) => `<span>${esc(x)}</span>`).join('')}</div>
          <div class="credit"><span>${esc(t.ui.collection)}</span><span>${esc(t.ui.tryKeys)} →</span></div>
        </article>`;
    }
    if (stop.id === 'edu') {
      return `
        <article class="panel" data-panel="${i}">
          <div class="cat"><span class="inv">JDG-T01</span><span>${esc(roomLabel(2))}</span></div>
          <h2 class="plain">${esc(t.edu.title)}</h2>
          <p>${esc(t.edu.lead)}</p>
          <ol class="rows">
            ${EDU.map((e) => `
              <li class="${e.future ? 'future' : ''}">
                <span class="k">${e.year}</span>
                <span class="v">${esc(t.edu[e.key].name)}<small>${esc(t.edu[e.key].note)}</small></span>
                <span class="d"></span>
              </li>`).join('')}
          </ol>
        </article>`;
    }
    if (stop.id === 'work') {
      const total = WORK.reduce((s, w) => s + w.months, 0);
      return `
        <article class="panel" data-panel="${i}">
          <div class="cat"><span class="inv">JDG-T02</span><span>${esc(roomLabel(2))}</span></div>
          <h2 class="plain">${esc(t.work.title)}</h2>
          <p>${esc(t.work.lead)}</p>
          <ol class="rows">
            ${WORK.map((w) => `
              <li>
                <span class="k">${(w.months * 0.2).toFixed(2)} m</span>
                <span class="v">${esc(t.work[w.key])}<span class="bar"><i style="width:${(w.months / 12) * 100}%"></i></span></span>
                <span class="d">${esc(t.months(w.months))}</span>
              </li>`).join('')}
          </ol>
          <div class="credit"><span>${esc(t.ui.scale)}</span><span>${esc(t.ui.total)} · ${esc(t.monthsShort(total))}</span></div>
        </article>`;
    }
    if (stop.showcase !== undefined) {
      const sc = SHOWCASES[stop.showcase];
      const st = t.showcase[sc.id];
      const items = sc.items.map((id) => PROJECTS[projectIndex(id)]);
      const host = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const tag = (p) => `<span class="tag">${esc(t.showcase.madeWith(p.tech))}</span>`;
      const inv = items.length > 1 ? `${items[0].inv} — ${items[items.length - 1].inv.slice(-3)}` : items[0].inv;
      if (items.length > 1) {
        return `
        <article class="panel showcase" data-panel="${i}">
          <div class="cat"><span class="inv">${inv}</span><span>${esc(roomLabel(sc.room))}</span></div>
          <p class="artist">${esc(st.kicker || t.showcase.tool)}</p>
          <h2 class="plain">${esc(st.title)}</h2>
          ${st.lead ? `<p>${esc(st.lead)}</p>` : ''}
          <ul class="works">
            ${items.map((p) => `
              <li>
                <button type="button" class="work" data-open="${projectIndex(p.id)}">
                  <span class="w-name">${esc(projectName(p, lang))}</span>
                  <span class="w-meta">${esc(t.projects[p.id].type)}${p.year ? ` · ${p.year}` : ''} · ${esc(host(p.url))}</span>
                </button>
                <a class="w-link" href="${p.url}" target="_blank" rel="noopener" aria-label="${esc(t.ui.visit)}: ${esc(projectName(p, lang))}">${ARROW}</a>
              </li>`).join('')}
          </ul>
          <div class="credit"><span>${tag(items[0])}</span><span>${items.length} ${esc(lang === 'es' ? 'proyectos' : 'projects')}</span></div>
        </article>`;
      }
      const p = items[0];
      const pt = t.projects[p.id];
      const idx = projectIndex(p.id);
      const note = p.private ? t.showcase.private : !p.url ? t.showcase.inDev : '';
      return `
        <article class="panel showcase${sc.featured ? ' featured' : ''}" data-panel="${i}">
          <div class="cat"><span class="inv">${p.inv}</span><span>${esc(roomLabel(sc.room))}</span></div>
          ${st.lead ? `<p class="lead">${esc(st.lead)}</p>` : ''}
          ${sc.featured ? `<p class="badges"><span class="badge">${esc(t.showcase.featured)}</span></p>` : ''}
          ${p.founder ? `<p class="badges"><span class="badge">${esc(t.showcase.founder)}</span><span class="badge live">${esc(t.showcase.live)}</span></p>` : ''}
          ${p.social ? `<p class="badges"><span class="badge">${esc(t.showcase.socialBadge)}</span><span class="badge live">${esc(t.showcase.live)}</span></p>` : ''}
          <p class="artist">${esc(pt.role || t.artist)}</p>
          <h2>${esc(projectName(p, lang))}</h2>
          <dl class="meta"><dt>${esc(t.ui.type)}</dt><dd>${esc(pt.type)}</dd><dt>${esc(t.ui.medium)}</dt><dd>${esc(p.tech)}</dd></dl>
          ${st.highlights ? `<ul class="stats">${st.highlights.map(([n, l]) => `<li><b>${esc(n)}</b><span>${esc(l)}</span></li>`).join('')}</ul>` : ''}
          <p>${esc(pt.desc)}</p>
          <div class="actions">
            <button type="button" class="btn primary" data-open="${idx}">${esc(t.ui.viewPiece)}</button>
            ${p.url ? `<a class="btn" href="${p.url}" target="_blank" rel="noopener">${esc(t.ui.visit)} ${ARROW}</a>` : `<span class="note">${esc(note)}</span>`}
            ${p.repo ? `<a class="btn" href="${p.repo}" target="_blank" rel="noopener">${esc(t.ui.code)} ${ARROW}</a>` : ''}
          </div>
          <div class="credit"><span>${tag(p)}</span><span>${esc(t.ui.collection)}</span></div>
        </article>`;
    }
    if (stop.id === 'contact') {
      const links = [
        ['GitHub', '/Juandagarc', LINKS.github],
        ['LinkedIn', '/in/juandagarc', LINKS.linkedin],
        ['Instagram', '@juanda_garc', LINKS.instagram],
      ];
      return `
        <article class="panel" data-panel="${i}">
          <div class="cat"><span class="inv">JDG-C01</span><span>${esc(roomLabel(ROOMS.indexOf('contact')))}</span></div>
          <h2 class="plain">${esc(t.contact.title)}</h2>
          <p>${esc(t.contact.body)}</p>
          <ul class="links">
            ${links.map(([n, h, u]) => `<li><a href="${u}" target="_blank" rel="noopener" data-link="${n}"><span>${esc(n)}</span><small>${esc(h)} ↗</small></a></li>`).join('')}
            <li><button type="button" data-contact><span>${esc(t.ui.write)}</span><small>${esc(LINKS.email)} →</small></button></li>
          </ul>
          <div class="actions"><button type="button" class="btn primary" data-contact>${esc(t.contact.form.title)}</button><button type="button" class="btn" data-game>${esc(t.game.cta)}</button></div>
          <div class="credit"><span>${esc(t.ui.collection)}</span><span>© Juandagarc</span></div>
          <p class="fineprint"><a href="https://doi.org/10.5281/zenodo.22010411" target="_blank" rel="noopener">${esc(t.contact.credit)}</a></p>
          <p class="fineprint">${esc(t.contact.music[0])}<a href="https://commons.wikimedia.org/wiki/File:Chopin_Ballade_no._1_in_G_minor,_Op._23_Frank_L%C3%A9vy.mp3" target="_blank" rel="noopener">${esc(t.contact.music[1])}</a>${esc(t.contact.music[2])}<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">${esc(t.contact.music[3])}</a>${esc(t.contact.music[4])}</p>
        </article>`;
    }
    return '';
  }

  function render() {
    const t = T[lang];
    document.documentElement.lang = lang;
    document.title = t.ui.pageTitle;
    tour.innerHTML = STOPS.map((s, i) => {
      const n = KEYS.filter((k) => k.stop === i).length;
      const cls = ['stop', s.side === 'hero' ? 'hero' : '', i === STOPS.length - 1 ? 'last' : '', n > 1 ? 'multi' : ''].join(' ').trim();
      const id = s.id === 'entrance' ? 'entrance' : s.id;
      return `<section class="${cls}" id="${id}" data-stop="${i}" data-side="${s.side}"${n > 1 ? ` style="--n:${n}"` : ''}>${panelFor(s, i)}</section>`;
    }).join('');
    panels = [...tour.querySelectorAll('[data-panel]')];

    plan.setAttribute('aria-label', t.ui.map);
    plan.innerHTML = `
      <p class="plan-title">${esc(t.ui.map)}</p>
      <div class="rail"><ol>
        ${ROOMS.map((r, i) => `
          <li><button type="button" data-room="${i}">
            <span class="shape ${r === 'journey' ? 'bar' : r === 'featured' ? 'dia' : r === 'career' || r === 'freelance' ? 'ring' : 'sq'}"></span>
            <span class="num">${pad2(i + 1)}</span><span class="name">${esc(t.rooms[r])}</span>
          </button></li>`).join('')}
      </ol><span class="visitor" aria-hidden="true"></span></div>`;
    planButtons = [...plan.querySelectorAll('button[data-room]')];
    visitor = plan.querySelector('.visitor');

    document.querySelectorAll('.seg [data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    $('#loader-title').textContent = t.ui.loading;
    $('#loader-sub').textContent = t.ui.loadingSub;
    $('#ficha-close-lbl').textContent = t.ui.close;
    updateSoundLabel();
    if (openProject >= 0) fillFicha(openProject);
    measure();
  }

  // ---------- scroll anchors ----------
  // One anchor per camera key. A stop with a row of laptops is taller by STEP_VH per extra laptop,
  // its panel stays pinned (CSS sticky) and the camera moves on to the next laptop every STEP_VH.
  const STEP_VH = 0.7;
  function measure() {
    const vh = window.innerHeight;
    const sections = [...tour.querySelectorAll('.stop')];
    for (const el of sections) {
      const panel = el.classList.contains('multi') && el.querySelector('.panel');
      if (panel) el.style.setProperty('--ph', `${panel.offsetHeight}px`);
    }
    const max = Math.max(0, document.documentElement.scrollHeight - vh);
    anchors = KEYS.map((key) => {
      const el = sections[key.stop];
      const extra = (key.of - 1) * STEP_VH * vh;
      const a = el.offsetTop + (el.offsetHeight - extra) / 2 - vh / 2 + key.sub * STEP_VH * vh;
      return Math.min(max, Math.max(0, a));
    });
    anchors[0] = 0;
    anchors[anchors.length - 1] = max;
  }

  // scroll → camera key float; panelFloat turns it into stops, holding still while a row is walked
  function panelFloat(k) {
    const n = KEYS.length - 1;
    const i = Math.min(n, Math.max(0, Math.floor(k)));
    const j = Math.min(n, i + 1);
    const a = KEYS[i].stop, b = KEYS[j].stop;
    return a + (b - a) * (k - i);
  }

  function stopFloat() {
    const y = window.scrollY;
    const n = anchors.length;
    if (!n) return 0;
    if (y <= anchors[0]) return 0;
    for (let i = 0; i < n - 1; i++) {
      if (y < anchors[i + 1]) {
        const f = (y - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i]);
        return i + f;
      }
    }
    return n - 1;
  }

  function scrollToStop(i) {
    measure();
    const k = Math.max(0, KEYS.findIndex((key) => key.stop === i));
    window.scrollTo({ top: anchors[k], behavior: reduced ? 'auto' : 'smooth' });
  }

  // ---------- per-frame ----------
  let lastRoom = -1;
  let lastKey = -1;
  function frame(k) {
    const s = panelFloat(k);
    // in a row of laptops, the work in front of the camera is marked in its panel's list
    const key = Math.min(KEYS.length - 1, Math.max(0, Math.round(k)));
    if (key !== lastKey) {
      lastKey = key;
      for (const el of panels) {
        const own = +el.dataset.panel === KEYS[key].stop;
        el.querySelectorAll('.works li').forEach((li, j) => li.toggleAttribute('data-current', own && j === KEYS[key].item));
      }
    }
    // panels fade with their distance (in stops) from the camera position
    for (const el of panels) {
      const i = +el.dataset.panel;
      const d = Math.abs(s - i);
      const o = i === 0 ? 1 - smooth(0.05, 0.45, d) : 1 - smooth(0.32, 0.62, d);
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    }
    const n = STOPS.length - 1;
    $('#progress').style.transform = `scaleX(${(k / (KEYS.length - 1)).toFixed(4)})`;

    const i0 = Math.floor(s), i1 = Math.min(n, i0 + 1), f = s - i0;
    const roomF = STOPS[i0].room + (STOPS[i1].room - STOPS[i0].room) * f;
    const room = STOPS[Math.round(s)].room;
    if (planButtons.length && visitor) {
      const olTop = planButtons[0].closest('.rail').getBoundingClientRect().top;
      const ys = planButtons.map((b) => { const r = b.querySelector('.shape').getBoundingClientRect(); return r.top + r.height / 2 - olTop; });
      const r0 = Math.floor(roomF), r1 = Math.min(ys.length - 1, r0 + 1);
      const y = ys[r0] + (ys[r1] - ys[r0]) * (roomF - r0);
      visitor.style.transform = `translateY(${(y - 4.5).toFixed(1)}px)`;
    }
    if (room !== lastRoom) {
      lastRoom = room;
      planButtons.forEach((b, k) => b.setAttribute('aria-current', String(k === room)));
      $('#now-num').textContent = pad2(room + 1);
      $('#now-name').textContent = T[lang].rooms[ROOMS[room]];
    }
    return room;
  }

  // ---------- language ----------
  function setLang(l) {
    if (!T[l] || l === lang) return;
    const s = stopFloat();
    lang = l;
    storeSet('jdg-lang', l);
    lastRoom = -1;
    lastKey = -1;
    render();
    fillContact();
    // keep the visitor in the same place after the text reflows
    const i = Math.round(s);
    window.scrollTo({ top: anchors[i], behavior: 'auto' });
    emit('lang', l);
  }
  document.querySelectorAll('.seg [data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

  // ---------- navigation ----------
  plan.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-room]');
    if (!b) return;
    const room = +b.dataset.room;
    scrollToStop(STOPS.findIndex((s) => s.room === room));
  });
  $('.brand').addEventListener('click', (e) => { e.preventDefault(); scrollToStop(0); });
  tour.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open]');
    if (b) requestProject(+b.dataset.open);
    if (e.target.closest('[data-game]')) emit('game');
    if (e.target.closest('[data-contact]')) openContact();
  });

  // ---------- project sheet ----------
  function fillFicha(i) {
    const t = T[lang];
    const p = PROJECTS[i];
    const pt = t.projects[p.id];
    const room = SHOWCASES.find((sc) => sc.items.includes(p.id))?.room ?? 3;
    const img = $('#ficha-img');
    img.hidden = !p.img;
    if (p.img) { img.src = p.img; img.alt = projectName(p, lang); }
    const card = $('#ficha-card');
    card.hidden = !!p.img;
    card.innerHTML = p.img ? '' : `<strong>${esc(projectName(p, lang))}</strong><span>${esc(p.url ? t.showcase.noCapture : t.showcase.inDev)}</span>`;
    $('#ficha-inv').textContent = p.inv;
    $('#ficha-room').textContent = roomLabel(room);
    $('#ficha-artist').textContent = pt.role || t.artist;
    $('#ficha-title').textContent = projectName(p, lang);
    const where = p.url ? `<dt>URL</dt><dd>${esc(p.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</dd>` : '';
    const status = p.founder || p.social ? `<dt>${esc(lang === 'es' ? 'Estado' : 'Status')}</dt><dd>${esc(p.founder ? t.showcase.founder : t.showcase.socialBadge)} · ${esc(t.showcase.live)}</dd>` : '';
    $('#ficha-meta').innerHTML = `<dt>${esc(t.ui.type)}</dt><dd>${esc(pt.type)}</dd><dt>${esc(t.ui.medium)}</dt><dd>${esc(p.tech)}</dd>${status}${where}`;
    $('#ficha-desc').textContent = pt.desc;
    const link = $('#ficha-link');
    link.hidden = !p.url;
    if (p.url) { link.href = p.url; link.innerHTML = `${esc(t.ui.visit)} ${ARROW}`; }
    const code = $('#ficha-code');
    code.hidden = !p.repo;
    if (p.repo) { code.href = p.repo; code.innerHTML = `${esc(t.ui.code)} ${ARROW}`; }
    const note = $('#ficha-note');
    note.hidden = !!p.url;
    note.textContent = p.private ? t.showcase.private : t.showcase.inDev;
    $('#ficha-credit').textContent = t.showcase.madeWith(p.tech);
  }

  function requestProject(i) {
    if (i < 0 || i >= PROJECTS.length) return;
    openProject = i;
    fillFicha(i);
    if (!ficha.open) ficha.showModal();
    document.documentElement.style.overflow = 'hidden';
    emit('open', i);
  }

  function closeProject() {
    if (ficha.open) ficha.close();
  }
  ficha.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    const i = openProject;
    openProject = -1;
    emit('close', i);
  });
  $('#ficha-close').addEventListener('click', closeProject);
  ficha.addEventListener('click', (e) => { if (e.target === ficha) closeProject(); });

  // ---------- contact form ----------
  // Sent through FormSubmit to my inbox; if that fails (offline, blocked) the address is right there to copy.
  const contact = $('#cf-dialog');
  const form = $('#cf');
  const status = $('#cf-status');
  function fillContact() {
    const f = T[lang].contact.form;
    $('#cf-close-lbl').textContent = T[lang].ui.close;
    $('#cf-kicker').textContent = f.kicker;
    $('#cf-title').textContent = f.title;
    $('#cf-lead').textContent = f.lead;
    $('#cf-l-name').textContent = f.name;
    $('#cf-l-email').textContent = f.email;
    $('#cf-l-subject').innerHTML = `${esc(f.subject)} <i>· ${esc(f.optional)}</i>`;
    $('#cf-l-message').textContent = f.message;
    $('#cf-direct').textContent = f.direct;
    $('#cf-copy').textContent = f.copy;
    const send = $('#cf-send');
    if (!send.disabled) send.textContent = f.send;
  }
  const say = (text, kind = '') => { status.textContent = text; status.className = `cf-status ${kind}`.trim(); };
  function openContact() {
    fillContact();
    if (!contact.open) contact.showModal();
    document.documentElement.style.overflow = 'hidden';
    form.elements.name.focus({ preventScroll: true });
  }
  contact.addEventListener('close', () => { document.documentElement.style.overflow = ''; });
  $('#cf-close').addEventListener('click', () => contact.close());
  contact.addEventListener('click', (e) => { if (e.target === contact) contact.close(); });
  $('#cf-copy').addEventListener('click', async () => {
    const f = T[lang].contact.form, b = $('#cf-copy');
    try { await navigator.clipboard.writeText(LINKS.email); b.textContent = f.copied; }
    catch { getSelection().selectAllChildren($('#cf-mail')); }
    setTimeout(() => { b.textContent = T[lang].contact.form.copy; }, 1600);
  });
  form.addEventListener('input', (e) => e.target.removeAttribute('aria-invalid'));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = T[lang].contact.form, el = form.elements;
    form.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    const v = { name: el.name.value.trim(), email: el.email.value.trim(), subject: el.subject.value.trim(), message: el.message.value.trim() };
    const bad = [['name', v.name.length > 1], ['email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)], ['message', v.message.length > 4]].filter(([, ok]) => !ok).map(([k]) => k);
    bad.forEach((k) => el[k].setAttribute('aria-invalid', 'true'));
    if (bad.length) { say(f.invalid, 'err'); el[bad[0]].focus(); return; }
    const send = $('#cf-send');
    send.disabled = true; send.textContent = f.sending; say('');
    try {
      if (el._honey.value) throw new Error('bot'); // a bot filled the hidden field: drop it quietly
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), 15000);
      const res = await fetch(LINKS.form, {
        method: 'POST', signal: abort.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: v.name, email: v.email, subject: v.subject || '—', message: v.message,
          _subject: `Portafolio · ${v.subject || v.name}`, _template: 'table', _captcha: 'false',
        }),
      });
      clearTimeout(timer);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) !== 'true') throw new Error(data.message || res.status);
      form.reset();
      say(T[lang].contact.form.sent, 'ok');
    } catch (err) {
      if (err.message === 'bot') { form.reset(); say(T[lang].contact.form.sent, 'ok'); }
      else say(T[lang].contact.form.error, 'err');
    } finally {
      send.disabled = false; send.textContent = T[lang].contact.form.send;
    }
  });

  // ---------- sound ----------
  let soundOn = false;
  function updateSoundLabel() {
    const t = T[lang];
    $('#sound').setAttribute('aria-pressed', String(soundOn));
    $('#sound-label').textContent = soundOn ? t.ui.soundOn : t.ui.soundOff;
    $('#sound').setAttribute('aria-label', soundOn ? t.ui.soundOn : t.ui.soundOff);
  }
  $('#sound').addEventListener('click', () => { soundOn = !soundOn; updateSoundLabel(); emit('sound', soundOn); });

  // ---------- cursor ----------
  const cursor = $('#cursor');
  const cursorLabel = $('#cursor-label');
  const pointer = { x: innerWidth / 2, y: innerHeight / 2, cx: innerWidth / 2, cy: innerHeight / 2, nx: 0, ny: 0, inside: false };
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX; pointer.y = e.clientY;
    pointer.nx = (e.clientX / innerWidth) * 2 - 1;
    pointer.ny = -(e.clientY / innerHeight) * 2 + 1;
    if (e.pointerType === 'mouse') cursor.classList.add('on');
    // magnetic buttons
    const b = e.target.closest?.('.btn, .chip');
    document.querySelectorAll('.btn[data-mag], .chip[data-mag]').forEach((el) => { if (el !== b) { el.style.transform = ''; delete el.dataset.mag; } });
    if (b && !reduced) {
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      b.style.transform = `translate(${(dx * 6).toFixed(1)}px, ${(dy * 5).toFixed(1)}px)`;
      b.dataset.mag = '1';
    }
  }, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.remove('on'));

  function setHover(label) {
    cursor.classList.toggle('active', label !== null);
    cursor.classList.toggle('has-label', !!label);
    if (label) cursorLabel.textContent = label;
    document.body.style.cursor = label !== null ? 'pointer' : '';
  }
  function tickCursor() {
    const k = reduced ? 1 : 0.22;
    pointer.cx += (pointer.x - pointer.cx) * k;
    pointer.cy += (pointer.y - pointer.cy) * k;
    cursor.style.transform = `translate(${pointer.cx.toFixed(1)}px, ${pointer.cy.toFixed(1)}px)`;
  }

  // ---------- loader ----------
  let loaded = 0;
  function setLoad(p) {
    loaded = Math.max(loaded, p); // loader callbacks can report late; never move backwards
    $('#loader-bar').style.transform = `scaleX(${loaded.toFixed(3)})`;
    $('#loader-pct').textContent = `${Math.round(loaded * 100)}%`;
  }
  function finishLoading() {
    $('#loader').classList.add('done');
    document.documentElement.classList.add('booted');
  }

  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  document.fonts?.ready?.then(measure);

  render();

  return {
    get lang() { return lang; },
    t: () => T[lang],
    on: (name, fn) => listeners[name].push(fn),
    stopFloat, frame, measure, scrollToStop, requestProject, closeProject,
    setHover, tickCursor, pointer, setLoad, finishLoading,
    isOpen: () => ficha.open || contact.open,
    reduced,
    clickLink(name) {
      const a = tour.querySelector(`[data-link="${name}"]`);
      if (a) { a.focus({ preventScroll: true }); a.click(); }
    },
    isUIEvent(e) {
      return !!e.target.closest?.('.panel, .hero-copy, .topbar, .plan, dialog, a, button');
    },
  };
}
