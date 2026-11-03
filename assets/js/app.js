/* Interkombo Logistics — public site app (hash router, renders from IKL data) */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const E = IKL.esc;
  const D = () => IKL.get();
  const main = $('#main');

  const NAV = [
    { href: '#/', label: 'Home', key: '' },
    { href: '#/services', label: 'Services', key: 'services' },
    { href: '#/cross-border', label: 'Cross-Border', key: 'cross-border' },
    { href: '#/track', label: 'Track', key: 'track' },
    { href: '#/about', label: 'About', key: 'about' },
    { href: '#/contact', label: 'Contact', key: 'contact' }
  ];

  /* ---------- helpers ---------- */
  const telHref = (p) => 'tel:' + String(p).replace(/[^\d+]/g, '').replace(/^0/, '+27');
  const waHref = (text) => 'https://wa.me/' + String(D().company.whatsapp).replace(/\D/g, '') + (text ? '?text=' + encodeURIComponent(text) : '');
  const initials = (n) => String(n).split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.innerHTML = icon('checkCircle') + '<span>' + E(msg) + '</span>';
    $('#toasts').appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2800);
  }
  function parseHash() {
    const h = location.hash.replace(/^#/, '') || '/';
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    return { parts, params: new URLSearchParams(qs || '') };
  }
  function placeOptions(selected, placeholder) {
    let o = `<option value="">${E(placeholder)}</option>`;
    Object.entries(IKL.PLACES).forEach(([g, list]) => {
      o += `<optgroup label="${E(g)}">` + Object.keys(list).map((n) => `<option ${n === selected ? 'selected' : ''}>${E(n)}</option>`).join('') + '</optgroup>';
    });
    return o;
  }
  const loadOptions = (sel) => D().pricing.loads.map((l) => `<option value="${E(l.id)}" ${l.id === sel ? 'selected' : ''}>${E(l.label)}</option>`).join('');
  function stars(n) { let s = ''; for (let i = 0; i < 5; i++) s += icon('star', '', 16).replace('fill="none"', i < n ? 'fill="currentColor"' : 'fill="none"'); return s; }

  /* ---------- shell ---------- */
  function renderShell() {
    const d = D(), c = d.company;
    const key = parseHash().parts[0] || '';
    $('#navLinks').innerHTML = NAV.map((n) => `<li><a href="${n.href}" class="${n.key === key ? 'active' : ''}">${n.label}</a></li>`).join('');
    $('#drawerNav').innerHTML = NAV.map((n) => `<a href="${n.href}" class="${n.key === key ? 'active' : ''}">${n.label}${icon('chevron', '', 18)}</a>`).join('');
    $('#drawerFoot').innerHTML = `
      <a href="#/quote" class="btn btn-primary btn-lg">${icon('zap', '', 18)} Get an instant quote</a>
      <a href="${telHref(c.phone)}" class="btn btn-ghost">${icon('phone', '', 18)} ${E(c.phone)}</a>
      <div class="drawer-contact">${icon('clock', '', 16)} ${E(c.hours)}</div>`;
    $('#waFab').href = waHref('Hi Interkombo Logistics, I would like a quote.');
    $('#waFab').innerHTML = icon('whatsapp', '', 30) + '<span class="wa-tip">Chat with us on WhatsApp</span>';
    const social = [['facebook', c.facebook], ['instagram', c.instagram], ['linkedin', c.linkedin]].filter((s) => s[1]);
    $('#footer').innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div>
            <img class="f-logo" src="assets/img/logo-dark.png" alt="${E(c.name)}">
            <p>${E(c.tagline)}</p>
            ${social.length ? `<div class="socials">${social.map(([n, u]) => `<a href="${E(u)}" target="_blank" rel="noopener" aria-label="${n}">${icon(n, '', 18)}</a>`).join('')}</div>` : ''}
          </div>
          <div><h4>Services</h4><ul>${d.services.slice(0, 6).map((s) => `<li><a href="#/services/${E(s.id)}">${E(s.title)}</a></li>`).join('')}</ul></div>
          <div><h4>Company</h4><ul>
            <li><a href="#/about">About us</a></li><li><a href="#/cross-border">Cross-border</a></li>
            <li><a href="#/quote">Get a quote</a></li><li><a href="#/track">Track shipment</a></li><li><a href="#/contact">Contact</a></li>
          </ul></div>
          <div><h4>Get in touch</h4><ul class="f-contact">
            <li>${icon('phone', '', 17)}<a href="${telHref(c.phone)}">${E(c.phone)}</a></li>
            <li>${icon('mail', '', 17)}<a href="mailto:${E(c.email)}" style="word-break:break-all">${E(c.email)}</a></li>
            <li>${icon('pin', '', 17)}<span>${E(c.address)}</span></li>
            <li>${icon('clock', '', 17)}<span>${E(c.hours)}</span></li>
          </ul></div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} ${E(c.name)}. All rights reserved.</span>
          <span>Website by <a href="https://lcdigitalsolution.co.za" target="_blank" rel="noopener">L.C Digital Solution WebCraft Studios</a></span>
        </div>
      </div>`;
    updateThemeIcon();
  }
  function updateThemeIcon() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    $('#themeBtn').innerHTML = icon(dark ? 'sun' : 'moon', '', 19);
    $('#themeBtn').setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  /* ---------- sections ---------- */
  function heroSection() {
    const d = D(), h = d.hero;
    return `
    <section class="hero">
      <div class="hero-bg"><div class="hero-grid-lines"></div><div class="blob blob-1"></div><div class="blob blob-2"></div><div class="blob blob-3"></div></div>
      <div class="container hero-inner">
        <div class="hero-copy">
          <span class="eyebrow reveal">${E(h.eyebrow)}</span>
          <h1 class="reveal d1">${E(h.title)} <span class="grad-text">${E(h.highlight)}</span></h1>
          <p class="lead reveal d2">${E(h.subtitle)}</p>
          <div class="hero-ctas reveal d3">
            <a href="#/quote" class="btn btn-primary btn-lg">${icon('zap', '', 19)} Get an instant quote</a>
            <a href="#/track" class="btn btn-ghost btn-lg">${icon('search', '', 19)} Track shipment</a>
          </div>
          <div class="trust-row reveal d4">
            <span>${icon('checkCircle', '', 18)} Upfront pricing</span>
            <span>${icon('checkCircle', '', 18)} Live tracking</span>
            <span>${icon('checkCircle', '', 18)} SADC cross-border</span>
          </div>
        </div>
        <div class="hero-visual reveal d2">
          <div class="float-chip c1"><span class="dot-ico">${icon('truck', '', 18)}</span><div><b>On the road</b><small>Pretoria → Harare</small></div></div>
          <div class="qq-card">
            <div class="qq-head">
              <div><h3>Instant estimate</h3><small>No sign-up · takes 10 seconds</small></div>
              
            </div>
            <form class="qq-form" id="qqForm">
              <div class="route-fields">
                <label class="field"><span>Moving from</span><select class="select" name="from" required>${placeOptions('Pretoria', 'Select pickup city')}</select></label>
                <button type="button" class="swap-btn" id="swapBtn" aria-label="Swap pickup and drop-off">${icon('refresh', '', 16)}</button>
                <label class="field"><span>Moving to</span><select class="select" name="to" required>${placeOptions('Cape Town', 'Select destination')}</select></label>
              </div>
              <label class="field"><span>What are you moving?</span><select class="select" name="load">${loadOptions('bed2')}</select></label>
              <div class="qq-estimate" id="qqEst"></div>
              <button class="btn btn-primary btn-lg btn-block" type="submit">Get my full quote ${icon('arrow', '', 18)}</button>
            </form>
          </div>
          <div class="float-chip c2"><span class="dot-ico">${icon('shield', '', 18)}</span><div><b>Goods-in-transit cover</b><small>Available on every move</small></div></div>
        </div>
      </div>
    </section>
    <div class="container track-strip reveal">
      <div class="track-card">
        <div class="track-ico">${icon('package', '', 26)}</div>
        <div><h3>Already booked with us?</h3><p>Enter your tracking number to see where your goods are right now.</p></div>
        <form class="track-form" id="stripTrack">
          <input class="input" name="id" placeholder="e.g. IKL-482913" aria-label="Tracking number" autocomplete="off">
          <button class="btn btn-primary" type="submit">Track ${icon('arrow', '', 17)}</button>
        </form>
      </div>
    </div>`;
  }

  function servicesSection(withHead = true) {
    const d = D();
    return `
    <section class="section" id="services">
      <div class="container">
        ${withHead ? `<div class="section-head reveal"><span class="eyebrow">What we do</span><h2 class="h2">Logistics services built around you</h2><p class="lead">From one box to a full truck load, across town or across the border, we have the vehicle, the crew and the experience.</p></div>` : ''}
        <div class="services-grid">
          ${d.services.map((s, i) => `
            <a class="service-card reveal d${(i % 3) + 1}" href="#/services/${E(s.id)}">
              <div class="svc-ico">${icon(s.icon, '', 26)}</div>
              <h3>${E(s.title)}</h3>
              <p>${E(s.short)}</p>
              <span class="svc-link">Learn more ${icon('arrow', '', 16)}</span>
            </a>`).join('')}
        </div>
      </div>
    </section>`;
  }

  function stepsSection() {
    const steps = [
      ['zap', 'Get a quote', 'Use our instant calculator or WhatsApp us for a fast, upfront price.'],
      ['calendar', 'Book your date', 'Confirm the date that suits you and we lock in your truck and crew.'],
      ['box', 'We pack & load', 'Our trained team wraps, loads and secures every item with care.'],
      ['route', 'Track to delivery', 'Follow your load live until it arrives safely at the door.']
    ];
    return `
    <section class="section section-alt">
      <div class="container">
        <div class="section-head reveal"><span class="eyebrow">How it works</span><h2 class="h2">Moving made simple in 4 steps</h2></div>
        <div class="steps">
          ${steps.map((s, i) => `<div class="step reveal d${i + 1}"><div class="step-num">${icon(s[0], '', 26)}</div><div><h3>${s[1]}</h3><p>${s[2]}</p></div></div>`).join('')}
        </div>
      </div>
    </section>`;
  }

  function statsSection() {
    return `
    <section class="stats-band">
      <div class="container stats-grid">
        ${D().stats.map((s) => `<div class="stat reveal"><b><span class="count" data-to="${E(s.value)}">${E(s.value)}</span><em>${E(s.suffix)}</em></b><span>${E(s.label)}</span></div>`).join('')}
      </div>
    </section>`;
  }

  function crossBorderSection(withHead = true) {
    const cb = D().crossBorder;
    return `
    <section class="section" id="cross-border">
      <div class="container">
        ${withHead ? `<div class="section-head reveal"><span class="eyebrow">Cross-border freight</span><h2 class="h2">Across the border, without the headache</h2><p class="lead">We move household goods and commercial freight into 8 SADC countries and help with the customs paperwork along the way.</p></div>` : ''}
        <div class="cb-grid">
          <div class="country-grid">
            ${cb.countries.map((c, i) => `<div class="country reveal d${(i % 4) + 1}"><span class="flag">${E(c.flag)}</span><div><b>${E(c.name)}</b><small>${E(c.border)}</small></div><span class="time">${E(c.time)}</span></div>`).join('')}
          </div>
          <div class="docs-card reveal d2">
            <h3>${icon('file', '', 22)} Documents checklist</h3>
            <p style="color:var(--text-2);margin:0">Have these ready to help your load clear customs quickly:</p>
            <ul class="check-list">${cb.documents.map((x) => `<li>${icon('checkCircle', '', 18)}<span>${E(x)}</span></li>`).join('')}</ul>
            <a href="#/quote?service=cross-border" class="btn btn-primary btn-block">Quote a cross-border move ${icon('arrow', '', 17)}</a>
          </div>
        </div>
      </div>
    </section>`;
  }

  function whySection() {
    const f = [
      ['wallet', 'Clear, upfront pricing', 'Know the cost before you book, with no hidden fees on the day.'],
      ['shield', 'Handled with care', 'Blankets, wrapping and trained crews protect every item.'],
      ['map', 'Live tracking', 'Follow your goods from collection to delivery with a tracking number.'],
      ['headset', 'Real people, fast replies', 'Talk to our team on WhatsApp or by phone, not a call centre.'],
      ['truck', 'Right truck, every time', 'From 1-ton bakkies to 14-ton trucks for any size of load.'],
      ['globe', 'Border experts', 'Customs paperwork support for smooth SADC crossings.']
    ];
    return `
    <section class="section section-alt">
      <div class="container why-grid">
        <div class="why-visual reveal">
          <img class="mark" src="assets/img/mark.png" alt="">
          <h3>One partner for every move, from the first box to the final signature.</h3>
          <div class="route-card">
            <div class="rc-top"><span>Shipment IKL-482913</span><span>68% complete</span></div>
            <div class="route-line"><span>JHB</span><span class="bar"><i></i></span><span>HRE</span></div>
          </div>
        </div>
        <div>
          <div class="section-head left reveal" style="margin-bottom:0"><span class="eyebrow">Why Interkombo</span><h2 class="h2">The logistics partner you’ll actually recommend</h2><p class="lead">We combine careful handling with modern tools, so your move is organised, visible and on time.</p></div>
          <div class="features-list">
            ${f.map((x, i) => `<div class="feature reveal d${(i % 2) + 1}"><div class="f-ico">${icon(x[0], '', 22)}</div><div><h4>${x[1]}</h4><p>${x[2]}</p></div></div>`).join('')}
          </div>
        </div>
      </div>
    </section>`;
  }

  function testimonialsSection() {
    const d = D();
    if (!d.testimonials.length) return '';
    return `
    <section class="section">
      <div class="container">
        <div class="section-head reveal"><span class="eyebrow">Client stories</span><h2 class="h2">What our clients say</h2></div>
        <div class="testi-grid">
          ${d.testimonials.map((t, i) => `
            <figure class="testi reveal d${(i % 3) + 1}" style="margin:0">
              ${d.testimonialsSample ? '<span class="sample-tag">Sample</span>' : ''}
              <div class="stars">${stars(Number(t.rating) || 5)}</div>
              <p>“${E(t.quote)}”</p>
              <figcaption class="testi-who"><span class="avatar">${E(initials(t.name))}</span><div><b>${E(t.name)}</b><small>${E(t.role)}</small></div></figcaption>
            </figure>`).join('')}
        </div>
      </div>
    </section>`;
  }

  function faqSection() {
    return `
    <section class="section section-alt" id="faq">
      <div class="container">
        <div class="section-head reveal"><span class="eyebrow">FAQ</span><h2 class="h2">Questions, answered</h2></div>
        <div class="faq-wrap">
          ${D().faqs.map((f, i) => `
            <div class="faq reveal ${i === 0 ? 'open' : ''}">
              <button aria-expanded="${i === 0}">${E(f.q)}<span class="tog">${icon('plus', '', 16)}</span></button>
              <div class="faq-body"><div><p>${E(f.a)}</p></div></div>
            </div>`).join('')}
        </div>
      </div>
    </section>`;
  }

  function ctaSection() {
    const c = D().company;
    return `
    <section class="section" style="padding-bottom:0">
      <div class="container">
        <div class="cta-band reveal">
          <div><h2>Ready to move? Let’s get you a price.</h2><p>Instant online estimate, or chat to our team on WhatsApp right now.</p></div>
          <div class="ctas">
            <a href="#/quote" class="btn btn-white btn-lg">${icon('zap', '', 18)} Get a quote</a>
            <a href="${waHref('Hi Interkombo Logistics, I would like a quote.')}" target="_blank" rel="noopener" class="btn btn-outline-white btn-lg">${icon('whatsapp', '', 18)} WhatsApp us</a>
          </div>
        </div>
      </div>
    </section>`;
  }

  function pageHero(title, lead, crumb) {
    return `
    <section class="page-hero">
      <div class="hero-bg"><div class="hero-grid-lines"></div><div class="blob blob-1"></div><div class="blob blob-3"></div></div>
      <div class="container">
        <div class="crumbs"><a href="#/">Home</a>${icon('chevron', '', 14)}<span>${E(crumb || title)}</span></div>
        <h1>${title}</h1>
        ${lead ? `<p class="lead">${lead}</p>` : ''}
      </div>
    </section>`;
  }

  /* ---------- pages ---------- */
  function pageHome() {
    main.innerHTML = heroSection() + servicesSection() + stepsSection() + statsSection() + crossBorderSection() + whySection() + testimonialsSection() + faqSection() + ctaSection();
    bindQuickQuote();
    bindStripTrack();
  }

  function pageServices() {
    main.innerHTML = pageHero('Our <span class="grad-text">services</span>', 'Everything you need to move people, homes and businesses, locally, nationally and across borders.', 'Services') + servicesSection(false) + stepsSection() + ctaSection();
  }

  function pageService(id) {
    const d = D(); const s = d.services.find((x) => x.id === id);
    if (!s) return page404();
    main.innerHTML = `
      ${pageHero(E(s.title), E(s.short), s.title)}
      <section class="section" style="padding-top:1rem">
        <div class="container svc-detail">
          <div>
            <div class="content reveal">
              <div class="svc-ico" style="background:var(--grad);color:#fff">${icon(s.icon, '', 26)}</div>
              <h2 style="font-size:1.6rem">About this service</h2>
              <p>${E(s.description)}</p>
              <div class="feat-grid">${(s.features || []).map((f) => `<div>${icon('checkCircle', '', 18)}${E(f)}</div>`).join('')}</div>
              <a href="#/quote?service=${E(s.id)}" class="btn btn-primary btn-lg">Get a quote for ${E(s.title)} ${icon('arrow', '', 18)}</a>
            </div>
          </div>
          <aside>
            <div class="side-card reveal d1">
              <h3>Need help planning?</h3>
              <p>Speak to our team for advice, a site survey or a custom quote.</p>
              <a href="${telHref(d.company.phone)}" class="btn btn-white">${icon('phone', '', 18)} Call ${E(d.company.phone)}</a>
              <a href="${waHref('Hi, I am interested in ' + s.title + '.')}" target="_blank" rel="noopener" class="btn btn-outline-white">${icon('whatsapp', '', 18)} WhatsApp us</a>
            </div>
            <div class="other-svcs reveal d2">
              ${d.services.filter((x) => x.id !== s.id).map((x) => `<a href="#/services/${E(x.id)}">${icon(x.icon, '', 20)} ${E(x.title)}</a>`).join('')}
            </div>
          </aside>
        </div>
      </section>
      ${ctaSection()}`;
  }

  function pageCrossBorder() {
    main.innerHTML = pageHero('Cross-border <span class="grad-text">freight</span>', 'Door-to-door removals and freight into Zimbabwe, Botswana, Mozambique, Zambia, Namibia, Lesotho, Eswatini and Malawi.', 'Cross-Border') + crossBorderSection(false) + faqSection() + ctaSection();
  }

  function pageAbout() {
    const a = D().about;
    main.innerHTML = `
      ${pageHero('About <span class="grad-text">Interkombo</span>', E(D().company.tagline), 'About')}
      <section class="section" style="padding-top:1rem">
        <div class="container about-grid">
          <div class="reveal">
            <h2 class="h2">${E(a.title)}</h2>
            <p class="lead">${E(a.body)}</p>
            <div class="values">${(a.values || []).map((v) => `<span>${icon('check', '', 16)}${E(v)}</span>`).join('')}</div>
          </div>
          <div class="mv-cards">
            <div class="mv reveal d1"><div class="f-ico">${icon('flag', '', 22)}</div><div><h3>Our mission</h3><p>${E(a.mission)}</p></div></div>
            <div class="mv alt reveal d2"><div class="f-ico">${icon('eye', '', 22)}</div><div><h3>Our vision</h3><p>${E(a.vision)}</p></div></div>
          </div>
        </div>
      </section>
      ${statsSection()}${whySection()}${testimonialsSection()}${ctaSection()}`;
  }

  function pageContact() {
    const c = D().company;
    main.innerHTML = `
      ${pageHero('Let’s <span class="grad-text">talk</span>', 'Questions, quotes or special requests: our team usually replies within the hour.', 'Contact')}
      <section class="section" style="padding-top:1rem">
        <div class="container contact-grid">
          <div>
            <div class="contact-cards">
              <a class="c-card reveal" href="${telHref(c.phone)}"><span class="f-ico">${icon('phone', '', 22)}</span><div><small>Call us</small><b>${E(c.phone)}</b></div></a>
              <a class="c-card wa reveal d1" href="${waHref('Hi Interkombo Logistics')}" target="_blank" rel="noopener"><span class="f-ico">${icon('whatsapp', '', 22)}</span><div><small>WhatsApp</small><b>Chat with us now</b></div></a>
              <a class="c-card reveal d2" href="mailto:${E(c.email)}"><span class="f-ico">${icon('mail', '', 22)}</span><div><small>Email</small><b>${E(c.email)}</b></div></a>
              <div class="c-card reveal d3"><span class="f-ico">${icon('pin', '', 22)}</span><div><small>Based in</small><b>${E(c.address)}</b></div></div>
              <div class="c-card reveal d4"><span class="f-ico">${icon('clock', '', 22)}</span><div><small>Hours</small><b>${E(c.hours)}</b></div></div>
            </div>
            <div class="map-wrap reveal"><iframe title="Map" loading="lazy" src="https://www.google.com/maps?q=${encodeURIComponent(c.mapQuery || c.address)}&output=embed"></iframe></div>
          </div>
          <div class="form-card reveal d1">
            <h2>Send us a message</h2>
            <p style="color:var(--muted)">Fill in the form and we’ll get back to you shortly.</p>
            <form id="contactForm" class="form-grid" novalidate>
              <label class="field"><span>Full name *</span><input class="input" name="name" required autocomplete="name"></label>
              <label class="field"><span>Phone *</span><input class="input" name="phone" type="tel" required autocomplete="tel" inputmode="tel"></label>
              <label class="field full"><span>Email</span><input class="input" name="email" type="email" autocomplete="email"></label>
              <label class="field full"><span>Subject</span>
                <select class="select" name="subject"><option>General enquiry</option><option>Quote request</option><option>Cross-border question</option><option>Shipment update</option><option>Business / contract work</option></select>
              </label>
              <label class="field full"><span>Message *</span><textarea class="textarea" name="message" required placeholder="Tell us what you need…"></textarea></label>
              <div class="full"><button class="btn btn-primary btn-lg btn-block" type="submit">Send message ${icon('arrow', '', 18)}</button></div>
            </form>
          </div>
        </div>
      </section>`;
    $('#contactForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target; const fd = Object.fromEntries(new FormData(f));
      let ok = true;
      ['name', 'phone', 'message'].forEach((k) => { const el = f.elements[k]; const bad = !String(fd[k] || '').trim(); el.classList.toggle('invalid', bad); if (bad) ok = false; });
      if (!ok) { toast('Please fill in the required fields'); return; }
      IKL.update((d) => d.messages.unshift({ id: IKL.uid('m'), createdAt: IKL.now(), read: false, ...fd }));
      f.reset();
      toast('Thanks! Your message has been sent.');
    });
  }

  /* ---------- tracking ---------- */
  function pageTrack(params) {
    const sample = D().shipments.slice(0, 3).map((s) => s.id);
    main.innerHTML = `
      ${pageHero('Track your <span class="grad-text">shipment</span>', 'Enter the tracking number from your booking confirmation to see live status updates.', 'Track')}
      <section class="section" style="padding-top:.5rem">
        <div class="container">
          <form class="track-page-form" id="trackForm">
            <input class="input" name="id" placeholder="Enter tracking number, e.g. IKL-482913" value="${E(params.get('id') || '')}" autocomplete="off" aria-label="Tracking number">
            <button class="btn btn-primary btn-lg" type="submit">${icon('search', '', 19)} Track</button>
          </form>
          ${sample.length ? `<div class="demo-ids">Try a demo: ${sample.map((id) => `<button type="button" data-id="${E(id)}">${E(id)}</button>`).join('')}</div>` : ''}
          <div id="trackOut"></div>
        </div>
      </section>`;
    const run = (id) => {
      id = String(id || '').trim().toUpperCase();
      if (!id) return;
      const s = D().shipments.find((x) => x.id.toUpperCase() === id);
      $('#trackOut').innerHTML = s ? trackResult(s) : `<div class="track-result"><div class="not-found">${icon('search', '', 40)}<h3 style="margin-top:1rem">No shipment found</h3><p style="color:var(--muted)">We couldn’t find <b>${E(id)}</b>. Check the number or contact us for help.</p><a class="btn btn-ghost" href="${waHref('Hi, I need help tracking ' + id)}" target="_blank" rel="noopener">${icon('whatsapp', '', 18)} Ask on WhatsApp</a></div></div>`;
    };
    $('#trackForm').addEventListener('submit', (e) => { e.preventDefault(); const v = e.target.id.value; history.replaceState(null, '', '#/track?id=' + encodeURIComponent(v.trim())); run(v); });
    $$('.demo-ids button').forEach((b) => b.addEventListener('click', () => { $('#trackForm').id.value = b.dataset.id; $('#trackForm').requestSubmit(); }));
    if (params.get('id')) run(params.get('id'));
  }

  function trackResult(s) {
    const cross = IKL.crossSet.has(s.from) || IKL.crossSet.has(s.to) || /cross/i.test(s.service) || s.events.some((e) => e.status === 'border');
    const stages = IKL.STAGES.filter((st) => !st.crossOnly || cross);
    const idx = stages.findIndex((st) => st.id === s.status);
    const events = [...s.events].sort((a, b) => new Date(b.at) - new Date(a.at));
    const label = (id) => (IKL.STAGES.find((x) => x.id === id) || {}).label || id;
    const icons = { booked: 'calendar', collected: 'box', transit: 'truck', border: 'flag', delivery: 'route', delivered: 'check' };
    return `
      <div class="track-result">
        <div class="tr-head">
          <div><small>Tracking number</small><h3>${E(s.id)}</h3></div>
          <span class="pill pill-${E(s.status)}">${E(label(s.status))}</span>
        </div>
        <div class="tr-route">
          <div><small>From</small><b>${E(s.from)}</b></div>
          <div class="mid">${icon('truck', '', 22)}${icon('arrow', '', 18)}</div>
          <div class="end"><small>To</small><b>${E(s.to)}</b></div>
        </div>
        <div class="progress">
          ${stages.map((st, i) => `<div class="prog-step ${i < idx || s.status === 'delivered' ? 'done' : i === idx ? 'current' : ''}"><div class="pdot">${icon(i < idx || s.status === 'delivered' ? 'check' : icons[st.id], '', 16)}</div>${st.label}</div>`).join('')}
        </div>
        ${s.eta && s.status !== 'delivered' ? `<p style="padding:0 1.5rem;margin:0 0 1rem;color:var(--text-2)">${icon('clock', '', 16)} Estimated arrival: <b>${E(IKL.fmtDate(s.eta, false))}</b></p>` : ''}
        <ul class="timeline">
          ${events.map((e) => `<li><span class="tdot"></span><div><b>${E(label(e.status))}${e.location ? ' · ' + E(e.location) : ''}</b><small>${E(IKL.fmtDate(e.at))}${e.note ? ' — ' + E(e.note) : ''}</small></div></li>`).join('')}
        </ul>
      </div>`;
  }

  /* ---------- quote wizard ---------- */
  const SERVICE_IDS = () => D().services.map((s) => s.id);
  function pageQuote(params) {
    const d = D();
    const svc = SERVICE_IDS().includes(params.get('service')) ? params.get('service') : '';
    const q = {
      step: 1, service: svc, from: params.get('from') || '', to: params.get('to') || '', date: '',
      load: params.get('load') || '', extras: [], name: '', phone: '', email: '', notes: ''
    };
    if (svc === 'cross-border' && !q.to) q.to = '';
    main.innerHTML = `
      ${pageHero('Get an <span class="grad-text">instant quote</span>', 'Answer a few quick questions and see your estimate update live. No obligation.', 'Quote')}
      <section class="section" style="padding-top:.5rem">
        <div class="container quote-layout">
          <div class="wizard">
            <div class="wiz-steps" id="wizSteps"></div>
            <form id="wizForm" novalidate><div class="wiz-body" id="wizBody"></div>
              <div class="wiz-nav"><button type="button" class="btn btn-ghost" id="wizBack">${icon('arrowLeft', '', 18)} Back</button><button type="submit" class="btn btn-primary" id="wizNext">Continue ${icon('arrow', '', 18)}</button></div>
            </form>
          </div>
          <aside class="summary" id="summary"></aside>
        </div>
      </section>`;
    document.body.classList.add('has-sum-bar');
    const sumBar = $('#sumBar'); sumBar.hidden = false;

    const STEP_NAMES = ['Service', 'Route', 'Load', 'Details'];
    function drawSteps() {
      $('#wizSteps').innerHTML = STEP_NAMES.map((n, i) => `<div class="wiz-step ${i + 1 === q.step ? 'active' : ''} ${i + 1 < q.step ? 'done' : ''}"><i>${i + 1 < q.step ? icon('check', '', 14) : i + 1}</i><span>${n}</span></div>`).join('');
      $('#wizBack').style.visibility = q.step === 1 ? 'hidden' : 'visible';
      $('#wizNext').innerHTML = q.step === 4 ? `Submit quote request ${icon('check', '', 18)}` : `Continue ${icon('arrow', '', 18)}`;
    }
    function drawBody() {
      const b = $('#wizBody');
      if (q.step === 1) {
        b.innerHTML = `<h2>What do you need?</h2><p class="sub">Choose the service that best fits your move.</p>
          <div class="choice-grid">${d.services.map((s) => `
            <label class="choice ${q.service === s.id ? 'on' : ''}"><input type="radio" name="service" value="${E(s.id)}" ${q.service === s.id ? 'checked' : ''}>
              <span class="tick">${icon('check', '', 13)}</span><span class="c-ico">${icon(s.icon, '', 22)}</span><b>${E(s.title)}</b><small>${E(s.short)}</small></label>`).join('')}</div>`;
      } else if (q.step === 2) {
        b.innerHTML = `<h2>Where are we going?</h2><p class="sub">Pick your pickup and drop-off cities, and your preferred date.</p>
          <div class="form-grid">
            <label class="field"><span>Pickup city *</span><select class="select" name="from">${placeOptions(q.from, 'Select pickup city')}</select></label>
            <label class="field"><span>Destination *</span><select class="select" name="to">${placeOptions(q.to, 'Select destination')}</select></label>
            <label class="field full"><span>Preferred moving date</span><input class="input" type="date" name="date" value="${E(q.date)}" min="${new Date().toISOString().slice(0, 10)}"></label>
          </div>
          <div id="cbNote"></div>`;
      } else if (q.step === 3) {
        b.innerHTML = `<h2>What are we moving?</h2><p class="sub">This decides the right truck for your load.</p>
          <div class="choice-grid">${d.pricing.loads.map((l) => { const v = d.pricing.vehicles.find((x) => x.id === l.vehicle) || {}; return `
            <label class="choice ${q.load === l.id ? 'on' : ''}"><input type="radio" name="load" value="${E(l.id)}" ${q.load === l.id ? 'checked' : ''}>
              <span class="tick">${icon('check', '', 13)}</span><span class="c-ico">${icon(l.vehicle === 'bakkie' ? 'box' : l.id === 'office' ? 'building' : l.id === 'freight' ? 'package' : 'home', '', 22)}</span><b>${E(l.label)}</b><small>${E(v.name || '')}</small></label>`; }).join('')}</div>
          <h3 style="font-size:1.1rem;margin:1.75rem 0 .3rem">Optional extras</h3><p class="sub" style="margin-bottom:1rem;color:var(--muted)">Add any services you’d like included.</p>
          <div class="choice-grid two">${d.pricing.extras.map((x) => `
            <label class="choice ${q.extras.includes(x.id) ? 'on' : ''}"><input type="checkbox" name="extras" value="${E(x.id)}" ${q.extras.includes(x.id) ? 'checked' : ''}>
              <span class="tick">${icon('check', '', 13)}</span><b>${E(x.label)}</b><span class="price">+ ${IKL.money(x.price)}</span></label>`).join('')}</div>`;
      } else {
        b.innerHTML = `<h2>Where should we send your quote?</h2><p class="sub">We’ll confirm your final price within the hour during business hours.</p>
          <div class="form-grid">
            <label class="field"><span>Full name *</span><input class="input" name="name" value="${E(q.name)}" autocomplete="name"></label>
            <label class="field"><span>Phone / WhatsApp *</span><input class="input" name="phone" type="tel" inputmode="tel" value="${E(q.phone)}" autocomplete="tel"></label>
            <label class="field full"><span>Email</span><input class="input" name="email" type="email" value="${E(q.email)}" autocomplete="email"></label>
            <label class="field full"><span>Anything we should know?</span><textarea class="textarea" name="notes" placeholder="Stairs, large items like a piano, access restrictions…">${E(q.notes)}</textarea></label>
          </div>`;
      }
      b.classList.remove('page-enter'); void b.offsetWidth; b.classList.add('page-enter');
      cbNote();
    }
    function cbNote() {
      const el = $('#cbNote'); if (!el) return;
      const cross = IKL.crossSet.has(q.from) || IKL.crossSet.has(q.to);
      el.innerHTML = cross ? `<div class="cb-note">${icon('globe', '', 18)}<span>This is a <b>cross-border</b> move. We’ll include customs clearing admin and send you a documents checklist.</span></div>` : '';
    }
    function drawSummary() {
      const ready = q.from && q.to && q.from !== q.to;
      const est = ready ? IKL.estimate(d, { from: q.from, to: q.to, load: q.load || 'bed1', extras: q.extras }) : null;
      const svc = d.services.find((s) => s.id === q.service);
      $('#summary').innerHTML = `
        <div class="summary-top"><small>Estimated cost</small>
          <div class="big">${est ? IKL.money(est.total) : 'R —'}</div>
          <div class="range">${est ? `Typical range ${IKL.money(est.low)} – ${IKL.money(est.high)}` : 'Choose your route to see a price'}</div>
        </div>
        <div class="summary-body">
          ${svc ? `<p style="margin:0 0 1rem;font-weight:600;display:flex;gap:.5rem;align-items:center">${icon(svc.icon, '', 18)} ${E(svc.title)}</p>` : ''}
          ${ready ? `<div class="sum-route"><span class="dot"></span><div><span>${E(q.from)}</span></div><span class="vline"></span><span></span><span class="dot end"></span><div><span>${E(q.to)}</span><small>≈ ${est.km.toLocaleString('en-ZA')} km by road${est.isCross ? ' · cross-border' : ''}</small></div></div>` : ''}
          ${est ? `<ul class="lines">${est.lines.map((l) => `<li><span>${E(l.label)}</span><b>${IKL.money(l.amount)}</b></li>`).join('')}<li class="total"><span>Estimate</span><b>${IKL.money(est.total)}</b></li></ul>
            ${!q.load ? `<p class="disclaimer" style="margin-bottom:.75rem">${icon('help', '', 16)} Based on a 1-bedroom load until you choose a size.</p>` : ''}` : `<p class="empty-sum">${icon('route', '', 28)}<br>Your price breakdown will appear here.</p>`}
          <p class="disclaimer">${icon('shield', '', 16)} Estimates are a guide. Your final price is confirmed after a quick call or video survey.</p>
        </div>`;
      sumBar.innerHTML = `<div><small>Estimated cost</small><b>${est ? IKL.money(est.total) : 'R —'}</b></div><button type="button" class="btn btn-primary btn-sm" id="sumBarBtn">${q.step === 4 ? 'Submit' : 'Continue'} ${icon('arrow', '', 16)}</button>`;
      $('#sumBarBtn').onclick = () => $('#wizForm').requestSubmit();
    }
    function read() {
      const f = $('#wizForm');
      if (q.step === 1) { const r = f.querySelector('input[name=service]:checked'); if (r) q.service = r.value; }
      if (q.step === 2) { q.from = f.from.value; q.to = f.to.value; q.date = f.date.value; }
      if (q.step === 3) { const r = f.querySelector('input[name=load]:checked'); if (r) q.load = r.value; q.extras = $$('input[name=extras]:checked', f).map((x) => x.value); }
      if (q.step === 4) { ['name', 'phone', 'email', 'notes'].forEach((k) => (q[k] = f.elements[k].value)); }
    }
    function validate() {
      const f = $('#wizForm');
      if (q.step === 1 && !q.service) { toast('Please choose a service'); return false; }
      if (q.step === 2) {
        f.from.classList.toggle('invalid', !q.from); f.to.classList.toggle('invalid', !q.to);
        if (!q.from || !q.to) { toast('Please choose pickup and destination'); return false; }
        if (q.from === q.to) { f.to.classList.add('invalid'); toast('Pickup and destination must be different'); return false; }
      }
      if (q.step === 3 && !q.load) { toast('Please choose what you are moving'); return false; }
      if (q.step === 4) {
        const badN = !q.name.trim(), badP = String(q.phone).replace(/\D/g, '').length < 9;
        f.name.classList.toggle('invalid', badN); f.phone.classList.toggle('invalid', badP);
        if (badN || badP) { toast('Please add your name and a valid phone number'); return false; }
      }
      return true;
    }
    $('#wizForm').addEventListener('change', (e) => {
      read();
      if (e.target.matches('input[type=radio], input[type=checkbox]')) $$('.choice', $('#wizForm')).forEach((c) => c.classList.toggle('on', c.querySelector('input').checked));
      e.target.classList.remove('invalid');
      cbNote(); drawSummary();
      if (q.step === 1 && e.target.name === 'service') setTimeout(() => $('#wizForm').requestSubmit(), 220);
    });
    $('#wizForm').addEventListener('input', (e) => { if (q.step === 4) { read(); e.target.classList.remove('invalid'); } });
    $('#wizBack').addEventListener('click', () => { read(); if (q.step > 1) { q.step--; drawSteps(); drawBody(); drawSummary(); scrollToWizard(); } });
    $('#wizForm').addEventListener('submit', (e) => {
      e.preventDefault(); read();
      if (!validate()) return;
      if (q.step < 4) { q.step++; drawSteps(); drawBody(); drawSummary(); scrollToWizard(); return; }
      submitQuote(q);
    });
    function scrollToWizard() { const top = $('.wizard').getBoundingClientRect().top + scrollY - 90; if (scrollY > top) scrollTo({ top, behavior: 'smooth' }); }
    drawSteps(); drawBody(); drawSummary();
  }

  function submitQuote(q) {
    const d = D();
    const est = IKL.estimate(d, q);
    const svc = d.services.find((s) => s.id === q.service);
    const ref = IKL.nextRef('IKQ', d.quotes);
    const extrasLabels = q.extras.map((id) => (d.pricing.extras.find((x) => x.id === id) || {}).label).filter(Boolean);
    IKL.update((data) => data.quotes.unshift({
      id: ref, createdAt: IKL.now(), status: 'new', service: svc ? svc.title : q.service, from: q.from, to: q.to, date: q.date,
      load: est.load.label, vehicle: est.vehicle.name, extras: extrasLabels, distance: est.km, estimate: est.total,
      name: q.name.trim(), phone: q.phone.trim(), email: q.email.trim(), notes: q.notes.trim()
    }));
    cleanupQuote();
    const msg = `Hi Interkombo Logistics, I just requested a quote (${ref}).\n${svc ? svc.title : ''}: ${q.from} → ${q.to}\nLoad: ${est.load.label}${q.date ? '\nDate: ' + q.date : ''}\nEstimate: ${IKL.money(est.total)}\nName: ${q.name}`;
    main.innerHTML = `
      ${pageHero('Quote <span class="grad-text">received</span>', '', 'Quote')}
      <section class="section" style="padding-top:0">
        <div class="container">
          <div class="success-card">
            <div class="success-ico">${icon('check', '', 42)}</div>
            <h2>Thank you, ${E(q.name.split(' ')[0])}!</h2>
            <p style="color:var(--text-2)">Your quote request has been received. Your estimated cost is <b>${IKL.money(est.total)}</b>. We’ll contact you shortly to confirm the final price.</p>
            <div>Your reference number</div>
            <div class="ref-box">${E(ref)} <button type="button" id="copyRef" aria-label="Copy reference">${icon('copy', '', 18)}</button></div>
            <div class="ctas">
              <a class="btn btn-primary btn-lg" href="${waHref(msg)}" target="_blank" rel="noopener" style="background:#25d366;box-shadow:none">${icon('whatsapp', '', 19)} Send to WhatsApp</a>
              <a class="btn btn-ghost btn-lg" href="#/">Back to home</a>
            </div>
          </div>
        </div>
      </section>`;
    $('#copyRef').onclick = () => { navigator.clipboard && navigator.clipboard.writeText(ref); toast('Reference copied'); };
    scrollTo({ top: 0, behavior: 'smooth' });
  }
  function cleanupQuote() { document.body.classList.remove('has-sum-bar'); const b = $('#sumBar'); b.hidden = true; b.innerHTML = ''; }

  function page404() {
    main.innerHTML = pageHero('Page not <span class="grad-text">found</span>', 'The page you’re looking for has moved, or never existed.', '404') + `<div class="container" style="padding-bottom:3rem"><a class="btn btn-primary" href="#/">${icon('home', '', 18)} Go home</a></div>`;
  }

  /* ---------- bindings ---------- */
  function bindQuickQuote() {
    const f = $('#qqForm'); if (!f) return;
    const upd = () => {
      const d = D();
      if (f.from.value && f.to.value && f.from.value !== f.to.value) {
        const e = IKL.estimate(d, { from: f.from.value, to: f.to.value, load: f.load.value, extras: [] });
        $('#qqEst').innerHTML = `<div><small>Estimated from</small><strong>${IKL.money(e.low)}</strong></div><div class="km">≈ ${e.km.toLocaleString('en-ZA')} km<br>${E(e.vehicle.name)}</div>`;
      } else $('#qqEst').innerHTML = `<div><small>Estimated from</small><strong>R —</strong></div><div class="km">Choose two<br>different cities</div>`;
    };
    f.addEventListener('change', upd); upd();
    $('#swapBtn').onclick = () => { const a = f.from.value; f.from.value = f.to.value; f.to.value = a; upd(); };
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const p = new URLSearchParams({ from: f.from.value, to: f.to.value, load: f.load.value });
      location.hash = '#/quote?' + p.toString();
    });
  }
  function bindStripTrack() {
    const f = $('#stripTrack'); if (!f) return;
    f.addEventListener('submit', (e) => { e.preventDefault(); const v = f.id.value.trim(); location.hash = '#/track' + (v ? '?id=' + encodeURIComponent(v) : ''); });
  }
  function bindFAQ() {
    $$('.faq button').forEach((b) => b.addEventListener('click', () => {
      const item = b.parentElement; const open = !item.classList.contains('open');
      item.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
    }));
  }
  let io;
  function bindReveal() {
    if (io) io.disconnect();
    if (!('IntersectionObserver' in window)) { $$('.reveal').forEach((el) => el.classList.add('in')); return; }
    io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); const c = en.target.querySelector('.count'); if (c) countUp(c); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach((el) => io.observe(el));
  }
  function countUp(el) {
    const to = parseFloat(el.dataset.to); if (isNaN(to) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dur = 1200, t0 = performance.now();
    const tick = (t) => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  /* ---------- router ---------- */
  function route() {
    const { parts, params } = parseHash();
    cleanupQuote();
    closeDrawer();
    const p = parts[0] || '';
    if (p === '') pageHome();
    else if (p === 'services' && parts[1]) pageService(parts[1]);
    else if (p === 'services') pageServices();
    else if (p === 'quote') pageQuote(params);
    else if (p === 'track') pageTrack(params);
    else if (p === 'cross-border') pageCrossBorder();
    else if (p === 'about') pageAbout();
    else if (p === 'contact') pageContact();
    else page404();
    renderShell();
    bindFAQ(); bindReveal();
    main.classList.remove('page-enter'); void main.offsetWidth; main.classList.add('page-enter');
    const titles = { '': 'Removals, Relocation & Cross-Border Freight', services: 'Services', quote: 'Instant Quote', track: 'Track Shipment', 'cross-border': 'Cross-Border Freight', about: 'About Us', contact: 'Contact' };
    document.title = 'Interkombo Logistics | ' + (titles[p] || 'Page');
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  /* ---------- global UI ---------- */
  function openDrawer() { document.body.classList.add('drawer-open'); }
  function closeDrawer() { document.body.classList.remove('drawer-open'); }
  $('#menuBtn').innerHTML = icon('menu', '', 22);
  $('#closeDrawer').innerHTML = icon('x', '', 22);
  $('#toTop').innerHTML = icon('chevron', '', 20).replace('<svg', '<svg style="transform:rotate(-90deg)"');
  $('#menuBtn').onclick = openDrawer;
  $('#closeDrawer').onclick = closeDrawer;
  $('#drawerBackdrop').onclick = closeDrawer;
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
  $('#themeBtn').onclick = () => { IKL.toggleTheme(); updateThemeIcon(); };
  $('#toTop').onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
  const onScroll = () => { $('#header').classList.toggle('scrolled', scrollY > 10); $('#toTop').classList.toggle('show', scrollY > 700); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  addEventListener('hashchange', route);
  // Live-refresh when admin edits content in another tab (skip on quote page so in-progress forms aren't lost)
  IKL.onChange(() => { const p = parseHash().parts[0] || ''; if (!['quote', 'contact', 'track'].includes(p)) route(); else renderShell(); });
  route();
})();
