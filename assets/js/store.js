/* Interkombo Logistics — data layer
 * All site content and records live here. Right now it persists to localStorage.
 * When the client confirms Supabase, only this file needs to change:
 * swap load()/persist() for Supabase queries and keep the same API.
 */
(function () {
  const KEY = 'ikl_data_v1';

  const uid = (p = '') => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  const now = () => new Date().toISOString();
  const daysAgo = (d, h = 0) => new Date(Date.now() - d * 864e5 - h * 36e5).toISOString();

  const DEFAULTS = {
    version: 1,
    company: {
      name: 'Interkombo Logistics',
      tagline: 'Removals, relocations & freight — across South Africa and beyond.',
      phone: '076 095 0954',
      whatsapp: '27624821827',
      email: 'lazaruschitsuro@lcdigitalsolution.co.za',
      address: 'Pretoria, Gauteng, South Africa',
      hours: 'Mon – Sat: 07:00 – 18:00 · Emergency moves 24/7',
      facebook: '',
      instagram: '',
      linkedin: '',
      mapQuery: 'Pretoria, Gauteng'
    },
    hero: {
      eyebrow: 'South Africa · SADC cross-border',
      title: 'Moving your world,',
      highlight: 'safely and on time.',
      image: '',
      subtitle: 'Household removals, office relocations and freight transport across all 9 provinces and into neighbouring countries. You get one team, clear pricing and live tracking.'
    },
    stats: [
      { value: '9', suffix: '', label: 'Provinces covered' },
      { value: '8', suffix: '', label: 'SADC countries' },
      { value: '24', suffix: '/7', label: 'Shipment tracking' },
      { value: '1', suffix: ' hr', label: 'Quote response time' }
    ],
    about: {
      title: 'A logistics partner that treats your goods like its own',
      body: 'Interkombo Logistics was founded to make moving and freight simple, transparent and stress-free. Whether it is a family relocating to a new city, a business moving offices over a weekend, or a supplier sending stock across the border, we plan every load carefully, handle it with care and keep you updated from collection to delivery.',
      mission: 'To deliver reliable, affordable and transparent logistics that help people and businesses move forward.',
      vision: 'To be Southern Africa’s most trusted name in removals and cross-border transport.',
      values: ['Reliability', 'Care', 'Transparency', 'Safety', 'Speed'],
      image: ''
    },
    media: {
      why: '',
      cta: '',
      crossBorder: ''
    },
    services: [
      { id: 'removals', image: '', icon: 'home', title: 'Home Removals', short: 'Stress-free household moves, packed, loaded and delivered with care.',
        description: 'From a single room to a full family home, our trained crew wraps, loads, transports and places every item where you want it. We supply blankets, wrapping and boxes so nothing arrives damaged.',
        features: ['Professional packing & wrapping', 'Furniture dismantling & assembly', 'Fragile & high-value item handling', 'Same-day local moves'] },
      { id: 'relocation', image: '', icon: 'building', title: 'Office & Corporate Relocation', short: 'Move your business with minimal downtime, even over a weekend.',
        description: 'We plan office moves around your operations: labelled crates, IT equipment handling and after-hours or weekend moves so your team is working on Monday morning.',
        features: ['After-hours & weekend moves', 'IT & server equipment care', 'Labelled crate system', 'Dedicated move coordinator'] },
      { id: 'freight', image: '', icon: 'truck', title: 'Goods Transportation', short: 'Reliable freight for suppliers, retailers and contractors.',
        description: 'Full-load and part-load transport for stock, building materials, equipment and palletised goods, from 1-ton bakkies to 14-ton trucks.',
        features: ['Full & part loads (FTL / LTL)', 'Palletised & bulk goods', 'Construction material delivery', 'Scheduled contract runs'] },
      { id: 'cross-border', image: '', icon: 'globe', title: 'Cross-Border Freight', short: 'Door-to-door into Zimbabwe, Botswana, Mozambique and more.',
        description: 'We handle the paperwork, the border and the road. Our team helps with customs documentation and clearing so your goods move through Beitbridge, Groblersdorp, Lebombo and other posts without surprises.',
        features: ['Customs documentation support', 'Clearing agent coordination', 'Border status updates', 'Household & commercial loads'] },
      { id: 'national', image: '', icon: 'route', title: 'Nationwide Delivery', short: 'Long-distance delivery between every major SA city.',
        description: 'Scheduled and dedicated long-distance runs connecting Gauteng, the Western Cape, KwaZulu-Natal, Limpopo and every province in between.',
        features: ['All 9 provinces', 'Dedicated or shared loads', 'Live tracking & ETAs', 'Proof of delivery'] },
      { id: 'storage', image: '', icon: 'box', title: 'Packing & Storage', short: 'Secure short and long-term storage between moves.',
        description: 'Need a place for your goods between homes, or while you renovate? We pack, collect and store your items securely until you are ready.',
        features: ['Packing materials supplied', 'Short & long-term storage', 'Inventory list for every load', 'Collect & redeliver on request'] }
    ],
    crossBorder: {
      countries: [
        { name: 'Zimbabwe', flag: '🇿🇼', border: 'Beitbridge', time: '2–4 days' },
        { name: 'Botswana', flag: '🇧🇼', border: 'Groblers Bridge / Tlokweng', time: '1–3 days' },
        { name: 'Mozambique', flag: '🇲🇿', border: 'Lebombo', time: '2–3 days' },
        { name: 'Zambia', flag: '🇿🇲', border: 'Beitbridge → Chirundu', time: '4–6 days' },
        { name: 'Namibia', flag: '🇳🇦', border: 'Vioolsdrif / Ariamsvlei', time: '3–5 days' },
        { name: 'Lesotho', flag: '🇱🇸', border: 'Maseru Bridge', time: '1–2 days' },
        { name: 'Eswatini', flag: '🇸🇿', border: 'Oshoek', time: '1–2 days' },
        { name: 'Malawi', flag: '🇲🇼', border: 'Via Mozambique / Zimbabwe', time: '5–7 days' }
      ],
      documents: [
        'Copy of ID or passport for sender and receiver',
        'Detailed inventory or commercial invoice',
        'Proof of residence (for household goods)',
        'Import / export permits where required',
        'Customs declaration (we help you complete it)',
        'Tax clearance or business registration (commercial loads)'
      ]
    },
    pricing: {
      currency: 'R',
      minCharge: 650,
      vehicles: [
        { id: 'bakkie', name: '1-Ton Bakkie', capacity: 'Boxes, small items, single room', base: 450, perKm: 9 },
        { id: 't4', name: '4-Ton Truck', capacity: '1–2 bedroom home or small office', base: 1200, perKm: 16 },
        { id: 't8', name: '8-Ton Truck', capacity: '3–4 bedroom home or medium office', base: 2200, perKm: 24 },
        { id: 't14', name: '14-Ton Truck', capacity: 'Large homes, full freight loads', base: 3500, perKm: 34 }
      ],
      loads: [
        { id: 'small', label: 'Few items / boxes', vehicle: 'bakkie' },
        { id: 'bed1', label: '1 bedroom / flat', vehicle: 't4' },
        { id: 'bed2', label: '2–3 bedroom home', vehicle: 't8' },
        { id: 'bed4', label: '4+ bedroom home', vehicle: 't14' },
        { id: 'office', label: 'Office / business', vehicle: 't8' },
        { id: 'freight', label: 'Full freight load', vehicle: 't14' }
      ],
      crossBorderFee: 3500,
      extras: [
        { id: 'packing', label: 'Full packing service', price: 1500 },
        { id: 'insurance', label: 'Goods-in-transit cover', price: 750 },
        { id: 'assembly', label: 'Furniture dismantle & assembly', price: 900 },
        { id: 'storage', label: 'Storage (first month)', price: 1800 }
      ]
    },
    testimonialsSample: true,
    testimonials: [
      { id: 't1', name: 'Thandiwe M.', role: 'Home move · Pretoria → Cape Town', quote: 'Everything arrived exactly as it left, and the team kept me updated the whole way. Moving has never been this easy.', rating: 5 },
      { id: 't2', name: 'Kagiso Trading', role: 'Freight · Johannesburg → Gaborone', quote: 'They sorted the paperwork, the border and the delivery. Our stock reached the client a day early.', rating: 5 },
      { id: 't3', name: 'Ruvimbo C.', role: 'Cross-border · Polokwane → Harare', quote: 'Clear price upfront, no surprises at Beitbridge and friendly drivers. I will definitely use them again.', rating: 5 }
    ],
    faqs: [
      { id: 'f1', q: 'How is my quote calculated?', a: 'Your quote is based on the distance, the size of your load (which decides the truck), any extras you choose and border fees for cross-border trips. The online calculator gives an instant estimate, and we confirm the final price after a quick call or video survey.' },
      { id: 'f2', q: 'Do you move goods across the border?', a: 'Yes. We run cross-border loads into Zimbabwe, Botswana, Mozambique, Zambia, Namibia, Lesotho, Eswatini and Malawi, and help with customs documentation and clearing.' },
      { id: 'f3', q: 'Are my goods insured during the move?', a: 'Goods-in-transit cover is available on every move. Add it in the quote calculator or ask our team for the full terms.' },
      { id: 'f4', q: 'How far in advance should I book?', a: 'For local moves, 3–5 days is usually enough. For long-distance and cross-border moves, we recommend booking 1–2 weeks ahead, especially at month-end.' },
      { id: 'f5', q: 'Can I track my shipment?', a: 'Yes. Every booking gets a tracking number. Enter it on our Track page to see the current status and history of your load.' },
      { id: 'f6', q: 'Do you supply boxes and packing materials?', a: 'We do. Choose the full packing service and we bring everything, or ask us to drop off boxes and wrapping so you can pack yourself.' }
    ],
    quotes: [
      { id: 'IKQ-10482', createdAt: daysAgo(0, 2), status: 'new', service: 'Home Removals', from: 'Pretoria', to: 'Cape Town', date: '', load: '2–3 bedroom home', vehicle: '8-Ton Truck', extras: ['Full packing service'], distance: 1460, estimate: 39740, name: 'Sipho Ndlovu', phone: '082 000 0000', email: 'sipho@example.com', notes: 'Piano included.' },
      { id: 'IKQ-10477', createdAt: daysAgo(1, 5), status: 'contacted', service: 'Cross-Border Freight', from: 'Johannesburg', to: 'Harare', date: '', load: 'Full freight load', vehicle: '14-Ton Truck', extras: ['Goods-in-transit cover'], distance: 1120, estimate: 45830, name: 'Farai Moyo', phone: '071 000 0000', email: 'farai@example.com', notes: '' },
      { id: 'IKQ-10469', createdAt: daysAgo(3, 1), status: 'won', service: 'Office & Corporate Relocation', from: 'Centurion', to: 'Sandton', date: '', load: 'Office / business', vehicle: '8-Ton Truck', extras: [], distance: 45, estimate: 3280, name: 'Lerato Office Supplies', phone: '060 000 0000', email: 'admin@example.com', notes: 'Weekend move.' }
    ],
    shipments: [
      { id: 'IKL-482913', customer: 'Farai Moyo', service: 'Cross-Border Freight', from: 'Johannesburg', to: 'Harare', status: 'border', eta: '', createdAt: daysAgo(2),
        events: [
          { at: daysAgo(2, 0), status: 'booked', location: 'Johannesburg', note: 'Booking confirmed' },
          { at: daysAgo(1, 20), status: 'collected', location: 'Johannesburg', note: 'Goods collected and loaded' },
          { at: daysAgo(1, 8), status: 'transit', location: 'Polokwane', note: 'On the N1 heading north' },
          { at: daysAgo(0, 3), status: 'border', location: 'Beitbridge Border Post', note: 'Customs clearance in progress' }
        ] },
      { id: 'IKL-305771', customer: 'Lerato Office Supplies', service: 'Office & Corporate Relocation', from: 'Centurion', to: 'Sandton', status: 'delivered', eta: '', createdAt: daysAgo(3),
        events: [
          { at: daysAgo(3, 0), status: 'booked', location: 'Centurion', note: 'Booking confirmed' },
          { at: daysAgo(2, 6), status: 'collected', location: 'Centurion', note: 'Crates loaded' },
          { at: daysAgo(2, 4), status: 'transit', location: 'N1 North', note: 'En route' },
          { at: daysAgo(2, 3), status: 'delivered', location: 'Sandton', note: 'Delivered and signed for' }
        ] },
      { id: 'IKL-771204', customer: 'Sipho Ndlovu', service: 'Home Removals', from: 'Pretoria', to: 'Durban', status: 'transit', eta: '', createdAt: daysAgo(1),
        events: [
          { at: daysAgo(1, 0), status: 'booked', location: 'Pretoria', note: 'Booking confirmed' },
          { at: daysAgo(0, 9), status: 'collected', location: 'Pretoria', note: 'Household goods packed and loaded' },
          { at: daysAgo(0, 4), status: 'transit', location: 'Harrismith', note: 'On the N3 towards Durban' }
        ] }
    ],
    messages: [
      { id: 'm1', createdAt: daysAgo(0, 5), read: false, name: 'Naledi K.', email: 'naledi@example.com', phone: '073 000 0000', subject: 'Storage enquiry', message: 'Hi, do you offer storage for 3 months between moves?' }
    ],
    subscribers: [
      { id: 's1', createdAt: daysAgo(1, 3), email: 'thabo@example.com', name: 'Thabo', source: 'Newsletter' },
      { id: 's2', createdAt: daysAgo(0, 6), email: 'grace@example.com', name: '', source: 'Discount popup' }
    ],
    promos: [
      { id: 'p1', code: 'MOVE10', type: 'percent', value: 10, title: '10% off your first move', description: 'New customers save 10% on any home removal or relocation.', expires: '', active: true, featured: true },
      { id: 'p2', code: 'BORDER500', type: 'fixed', value: 500, title: 'R500 off cross-border', description: 'Save R500 on any cross-border move into SADC.', expires: '', active: true, featured: true },
      { id: 'p3', code: 'MIDWEEK15', type: 'percent', value: 15, title: '15% off midweek moves', description: 'Book a Tuesday–Thursday local move and save 15%.', expires: '', active: true, featured: true }
    ],
    marketing: {
      bannerEnabled: true,
      bannerText: 'Launch special: get 10% off your first move with code MOVE10',
      popupEnabled: true,
      popupTitle: 'Get 10% off your first move',
      popupText: 'Join our newsletter for moving tips and exclusive deals, and unlock your discount code instantly.',
      popupCode: 'MOVE10',
      popupDelay: 8,
      popupImage: 'https://images.unsplash.com/photo-1746985106190-6c116edec9bc?auto=format&fit=crop&w=1400&q=75',
      newsletterTitle: 'Moving tips & exclusive deals',
      newsletterText: 'Join our mailing list for promotions, discount codes and helpful moving checklists. No spam, unsubscribe anytime.'
    },
    admin: { username: 'admin', password: 'interkombo2026' }
  };

  // Tracking stages, in order
  const STAGES = [
    { id: 'booked', label: 'Booked' },
    { id: 'collected', label: 'Collected' },
    { id: 'transit', label: 'In transit' },
    { id: 'border', label: 'At border', crossOnly: true },
    { id: 'delivery', label: 'Out for delivery' },
    { id: 'delivered', label: 'Delivered' }
  ];

  // Approximate coordinates for the distance estimator
  const PLACES = {
    'South Africa': {
      'Johannesburg': [-26.204, 28.047], 'Pretoria': [-25.747, 28.229], 'Centurion': [-25.86, 28.19], 'Sandton': [-26.107, 28.056],
      'Midrand': [-25.99, 28.13], 'Cape Town': [-33.925, 18.424], 'Durban': [-29.858, 31.03], 'Pietermaritzburg': [-29.6, 30.38],
      'Polokwane': [-23.904, 29.469], 'Tzaneen': [-23.833, 30.163], 'Thohoyandou': [-22.95, 30.48], 'Musina': [-22.35, 30.04],
      'Mbombela (Nelspruit)': [-25.465, 30.985], 'Emalahleni (Witbank)': [-25.87, 29.23], 'Rustenburg': [-25.667, 27.242], 'Mahikeng': [-25.85, 25.64],
      'Bloemfontein': [-29.085, 26.159], 'Kimberley': [-28.738, 24.763], 'Gqeberha (Port Elizabeth)': [-33.96, 25.6], 'East London': [-33.015, 27.912],
      'George': [-33.963, 22.462], 'Upington': [-28.45, 21.25], 'Richards Bay': [-28.78, 32.04], 'Harrismith': [-28.27, 29.13]
    },
    'Cross-border': {
      'Harare, Zimbabwe': [-17.829, 31.053], 'Bulawayo, Zimbabwe': [-20.15, 28.58], 'Masvingo, Zimbabwe': [-20.06, 30.83],
      'Gaborone, Botswana': [-24.654, 25.908], 'Francistown, Botswana': [-21.17, 27.51], 'Maputo, Mozambique': [-25.966, 32.583],
      'Lusaka, Zambia': [-15.387, 28.322], 'Windhoek, Namibia': [-22.56, 17.083], 'Maseru, Lesotho': [-29.31, 27.48],
      'Mbabane, Eswatini': [-26.305, 31.136], 'Lilongwe, Malawi': [-13.963, 33.774], 'Blantyre, Malawi': [-15.786, 35.005]
    }
  };
  const coords = {};
  const crossSet = new Set();
  Object.entries(PLACES).forEach(([g, list]) => Object.entries(list).forEach(([n, c]) => { coords[n] = c; if (g === 'Cross-border') crossSet.add(n); }));

  function distanceKm(a, b) {
    const p = coords[a], q = coords[b];
    if (!p || !q) return 0;
    const R = 6371, rad = (x) => x * Math.PI / 180;
    const dLat = rad(q[0] - p[0]), dLon = rad(q[1] - p[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(p[0])) * Math.cos(rad(q[0])) * Math.sin(dLon / 2) ** 2;
    const straight = 2 * R * Math.asin(Math.sqrt(h));
    return Math.max(5, Math.round(straight * 1.28)); // road factor
  }

  function estimate(data, input) {
    const pr = data.pricing;
    const load = pr.loads.find((l) => l.id === input.load) || pr.loads[0];
    const vehicle = pr.vehicles.find((v) => v.id === load.vehicle) || pr.vehicles[0];
    const km = distanceKm(input.from, input.to);
    const isCross = crossSet.has(input.from) || crossSet.has(input.to);
    const lines = [];
    lines.push({ label: `${vehicle.name} call-out`, amount: vehicle.base });
    lines.push({ label: `${km.toLocaleString('en-ZA')} km × ${pr.currency}${vehicle.perKm}/km`, amount: km * vehicle.perKm });
    if (isCross) lines.push({ label: 'Cross-border admin & clearing', amount: pr.crossBorderFee });
    (input.extras || []).forEach((id) => { const e = pr.extras.find((x) => x.id === id); if (e) lines.push({ label: e.label, amount: e.price }); });
    let total = lines.reduce((s, l) => s + Number(l.amount || 0), 0);
    total = Math.max(total, pr.minCharge);
    const promo = findPromo(data, input.promo);
    let discount = 0;
    if (promo) {
      discount = promo.type === 'percent' ? Math.round(total * Number(promo.value) / 100) : Math.min(total, Number(promo.value));
      lines.push({ label: `Promo ${promo.code}`, amount: -discount, promo: true });
      total = total - discount;
    }
    return { km, isCross, vehicle, load, lines, total, promo, discount, low: Math.round(total * 0.92 / 10) * 10, high: Math.round(total * 1.08 / 10) * 10 };
  }

  const clone = (o) => JSON.parse(JSON.stringify(o));
  let cache = null;

  /* ---------- Supabase connection ---------- */
  const SUPA_URL = 'https://hnagbyslldklisatkbkm.supabase.co';
  const SUPA_KEY = 'sb_publishable_AsxVRm0oTKTFOEqKwcNyYw_lvOB4uig';
  const CONTENT_KEYS = ['company', 'hero', 'stats', 'about', 'media', 'services', 'crossBorder', 'pricing', 'testimonialsSample', 'testimonials', 'faqs', 'promos', 'marketing'];
  const RECORDS = ['quotes', 'shipments', 'messages', 'subscribers'];
  const CACHE_KEY = 'ikl_content_cache_v3';
  const sb = window.supabase && window.supabase.createClient ? window.supabase.createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
  let isAdmin = false;
  let snapshot = {}; // last state known to be in the database
  const errorListeners = [];
  const reportError = (msg) => { console.warn('[IKL]', msg); errorListeners.forEach((fn) => fn(msg)); };

  function pickContent(d) { const o = {}; CONTENT_KEYS.forEach((k) => { if (d[k] !== undefined) o[k] = d[k]; }); return o; }
  function takeSnapshot() {
    snapshot = { content: JSON.stringify(pickContent(cache)) };
    RECORDS.forEach((k) => { snapshot[k] = new Map((cache[k] || []).map((x) => [x.id, JSON.stringify(x)])); });
  }

  function load() {
    if (cache) return cache;
    cache = clone(DEFAULTS);
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) Object.assign(cache, JSON.parse(raw));
    } catch (e) { /* storage unavailable */ }
    RECORDS.forEach((k) => { cache[k] = []; }); // records only ever come from the database
    delete cache.admin;
    migrate(cache);
    takeSnapshot();
    return cache;
  }

  // Bring older saved data up to date with new defaults
  function migrate(d) {
    if (d.company && d.company.whatsapp === '27760950954') d.company.whatsapp = DEFAULTS.company.whatsapp;
    d.media = Object.assign(clone(DEFAULTS.media), d.media || {});
    d.marketing = Object.assign(clone(DEFAULTS.marketing), d.marketing || {});
    d.version = 3;
  }

  function findPromo(data, code) {
    if (!code) return null;
    const c = String(code).trim().toUpperCase();
    const p = (data.promos || []).find((x) => String(x.code).toUpperCase() === c);
    if (!p || !p.active) return null;
    if (p.expires && new Date(p.expires + 'T23:59:59') < new Date()) return null;
    return p;
  }

  const listeners = [];
  const notify = (external) => listeners.forEach((fn) => { try { fn(cache, external); } catch (e) { console.error(e); } });

  // Push whatever changed since the last sync to Supabase
  async function sync() {
    if (!sb) return;
    const jobs = [];
    const content = pickContent(cache);
    const cJson = JSON.stringify(content);
    if (cJson !== snapshot.content && isAdmin) {
      jobs.push(sb.from('site_content').upsert({ id: 'main', data: content, updated_at: new Date().toISOString() }).then(({ error }) => { if (error) reportError('Could not save website content: ' + error.message); }));
    }
    RECORDS.forEach((k) => {
      const prev = snapshot[k] || new Map();
      const seen = new Set();
      (cache[k] || []).forEach((item) => {
        seen.add(item.id);
        const j = JSON.stringify(item);
        if (!prev.has(item.id)) {
          jobs.push(sb.from(k).insert({ id: item.id, created_at: item.createdAt || new Date().toISOString(), data: item }).then(({ error }) => {
            if (error && error.code !== '23505') reportError('Could not save ' + k.slice(0, -1) + ': ' + error.message);
          }));
        } else if (prev.get(item.id) !== j && isAdmin) {
          jobs.push(sb.from(k).update({ data: item }).eq('id', item.id).then(({ error }) => { if (error) reportError('Could not update ' + k.slice(0, -1) + ': ' + error.message); }));
        }
      });
      if (isAdmin) prev.forEach((_, id) => { if (!seen.has(id)) jobs.push(sb.from(k).delete().eq('id', id).then(({ error }) => { if (error) reportError('Could not delete: ' + error.message); })); });
    });
    takeSnapshot();
    await Promise.all(jobs);
  }

  function persist() {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(pickContent(cache))); } catch (e) { /* ignore */ }
    notify(false);
    return sync();
  }

  // Pull the latest content (everyone) and records (admins only)
  async function pull() {
    if (!sb) return;
    load();
    const { data, error } = await sb.from('site_content').select('data').eq('id', 'main').maybeSingle();
    if (error) reportError('Could not load website content: ' + error.message);
    let seedNeeded = false;
    if (data && data.data) { Object.assign(cache, data.data); migrate(cache); }
    else if (!error) seedNeeded = true;
    if (isAdmin) {
      const results = await Promise.all(RECORDS.map((k) => sb.from(k).select('data').order('created_at', { ascending: false }).limit(2000)));
      results.forEach((r, i) => { if (r.error) reportError('Could not load ' + RECORDS[i] + ': ' + r.error.message); else cache[RECORDS[i]] = r.data.map((x) => x.data); });
    }
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(pickContent(cache))); } catch (e) {}
    takeSnapshot();
    if (seedNeeded && isAdmin) { snapshot.content = ''; await sync(); }
    notify(true);
  }

  async function checkAdmin() {
    if (!sb) return false;
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { isAdmin = false; return false; }
    const { data, error } = await sb.rpc('claim_admin');
    isAdmin = !error && data === true;
    return isAdmin;
  }

  const ready = (async () => { load(); try { await checkAdmin(); await pull(); } catch (e) { reportError(String(e.message || e)); } })();

  const auth = {
    session: async () => (sb ? (await sb.auth.getSession()).data.session : null),
    isAdmin: () => isAdmin,
    signIn: async (email, password) => {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      const ok = await checkAdmin();
      if (!ok) return { notAdmin: true };
      await pull();
      return { ok: true };
    },
    signUp: async (email, password) => {
      const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + '/admin.html' } });
      if (error) return { error: error.message };
      if (!data.session) return { confirm: true };
      const ok = await checkAdmin();
      if (ok) await pull();
      return ok ? { ok: true } : { notAdmin: true };
    },
    signOut: async () => { await sb.auth.signOut(); isAdmin = false; RECORDS.forEach((k) => { cache[k] = []; }); takeSnapshot(); },
    updatePassword: async (password) => { const { error } = await sb.auth.updateUser({ password }); return error ? error.message : null; },
    resetPassword: async (email) => { const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/admin.html' }); return error ? error.message : null; },
    listAdmins: async () => { const { data } = await sb.from('admins').select('user_id,email,created_at').order('created_at'); return data || []; },
    addAdmin: async (email) => { const { data, error } = await sb.rpc('add_admin', { p_email: email }); return error ? error.message : data; },
    removeAdmin: async (uid) => { const { error } = await sb.from('admins').delete().eq('user_id', uid); return error ? error.message : null; },
    email: async () => { const s = await auth.session(); return s ? s.user.email : ''; }
  };
  if (sb) sb.auth.onAuthStateChange((evt) => { if (evt === 'PASSWORD_RECOVERY') window.dispatchEvent(new CustomEvent('ikl-password-recovery')); });

  window.IKL = {
    STAGES, PLACES, crossSet, uid, now,
    ready, auth, online: !!sb,
    get: () => load(),
    save: (d) => { cache = d; return persist(); },
    update: (fn) => { const d = load(); fn(d); persist(); return d; },
    refresh: () => pull(),
    onSyncError: (fn) => errorListeners.push(fn),
    track: async (id) => {
      if (!sb) return null;
      const { data, error } = await sb.rpc('track_shipment', { p_id: String(id || '').trim() });
      if (error) { reportError(error.message); return null; }
      return data;
    },
    resetContent: () => { const d = load(); CONTENT_KEYS.forEach((k) => { d[k] = clone(DEFAULTS[k]); }); return persist(); },
    img: (url, w) => (url && /images\.unsplash\.com/.test(url) && w ? url.replace(/w=\d+/, 'w=' + w) : url || ''),
    onChange: (fn) => listeners.push(fn),
    exportJSON: () => JSON.stringify(load(), null, 2),
    importJSON: (txt) => { const d = JSON.parse(txt); delete d.admin; const c = load(); CONTENT_KEYS.concat(RECORDS).forEach((k) => { if (d[k] !== undefined) c[k] = d[k]; }); migrate(c); return persist(); },
    distanceKm, estimate, findPromo: (code) => findPromo(load(), code),
    money: (n) => (Number(n) < 0 ? '−R' : 'R') + Math.abs(Math.round(Number(n) || 0)).toLocaleString('en-ZA').replace(/,/g, ' '),
    nextRef: (prefix, list) => {
      const nums = list.map((x) => parseInt(String(x.id).split('-')[1], 10)).filter((n) => !isNaN(n));
      if (prefix === 'IKL') return 'IKL-' + String(Math.floor(100000 + Math.random() * 899999));
      return prefix + '-' + String(Date.now()).slice(-6) + String(Math.floor(Math.random() * 10));
    },
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    fmtDate: (iso, withTime = true) => {
      if (!iso) return '';
      const d = new Date(iso);
      const o = { day: 'numeric', month: 'short', year: 'numeric' };
      if (withTime) Object.assign(o, { hour: '2-digit', minute: '2-digit' });
      return d.toLocaleString('en-ZA', o);
    },
    timeAgo: (iso) => {
      const s = (Date.now() - new Date(iso)) / 1000;
      if (s < 60) return 'just now';
      if (s < 3600) return Math.floor(s / 60) + ' min ago';
      if (s < 86400) return Math.floor(s / 3600) + ' h ago';
      return Math.floor(s / 86400) + ' d ago';
    }
  };

  // Theme (shared by site and admin)
  const THEME_KEY = 'ikl_theme';
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0f0b19' : '#ffffff');
  }
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(saved || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  window.IKL.toggleTheme = () => {
    const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    return t;
  };
})();
