/* Interkombo Logistics — admin dashboard */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const E = IKL.esc;
  const D = () => IKL.get();
  const AUTH = 'ikl_admin_session';
  const root = $('#root');

  const STATUS_Q = [['new', 'New'], ['contacted', 'Contacted'], ['won', 'Won'], ['lost', 'Lost']];
  const qLabel = (s) => (STATUS_Q.find((x) => x[0] === s) || [s, s])[1];
  const sLabel = (s) => (IKL.STAGES.find((x) => x.id === s) || {}).label || s;
  const pill = (s, label) => `<span class="pill pill-${E(s)}">${E(label)}</span>`;
  const telHref = (p) => 'tel:' + String(p).replace(/[^\d+]/g, '').replace(/^0/, '+27');
  const waNum = (p) => { let n = String(p).replace(/\D/g, ''); if (n.startsWith('0')) n = '27' + n.slice(1); return n; };
  const initials = (n) => String(n || 'A').split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.innerHTML = icon('checkCircle') + '<span>' + E(msg) + '</span>';
    $('#toasts').appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2600);
  }

  /* ================= AUTH ================= */
  const isAuthed = () => { try { return sessionStorage.getItem(AUTH) === '1'; } catch (e) { return false; } };
  function renderLogin() {
    document.title = 'Admin Login | Interkombo Logistics';
    root.innerHTML = `
      <div class="login-wrap">
        <div class="login-art">
          <img src="assets/img/logo-dark.png" alt="Interkombo Logistics">
          <div>
            <h2>Run your logistics business from one place.</h2>
            <p>Manage quotes, update shipment tracking, reply to enquiries and edit every word on your website, from your phone or computer.</p>
            <ul>
              <li>${icon('checkCircle', '', 18)} Quote requests & sales pipeline</li>
              <li>${icon('checkCircle', '', 18)} Live shipment tracking updates</li>
              <li>${icon('checkCircle', '', 18)} Edit services, prices & content</li>
            </ul>
          </div>
          <small style="color:rgba(255,255,255,.55)">© ${new Date().getFullYear()} Interkombo Logistics</small>
        </div>
        <div class="login-form-side">
          <button class="icon-btn login-theme" id="themeBtn" aria-label="Toggle theme"></button>
          <div class="login-card">
            <img class="m-logo logo-light" src="assets/img/logo-light.png" alt="Interkombo Logistics">
            <img class="m-logo logo-dark" src="assets/img/logo-dark.png" alt="Interkombo Logistics">
            <h1>Welcome back</h1>
            <p class="sub">Sign in to your admin dashboard.</p>
            <form id="loginForm" novalidate>
              <div class="login-err" id="loginErr">Incorrect username or password.</div>
              <label class="field"><span>Username</span><input class="input" name="u" autocomplete="username" autocapitalize="none" required></label>
              <label class="field"><span>Password</span><div class="pw-wrap"><input class="input" name="p" type="password" autocomplete="current-password" required><button type="button" id="pwToggle" aria-label="Show password">${icon('eye', '', 19)}</button></div></label>
              <button class="btn btn-primary btn-lg btn-block" type="submit">${icon('lock', '', 18)} Sign in</button>
            </form>
            <a class="back-site" href="index.html">${icon('arrowLeft', '', 16)} Back to website</a>
          </div>
        </div>
      </div>`;
    bindTheme();
    $('#pwToggle').onclick = () => { const i = $('#loginForm').p; i.type = i.type === 'password' ? 'text' : 'password'; };
    $('#loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target, a = D().admin;
      if (f.u.value.trim().toLowerCase() === String(a.username).toLowerCase() && f.p.value === a.password) {
        try { sessionStorage.setItem(AUTH, '1'); } catch (er) {}
        if (!location.hash || location.hash === '#') location.hash = '#/dashboard';
        boot();
      } else {
        const er = $('#loginErr'); er.classList.remove('show'); void er.offsetWidth; er.classList.add('show');
      }
    });
    setTimeout(() => $('#loginForm').u.focus(), 50);
  }
  function logout() { try { sessionStorage.removeItem(AUTH); } catch (e) {} location.hash = ''; boot(); }

  function bindTheme() {
    const b = $('#themeBtn'); if (!b) return;
    const set = () => { const dark = document.documentElement.getAttribute('data-theme') === 'dark'; b.innerHTML = icon(dark ? 'sun' : 'moon', '', 19); };
    set(); b.onclick = () => { IKL.toggleTheme(); set(); };
  }

  /* ================= SHELL ================= */
  const NAV = [
    { group: 'Overview', items: [['dashboard', 'Dashboard', 'dashboard']] },
    { group: 'Operations', items: [['quotes', 'Quote requests', 'file'], ['shipments', 'Shipments', 'truck'], ['messages', 'Messages', 'inbox']] },
    { group: 'Website', items: [['content', 'Site content', 'edit'], ['services', 'Services', 'box'], ['pricing', 'Pricing', 'tag'], ['crossborder', 'Cross-border', 'globe'], ['testimonials', 'Testimonials', 'star'], ['faqs', 'FAQs', 'help']] },
    { group: 'System', items: [['settings', 'Settings', 'settings']] }
  ];
  const TITLES = Object.fromEntries(NAV.flatMap((g) => g.items.map((i) => [i[0], i[1]])));

  function renderShell(view) {
    const d = D();
    const badges = { quotes: d.quotes.filter((q) => q.status === 'new').length, messages: d.messages.filter((m) => !m.read).length };
    root.innerHTML = `
      <div class="app">
        <aside class="sidebar" id="sidebar">
          <div class="sb-brand">
            <a href="#/dashboard"><img class="logo-light" src="assets/img/logo-light.png" alt="Interkombo"><img class="logo-dark" src="assets/img/logo-dark.png" alt="Interkombo"></a>
            <button class="icon-btn close-sb" id="closeSb" aria-label="Close menu">${icon('x', '', 20)}</button>
          </div>
          <nav class="sb-nav">
            ${NAV.map((g) => `<div class="sb-label">${g.group}</div>` + g.items.map(([id, label, ic]) => `<a href="#/${id}" class="${id === view ? 'active' : ''}">${icon(ic, '', 19)}<span>${label}</span>${badges[id] ? `<span class="badge">${badges[id]}</span>` : ''}</a>`).join('')).join('')}
          </nav>
          <div class="sb-foot">
            <a class="btn btn-ghost btn-sm" href="index.html" target="_blank" rel="noopener">${icon('external', '', 16)} View website</a>
            <div class="sb-user"><span class="avatar">${E(initials(d.admin.username))}</span><div><b>${E(d.admin.username)}</b><small>Administrator</small></div><button id="logoutBtn" aria-label="Log out" title="Log out">${icon('logout', '', 19)}</button></div>
          </div>
        </aside>
        <div class="sb-backdrop" id="sbBackdrop"></div>
        <div class="main-col">
          <header class="topbar">
            <button class="icon-btn menu-sb" id="openSb" aria-label="Open menu">${icon('menu', '', 21)}</button>
            <h1>${E(TITLES[view] || 'Dashboard')}</h1>
            <div class="tb-actions">
              <a class="btn btn-ghost btn-sm hide-m" href="index.html" target="_blank" rel="noopener">${icon('external', '', 16)} View site</a>
              <button class="icon-btn" id="themeBtn" aria-label="Toggle theme"></button>
            </div>
          </header>
          <main class="content view-enter" id="view"></main>
        </div>
      </div>`;
    bindTheme();
    $('#openSb').onclick = () => document.body.classList.add('sb-open');
    const close = () => document.body.classList.remove('sb-open');
    $('#closeSb').onclick = close; $('#sbBackdrop').onclick = close;
    $$('.sb-nav a').forEach((a) => a.addEventListener('click', close));
    $('#logoutBtn').onclick = () => confirmDialog('Log out of the dashboard?', logout, 'Log out');
    document.title = (TITLES[view] || 'Dashboard') + ' | Interkombo Admin';
  }

  /* ================= MODALS ================= */
  function modal({ title, sub = '', body = '', foot = '', wide = false, onMount }) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-root';
    wrap.innerHTML = `<div class="modal-bg"></div><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${E(title)}">
      <span class="sheet-handle"></span>
      <div class="modal-head"><div><h2>${E(title)}</h2>${sub ? `<small>${sub}</small>` : ''}</div><button class="icon-btn" data-close aria-label="Close">${icon('x', '', 20)}</button></div>
      <div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}</div>`;
    $('#modals').appendChild(wrap);
    document.body.style.overflow = 'hidden';
    const close = () => { wrap.remove(); if (!$('#modals').children.length) document.body.style.overflow = ''; document.removeEventListener('keydown', esc); };
    const esc = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc);
    wrap.querySelector('.modal-bg').onclick = close;
    $$('[data-close]', wrap).forEach((b) => (b.onclick = close));
    if (onMount) onMount(wrap, close);
    return { el: wrap, close };
  }
  function confirmDialog(text, onYes, yesLabel = 'Delete') {
    modal({
      title: 'Are you sure?', body: `<p class="confirm-text">${E(text)}</p>`,
      foot: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn ${yesLabel === 'Delete' ? 'btn-danger' : 'btn-brand'}" id="yesBtn">${E(yesLabel)}</button>`,
      onMount: (el, close) => { $('#yesBtn', el).onclick = () => { close(); onYes(); }; }
    });
  }
  function fieldHTML(f, v) {
    const val = v == null ? '' : v;
    const cls = f.full ? 'field full' : 'field';
    const req = f.required ? ' *' : '';
    if (f.type === 'textarea') return `<label class="${cls}"><span>${E(f.label)}${req}</span><textarea class="textarea" name="${f.name}" rows="${f.rows || 4}" placeholder="${E(f.placeholder || '')}">${E(val)}</textarea>${f.help ? `<small class="help">${E(f.help)}</small>` : ''}</label>`;
    if (f.type === 'lines') return `<label class="${cls}"><span>${E(f.label)}${req}</span><textarea class="textarea" name="${f.name}" rows="${f.rows || 4}">${E((val || []).join('\n'))}</textarea><small class="help">One per line</small></label>`;
    if (f.type === 'select') return `<label class="${cls}"><span>${E(f.label)}${req}</span><select class="select" name="${f.name}">${f.options.map((o) => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<option value="${E(ov)}" ${String(ov) === String(val) ? 'selected' : ''}>${E(ol)}</option>`; }).join('')}</select></label>`;
    if (f.type === 'icon') return `<div class="field full"><span class="label">${E(f.label)}</span><div class="icon-pick">${['home', 'building', 'truck', 'globe', 'route', 'box', 'package', 'shield', 'map', 'zap', 'users', 'calendar', 'clock', 'wallet', 'headset', 'flag'].map((n) => `<label title="${n}"><input type="radio" name="${f.name}" value="${n}" ${n === val ? 'checked' : ''}>${icon(n, '', 20)}</label>`).join('')}</div></div>`;
    if (f.type === 'switch') return `<div class="${cls}"><label class="switch"><input type="checkbox" name="${f.name}" ${val ? 'checked' : ''}><span class="tr"></span>${E(f.label)}</label>${f.help ? `<small class="help">${E(f.help)}</small>` : ''}</div>`;
    return `<label class="${cls}"><span>${E(f.label)}${req}</span><input class="input" name="${f.name}" type="${f.type || 'text'}" value="${E(val)}" placeholder="${E(f.placeholder || '')}" ${f.type === 'tel' ? 'inputmode="tel"' : ''} ${f.type === 'number' ? 'inputmode="decimal" step="any"' : ''}>${f.help ? `<small class="help">${E(f.help)}</small>` : ''}</label>`;
  }
  function readFields(form, fields) {
    const out = {};
    fields.forEach((f) => {
      const el = form.elements[f.name];
      if (f.type === 'switch') out[f.name] = !!(el && el.checked);
      else if (f.type === 'icon') { const c = form.querySelector(`input[name="${f.name}"]:checked`); out[f.name] = c ? c.value : ''; }
      else if (f.type === 'lines') out[f.name] = String(el.value).split('\n').map((s) => s.trim()).filter(Boolean);
      else if (f.type === 'number') out[f.name] = el.value === '' ? 0 : Number(el.value);
      else out[f.name] = String(el.value).trim();
    });
    return out;
  }
  function formModal({ title, sub, fields, values = {}, onSave, saveLabel = 'Save', wide }) {
    modal({
      title, sub, wide,
      body: `<form class="modal-form" id="mForm" novalidate>${fields.map((f) => fieldHTML(f, values[f.name])).join('')}</form>`,
      foot: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-brand" id="mSave">${icon('check', '', 17)} ${E(saveLabel)}</button>`,
      onMount: (el, close) => {
        const form = $('#mForm', el);
        const go = () => {
          const v = readFields(form, fields);
          const missing = fields.filter((f) => f.required && !String(v[f.name] || '').trim());
          fields.forEach((f) => { const i = form.elements[f.name]; if (i && i.classList) i.classList.toggle('invalid', missing.includes(f)); });
          if (missing.length) { toast('Please fill in the required fields'); return; }
          if (onSave(v) !== false) close();
        };
        $('#mSave', el).onclick = go;
        form.addEventListener('submit', (e) => { e.preventDefault(); go(); });
        const first = form.querySelector('input:not([type=radio]):not([type=checkbox]), textarea, select'); if (first && matchMedia('(min-width: 641px)').matches) first.focus();
      }
    });
  }

  /* ================= VIEWS ================= */
  const V = {};

  V.dashboard = (el) => {
    const d = D();
    const newQ = d.quotes.filter((q) => q.status === 'new');
    const pipeline = d.quotes.filter((q) => q.status === 'new' || q.status === 'contacted').reduce((s, q) => s + Number(q.estimate || 0), 0);
    const active = d.shipments.filter((s) => s.status !== 'delivered');
    const unread = d.messages.filter((m) => !m.read);
    const hour = new Date().getHours();
    el.innerHTML = `
      <div class="welcome">
        <div><h2>Good ${hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'} 👋</h2><p>${newQ.length ? `You have <b>${newQ.length}</b> new quote request${newQ.length > 1 ? 's' : ''} waiting.` : 'You are all caught up on quote requests.'}</p></div>
        <div class="actions"><a href="#/shipments?new=1" class="btn btn-white btn-sm">${icon('plus', '', 16)} New shipment</a><a href="#/quotes" class="btn btn-outline-white btn-sm">${icon('file', '', 16)} View quotes</a></div>
      </div>
      <div class="grid-4" style="margin-bottom:1rem">
        <a href="#/quotes" class="card stat-card"><div class="s-top"><small>New quotes</small><span class="s-ico">${icon('file', '', 20)}</span></div><b>${newQ.length}</b><span class="trend">${d.quotes.length} total requests</span></a>
        <a href="#/quotes" class="card stat-card purple"><div class="s-top"><small>Open pipeline</small><span class="s-ico">${icon('wallet', '', 20)}</span></div><b>${IKL.money(pipeline)}</b><span class="trend">New + contacted estimates</span></a>
        <a href="#/shipments" class="card stat-card blue"><div class="s-top"><small>Active shipments</small><span class="s-ico">${icon('truck', '', 20)}</span></div><b>${active.length}</b><span class="trend">${d.shipments.length - active.length} delivered</span></a>
        <a href="#/messages" class="card stat-card green"><div class="s-top"><small>Unread messages</small><span class="s-ico">${icon('inbox', '', 20)}</span></div><b>${unread.length}</b><span class="trend">${d.messages.length} total</span></a>
      </div>
      <div class="grid-2">
        <div class="card"><div class="card-head"><h2>Latest quote requests</h2><a href="#/quotes">View all ${icon('arrow', '', 15)}</a></div>
          ${d.quotes.length ? d.quotes.slice(0, 5).map((q) => `<div class="list-item" data-q="${E(q.id)}"><span class="li-ico">${icon('file', '', 19)}</span><div class="li-main"><b>${E(q.name)}</b><small>${E(q.from)} → ${E(q.to)} · ${E(q.service)}</small></div><div class="li-end">${pill(q.status, qLabel(q.status))}<small>${IKL.timeAgo(q.createdAt)}</small></div></div>`).join('') : `<div class="empty">${icon('file', '', 32)}<p>No quote requests yet.</p></div>`}
        </div>
        <div class="card"><div class="card-head"><h2>Active shipments</h2><a href="#/shipments">View all ${icon('arrow', '', 15)}</a></div>
          ${active.length ? active.slice(0, 5).map((s) => `<div class="list-item" data-s="${E(s.id)}"><span class="li-ico">${icon('truck', '', 19)}</span><div class="li-main"><b class="mono">${E(s.id)}</b><small>${E(s.from)} → ${E(s.to)}</small></div><div class="li-end">${pill(s.status, sLabel(s.status))}</div></div>`).join('') : `<div class="empty">${icon('truck', '', 32)}<p>No active shipments.</p></div>`}
        </div>
      </div>`;
    $$('[data-q]', el).forEach((r) => (r.onclick = () => openQuote(r.dataset.q)));
    $$('[data-s]', el).forEach((r) => (r.onclick = () => openShipment(r.dataset.s)));
  };

  /* ---------- Quotes ---------- */
  let qFilter = 'all', qSearch = '';
  V.quotes = (el) => {
    const d = D();
    const counts = Object.fromEntries(STATUS_Q.map(([s]) => [s, d.quotes.filter((q) => q.status === s).length]));
    el.innerHTML = `
      <div class="toolbar">
        <div class="tabs">${[['all', 'All', d.quotes.length], ...STATUS_Q.map(([s, l]) => [s, l, counts[s]])].map(([s, l, c]) => `<button class="${qFilter === s ? 'on' : ''}" data-f="${s}">${l} <em>${c}</em></button>`).join('')}</div>
        <div class="search">${icon('search', '', 18)}<input class="input" id="qSearch" placeholder="Search name, city, ref…" value="${E(qSearch)}"></div>
      </div>
      <div class="card" id="qList"></div>`;
    const draw = () => {
      const s = qSearch.toLowerCase();
      const list = D().quotes.filter((q) => (qFilter === 'all' || q.status === qFilter) && (!s || [q.id, q.name, q.from, q.to, q.service, q.phone].join(' ').toLowerCase().includes(s)));
      $('#qList').innerHTML = list.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>Ref</th><th>Customer</th><th>Route</th><th>Service</th><th>Estimate</th><th>Status</th><th>Received</th></tr></thead><tbody>
        ${list.map((q) => `<tr data-q="${E(q.id)}">
          <td data-l="Ref" class="c-hide"><span class="mono">${E(q.id)}</span></td>
          <td><b>${E(q.name)}</b><small>${E(q.phone)}</small></td>
          <td class="c-span">${E(q.from)} → ${E(q.to)}<small>${E(q.load)}</small></td>
          <td class="c-hide">${E(q.service)}</td>
          <td data-l="Estimate"><b>${IKL.money(q.estimate)}</b></td>
          <td class="c-end">${pill(q.status, qLabel(q.status))}</td>
          <td data-l="Received">${IKL.timeAgo(q.createdAt)}</td>
        </tr>`).join('')}</tbody></table></div>` : `<div class="empty">${icon('file', '', 34)}<p>No quote requests match.</p></div>`;
      $$('[data-q]', $('#qList')).forEach((r) => (r.onclick = () => openQuote(r.dataset.q)));
    };
    $$('.tabs button', el).forEach((b) => (b.onclick = () => { qFilter = b.dataset.f; V.quotes(el); }));
    $('#qSearch').oninput = (e) => { qSearch = e.target.value; draw(); };
    draw();
  };
  function openQuote(id) {
    const q = D().quotes.find((x) => x.id === id); if (!q) return;
    const msg = `Hi ${q.name.split(' ')[0]}, thank you for requesting a quote from Interkombo Logistics (${q.id}) for ${q.from} → ${q.to}. `;
    modal({
      title: q.name, sub: `${E(q.id)} · received ${E(IKL.fmtDate(q.createdAt))}`, wide: true,
      body: `
        <div class="est-box"><div><small>Online estimate</small><b>${IKL.money(q.estimate)}</b></div><div style="text-align:right"><small>Distance</small><b style="font-size:1.1rem">${Number(q.distance || 0).toLocaleString('en-ZA')} km</b></div></div>
        <div class="contact-actions">
          <a class="btn btn-wa btn-sm" href="https://wa.me/${waNum(q.phone)}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${icon('whatsapp', '', 17)} WhatsApp</a>
          <a class="btn btn-ghost btn-sm" href="${telHref(q.phone)}">${icon('phone', '', 17)} Call</a>
          ${q.email ? `<a class="btn btn-ghost btn-sm" href="mailto:${E(q.email)}?subject=${encodeURIComponent('Your Interkombo Logistics quote ' + q.id)}">${icon('mail', '', 17)} Email</a>` : ''}
        </div>
        <div class="detail-grid">
          <div><small>Service</small><b>${E(q.service)}</b></div>
          <div><small>Preferred date</small><b>${q.date ? E(IKL.fmtDate(q.date, false)) : 'Flexible'}</b></div>
          <div><small>From</small><b>${E(q.from)}</b></div>
          <div><small>To</small><b>${E(q.to)}</b></div>
          <div><small>Load</small><b>${E(q.load)}</b></div>
          <div><small>Vehicle</small><b>${E(q.vehicle)}</b></div>
          <div><small>Phone</small><b>${E(q.phone)}</b></div>
          <div><small>Email</small><b>${E(q.email || '—')}</b></div>
          <div class="full"><small>Extras</small><b>${q.extras && q.extras.length ? E(q.extras.join(', ')) : 'None'}</b></div>
          ${q.notes ? `<div class="full"><small>Notes</small><b>${E(q.notes)}</b></div>` : ''}
        </div>
        <label class="field"><span>Status</span><select class="select" id="qStatus">${STATUS_Q.map(([s, l]) => `<option value="${s}" ${q.status === s ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`,
      foot: `<button class="btn btn-danger left" id="qDel">${icon('trash', '', 17)}<span class="hide-xs">Delete</span></button><button class="btn btn-ghost" id="qConvert">${icon('truck', '', 17)} Create shipment</button><button class="btn btn-brand" id="qSave">${icon('check', '', 17)} Save</button>`,
      onMount: (el, close) => {
        $('#qSave', el).onclick = () => { IKL.update((d) => { d.quotes.find((x) => x.id === id).status = $('#qStatus', el).value; }); close(); toast('Quote updated'); refresh(); };
        $('#qDel', el).onclick = () => confirmDialog(`Delete quote ${id}? This can’t be undone.`, () => { IKL.update((d) => { d.quotes = d.quotes.filter((x) => x.id !== id); }); close(); toast('Quote deleted'); refresh(); });
        $('#qConvert', el).onclick = () => { close(); newShipment({ customer: q.name, service: q.service, from: q.from, to: q.to, eta: q.date, quoteId: q.id }); };
      }
    });
  }

  /* ---------- Shipments ---------- */
  let sFilter = 'active', sSearch = '';
  V.shipments = (el, params) => {
    const d = D();
    const act = d.shipments.filter((s) => s.status !== 'delivered').length;
    el.innerHTML = `
      <div class="toolbar">
        <div class="tabs">${[['active', 'Active', act], ['delivered', 'Delivered', d.shipments.length - act], ['all', 'All', d.shipments.length]].map(([s, l, c]) => `<button class="${sFilter === s ? 'on' : ''}" data-f="${s}">${l} <em>${c}</em></button>`).join('')}</div>
        <div class="search">${icon('search', '', 18)}<input class="input" id="sSearch" placeholder="Search tracking no., customer…" value="${E(sSearch)}"></div>
        <span class="spacer"></span>
        <button class="btn btn-primary" id="newShip">${icon('plus', '', 18)} New shipment</button>
      </div>
      <div class="card" id="sList"></div>`;
    const draw = () => {
      const s = sSearch.toLowerCase();
      const list = D().shipments.filter((x) => (sFilter === 'all' || (sFilter === 'active' ? x.status !== 'delivered' : x.status === 'delivered')) && (!s || [x.id, x.customer, x.from, x.to].join(' ').toLowerCase().includes(s)));
      $('#sList').innerHTML = list.length ? `<div class="table-wrap"><table class="data"><thead><tr><th>Tracking no.</th><th>Customer</th><th>Route</th><th>Last update</th><th>Status</th></tr></thead><tbody>
        ${list.map((x) => { const last = [...x.events].sort((a, b) => new Date(b.at) - new Date(a.at))[0] || {}; return `<tr data-s="${E(x.id)}">
          <td><span class="mono">${E(x.id)}</span><small>${E(x.service)}</small></td>
          <td data-l="Customer" class="c-span">${E(x.customer)}</td>
          <td class="c-span">${E(x.from)} → ${E(x.to)}</td>
          <td data-l="Last update" class="c-span">${E(last.location || '')}<small>${last.at ? IKL.timeAgo(last.at) : ''}</small></td>
          <td class="c-end">${pill(x.status, sLabel(x.status))}</td></tr>`; }).join('')}</tbody></table></div>` : `<div class="empty">${icon('truck', '', 34)}<p>No shipments here yet.</p></div>`;
      $$('[data-s]', $('#sList')).forEach((r) => (r.onclick = () => openShipment(r.dataset.s)));
    };
    $$('.tabs button', el).forEach((b) => (b.onclick = () => { sFilter = b.dataset.f; V.shipments(el, new URLSearchParams()); }));
    $('#sSearch').oninput = (e) => { sSearch = e.target.value; draw(); };
    $('#newShip').onclick = () => newShipment({});
    draw();
    if (params && params.get('new')) { history.replaceState(null, '', '#/shipments'); newShipment({}); }
  };
  const placeOpts = () => [['', 'Select…'], ...Object.values(IKL.PLACES).flatMap((g) => Object.keys(g))];
  function newShipment(pre) {
    const d = D();
    formModal({
      title: 'New shipment', sub: 'A tracking number is created automatically', saveLabel: 'Create shipment',
      fields: [
        { name: 'customer', label: 'Customer name', required: true, full: true },
        { name: 'service', label: 'Service', type: 'select', options: d.services.map((s) => s.title), full: true },
        { name: 'from', label: 'From', type: 'select', options: placeOpts(), required: true },
        { name: 'to', label: 'To', type: 'select', options: placeOpts(), required: true },
        { name: 'eta', label: 'Estimated arrival', type: 'date' },
        { name: 'note', label: 'First update note', placeholder: 'Booking confirmed' }
      ],
      values: pre,
      onSave: (v) => {
        const id = IKL.nextRef('IKL', d.shipments);
        IKL.update((data) => {
          data.shipments.unshift({ id, customer: v.customer, service: v.service, from: v.from, to: v.to, eta: v.eta, status: 'booked', createdAt: IKL.now(), events: [{ at: IKL.now(), status: 'booked', location: v.from, note: v.note || 'Booking confirmed' }] });
          if (pre.quoteId) { const q = data.quotes.find((x) => x.id === pre.quoteId); if (q) q.status = 'won'; }
        });
        toast(`Shipment ${id} created`);
        if (current !== 'shipments') location.hash = '#/shipments'; else refresh();
        setTimeout(() => openShipment(id), 120);
      }
    });
  }
  function openShipment(id) {
    const s = D().shipments.find((x) => x.id === id); if (!s) return;
    const events = [...s.events].sort((a, b) => new Date(b.at) - new Date(a.at));
    const link = location.href.replace(/admin\.html.*$/, '') + 'index.html#/track?id=' + encodeURIComponent(s.id);
    modal({
      title: s.id, sub: `${E(s.customer)} · ${E(s.from)} → ${E(s.to)}`, wide: true,
      body: `
        <div class="contact-actions">
          <button class="btn btn-ghost btn-sm" id="copyLink">${icon('copy', '', 16)} Copy tracking link</button>
          <a class="btn btn-ghost btn-sm" href="${E(link)}" target="_blank" rel="noopener">${icon('eye', '', 16)} Preview</a>
          <a class="btn btn-wa btn-sm" href="https://wa.me/?text=${encodeURIComponent(`Track your Interkombo Logistics shipment ${s.id} here: ${link}`)}" target="_blank" rel="noopener">${icon('whatsapp', '', 16)} Share</a>
        </div>
        <p class="section-title">Post a tracking update</p>
        <div class="update-box">
          <div class="row">
            <label class="field"><span>New status</span><select class="select" id="uStatus">${IKL.STAGES.map((st) => `<option value="${st.id}" ${st.id === s.status ? 'selected' : ''}>${st.label}</option>`).join('')}</select></label>
            <label class="field"><span>Current location</span><input class="input" id="uLoc" placeholder="e.g. Beitbridge"></label>
          </div>
          <label class="field"><span>Note for customer</span><input class="input" id="uNote" placeholder="e.g. Customs clearance in progress"></label>
          <div class="row">
            <label class="field"><span>Estimated arrival</span><input class="input" type="date" id="uEta" value="${E((s.eta || '').slice(0, 10))}"></label>
            <div style="display:flex;align-items:end"><button class="btn btn-primary btn-block" id="uPost">${icon('upload', '', 17)} Post update</button></div>
          </div>
        </div>
        <p class="section-title">History</p>
        <ul class="adm-timeline">${events.map((e, i) => `<li><span class="d"></span><div><b>${E(sLabel(e.status))}${e.location ? ' · ' + E(e.location) : ''}</b><small>${E(IKL.fmtDate(e.at))}${e.note ? ' — ' + E(e.note) : ''}</small></div>${events.length > 1 ? `<button class="sq-btn danger" data-ev="${E(e.at)}" aria-label="Remove update" title="Remove update">${icon('trash', '', 15)}</button>` : '<span></span>'}</li>`).join('')}</ul>`,
      foot: `<button class="btn btn-danger left" id="sDel">${icon('trash', '', 17)} Delete</button><button class="btn btn-ghost" id="sEdit">${icon('edit', '', 17)} Edit details</button><button class="btn btn-brand" data-close>Done</button>`,
      onMount: (el, close) => {
        $('#copyLink', el).onclick = () => { navigator.clipboard && navigator.clipboard.writeText(link); toast('Tracking link copied'); };
        $('#uPost', el).onclick = () => {
          const st = $('#uStatus', el).value, loc = $('#uLoc', el).value.trim(), note = $('#uNote', el).value.trim(), eta = $('#uEta', el).value;
          if (!loc && !note && st === s.status && eta === (s.eta || '').slice(0, 10)) { $('#uLoc', el).classList.add('invalid'); toast('Add a location or note for the update'); return; }
          IKL.update((d) => {
            const x = d.shipments.find((y) => y.id === id);
            if (loc || note || st !== x.status) x.events.push({ at: IKL.now(), status: st, location: loc, note });
            x.status = st; x.eta = eta;
          });
          close(); toast('Tracking updated'); refresh(); openShipment(id);
        };
        $$('[data-ev]', el).forEach((b) => (b.onclick = () => {
          IKL.update((d) => { const x = d.shipments.find((y) => y.id === id); x.events = x.events.filter((e) => e.at !== b.dataset.ev); const last = [...x.events].sort((a, c) => new Date(c.at) - new Date(a.at))[0]; if (last) x.status = last.status; });
          close(); refresh(); openShipment(id);
        }));
        $('#sDel', el).onclick = () => confirmDialog(`Delete shipment ${id}? Customers will no longer be able to track it.`, () => { IKL.update((d) => { d.shipments = d.shipments.filter((x) => x.id !== id); }); close(); toast('Shipment deleted'); refresh(); });
        $('#sEdit', el).onclick = () => {
          close();
          formModal({
            title: 'Edit shipment', sub: E(id),
            fields: [
              { name: 'customer', label: 'Customer name', required: true, full: true },
              { name: 'service', label: 'Service', type: 'select', options: D().services.map((x) => x.title), full: true },
              { name: 'from', label: 'From', type: 'select', options: placeOpts(), required: true },
              { name: 'to', label: 'To', type: 'select', options: placeOpts(), required: true }
            ],
            values: s,
            onSave: (v) => { IKL.update((d) => Object.assign(d.shipments.find((x) => x.id === id), v)); toast('Shipment saved'); refresh(); setTimeout(() => openShipment(id), 50); }
          });
        };
      }
    });
  }

  /* ---------- Messages ---------- */
  V.messages = (el) => {
    const list = D().messages;
    el.innerHTML = `<div class="card">${list.length ? list.map((m) => `<div class="list-item" data-m="${E(m.id)}">${m.read ? '<span style="width:9px"></span>' : '<span class="unread-dot"></span>'}<span class="li-ico">${icon('message', '', 19)}</span><div class="li-main"><b style="${m.read ? 'font-weight:500' : ''}">${E(m.name)} · ${E(m.subject || 'Enquiry')}</b><small>${E(m.message)}</small></div><div class="li-end"><small>${IKL.timeAgo(m.createdAt)}</small></div></div>`).join('') : `<div class="empty">${icon('inbox', '', 34)}<p>No messages yet. Contact form submissions appear here.</p></div>`}</div>`;
    $$('[data-m]', el).forEach((r) => (r.onclick = () => openMessage(r.dataset.m)));
  };
  function openMessage(id) {
    IKL.update((d) => { const m = d.messages.find((x) => x.id === id); if (m) m.read = true; });
    const m = D().messages.find((x) => x.id === id); if (!m) return;
    modal({
      title: m.subject || 'Message', sub: `From ${E(m.name)} · ${E(IKL.fmtDate(m.createdAt))}`,
      body: `<p style="white-space:pre-wrap;font-size:1.02rem">${E(m.message)}</p>
        <div class="detail-grid"><div><small>Phone</small><b>${E(m.phone || '—')}</b></div><div><small>Email</small><b>${E(m.email || '—')}</b></div></div>
        <div class="contact-actions">
          ${m.phone ? `<a class="btn btn-wa btn-sm" href="https://wa.me/${waNum(m.phone)}?text=${encodeURIComponent('Hi ' + m.name.split(' ')[0] + ', thanks for contacting Interkombo Logistics. ')}" target="_blank" rel="noopener">${icon('whatsapp', '', 17)} Reply on WhatsApp</a><a class="btn btn-ghost btn-sm" href="${telHref(m.phone)}">${icon('phone', '', 17)} Call</a>` : ''}
          ${m.email ? `<a class="btn btn-ghost btn-sm" href="mailto:${E(m.email)}?subject=${encodeURIComponent('Re: ' + (m.subject || 'Your enquiry'))}">${icon('mail', '', 17)} Email</a>` : ''}
        </div>`,
      foot: `<button class="btn btn-danger left" id="mDel">${icon('trash', '', 17)} Delete</button><button class="btn btn-ghost" id="mUnread">Mark unread</button><button class="btn btn-brand" data-close>Done</button>`,
      onMount: (el, close) => {
        $('#mDel', el).onclick = () => confirmDialog('Delete this message?', () => { IKL.update((d) => { d.messages = d.messages.filter((x) => x.id !== id); }); close(); toast('Message deleted'); refresh(); });
        $('#mUnread', el).onclick = () => { IKL.update((d) => { d.messages.find((x) => x.id === id).read = false; }); close(); refresh(); };
      }
    });
    refresh();
  }

  /* ---------- Settings-style form pages (with save bar) ---------- */
  function formPage(el, sectionsHTML, onSave) {
    el.innerHTML = `<form id="pageForm" novalidate>${sectionsHTML}
      <div class="save-bar" id="saveBar"><span class="dirty">${icon('edit', '', 16)} Unsaved changes</span><button type="button" class="btn btn-ghost" id="discard">Discard</button><button type="submit" class="btn btn-primary">${icon('check', '', 17)} Save changes</button></div></form>`;
    const f = $('#pageForm', el);
    const markDirty = () => { $('#saveBar').classList.add('is-dirty'); dirty = true; };
    f.addEventListener('input', markDirty); f.addEventListener('change', markDirty);
    $('#discard', el).onclick = () => { dirty = false; refresh(); };
    f.addEventListener('submit', (e) => { e.preventDefault(); if (onSave(f) !== false) { dirty = false; toast('Changes saved. Your website is updated.'); refresh(); } });
    return f;
  }
  const section = (title, help, inner) => `<div class="card form-section"><div class="card-head"><div><h3>${title}</h3>${help ? `<p class="help">${help}</p>` : ''}</div></div><div class="card-pad">${inner}</div></div>`;

  V.content = (el) => {
    const d = D();
    const companyF = [
      { name: 'name', label: 'Business name', required: true }, { name: 'phone', label: 'Phone number', type: 'tel' },
      { name: 'whatsapp', label: 'WhatsApp number', help: 'International format, e.g. 27760950954' }, { name: 'email', label: 'Email', type: 'email' },
      { name: 'address', label: 'Address / area' }, { name: 'mapQuery', label: 'Map location', help: 'What to show on the contact page map' },
      { name: 'hours', label: 'Business hours', full: true }, { name: 'tagline', label: 'Tagline (footer)', full: true },
      { name: 'facebook', label: 'Facebook URL', type: 'url' }, { name: 'instagram', label: 'Instagram URL', type: 'url' }, { name: 'linkedin', label: 'LinkedIn URL', type: 'url' }
    ];
    const heroF = [
      { name: 'eyebrow', label: 'Small label above headline', full: true }, { name: 'title', label: 'Headline (first line)' }, { name: 'highlight', label: 'Headline highlight (orange)' },
      { name: 'subtitle', label: 'Intro paragraph', type: 'textarea', full: true, rows: 3 }
    ];
    const aboutF = [
      { name: 'title', label: 'About heading', full: true }, { name: 'body', label: 'About text', type: 'textarea', full: true, rows: 5 },
      { name: 'mission', label: 'Mission', type: 'textarea', rows: 3 }, { name: 'vision', label: 'Vision', type: 'textarea', rows: 3 },
      { name: 'values', label: 'Values', type: 'lines', full: true, rows: 5 }
    ];
    const pre = (p, fs) => fs.map((x) => ({ ...x, name: p + '.' + x.name }));
    const vals = (p, o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [p + '.' + k, v]));
    const statsRows = d.stats.map((s, i) => `<div class="r r-stat"><label><span class="mini-label">Number</span><input class="input" name="st.${i}.value" value="${E(s.value)}"></label><label><span class="mini-label">Suffix</span><input class="input" name="st.${i}.suffix" value="${E(s.suffix)}" placeholder="+, %, /7"></label><label><span class="mini-label">Label</span><input class="input" name="st.${i}.label" value="${E(s.label)}"></label></div>`).join('');
    const all = { ...vals('c', d.company), ...vals('h', d.hero), ...vals('a', d.about) };
    const f = formPage(el,
      `<div class="kbd-note">${icon('help', '', 18)}<span>Edit any text below and press <b>Save changes</b>. Your website updates straight away.</span></div>` +
      section('Business details', 'Shown in the header, footer and contact page.', pre('c', companyF).map((x) => fieldHTML(x, all[x.name])).join('')) +
      section('Homepage hero', 'The first thing visitors see.', pre('h', heroF).map((x) => fieldHTML(x, all[x.name])).join('')) +
      section('Stats band', 'The four highlight numbers on the homepage.', `<div class="row-editor full">${statsRows}</div>`) +
      section('About page', '', pre('a', aboutF).map((x) => fieldHTML(x, all[x.name])).join('')),
      (form) => {
        const c = readFields(form, pre('c', companyF)), h = readFields(form, pre('h', heroF)), a = readFields(form, pre('a', aboutF));
        if (!c['c.name']) { form.elements['c.name'].classList.add('invalid'); toast('Business name is required'); return false; }
        const strip = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k.split('.').slice(1).join('.'), v]));
        IKL.update((data) => {
          Object.assign(data.company, strip(c)); data.company.whatsapp = String(data.company.whatsapp).replace(/\D/g, '');
          Object.assign(data.hero, strip(h)); Object.assign(data.about, strip(a));
          data.stats = data.stats.map((s, i) => ({ value: form.elements[`st.${i}.value`].value.trim(), suffix: form.elements[`st.${i}.suffix`].value.trim(), label: form.elements[`st.${i}.label`].value.trim() }));
        });
      });
    return f;
  };

  /* ---------- Generic list manager (services, testimonials, faqs) ---------- */
  function listManager(el, { key, addLabel, fields, card, defaults = {}, top = '' }) {
    const list = D()[key];
    el.innerHTML = `${top}<div class="toolbar"><span class="help">${list.length} item${list.length === 1 ? '' : 's'} · use the arrows to change the order on the website</span><span class="spacer"></span><button class="btn btn-primary" id="addItem">${icon('plus', '', 18)} ${E(addLabel)}</button></div>
      <div class="item-grid">${list.map((it, i) => `<div class="item-card">${card(it)}
        <div class="ic-actions"><button class="sq-btn" data-up="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move up">${icon('chevron', '', 16).replace('<svg', '<svg style="transform:rotate(-90deg)"')}</button><button class="sq-btn" data-down="${i}" ${i === list.length - 1 ? 'disabled' : ''} aria-label="Move down">${icon('chevron', '', 16).replace('<svg', '<svg style="transform:rotate(90deg)"')}</button><span class="grow"></span><button class="sq-btn" data-edit="${i}" aria-label="Edit">${icon('edit', '', 16)}</button><button class="sq-btn danger" data-del="${i}" aria-label="Delete">${icon('trash', '', 16)}</button></div></div>`).join('') || `<div class="card empty">${icon('box', '', 32)}<p>Nothing here yet.</p></div>`}</div>`;
    const move = (i, dir) => { IKL.update((d) => { const a = d[key]; const [x] = a.splice(i, 1); a.splice(i + dir, 0, x); }); refresh(); };
    $$('[data-up]', el).forEach((b) => (b.onclick = () => move(+b.dataset.up, -1)));
    $$('[data-down]', el).forEach((b) => (b.onclick = () => move(+b.dataset.down, 1)));
    $$('[data-edit]', el).forEach((b) => (b.onclick = () => { const i = +b.dataset.edit; formModal({ title: 'Edit', fields, values: D()[key][i], wide: true, onSave: (v) => { IKL.update((d) => Object.assign(d[key][i], v)); toast('Saved. Your website is updated.'); refresh(); } }); }));
    $$('[data-del]', el).forEach((b) => (b.onclick = () => confirmDialog('Delete this item from the website?', () => { IKL.update((d) => d[key].splice(+b.dataset.del, 1)); toast('Deleted'); refresh(); })));
    $('#addItem', el).onclick = () => formModal({ title: addLabel, fields, values: defaults, wide: true, saveLabel: 'Add', onSave: (v) => { IKL.update((d) => d[key].push({ id: IKL.uid(key.slice(0, 1)), ...v })); toast('Added to your website'); refresh(); } });
  }

  V.services = (el) => listManager(el, {
    key: 'services', addLabel: 'Add service', defaults: { icon: 'truck', features: [] },
    fields: [
      { name: 'title', label: 'Service name', required: true, full: true },
      { name: 'icon', label: 'Icon', type: 'icon' },
      { name: 'short', label: 'Short description (cards)', required: true, full: true },
      { name: 'description', label: 'Full description (service page)', type: 'textarea', full: true, rows: 4 },
      { name: 'features', label: 'Key features', type: 'lines', full: true }
    ],
    card: (s) => `<div class="ic-top"><span class="ic-ico">${icon(s.icon, '', 22)}</span><h3>${E(s.title)}</h3></div><p>${E(s.short)}</p>`
  });

  V.testimonials = (el) => {
    const d = D();
    listManager(el, {
      key: 'testimonials', addLabel: 'Add testimonial', defaults: { rating: 5 },
      top: `<div class="card card-pad" style="margin-bottom:1rem;display:flex;gap:1rem;align-items:center;justify-content:space-between;flex-wrap:wrap"><div><b>Show “Sample” labels</b><p class="help">Keep this on until you replace these with real client reviews.</p></div><label class="switch"><input type="checkbox" id="sampleT" ${d.testimonialsSample ? 'checked' : ''}><span class="tr"></span></label></div>`,
      fields: [
        { name: 'name', label: 'Client name', required: true }, { name: 'role', label: 'Move / company', placeholder: 'Home move · Pretoria → Cape Town' },
        { name: 'rating', label: 'Rating', type: 'select', options: [[5, '★★★★★ 5'], [4, '★★★★ 4'], [3, '★★★ 3']] },
        { name: 'quote', label: 'Review', type: 'textarea', required: true, full: true }
      ],
      card: (t) => `<div class="ic-top"><span class="avatar" style="width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--grad-purple);color:#fff;font-weight:700">${E(initials(t.name))}</span><div><h3>${E(t.name)}</h3><small style="color:var(--muted)">${E(t.role)}</small></div></div><p>“${E(t.quote)}”</p>`
    });
    $('#sampleT', el).onchange = (e) => { IKL.update((x) => { x.testimonialsSample = e.target.checked; }); toast(e.target.checked ? 'Sample labels shown' : 'Sample labels hidden'); };
  };

  V.faqs = (el) => listManager(el, {
    key: 'faqs', addLabel: 'Add question',
    fields: [{ name: 'q', label: 'Question', required: true, full: true }, { name: 'a', label: 'Answer', type: 'textarea', required: true, full: true, rows: 5 }],
    card: (f) => `<h3>${E(f.q)}</h3><p>${E(f.a)}</p>`
  });

  /* ---------- Pricing ---------- */
  V.pricing = (el) => {
    const p = D().pricing;
    const vRows = p.vehicles.map((v, i) => `<div class="r r-vehicle"><label><span class="mini-label">Vehicle</span><input class="input" name="v.${i}.name" value="${E(v.name)}"></label><label><span class="mini-label">Suitable for</span><input class="input" name="v.${i}.capacity" value="${E(v.capacity)}"></label><label><span class="mini-label">Call-out (R)</span><input class="input" type="number" inputmode="decimal" name="v.${i}.base" value="${E(v.base)}"></label><label><span class="mini-label">Per km (R)</span><input class="input" type="number" inputmode="decimal" step="any" name="v.${i}.perKm" value="${E(v.perKm)}"></label></div>`).join('');
    const vOpts = (sel) => p.vehicles.map((v) => `<option value="${E(v.id)}" ${v.id === sel ? 'selected' : ''}>${E(v.name)}</option>`).join('');
    const lRows = p.loads.map((l, i) => `<div class="r r-load" data-row><label><span class="mini-label">Load option</span><input class="input" name="l.label" value="${E(l.label)}"><input type="hidden" name="l.id" value="${E(l.id)}"></label><label><span class="mini-label">Uses truck</span><select class="select" name="l.vehicle">${vOpts(l.vehicle)}</select></label><button type="button" class="sq-btn danger" data-rm aria-label="Remove">${icon('trash', '', 16)}</button></div>`).join('');
    const xRows = p.extras.map((x) => `<div class="r r-extra" data-row><label><span class="mini-label">Extra</span><input class="input" name="x.label" value="${E(x.label)}"><input type="hidden" name="x.id" value="${E(x.id)}"></label><label><span class="mini-label">Price (R)</span><input class="input" type="number" inputmode="decimal" name="x.price" value="${E(x.price)}"></label><button type="button" class="sq-btn danger" data-rm aria-label="Remove">${icon('trash', '', 16)}</button></div>`).join('');
    const f = formPage(el,
      `<div class="kbd-note">${icon('help', '', 18)}<span>These rates power the <b>instant quote calculator</b> on your website. Estimate = truck call-out + (distance × per-km rate) + extras + cross-border fee.</span></div>` +
      section('Trucks & rates', '', `<div class="row-editor full">${vRows}</div>`) +
      section('General', '', fieldHTML({ name: 'crossBorderFee', label: 'Cross-border admin & clearing fee (R)', type: 'number' }, p.crossBorderFee) + fieldHTML({ name: 'minCharge', label: 'Minimum charge (R)', type: 'number' }, p.minCharge)) +
      section('Load sizes', 'What customers choose in the calculator, and which truck it uses.', `<div class="row-editor full" id="loadRows">${lRows}</div><div class="full"><button type="button" class="btn btn-ghost btn-sm" id="addLoad">${icon('plus', '', 16)} Add load option</button></div>`) +
      section('Optional extras', '', `<div class="row-editor full" id="extraRows">${xRows}</div><div class="full"><button type="button" class="btn btn-ghost btn-sm" id="addExtra">${icon('plus', '', 16)} Add extra</button></div>`),
      (form) => {
        const loads = $$('#loadRows [data-row]', form).map((r) => ({ id: r.querySelector('[name="l.id"]').value || IKL.uid('l'), label: r.querySelector('[name="l.label"]').value.trim(), vehicle: r.querySelector('[name="l.vehicle"]').value })).filter((x) => x.label);
        const extras = $$('#extraRows [data-row]', form).map((r) => ({ id: r.querySelector('[name="x.id"]').value || IKL.uid('x'), label: r.querySelector('[name="x.label"]').value.trim(), price: Number(r.querySelector('[name="x.price"]').value) || 0 })).filter((x) => x.label);
        if (!loads.length) { toast('Add at least one load option'); return false; }
        IKL.update((d) => {
          d.pricing.vehicles = d.pricing.vehicles.map((v, i) => ({ ...v, name: form.elements[`v.${i}.name`].value.trim() || v.name, capacity: form.elements[`v.${i}.capacity`].value.trim(), base: Number(form.elements[`v.${i}.base`].value) || 0, perKm: Number(form.elements[`v.${i}.perKm`].value) || 0 }));
          d.pricing.crossBorderFee = Number(form.elements.crossBorderFee.value) || 0;
          d.pricing.minCharge = Number(form.elements.minCharge.value) || 0;
          d.pricing.loads = loads; d.pricing.extras = extras;
        });
      });
    const bindRm = () => $$('[data-rm]', f).forEach((b) => (b.onclick = () => { b.closest('[data-row]').remove(); f.dispatchEvent(new Event('change')); }));
    $('#addLoad', f).onclick = () => { $('#loadRows', f).insertAdjacentHTML('beforeend', `<div class="r r-load" data-row><label><span class="mini-label">Load option</span><input class="input" name="l.label" placeholder="e.g. Student move"><input type="hidden" name="l.id" value=""></label><label><span class="mini-label">Uses truck</span><select class="select" name="l.vehicle">${vOpts('t4')}</select></label><button type="button" class="sq-btn danger" data-rm aria-label="Remove">${icon('trash', '', 16)}</button></div>`); bindRm(); f.dispatchEvent(new Event('change')); };
    $('#addExtra', f).onclick = () => { $('#extraRows', f).insertAdjacentHTML('beforeend', `<div class="r r-extra" data-row><label><span class="mini-label">Extra</span><input class="input" name="x.label" placeholder="e.g. Piano handling"><input type="hidden" name="x.id" value=""></label><label><span class="mini-label">Price (R)</span><input class="input" type="number" inputmode="decimal" name="x.price" value="0"></label><button type="button" class="sq-btn danger" data-rm aria-label="Remove">${icon('trash', '', 16)}</button></div>`); bindRm(); f.dispatchEvent(new Event('change')); };
    bindRm();
  };

  /* ---------- Cross-border ---------- */
  V.crossborder = (el) => {
    const cb = D().crossBorder;
    const row = (c = {}) => `<div class="r r-country" data-row><label><span class="mini-label">Flag</span><input class="input" name="flag" value="${E(c.flag || '')}" style="text-align:center;font-size:1.3rem"></label><label><span class="mini-label">Country</span><input class="input" name="name" value="${E(c.name || '')}"></label><label><span class="mini-label">Border post / route</span><input class="input" name="border" value="${E(c.border || '')}"></label><label><span class="mini-label">Transit time</span><input class="input" name="time" value="${E(c.time || '')}" placeholder="2–4 days"></label><button type="button" class="sq-btn danger" data-rm aria-label="Remove">${icon('trash', '', 16)}</button></div>`;
    const f = formPage(el,
      section('Countries served', 'Shown on the homepage and cross-border page.', `<div class="row-editor full" id="cRows">${cb.countries.map(row).join('')}</div><div class="full"><button type="button" class="btn btn-ghost btn-sm" id="addC">${icon('plus', '', 16)} Add country</button></div>`) +
      section('Documents checklist', '', fieldHTML({ name: 'documents', label: 'Required documents', type: 'lines', full: true, rows: 7 }, cb.documents)),
      (form) => {
        const countries = $$('#cRows [data-row]', form).map((r) => ({ flag: r.querySelector('[name=flag]').value.trim(), name: r.querySelector('[name=name]').value.trim(), border: r.querySelector('[name=border]').value.trim(), time: r.querySelector('[name=time]').value.trim() })).filter((c) => c.name);
        IKL.update((d) => { d.crossBorder.countries = countries; d.crossBorder.documents = form.elements.documents.value.split('\n').map((s) => s.trim()).filter(Boolean); });
      });
    const bindRm = () => $$('[data-rm]', f).forEach((b) => (b.onclick = () => { b.closest('[data-row]').remove(); f.dispatchEvent(new Event('change')); }));
    $('#addC', f).onclick = () => { $('#cRows', f).insertAdjacentHTML('beforeend', row()); bindRm(); f.dispatchEvent(new Event('change')); };
    bindRm();
  };

  /* ---------- Settings ---------- */
  V.settings = (el) => {
    const a = D().admin;
    el.innerHTML = `
      <div class="card form-section"><div class="card-head"><div><h3>Admin login</h3><p class="help">Change the username and password used to sign in.</p></div></div>
        <form class="card-pad" id="accForm" novalidate>
          ${fieldHTML({ name: 'username', label: 'Username', required: true }, a.username)}
          ${fieldHTML({ name: 'password', label: 'New password', type: 'password', placeholder: 'Leave blank to keep current' }, '')}
          <div class="full"><button class="btn btn-brand" type="submit">${icon('lock', '', 17)} Update login</button></div>
        </form></div>
      <div class="card form-section"><div class="card-head"><div><h3>Backup & restore</h3><p class="help">Download all website content and records, or restore from a backup file.</p></div></div>
        <div class="card-pad"><button class="btn btn-ghost" id="exp">${icon('download', '', 17)} Download backup</button><label class="btn btn-ghost" style="cursor:pointer">${icon('upload', '', 17)} Restore backup<input type="file" id="imp" accept="application/json" hidden></label></div></div>
      <div class="card form-section danger-zone"><div class="card-head"><div><h3 style="color:var(--danger)">Reset demo data</h3><p class="help">Restores the original demo content. All your changes, quotes and shipments will be removed.</p></div></div>
        <div class="card-pad"><div><button class="btn btn-danger" id="resetBtn">${icon('refresh', '', 17)} Reset everything</button></div></div></div>`;
    $('#accForm').addEventListener('submit', (e) => {
      e.preventDefault(); const f = e.target; const u = f.username.value.trim(), p = f.password.value;
      if (!u) { f.username.classList.add('invalid'); return; }
      if (p && p.length < 6) { f.password.classList.add('invalid'); toast('Password must be at least 6 characters'); return; }
      IKL.update((d) => { d.admin.username = u; if (p) d.admin.password = p; }); toast('Login details updated'); refresh();
    });
    $('#exp').onclick = () => { const blob = new Blob([IKL.exportJSON()], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a2 = document.createElement('a'); a2.href = url; a2.download = 'interkombo-backup-' + new Date().toISOString().slice(0, 10) + '.json'; a2.click(); URL.revokeObjectURL(url); toast('Backup downloaded'); };
    $('#imp').onchange = (e) => { const file = e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = () => { try { IKL.importJSON(r.result); toast('Backup restored'); refresh(); } catch (er) { toast('That file is not a valid backup'); } }; r.readAsText(file); };
    $('#resetBtn').onclick = () => confirmDialog('Reset all content and records back to the demo data?', () => { IKL.reset(); toast('Demo data restored'); refresh(); }, 'Reset');
  };

  /* ================= ROUTER ================= */
  let current = 'dashboard', dirty = false;
  function parse() { const h = location.hash.replace(/^#\/?/, ''); const [p, qs] = h.split('?'); return { view: p || 'dashboard', params: new URLSearchParams(qs || '') }; }
  function refresh() { const el = $('#view'); if (!el) return; const { params } = parse(); renderShellBadges(); V[current](el, params); }
  function renderShellBadges() {
    const d = D(); const counts = { quotes: d.quotes.filter((q) => q.status === 'new').length, messages: d.messages.filter((m) => !m.read).length };
    $$('.sb-nav a').forEach((a) => { const id = a.getAttribute('href').slice(2); const b = a.querySelector('.badge'); if (b) b.remove(); if (counts[id]) a.insertAdjacentHTML('beforeend', `<span class="badge">${counts[id]}</span>`); });
  }
  function route() {
    if (!isAuthed()) return renderLogin();
    let { view, params } = parse();
    if (!V[view]) view = 'dashboard';
    if (dirty && view !== current && !confirm('You have unsaved changes. Leave this page?')) { history.replaceState(null, '', '#/' + current); return; }
    dirty = false; current = view;
    $('#modals').innerHTML = ''; document.body.style.overflow = ''; document.body.classList.remove('sb-open');
    renderShell(view);
    V[view]($('#view'), params);
    scrollTo(0, 0);
  }
  function boot() { route(); }
  addEventListener('hashchange', route);
  addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  // New quotes/messages from the website (other tab) update the dashboard live
  IKL.onChange(() => { if (isAuthed() && !dirty && !$('#modals').children.length) refresh(); });
  boot();
})();
