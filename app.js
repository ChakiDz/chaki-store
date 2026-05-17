// ==================== SEARCH HANDLER ====================
let searchTimeout;
function handleNavbarSearch(inputEl) {
  const val = inputEl.value;
  state.search = val;
  
  // حفظ موضع المؤشر (Cursor Position)
  const start = inputEl.selectionStart;
  const end = inputEl.selectionEnd;

  // تأخير الرندرة قليلاً لتحسين الأداء (Debouncing)
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    state.page = 'products';
    render();

    // إعادة التركيز والمؤشر بعد إعادة بناء الواجهة
    const newInput = document.querySelector('.search-wrap input');
    if (newInput) {
      newInput.focus();
      newInput.setSelectionRange(start, end);
    }
  }, 300); // تأخير 300 مللي ثانية
}

// ==================== SCROLL ANIMATIONS ====================
function initScrollAnimations() {
  const observerOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // إلغاء المراقبة بعد التنشيط لمرة واحدة فقط
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ==================== CART PAGE ====================
function renderCartPage() {
  const FREE  = Number(appSettings?.free_shipping_min) || 5000;
  const sub   = getSubtotal();
  const ship  = getShipping(sub);
  const disc  = getDiscount();
  const total = getTotal();
  const pct   = Math.min((sub / FREE) * 100, 100);
  const left  = FREE - sub;

  if (!state.cart.length) {
    return `
    <div class="cart-page fade-in">
      <div class="breadcrumb">
        <a onclick="navigateTo('home')">الرئيسية</a>
        <span class="sep">›</span>
        <span class="cur">سلة التسوق</span>
      </div>
      <div class="empty-cart">
        <span class="ec-icon">🛒</span>
        <h2>سلتك فارغة!</h2>
        <p>لم تضف أي منتجات بعد.<br>استكشف تصاميمنا الفريدة واختر ما يعجبك.</p>
        <button class="btn-primary" style="margin:0 auto"
                onclick="navigateTo('products')">
          🛍️ ابدأ التسوق الآن
        </button>
        <div class="suggest-products">
          ${products.slice(0, 4).map(p => {
            const img = getPrimaryImage(p);
            return `
            <div class="suggest-card" onclick="addToCart(${p.id}, event)">
              ${img
                ? `<div style="height:100px;overflow:hidden;border-radius:14px">
                     <img src="${img}" alt="${p.title}"
                          style="width:100%;height:100%;object-fit:cover">
                   </div>`
                : `<div style="height:100px;display:flex;align-items:center;
                               justify-content:center;font-size:36px">📦</div>`}
              <div class="sc-name">${p.title}</div>
              <div class="sc-price">${fmt(p.price)} دج</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  }

  return `
  <div class="cart-page fade-in">
    <div class="breadcrumb">
      <a onclick="navigateTo('home')">الرئيسية</a>
      <span class="sep">›</span>
      <span class="cur">سلة التسوق</span>
    </div>

    <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px">
      <h1 style="font-size:30px;font-weight:900">
        سلة <span style="color:var(--green)">التسوق</span>
      </h1>
      <span class="cart-count-badge">⚡ ${cartCount()} منتج</span>
    </div>

    <div class="cart-layout">
      <div>
        <div class="cart-actions-bar">
          <span style="font-size:13px;color:var(--muted)">
            المجموع: <strong style="color:var(--text)">${fmt(sub)} دج</strong>
          </span>
          <button class="clear-cart-btn" onclick="clearCart()">🗑️ إفراغ السلة</button>
        </div>

        <div class="cart-items-list">
          ${state.cart.map(item => {
            const product = products.find(p => p.id === item.id) || {};
            return `
            <div class="cart-item">
              <div class="ci-img" onclick="navigateTo('product', ${item.id})">
                ${product.image_url
                  ? `<img src="${product.image_url}" alt="${item.title}">`
                  : '📦'}
              </div>
              <div class="ci-info">
                <h4>${item.title}</h4>
                <div class="ci-cat">${item.category}</div>
                <div class="ci-price-unit">
                  سعر الوحدة: <strong>${fmt(item.price)} دج</strong>
                </div>
              </div>
              <div class="ci-qty">
                <button onclick="changeQty(${item.id}, -1)">−</button>
                <span>${item.qty}</span>
                <button onclick="changeQty(${item.id}, 1)">+</button>
              </div>
              <div class="ci-total">${fmt(item.price * item.qty)} دج</div>
              <button class="ci-del" onclick="removeFromCart(${item.id})">🗑️</button>
            </div>`;
          }).join('')}
        </div>

        <div style="margin-top:20px">
          <button class="btn-outline" onclick="navigateTo('products')"
                  style="padding:12px 24px;font-size:14px">
            ← متابعة التسوق
          </button>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-title">📋 ملخص الطلب</div>

        <div class="shipping-progress">
          <div class="ship-label">
            <span>تقدّم الشحن المجاني</span>
            <span>${fmt(Math.min(sub, FREE))} / ${fmt(FREE)} دج</span>
          </div>
          <div class="ship-bar">
            <div class="ship-fill" style="width:${pct}%"></div>
          </div>
          <div class="ship-msg">
            ${pct >= 100
              ? '🎉 حصلت على شحن مجاني!'
              : `أضف ${fmt(left)} دج للشحن المجاني`}
          </div>
        </div>

        <div class="promo-wrap">
          <input class="promo-input" id="promo-input" type="text"
            placeholder="كود الخصم..."
            value="${state.promoApplied ? 'CHAKI10' : ''}">
          <button class="promo-btn" onclick="applyPromo()">
            ${state.promoApplied ? '✓ مطبّق' : 'تطبيق'}
          </button>
        </div>

        <div class="summary-row">
          <span class="label">المجموع الفرعي</span>
          <span class="val">${fmt(sub)} دج</span>
        </div>
        ${disc ? `
          <div class="summary-row">
            <span class="label">🎁 خصم CHAKI10</span>
            <span class="val" style="color:var(--green)">− ${fmt(disc)} دج</span>
          </div>` : ''}
        <div class="summary-row">
          <span class="label">🚚 الشحن</span>
          <span class="val">
            ${ship === 0
              ? '<span style="color:var(--green);font-weight:900">مجاني ✓</span>'
              : fmt(ship) + ' دج'}
          </span>
        </div>

        <hr class="summary-divider">
        <div class="summary-total">
          <span>الإجمالي</span>
          <span class="amount">${fmt(total)} دج</span>
        </div>

        <button class="btn-primary"
                style="width:100%;font-size:15px;padding:16px;margin-bottom:10px"
                onclick="navigateTo('checkout')">
          ✅ إتمام الطلب — ${fmt(total)} دج
        </button>
        <button class="btn-outline" style="width:100%;padding:12px"
                onclick="navigateTo('products')">
          ← مواصلة التسوق
        </button>
      </div>
    </div>
  </div>`;
}

// ==================== CHECKOUT PAGE ====================
const shippingRates = {
  "1":{"name":"أدرار","home":1650,"office":800},
  "2":{"name":"الشلف","home":950,"office":450},
  "3":{"name":"الأغواط","home":950,"office":450},
  "4":{"name":"أم البواقي","home":700,"office":400},
  "5":{"name":"باتنة","home":750,"office":400},
  "6":{"name":"بجاية","home":800,"office":450},
  "7":{"name":"بسكرة","home":800,"office":450},
  "8":{"name":"بشار","home":1150,"office":550},
  "9":{"name":"البليدة","home":900,"office":450},
  "10":{"name":"البويرة","home":800,"office":450},
  "11":{"name":"تمنراست","home":1650,"office":800},
  "12":{"name":"تبسة","home":700,"office":400},
  "13":{"name":"تلمسان","home":950,"office":550},
  "14":{"name":"تيارت","home":950,"office":500},
  "15":{"name":"تيزي وزو","home":850,"office":450},
  "16":{"name":"الجزائر","home":850,"office":450},
  "17":{"name":"الجلفة","home":900,"office":450},
  "18":{"name":"جيجل","home":750,"office":400},
  "19":{"name":"سطيف","home":750,"office":400},
  "20":{"name":"سعيدة","home":950,"office":550},
  "21":{"name":"سكيكدة","home":700,"office":400},
  "22":{"name":"سيدي بلعباس","home":1100,"office":550},
  "23":{"name":"عنابة","home":650,"office":400},
  "24":{"name":"قالمة","home":650,"office":400},
  "25":{"name":"قسنطينة","home":700,"office":400},
  "26":{"name":"المدية","home":850,"office":450},
  "27":{"name":"مستغانم","home":950,"office":500},
  "28":{"name":"المسيلة","home":850,"office":450},
  "29":{"name":"معسكر","home":950,"office":500},
  "30":{"name":"ورقلة","home":1000,"office":500},
  "31":{"name":"وهران","home":1050,"office":500},
  "32":{"name":"البيض","home":1000,"office":500},
  "34":{"name":"برج بوعريريج","home":850,"office":400},
  "35":{"name":"بومرداس","home":850,"office":450},
  "36":{"name":"الطارف","home":500,"office":400},
  "38":{"name":"تيسمسيلت","home":950,"office":450},
  "39":{"name":"الوادي","home":950,"office":450},
  "40":{"name":"خنشلة","home":750,"office":400},
  "41":{"name":"سوق أهراس","home":650,"office":400},
  "42":{"name":"تيبازة","home":850,"office":450},
  "43":{"name":"ميلة","home":800,"office":400},
  "44":{"name":"عين الدفلة","home":850,"office":450},
  "45":{"name":"النعامة","home":1200,"office":550},
  "46":{"name":"عين تيموشنت","home":950,"office":550},
  "47":{"name":"غرداية","home":950,"office":500},
  "48":{"name":"غليزان","home":950,"office":500},
};

function renderCheckoutPage() {
  if (!state.cart.length) {
    return `
    <div class="cart-page fade-in" style="text-align:center;padding:100px 40px">
      <div style="font-size:60px;margin-bottom:20px">🛒</div>
      <h2>السلة فارغة</h2>
      <p style="color:var(--muted2);margin-bottom:24px">أضف منتجات قبل إتمام الطلب</p>
      <button class="btn-primary" onclick="navigateTo('products')">تسوق الآن</button>
    </div>`;
  }

  if (!state.orderInfo) state.orderInfo = {deliveryType: 'home'};
  const dType    = state.orderInfo.deliveryType || 'home';
  const wId      = state.orderInfo.wilayaId     || '';
  const shipCost = (wId && shippingRates[wId]) ? shippingRates[wId][dType] : 0;
  const sub      = getSubtotal();
  const disc     = getDiscount();
  const total    = sub - disc + shipCost;
  const wilayas  = Object.entries(shippingRates).sort((a, b) => +a[0] - +b[0]);

  return `
  <div class="cart-page fade-in">
    <div class="breadcrumb">
      <a onclick="navigateTo('home')">الرئيسية</a><span class="sep">›</span>
      <a onclick="navigateTo('cart')">السلة</a><span class="sep">›</span>
      <span class="cur">إتمام الطلب</span>
    </div>

    <div style="display:flex;align-items:center;gap:16px;margin-bottom:32px">
      <h1 style="font-size:30px;font-weight:900">
        إتمام <span style="color:var(--green)">الطلب</span>
      </h1>
    </div>

    <div class="co-grid">
      <div class="co-form-card">

        <div class="co-section-title">👤 بيانات العميل</div>
        <div class="co-field-row">
          <div class="co-field">
            <label>الاسم الكامل *</label>
            <input id="co-name" type="text" placeholder="أحمد بن علي"
              value="${state.orderInfo.name || ''}">
          </div>
          <div class="co-field">
            <label>رقم الهاتف *</label>
            <input id="co-phone" type="tel" placeholder="06 XX XX XX XX"
              dir="ltr" value="${state.orderInfo.phone || ''}">
          </div>
        </div>

        <div class="co-section-title" style="margin-top:28px">📍 عنوان التوصيل</div>
        <div class="co-field-row">
          <div class="co-field">
            <label>الولاية *</label>
            <select id="co-wilaya"
                    onchange="state.orderInfo.wilayaId=this.value; coUpdateLive()">
              <option value="">-- اختر الولاية --</option>
              ${wilayas.map(([id, w]) => `
                <option value="${id}" ${wId === id ? 'selected' : ''}>
                  ${id}. ${w.name}
                </option>`).join('')}
            </select>
          </div>
          <div class="co-field">
            <label>البلدية *</label>
            <input id="co-commune" type="text" placeholder="اكتب اسم البلدية"
              value="${state.orderInfo.commune || ''}">
          </div>
        </div>

        <div class="co-field">
          <label>العنوان التفصيلي (اختياري)</label>
          <textarea id="co-address"
            placeholder="الشارع، رقم المنزل...">${state.orderInfo.address || ''}</textarea>
        </div>

        <div class="co-section-title" style="margin-top:28px">🚚 نوع التوصيل</div>
        <div class="dt-grid">
          <div class="dt-card ${dType === 'home' ? 'active' : ''}"
               onclick="state.orderInfo.deliveryType='home'; coUpdateLive();
                        this.parentElement.querySelectorAll('.dt-card')
                          .forEach(c=>c.classList.remove('active'));
                        this.classList.add('active')">
            <div class="dt-icon">🏠</div>
            <div class="dt-name">توصيل للمنزل</div>
            <div class="dt-note">أسرع وأكثر راحة</div>
            ${wId && shippingRates[wId]
              ? `<div class="dt-price">${fmt(shippingRates[wId].home)} دج</div>` : ''}
          </div>
          <div class="dt-card ${dType === 'office' ? 'active' : ''}"
               onclick="state.orderInfo.deliveryType='office'; coUpdateLive();
                        this.parentElement.querySelectorAll('.dt-card')
                          .forEach(c=>c.classList.remove('active'));
                        this.classList.add('active')">
            <div class="dt-icon">🏪</div>
            <div class="dt-name">استلام من المكتب</div>
            <div class="dt-note">أوفر وأكثر أماناً</div>
            ${wId && shippingRates[wId]
              ? `<div class="dt-price">${fmt(shippingRates[wId].office)} دج</div>` : ''}
          </div>
        </div>

        <div class="ship-preview-box">
          <span>🚚 تكلفة الشحن:
            <strong>${wId && shippingRates[wId] ? shippingRates[wId].name : '—'}</strong>
          </span>
          <span id="co-ship-val"
                style="color:var(--green);font-weight:900;font-size:17px">
            ${shipCost ? fmt(shipCost) + ' دج' : 'اختر الولاية أولاً'}
          </span>
        </div>

        <div class="co-field" style="margin-top:16px">
          <label>ملاحظات (اختياري)</label>
          <textarea id="co-notes"
            placeholder="أي تعليمات خاصة...">${state.orderInfo.notes || ''}</textarea>
        </div>

        <button class="btn-primary"
                style="width:100%;font-size:15px;padding:16px;
                       margin-bottom:12px;justify-content:center"
                onclick="saveCheckoutForm(); sendOrder()">
          ✅ تأكيد الطلب
        </button>
        <div class="co-trust-row">
          <span>🔒 آمن</span><span>|</span>
          <span>💵 دفع عند الاستلام</span><span>|</span>
          <span>📦 توصيل مضمون</span>
        </div>
      </div>

      <!-- ملخص الطلب -->
      <div class="co-summary-col">
        <div class="co-order-summary">
          <div class="summary-title">📋 ملخص طلبك</div>
          ${state.cart.map(item => `
            <div class="co-order-item">
              <div class="coi-info">
                <div class="coi-name">${item.title}</div>
                <div class="coi-qty">× ${item.qty}</div>
              </div>
              <div class="coi-price">${fmt(item.price * item.qty)} دج</div>
            </div>`).join('')}
          <hr class="summary-divider">
          <div class="summary-row">
            <span class="label">المجموع الفرعي</span>
            <span class="val">${fmt(sub)} دج</span>
          </div>
          ${disc ? `
            <div class="summary-row">
              <span class="label">🎁 خصم</span>
              <span class="val" style="color:var(--green)">− ${fmt(disc)} دج</span>
            </div>` : ''}
          <div class="summary-row">
            <span class="label">🚚 الشحن</span>
            <span class="val" id="co-ship-summary">
              ${shipCost ? fmt(shipCost) + ' دج' : '—'}
            </span>
          </div>
          <hr class="summary-divider">
          <div class="summary-total">
            <span>الإجمالي</span>
            <span class="amount" id="co-total-live">
              ${shipCost ? fmt(total) + ' دج' : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function coUpdateLive() {
  const wId   = state.orderInfo?.wilayaId;
  const dType = state.orderInfo?.deliveryType || 'home';
  const rate  = (wId && shippingRates[wId]) ? shippingRates[wId][dType] : 0;
  const t     = getSubtotal() - getDiscount() + rate;
  const el1   = document.getElementById('co-ship-val');
  const el2   = document.getElementById('co-ship-summary');
  const el3   = document.getElementById('co-total-live');
  if (el1) el1.textContent = rate ? fmt(rate) + ' دج' : 'اختر الولاية أولاً';
  if (el2) el2.textContent = rate ? fmt(rate) + ' دج' : '—';
  if (el3) el3.textContent = rate ? fmt(t)    + ' دج' : '—';
}

function saveCheckoutForm() {
  if (!state.orderInfo) state.orderInfo = {};
  state.orderInfo.name     = document.getElementById('co-name')?.value?.trim();
  state.orderInfo.phone    = document.getElementById('co-phone')?.value?.trim();
  state.orderInfo.wilayaId = document.getElementById('co-wilaya')?.value;
  state.orderInfo.commune  = document.getElementById('co-commune')?.value?.trim();
  state.orderInfo.address  = document.getElementById('co-address')?.value?.trim();
  state.orderInfo.notes    = document.getElementById('co-notes')?.value?.trim();
}

async function sendOrder() {
  const name    = state.orderInfo?.name;
  const phone   = state.orderInfo?.phone;
  const wId     = state.orderInfo?.wilayaId;
  const commune = state.orderInfo?.commune;

  if (!name || !phone || !commune) return showToast('⚠️ يرجى ملء الحقول الإلزامية');
  if (!/^(0)(5|6|7)[0-9]{8}$/.test(phone)) return showToast('⚠️ رقم الهاتف غير صحيح (يجب أن يبدأ بـ 05 أو 06 أو 07)');
  if (!wId || !shippingRates[wId]) return showToast('⚠️ يرجى اختيار الولاية');

  const wilaya   = shippingRates[wId];
  const dType    = state.orderInfo?.deliveryType || 'home';
  const shipCost = wilaya[dType];
  const sub      = getSubtotal();
  const disc     = getDiscount();
  const total    = sub - disc + shipCost;

  const newOrder = {
    orderId:  '#CH' + Math.floor(1000 + Math.random() * 9000),
    date:     new Date().toLocaleString('ar-DZ'),
    customer: {
      name, phone,
      wilaya:       wilaya.name,
      commune,
      address:      state.orderInfo.address || '',
      notes:        state.orderInfo.notes   || '',
      deliveryType: dType === 'home' ? '🏠 توصيل للمنزل' : '🏪 استلام من المكتب',
    },
    items:    state.cart.map(i => ({...i})),
    subtotal: sub,
    discount: disc,
    shipping: shipCost,
    total,
    status:   'جديد',
  };

  const btn = document.querySelector('.co-grid .btn-primary');
  if (btn) { btn.textContent = '⏳ جاري الحفظ...'; btn.disabled = true; }

  // التحقق من الأسعار من قاعدة البيانات مباشرة لمنع التلاعب
  const dbSubtotal = await verifyOrderPrices(state.cart);
  if (dbSubtotal === false || dbSubtotal !== sub) {
    showToast('⚠️ تم اكتشاف خطأ في حساب الأسعار. يرجى تحديث الصفحة.');
    if (btn) { btn.textContent = '✅ تأكيد الطلب'; btn.disabled = false; }
    return;
  }

  const saved = await saveOrderToSupabase(newOrder);

  // التتبع الجديد الموحد
  if (typeof pixelPurchase === 'function') pixelPurchase(newOrder);

  if (btn) { btn.textContent = '✅ تأكيد الطلب'; btn.disabled = false; }

  state.orders.unshift(newOrder);
  localStorage.setItem('chaki_orders', JSON.stringify(state.orders));

  state.cart         = [];
  state.promoApplied = false;
  state.lastOrder    = newOrder;
  state.orderInfo    = {deliveryType: 'home'};
  saveToStorage();

  showToast(saved ? '✅ تم حفظ طلبك!' : '✅ تم تسجيل طلبك!');
  setTimeout(() => { state.page = 'order-success'; render(); }, 700);
}

// ==================== ORDER SUCCESS ====================
function renderOrderSuccessPage() {
  const o = state.lastOrder;
  return `
  <div class="cart-page fade-in"
       style="text-align:center;padding:80px 40px;max-width:600px;margin:0 auto">
    <div style="font-size:80px;margin-bottom:20px">🎉</div>
    <div style="background:var(--green-glow);border:1px solid rgba(57,255,20,0.3);
                border-radius:20px;padding:30px;margin-bottom:28px">
      <div style="font-size:13px;color:var(--muted);margin-bottom:6px">رقم طلبك</div>
      <div style="font-size:28px;font-weight:900;color:var(--green)">
        ${o?.orderId || '---'}
      </div>
    </div>
    <h2 style="font-size:26px;font-weight:900;color:var(--green);margin-bottom:12px">
      تم إرسال طلبك بنجاح! ✅
    </h2>
    <p style="color:var(--muted2);line-height:1.9;margin-bottom:32px">
      شكراً لطلبك من <strong>CHAKI⚡</strong><br>
      سيتواصل معك فريقنا قريباً لتأكيد موعد التوصيل.<br>
      الدفع عند استلام الطلب.
    </p>
    ${o ? `
      <div style="background:var(--card);border:1px solid var(--border2);
                  border-radius:16px;padding:20px;text-align:right;margin-bottom:28px">
        <div class="summary-row">
          <span class="label">العميل</span>
          <span class="val">${o.customer?.name}</span>
        </div>
        <div class="summary-row">
          <span class="label">الهاتف</span>
          <span class="val">${o.customer?.phone}</span>
        </div>
        <div class="summary-row">
          <span class="label">الولاية</span>
          <span class="val">${o.customer?.wilaya}</span>
        </div>
        <div class="summary-row">
          <span class="label">الإجمالي</span>
          <span class="val" style="color:var(--green)">${fmt(o.total)} دج</span>
        </div>
      </div>` : ''}
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <button class="btn-primary" onclick="navigateTo('home')">🏠 العودة للرئيسية</button>
      <button class="btn-outline" onclick="navigateTo('products')">🛍️ مواصلة التسوق</button>
    </div>
  </div>`;
}

// ==================== MAIN RENDER ====================
function render() {
  // صفحة الأدمن تأخذ الشاشة كاملة
  if (state.page === 'admin') {
    if (!adminState.loggedIn) {
      document.getElementById('app').innerHTML = renderAdminLogin();
    } else {
      renderAdmin();
    }
    updateSEO();
    return;
  }

  let content = '';
  if      (state.page === 'home')          content = renderHero() + renderBenefits() + renderProductsSection() + renderStats() + renderCategories() + renderCustomOrders() + renderTestimonials() + renderNewsletter();
  else if (state.page === 'products')      content = renderProductsPage();
  else if (state.page === 'product')       content = renderProductDetailPage();
  else if (state.page === 'cart')          content = renderCartPage();
  else if (state.page === 'checkout')      content = renderCheckoutPage();
  else if (state.page === 'order-success') content = renderOrderSuccessPage();
  else if (state.page === 'free')          content = renderFreePage();
  else if (state.page === 'contact')       content = renderContactPage();
  else if (state.page === 'track')         content = renderTrackPage();
  else if (state.page === 'faq')           content = renderFaqPage();
  else if (state.page === 'privacy')       content = renderPrivacyPage();
  else if (state.page === 'terms')         content = renderTermsPage();
  else if (state.page === '404')           content = render404Page();

  const appEl = document.getElementById('app');

  // بناء الهيكل الأساسي للموقع (Layout Shell) إذا لم يكن موجوداً
  if (!document.getElementById('main-content')) {
    appEl.innerHTML = `
      <div id="announce-slot"></div>
      <div id="navbar-slot"></div>
      <main id="main-content" class="fade-in"></main>
      <div id="footer-slot"></div>
    `;
  }

  // تحديث المكونات بشكل مستهدف (Targeted Component Rendering)
  const announceHTML = renderAnnounce();
  const navbarHTML   = renderNavbar();
  const footerHTML   = renderFooter();

  const annSlot = document.getElementById('announce-slot');
  const navSlot = document.getElementById('navbar-slot');
  const footSlot = document.getElementById('footer-slot');
  const mainSlot = document.getElementById('main-content');
  
  if (annSlot && annSlot.innerHTML !== announceHTML) annSlot.innerHTML = announceHTML;
  if (navSlot && navSlot.innerHTML !== navbarHTML)   navSlot.innerHTML = navbarHTML;
  if (footSlot && footSlot.innerHTML !== footerHTML)  footSlot.innerHTML = footerHTML;
  if (mainSlot && mainSlot.innerHTML !== content)     mainSlot.innerHTML = content;

  // رصد زيارة حقيقية عند تحميل الصفحة الرئيسية لأول مرة في الجلسة
  if (state.page === 'home' && !sessionStorage.getItem('v_tracked')) {
    const visits = parseInt(localStorage.getItem('total_visits') || '0');
    localStorage.setItem('total_visits', visits + 1);
    sessionStorage.setItem('v_tracked', 'true');
  }

  // تتبع الأحداث المخصصة بناءً على الصفحة
  if (typeof fbq !== 'undefined' || typeof ttq !== 'undefined') {
    if (state.page === 'product' && state.selectedProduct) {
      pixelViewContent(state.selectedProduct);
    } else if (state.page === 'checkout') {
      pixelInitiateCheckout();
    }
    if (typeof fbq !== 'undefined') fbq('track', 'PageView');
  }

  updateMobileNav();
  updateSEO();
  initScrollAnimations();

  // العد التنازلي للمسابقة
  if (typeof window.giveawayInterval !== 'undefined') {
    clearInterval(window.giveawayInterval);
    window.giveawayInterval = undefined;
  }
  if (state.page === 'free') {
    window.giveawayInterval = setInterval(() => {
      const cd = getCountdownTime();
      if (cd.ended) { clearInterval(window.giveawayInterval); return; }
      const d = document.getElementById('cd-days');
      const h = document.getElementById('cd-hours');
      const m = document.getElementById('cd-minutes');
      const s = document.getElementById('cd-seconds');
      if (d) d.textContent = String(cd.days).padStart(2, '0');
      if (h) h.textContent = String(cd.hours).padStart(2, '0');
      if (m) m.textContent = String(cd.minutes).padStart(2, '0');
      if (s) s.textContent = String(cd.seconds).padStart(2, '0');
    }, 1000);
  }
}

// ==================== START ====================
async function initApp() {
  try {
    // 1. إعداد مراقب التاريخ فقط دون تنفيذ التوجيه الآن
    window.addEventListener('popstate', () => applyRouteFromLocation({renderNow: true}));

    // 2. جلب الإعدادات والأقسام أولاً
    await loadSettings();
    initPixel();
    initTikTokPixel();
    await fetchCategoriesFromSupabase();
    
    // 3. جلب المنتجات والانتظار حتى تنتهي (await)
    await loadProductsFromSupabase(false);
    
    // 4. الآن فقط نقوم بتحديد الصفحة المطلوبة بناءً على الرابط
    applyRouteFromLocation({replace: true, renderNow: true});

  } catch (err) {
    console.error('🔴 App Init Error:', err);
    document.getElementById('app').innerHTML = `
      <div style="text-align:center; padding:100px;">
        <p>⚠️ عذراً، تعذر تحميل المتجر حالياً</p>
        <button onclick="location.reload()" class="btn-primary">إعادة المحاولة</button>
      </div>`;
  }
}
initApp();