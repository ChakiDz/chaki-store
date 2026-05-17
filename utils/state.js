// ==================== DATA ====================
let products = [
  {
    id:1, title:'تمثال قطة هندسي', price:3500, oldPrice:4200, category:'ديكور', 
    rating:4.6, reviews:24, badge:'جديد', desc:'تمثال هندسي فاخر بتصميم عصري.',
    options: { colors: ['أسود نيون', 'أبيض رخامي', 'ذهبي ميتاليك'], materials: ['PLA+', 'Silk'] }
  },
  {id:2, title:'حامل يد التحكم',     price:1200, oldPrice:1600, category:'ألعاب',       rating:4.8, reviews:52,  badge:'الأكثر مبيعاً',  desc:'حامل احترافي لجميع أنواع يدات التحكم.'},
  {id:3, title:'مزهرية عصرية',       price:1800, oldPrice:null, category:'ديكور',       rating:4.5, reviews:34,  badge:'جديد',           desc:'تصميم متموج فاخر يضيف لمسة جمالية.'},
  {id:4, title:'منظم المكتب',        price:1500, oldPrice:1900, category:'مكتب',        rating:4.7, reviews:41,  badge:null,             desc:'منظم عملي بتصميم مينيمالي أنيق.'},
  {id:5, title:'ميدالية CHAKI',      price:600,  oldPrice:null, category:'إكسسوارات',   rating:4.9, reviews:86,  badge:'الأكثر مبيعاً',  desc:'هدية مميزة بتصميم هندسي عصري.'},
  {id:6, title:'تمثال ذئب هندسي',   price:2500, oldPrice:3000, category:'ديكور',       rating:4.6, reviews:27,  badge:'جديد',           desc:'قطعة فنية فريدة بشخصية قوية.'},
  {id:7, title:'حامل الهاتف',        price:800,  oldPrice:1000, category:'مكتب',        rating:4.4, reviews:68,  badge:null,             desc:'متوافق مع جميع أحجام الهواتف.'},
  {id:8, title:'حامل باتمان',        price:950,  oldPrice:1200, category:'ألعاب',       rating:4.7, reviews:31,  badge:'جديد',           desc:'لعشاق DC — قطعة فريدة ومميزة.'},
  {id:9, title:'أصيص نباتي',         price:1100, oldPrice:null, category:'ديكور',       rating:4.5, reviews:23,  badge:null,             desc:'يناسب النباتات الصغيرة والعصارية.'},
  {id:10,title:'منظم الكابلات',      price:400,  oldPrice:null, category:'مكتب',        rating:4.6, reviews:94,  badge:null,             desc:'ترتيب أنيق للكابلات على مكتبك.'},
];

let categories = [];

// ==================== STATE ====================
let state = {
  page:            'home',
  cart:            JSON.parse(localStorage.getItem('chaki_cart'))  || [],
  favs:            JSON.parse(localStorage.getItem('chaki_favs'))  || [],
  filterCat:       'الكل',
  search:          '',
  sort:            'default',
  selectedProduct: null,
  priceMin:        0,
  priceMax:        10000,
  viewMode:        'grid',
  filterBadge:     null,
  promoApplied:    JSON.parse(localStorage.getItem('chaki_promo')) || false,
  orders:          JSON.parse(localStorage.getItem('chaki_orders'))|| [],
  orderInfo:       {deliveryType: 'home'},
  lastOrder:       null,
  mobileFiltersOpen: false,
  giveawayParticipants: JSON.parse(localStorage.getItem('chaki_giveaway_participants')) || [],
  giveawayEnteredUser:  JSON.parse(localStorage.getItem('chaki_giveaway_entered'))      || null,
  giveawayDrawDate:     0,
};

// ==================== STORAGE ====================
function saveToStorage() {
  localStorage.setItem('chaki_cart',                  JSON.stringify(state.cart));
  localStorage.setItem('chaki_favs',                  JSON.stringify(state.favs));
  localStorage.setItem('chaki_promo',                 JSON.stringify(state.promoApplied));
  localStorage.setItem('chaki_giveaway_participants', JSON.stringify(state.giveawayParticipants));
  localStorage.setItem('chaki_giveaway_entered',      JSON.stringify(state.giveawayEnteredUser));
}

// ==================== CART HELPERS ====================
function cartCount()   { return state.cart.reduce((s, i) => s + i.qty, 0); }
function cartTotal()   { return state.cart.reduce((s, i) => s + i.price * i.qty, 0); }
function getSubtotal() { return state.cart.reduce((s, i) => s + i.price * i.qty, 0); }
function getShipping(sub) { 
  const min = Number(appSettings?.free_shipping_min) || 5000;
  return sub === 0 ? 0 : sub >= min ? 0 : 500; 
}
function getDiscount() { return state.promoApplied ? Math.round(getSubtotal() * 0.1) : 0; }
function getTotal()    { return getSubtotal() + getShipping(getSubtotal()) - getDiscount(); }

function addToCart(id, e, qty = 1) {
  if (e) e.stopPropagation();
  const p   = products.find(x => x.id === id);
  if (!p) return;

  const idx = state.cart.findIndex(i => i.id === id);
  if (idx > -1) state.cart[idx].qty += qty;
  else state.cart.push({...p, qty: qty});

  if (typeof pixelAddToCart === 'function') pixelAddToCart(p);

  saveToStorage();
  showToast('✅ تمت الإضافة إلى السلة');
  updateCartBadge();
}

function toggleFav(id, e) {
  if (e) e.stopPropagation();
  const idx = state.favs.indexOf(id);
  if (idx > -1) state.favs.splice(idx, 1);
  else state.favs.push(id);
  saveToStorage();
  render();
}

function changeQty(id, delta) {
  const idx = state.cart.findIndex(i => i.id === id);
  if (idx > -1) {
    state.cart[idx].qty += delta;
    if (state.cart[idx].qty < 1) state.cart[idx].qty = 1;
    saveToStorage();
    render();
  }
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveToStorage();
  showToast('🗑️ تم حذف المنتج من السلة');
  render();
}

function clearCart() {
  if (!state.cart.length) return;
  state.cart         = [];
  state.promoApplied = false;
  saveToStorage();
  showToast('🗑️ تم إفراغ السلة');
  render();
}

function applyPromo() {
  const val = document.getElementById('promo-input')?.value?.trim().toUpperCase();
  if (val === 'CHAKI10') {
    state.promoApplied = true;
    saveToStorage();
    showToast('🎉 تم تطبيق خصم 10%!');
    render();
  } else {
    showToast('⚠️ كود غير صحيح — جرّب: CHAKI10');
  }
}

// ==================== NAVIGATION ====================
function navigateTo(page, extra, options = {}) {
  state.page = page;
  if (extra) {
    if (page === 'product')   state.selectedProduct = typeof extra === 'number' ? products.find(x => x.id === extra) : extra;
    if (page === 'products' && extra.cat) state.filterCat = extra.cat;
  }
  if (!options.skipURL) updateBrowserURL(page, extra, options.replaceURL);
  window.scrollTo({top: 0, behavior: 'smooth'});
  
  // إغلاق القوائم الجانبية للموبايل عند التنقل
  closeMobileMenu();
  toggleMobileFilters(false);
  render();
}

function updateBrowserURL(page, extra, replace = false) {
  if (!window.history?.pushState) return;
  const routes = {
    home: '/', products: '/products', cart: '/cart',
    checkout: '/checkout', 'order-success': '/order-success',
    track: '/track', contact: '/contact', faq: '/faq',
    privacy: '/privacy', terms: '/terms', admin: '/admin', free: '/free',
    404: '/404'
  };
  let path = routes[page] || '/';
  if (page === 'product' && state.selectedProduct) {
    path = `/product/${encodeURIComponent(getProductSlug(state.selectedProduct))}`;
  }
  if (page === 'products' && extra?.cat) {
    path = `/products?cat=${encodeURIComponent(extra.cat)}`;
  }
  const current = window.location.pathname + window.location.search;
  if (path === current) return;
  try {
    window.history[replace ? 'replaceState' : 'pushState']({page}, '', path);
  } catch(e) {}
}

function applyRouteFromLocation({replace = false, renderNow = true} = {}) {
  const parts  = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const params = new URLSearchParams(window.location.search);
  const first  = parts[0] || '';

  if (!first || first.endsWith('.html')) {
    state.page = 'home';
  } else if (first === 'product' && parts[1]) {
    const product = findProductBySlug(parts[1]);
    if (product) {
      state.page = 'product';
      state.selectedProduct = product;
    } else {
      state.page = '404';
    }
  } else if (first === 'products') {
    state.page = 'products';
    const cat  = params.get('cat');
    if (cat) state.filterCat = cat;
  } else if (['cart','checkout','order-success','track','contact','faq','privacy','terms','admin','free','404'].includes(first)) {
    state.page = first;
  } else {
    state.page = '404';
  }

  updateBrowserURL(state.page, null, replace);
  if (renderNow) render();
}

// ==================== MISC ====================
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  const cc    = cartCount();
  if (badge) badge.textContent = cc;
  const btn = document.querySelector('.cart-btn');
  if (!badge && cc > 0 && btn) {
    const b = document.createElement('span');
    b.className   = 'cart-badge';
    b.textContent = cc;
    btn.appendChild(b);
  }
}

function updateMobileNav() {
  ['home','products','cart','wa'].forEach(id => {
    document.getElementById('mbn-' + id)?.classList.remove('active');
  });
  const map = {home:'home', products:'products', product:'products', cart:'cart'};
  const aid = map[state.page];
  if (aid) document.getElementById('mbn-' + aid)?.classList.add('active');
  const badge = document.getElementById('mbn-badge');
  const cc    = cartCount();
  if (badge) {
    badge.textContent  = cc;
    badge.style.display = cc > 0 ? 'flex' : 'none';
  }
}

function openWA(msg) {
  let phone = appSettings?.whatsapp_number || '213658307105';
  const store = appSettings?.store_name      || 'CHAKI⚡';
  const text  = msg || `مرحبا، أريد الاستفسار عن منتجات ${store}`;

  // تنظيف الرقم للرابط (يجب أن يبدأ بـ 213 وبدون أصفار أو مسافات)
  let cleanPhone = String(phone).replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '213' + cleanPhone.substring(1);

  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
}

function openMobileMenu() {
  document.getElementById('mobile-menu')?.classList.add('open');
  document.getElementById('hamburger-btn')?.classList.add('open');
  document.body.style.overflow = 'hidden';
  const badge = document.getElementById('mm-cart-count');
  const cc    = cartCount();
  if (badge) badge.textContent = cc > 0 ? `(${cc})` : '';
}

function closeMobileMenu() {
  document.getElementById('mobile-menu')?.classList.remove('open');
  document.getElementById('hamburger-btn')?.classList.remove('open');
  document.body.style.overflow = '';
}

function toggleMobileFilters(open) {
  state.mobileFiltersOpen = open;
  document.body.style.overflow = open ? 'hidden' : '';
  document.querySelector('.sidebar')?.classList.toggle('drawer-open', open);
  const overlay = document.querySelector('.sidebar-overlay');
  if (overlay) {
    overlay.style.opacity    = open ? '1' : '0';
    overlay.style.visibility = open ? 'visible' : 'hidden';
    overlay.classList.toggle('active', open);
  }
}

function saveGiveawayParticipant(name, phone, instagram) {
  if (!name || !phone || !instagram) {
    showToast('⚠️ يرجى ملء جميع الحقول');
    return false;
  }
  const p = {id: Date.now(), name, phone, instagram, joinedAt: new Date().toISOString()};
  state.giveawayParticipants.push(p);
  state.giveawayEnteredUser = p;
  saveToStorage();
  showToast('🎉 تم تسجيلك في المسابقة!');
  render();
  return true;
}

function getCountdownTime() {
  const remaining = state.giveawayDrawDate - Date.now();
  if (remaining <= 0) return {days:0, hours:0, minutes:0, seconds:0, ended:true};
  return {
    days:    Math.floor(remaining / 86400000),
    hours:   Math.floor((remaining % 86400000) / 3600000),
    minutes: Math.floor((remaining % 3600000)  / 60000),
    seconds: Math.floor((remaining % 60000)    / 1000),
    ended:   false,
  };
}