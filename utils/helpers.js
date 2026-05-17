// ==================== HELPERS ====================

// تنسيق السعر بالدينار الجزائري
function fmt(n) {
  return Number(n).toLocaleString('ar-DZ');
}

// رسم النجوم
function stars(r) {
  const rating = Math.round(r); // تقريب التقييم لأقرب رقم صحيح
  return `<span class="stars-wrap">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span>`;
}

// دالة نسخ النص إلى الحافظة (تدعم الموبايل عبر الضغط المطول)
function copyToClipboard(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    if (typeof showToast === 'function') showToast('📋 تم نسخ الرقم بنجاح');
  }).catch(() => {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    if (typeof showToast === 'function') showToast('📋 تم نسخ الرقم');
  });
}

// تنسيق رقم الهاتف للعرض ومنع التداخل في النصوص العربية
function formatPhone(phone) {
  if (!phone) return '—';
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('213')) cleaned = '0' + cleaned.substring(3);
  
  let display = cleaned;
  if (cleaned.length === 10) {
    display = cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }

  return `<span dir="ltr" class="phone-wrap"
            oncontextmenu="copyToClipboard('${cleaned}'); event.preventDefault();"
            title="اضغط مطولاً للنسخ">${display}</span>`;
}

// دالة تنظيف النصوص لمنع ثغرات XSS
function escapeHTML(str) {
  if (!str) return '';
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

// دالة مساعدة للإضافة للسلة مع الكمية (تجنب eval في onclick)
function handleAddToCartWithQty(id, event) {
  const qtyEl = document.querySelector('.qty-ctrl span');
  const qty = qtyEl ? parseInt(qtyEl.textContent) : 1;
  addToCart(id, event, qty);
}

// دالة مساعدة للتمرير للطلبات المخصصة
function handleCustomOrderLink() {
  navigateTo('home');
  setTimeout(() => document.getElementById('custom-section')?.scrollIntoView({behavior:'smooth'}), 100);
}

// تحويل النص إلى slug للرابط
function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getProductSlug(p) {
  return p?.slug || slugify(p?.title) || `product-${p?.id}`;
}

function findProductBySlug(value) {
  const decoded = decodeURIComponent(String(value || '')).toLowerCase();
  return products.find(p =>
    String(p.id) === decoded ||
    String(p.slug || '').toLowerCase() === decoded ||
    getProductSlug(p).toLowerCase() === decoded
  ) || null;
}

// جلب صور المنتج
function getProductImages(p) {
  const images = [];
  if (Array.isArray(p.image_urls)) images.push(...p.image_urls);
  if (p.image_url) images.unshift(p.image_url);
  return [...new Set(images.filter(Boolean))];
}

function getPrimaryImage(p) {
  return getProductImages(p)[0] || null;
}

// تغيير صورة المعرض في صفحة المنتج
function changeGalleryImage(url, element) {
  const mainImg = document.getElementById('expanded-img');
  if (!mainImg) return;
  mainImg.style.opacity = '0.5';
  setTimeout(() => {
    mainImg.src           = url;
    mainImg.style.opacity = '1';
  }, 150);
  document.querySelectorAll('.thumb-item').forEach(item => {
    item.classList.remove('active');
  });
  element.classList.add('active');
}

// ==================== SEO ====================
function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const match = selector.match(/\[(name|property)="([^"]+)"\]/);
    if (match) el.setAttribute(match[1], match[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value || '');
}

function setCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link     = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

function toAbsoluteURL(value) {
  if (!value) return '';
  try { return new URL(value, window.location.origin).href; }
  catch(e) { return ''; }
}

function updateSEO() {
  const storeName = appSettings?.store_name || 'CHAKI⚡';
  const defaultTitle = `${storeName} | متجر الطباعة ثلاثية الأبعاد`;
  const defaultDesc  = `متجر ${storeName} لمنتجات الطباعة ثلاثية الأبعاد في الجزائر.`;
  let title = defaultTitle;
  let desc  = defaultDesc;
  let image = getPrimaryImage(products[0]) || '';
  let type  = 'website';

  if (state.page === 'product' && state.selectedProduct) {
    const p = state.selectedProduct;
    title   = `${p.title} | CHAKI`;
    desc    = p.desc || `${p.title} بسعر ${fmt(p.price)} دج`;
    image   = getPrimaryImage(p) || image;
    type    = 'product';

    // إضافة JSON-LD للمنتج
    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": p.title,
      "image": toAbsoluteURL(image),
      "description": p.desc,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "DZD",
        "price": p.price,
        "availability": "https://schema.org/InStock"
      }
    };
    let script = document.getElementById('product-schema');
    if (!script) {
      script = document.createElement('script');
      script.id = 'product-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
  } else if (state.page === 'products') {
    title = 'منتجات CHAKI | متجر الطباعة ثلاثية الأبعاد';
    desc  = 'تصفح منتجات CHAKI المطبوعة ثلاثية الأبعاد.';
  } else if (state.page === '404') {
    title = '404 - الصفحة غير موجودة | CHAKI⚡';
    desc  = 'عذراً، الصفحة التي تبحث عنها غير موجودة في متجر CHAKI.';
  } else if (state.page === 'free') {
    title = '🎁 مجاناً - هدايا CHAKI⚡';
    desc  = 'اربح منتجات 3D فريدة! شارك في مسابقات CHAKI.';
  } else if (state.page === 'cart') {
    title = 'السلة | CHAKI';
  } else if (state.page === 'checkout') {
    title = 'إتمام الطلب | CHAKI';
  }

  document.title = title;
  const url = window.location.href;

  setMeta('meta[name="description"]',        'content', desc);
  setMeta('meta[property="og:type"]',        'content', type);
  setMeta('meta[property="og:title"]',       'content', title);
  setMeta('meta[property="og:description"]', 'content', desc);
  setMeta('meta[property="og:image"]',       'content', toAbsoluteURL(image));
  setMeta('meta[property="og:url"]',         'content', url);
  setMeta('meta[name="twitter:card"]',       'content', 'summary_large_image');
  setCanonical(url);
}