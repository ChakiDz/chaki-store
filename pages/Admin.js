// ==================== ADMIN CONFIG ====================
let adminState = {
  loggedIn:    isAdminLoggedIn(),
  section:     'dashboard',
  orders:      [],
  participants: [],
  orderSearch: '',
  orderStatus: 'الكل',
};

// ==================== ADMIN LOGIN ====================
function renderAdminLogin() {
  return `
  <div class="adm-login-wrap">
    <div class="adm-login-card">
      <div class="adm-login-icon">⚡</div>
      <h1 class="adm-login-title">تسجيل دخول المسؤول</h1>
      <p class="adm-login-subtitle">لوحة تحكم المتجر</p>
      
      <div class="co-field admin-login-field">
        <label>البريد الإلكتروني</label>
        <input id="admin-email" type="email" placeholder="admin@chaki.dz" class="w-full">
      </div>

      <div class="co-field admin-login-field">
        <label>كلمة المرور</label>
        <input id="admin-pass" type="password" placeholder="••••••••"
          onkeydown="event.key==='Enter' && adminLogin()" class="w-full" style="letter-spacing:4px">
      </div>
      <button class="btn-primary admin-login-btn" onclick="adminLogin()">
        🔐 دخول
      </button>
      <button onclick="navigateTo('home')" class="admin-back-btn">
        ← العودة للمتجر
      </button>
    </div>
  </div>`;
}

async function adminLogin() {
  const email = document.getElementById('admin-email')?.value?.trim();
  const pass  = document.getElementById('admin-pass')?.value;
  
  if (!email || !pass) return showToast('⚠️ يرجى إدخال البيانات كاملة');

  const btn = document.querySelector('button[onclick="adminLogin()"]');
  btn.textContent = '⏳ جاري التحقق...';
  btn.disabled = true;

  const result = await signInAdmin(email, pass);

  if (result.success) {
    adminState.loggedIn = true;
    sessionStorage.setItem('chaki_admin', 'true');
    adminState.section = 'dashboard';
    renderAdmin();
  } else {
    showToast('❌ خطأ: ' + result.error);
    btn.textContent = '🔐 دخول';
    btn.disabled = false;
  }
}

function adminLogout() {
  adminState.loggedIn = false;
  signOutAdmin();
  navigateTo('home');
}

// ==================== ADMIN RENDER ====================
async function renderAdmin() {
  const storeName = appSettings?.store_name || 'CHAKI⚡';
  const displayTitle = storeName.includes('⚡') 
    ? storeName.replace('⚡', '<span style="color:var(--green)">I⚡</span>').replace('I<span style="color:var(--green)">I⚡</span>', '<span style="color:var(--green)">I⚡</span>')
    : storeName;

  document.getElementById('app').innerHTML = `<div class="admin-loading">⏳ جاري التحميل...</div>`;
  document.querySelector('.mobile-bottom-nav')?.style?.setProperty('display', 'none');

  const sbOrders = await fetchOrdersFromSupabase();
  if (sbOrders) {
    adminState.orders = sbOrders.map(o => ({
      orderId:  o.order_id,
      date:     o.date,
      customer: {
        name:         o.customer_name,
        phone:        o.phone,
        wilaya:       o.wilaya,
        commune:      o.commune,
        address:      o.address,
        notes:        o.notes,
        deliveryType: o.delivery_type,
      },
      items:    o.items,
      subtotal: o.subtotal,
      discount: o.discount,
      shipping: o.shipping,
      total:    o.total,
      status:   o.status,
    }));
  } else {
    adminState.orders = JSON.parse(localStorage.getItem('chaki_orders') || '[]');
  }

  // تحسين: جلب المشاركين فقط عند الحاجة لتقليل استهلاك البيانات
  if (adminState.section === 'giveaway') {
    adminState.participants = await fetchGiveawayParticipants();
  }

  const sections = [
    {id:'dashboard', icon:'📊', label:'الرئيسية'},
    {id:'orders',    icon:'📦', label:'الطلبات'},
    {id:'products',  icon:'🛍️', label:'المنتجات'},
    {id:'customers', icon:'👥', label:'العملاء'},
    {id:'marketing', icon:'📣', label:'التسويق'},
    {id:'giveaway',  icon:'🎁', label:'المسابقات'},
    {id:'settings',  icon:'⚙️', label:'الإعدادات'},
  ];

  const newOrders = adminState.orders.filter(o => o.status === 'جديد').length;

  document.getElementById('app').innerHTML = `
  <div class="adm-wrap">
    <aside class="adm-sidebar">
      <div class="adm-logo" onclick="adminState.section='dashboard';renderAdmin()">
        <span style="font-size:22px;font-weight:900">
          ${displayTitle}
        </span>
        <span style="font-size:11px;color:var(--muted);display:block;margin-top:2px">
          لوحة التحكم
        </span>
      </div>
      <nav class="adm-nav">
        ${sections.map(s => `
          <button class="adm-nav-btn ${adminState.section === s.id ? 'active' : ''}"
                  onclick="adminState.section='${s.id}';renderAdmin()">
            <span class="adm-nav-icon">${s.icon}</span>
            <span>${s.label}</span>
            ${s.id === 'orders' && newOrders > 0
              ? `<span class="adm-badge">${newOrders}</span>` : ''}
          </button>`).join('')}
      </nav>
      <div style="margin-top:auto;padding:20px">
        <button class="adm-nav-btn" onclick="navigateTo('home')"
                style="margin-bottom:8px;width:100%">
          <span class="adm-nav-icon">🏪</span><span>عرض المتجر</span>
        </button>
        <button class="adm-nav-btn" onclick="adminLogout()"
                style="color:#e53935;width:100%">
          <span class="adm-nav-icon">🚪</span><span>خروج</span>
        </button>
      </div>
    </aside>
    <main class="adm-main" id="adm-main">
      ${adminState.section === 'dashboard' ? renderAdminDashboard() : ''}
      ${adminState.section === 'orders'    ? renderAdminOrders()    : ''}
      ${adminState.section === 'products'  ? renderAdminProducts()  : ''}
      ${adminState.section === 'customers' ? renderAdminCustomers() : ''}
      ${adminState.section === 'marketing' ? renderAdminMarketing() : ''}
      ${adminState.section === 'giveaway'  ? renderAdminGiveaway()  : ''}
      ${adminState.section === 'settings'  ? renderAdminSettings()  : ''}
    </main>
  </div>`;
}

// ==================== DASHBOARD ====================
function renderAdminDashboard() {
  const orders  = adminState.orders;
  const revenue = orders
    .filter(o => o.status !== 'ملغي')
    .reduce((s, o) => s + (o.total || 0), 0);
  const newOrd   = orders.filter(o => o.status === 'جديد').length;
  const delivered= orders.filter(o => o.status === 'تم التسليم').length;

  const stats = [
    {icon:'💰', label:'إجمالي الإيرادات', val:fmt(revenue)+' دج', color:'var(--green)'},
    {icon:'📦', label:'طلبات جديدة',       val:newOrd,             color:'#FF6B00'},
    {icon:'✅', label:'تم التسليم',        val:delivered,          color:'#4CAF50'},
    {icon:'❌', label:'ملغية',             val:orders.filter(o=>o.status==='ملغي').length, color:'#e53935'},
  ];

  const statusCount = {};
  orders.forEach(o => { statusCount[o.status] = (statusCount[o.status] || 0) + 1; });

  return `
  <div class="adm-section fade-in">
    <div class="adm-header">
      <div>
        <h1 class="adm-title">📊 لوحة التحكم</h1>
        <p style="color:var(--muted);font-size:13px;margin-top:4px">
          ${new Date().toLocaleDateString('ar-DZ', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}
        </p>
      </div>
      <button class="btn-primary" style="padding:10px 20px;font-size:13px"
              onclick="renderAdmin()">🔄 تحديث</button>
    </div>

    <div class="adm-stats-grid">
      ${stats.map(s => `
        <div class="adm-stat-card">
          <div class="adm-stat-icon"
               style="background:${s.color}22;color:${s.color}">${s.icon}</div>
          <div>
            <div class="adm-stat-val" style="color:${s.color}">${s.val}</div>
            <div class="adm-stat-label">${s.label}</div>
          </div>
        </div>`).join('')}
    </div>

    <div class="adm-card">
      <div class="adm-card-title">📊 توزيع الطلبات حسب الحالة</div>
      ${Object.entries(statusCount).map(([st, cnt]) => {
        const colors = {
          'جديد':'#39FF14','قيد المعالجة':'#FF6B00',
          'في الطريق':'#2196F3','تم التسليم':'#4CAF50','ملغي':'#e53935'
        };
        const pct = orders.length ? Math.round(cnt / orders.length * 100) : 0;
        return `
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;
                      font-size:13px;margin-bottom:6px">
            <span>${st}</span>
            <span style="color:${colors[st]||'var(--green)'};font-weight:700">
              ${cnt} طلب (${pct}%)
            </span>
          </div>
          <div style="height:6px;background:var(--card2);border-radius:10px;overflow:hidden">
            <div style="height:100%;width:${pct}%;
                        background:${colors[st]||'var(--green)'};
                        border-radius:10px"></div>
          </div>
        </div>`;
      }).join('') || `<p style="color:var(--muted);text-align:center;padding:20px">
                        لا توجد طلبات بعد</p>`}
    </div>

    <div class="adm-card">
      <div class="adm-card-title">🕐 أحدث الطلبات</div>
      ${orders.length === 0
        ? `<p style="color:var(--muted);text-align:center;padding:20px">لا توجد طلبات</p>`
        : `<table class="adm-table">
             <thead>
               <tr>
                 <th>رقم الطلب</th><th>العميل</th>
                 <th>الولاية</th><th>الإجمالي</th>
                 <th>الحالة</th><th>إجراء</th>
               </tr>
             </thead>
             <tbody>
               ${orders.slice(0, 6).map(o => `
                 <tr>
                   <td data-label="رقم الطلب" style="color:var(--green);font-weight:700">${o.orderId}</td>
                   <td data-label="العميل">${escapeHTML(o.customer?.name) || '—'}</td>
                   <td data-label="الولاية">${escapeHTML(o.customer?.wilaya) || '—'}</td>
                   <td data-label="الإجمالي" style="font-weight:700">${fmt(o.total)} دج</td>
                   <td data-label="الحالة"><span class="adm-status-badge"
                     style="background:${getStatusColor(o.status)}22;
                            color:${getStatusColor(o.status)};
                            border-color:${getStatusColor(o.status)}">
                     ${o.status}
                   </span></td>
                   <td data-label="إجراء">
                     <button class="adm-action-btn"
                       onclick="adminState.section='orders';
                                adminState.orderSearch='${o.orderId}';
                                renderAdmin()">عرض</button>
                   </td>
                 </tr>`).join('')}
             </tbody>
           </table>`}
    </div>
  </div>`;
}

// ==================== ORDERS ====================
function renderAdminOrders() {
  const statuses = ['الكل','جديد','قيد المعالجة','في الطريق','تم التسليم','ملغي'];
  return `
  <div class="adm-section fade-in">
    <div class="adm-header">
      <h1 class="adm-title">📦 إدارة الطلبات</h1>
    </div>
    <div class="adm-card" style="margin-bottom:20px">
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <input type="text" placeholder="🔍 بحث برقم الطلب أو الاسم..."
          value="${adminState.orderSearch}"
          oninput="adminState.orderSearch=this.value;
                   document.getElementById('orders-list').innerHTML=renderOrdersList()"
          style="flex:1;min-width:200px;background:var(--card2);
                 border:1px solid var(--border2);color:var(--text);
                 padding:10px 14px;border-radius:10px;
                 font-family:'Cairo',sans-serif;font-size:13px;outline:none">
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${statuses.map(s => `
            <button class="adm-filter-tab ${adminState.orderStatus===s?'active':''}"
                    onclick="adminState.orderStatus='${s}';renderAdmin()">
              ${s}
            </button>`).join('')}
        </div>
      </div>
    </div>
    <div id="orders-list">${renderOrdersList()}</div>
  </div>`;
}

function renderOrdersList() {
  const q        = adminState.orderSearch.toLowerCase();
  const filtered = adminState.orders.filter(o => {
    const matchStatus = adminState.orderStatus === 'الكل' || o.status === adminState.orderStatus;
    const matchSearch = !q ||
      o.orderId?.toLowerCase().includes(q) ||
      o.customer?.name?.includes(adminState.orderSearch) ||
      o.customer?.phone?.includes(adminState.orderSearch) ||
      o.customer?.wilaya?.includes(adminState.orderSearch);
    return matchStatus && matchSearch;
  });

  if (!filtered.length) return `
    <div class="adm-card" style="text-align:center;padding:50px">
      <div style="font-size:40px;margin-bottom:12px">📭</div>
      <p style="color:var(--muted)">لا توجد طلبات مطابقة</p>
    </div>`;

  return filtered.map(o => `
    <div class="adm-order-card">
      <div class="adm-order-header">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span style="color:var(--green);font-weight:900;font-size:16px">${o.orderId}</span>
          <span style="color:var(--muted);font-size:12px">${o.date}</span>
        </div>
        <span class="adm-status-badge"
          style="background:${getStatusColor(o.status)}22;
                 color:${getStatusColor(o.status)};
                 border-color:${getStatusColor(o.status)}">
          ${o.status}
        </span>
      </div>
      <div class="adm-order-body">
        <div class="adm-order-info">
          <div class="adm-info-row"><span>👤 الاسم</span><strong>${escapeHTML(o.customer?.name)||'—'}</strong></div>
          <div class="adm-info-row"><span>📞 الهاتف</span>
            <a href="tel:${o.customer?.phone}" style="color:var(--green)">
              ${formatPhone(o.customer?.phone)}
            </a>
          </div>
          <div class="adm-info-row"><span>📍 الولاية</span>
            <strong>${escapeHTML(o.customer?.wilaya)||'—'} — ${escapeHTML(o.customer?.commune)||'—'}</strong>
          </div>
          ${o.customer?.address ? `
            <div class="adm-info-row"><span>🏠 العنوان</span><strong>${escapeHTML(o.customer.address)}</strong></div>
          ` : ''}
          ${o.customer?.notes ? `
            <div class="adm-info-row"><span>📝 ملاحظات</span><strong>${escapeHTML(o.customer.notes)}</strong></div>
          ` : ''}
          <div class="adm-info-row"><span>🚚 التوصيل</span>
            <strong>${escapeHTML(o.customer?.deliveryType)||'—'}</strong>
          </div>
        </div>
        <div class="adm-order-items">
          ${(o.items||[]).map(i => `
            <div style="display:flex;justify-content:space-between;
                        font-size:13px;padding:6px 0;border-bottom:1px solid var(--border)">
              <span>${escapeHTML(i.title)} × ${i.qty}</span>
              <span style="color:var(--green);font-weight:700">
                ${fmt(i.price * i.qty)} دج
              </span>
            </div>`).join('')}
          <div style="display:flex;justify-content:space-between;
                      font-size:15px;font-weight:900;
                      margin-top:10px;padding-top:10px;
                      border-top:2px solid var(--border2)">
            <span>الإجمالي</span>
            <span style="color:var(--green)">${fmt(o.total)} دج</span>
          </div>
        </div>
      </div>
      <div class="adm-order-footer">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-size:13px;color:var(--muted)">تغيير الحالة:</span>
          ${['جديد','قيد المعالجة','في الطريق','تم التسليم','ملغي'].map(s => `
            <button class="adm-status-btn ${o.status===s?'active':''}"
              style="${o.status===s
                ? `background:${getStatusColor(s)};color:#000;border-color:${getStatusColor(s)}`
                : ''}"
              onclick="changeOrderStatus('${o.orderId}','${s}')">
              ${s}
            </button>`).join('')}
        </div>
        <div style="display:flex;gap:8px">
          <a href="tel:${o.customer?.phone}" class="adm-action-btn"
             style="text-decoration:none">📞 اتصال</a>
          <button class="adm-action-btn"
                  onclick="openWA('مرحبا ${escapeHTML(o.customer?.name).replace(/'/g, "\\'")}, بخصوص طلبك ${o.orderId}')">
            💬 واتساب
          </button>
        </div>
      </div>
    </div>`).join('');
}

async function changeOrderStatus(orderId, newStatus) {
  await updateOrderStatus(orderId, newStatus);
  const idx = adminState.orders.findIndex(o => o.orderId === orderId);
  if (idx > -1) adminState.orders[idx].status = newStatus;
  const local = JSON.parse(localStorage.getItem('chaki_orders') || '[]');
  const li    = local.findIndex(o => o.orderId === orderId);
  if (li > -1) { local[li].status = newStatus; localStorage.setItem('chaki_orders', JSON.stringify(local)); }
  const list = document.getElementById('orders-list');
  if (list) list.innerHTML = renderOrdersList();
  showToast(`✅ تم تحديث الحالة: ${newStatus}`);
}

function getStatusColor(s) {
  return {
    'جديد':          '#39FF14',
    'قيد المعالجة': '#FF6B00',
    'في الطريق':    '#2196F3',
    'تم التسليم':   '#4CAF50',
    'ملغي':          '#e53935',
  }[s] || '#888';
}

// ==================== PRODUCTS (ADMIN) ====================
function renderAdminProducts() {
  return `
  <div class="adm-section fade-in">
    <div class="adm-header">
      <h1 class="adm-title">🛍️ إدارة المنتجات</h1>
      <button class="btn-primary" style="padding:10px 20px;font-size:13px"
              onclick="showAddProductForm()">+ إضافة منتج</button>
    </div>
    <div id="adm-product-form"></div>
    <div class="adm-products-grid">
      ${products.map((p, i) => `
        <div class="adm-product-card">
          <div class="adm-pc-img">
            ${getPrimaryImage(p)
              ? `<img src="${getPrimaryImage(p)}" alt="${p.title}" loading="lazy">`
              : '📦'}
          </div>
          <div class="adm-pc-info">
            <div style="font-size:11px;color:var(--muted);margin-bottom:4px">${p.category}</div>
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${p.title}</div>
            <div style="font-size:16px;font-weight:900;color:var(--green)">${fmt(p.price)} دج</div>
          </div>
          <div class="adm-pc-actions">
            <button class="adm-action-btn" onclick="duplicateProduct(${i})">👯 تكرار</button>
            <button class="adm-action-btn" onclick="showEditProductForm(${i})">✏️ تعديل</button>
            <button class="adm-action-btn"
                    style="border-color:#e53935;color:#e53935"
                    onclick="deleteAdminProduct(${i})">🗑️</button>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}

function showAddProductForm() {
  document.getElementById('adm-product-form').innerHTML = productFormHTML(-1, {});
}

function showEditProductForm(idx) {
  document.getElementById('adm-product-form').innerHTML = productFormHTML(idx, products[idx]);
  document.getElementById('adm-product-form').scrollIntoView({behavior:'smooth'});
}

function productFormHTML(idx, p) {
  const isEdit = idx > -1;
  const cats   = categories.map(c => c.name).filter(n => n !== 'قريباً');
  const hasExistingImages = p.image_urls && p.image_urls.length > 0;

  return `
  <div class="adm-card" style="margin-bottom:24px;border-color:rgba(57,255,20,0.3)"
       data-existing-images='${JSON.stringify(p.image_urls || [])}'>
    <div class="adm-card-title">${isEdit ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="co-field">
        <label>اسم المنتج *</label>
        <input id="pf-name" value="${p.title||''}" placeholder="اسم المنتج">
      </div>
      <div class="co-field">
        <label>السعر *</label>
        <input id="pf-price" type="number" value="${p.price||''}" placeholder="السعر">
      </div>
      <div class="co-field">
        <label>السعر القديم</label>
        <input id="pf-oldprice" type="number" value="${p.oldPrice||''}" placeholder="اختياري">
      </div>
      <div class="co-field">
        <label>صور المنتج ${hasExistingImages && !isEdit ? '(اختياري)' : '*'}</label>
        <input id="pf-image" type="file" accept="image/*" multiple>
        ${hasExistingImages && !isEdit ? `<div style="font-size:11px;color:var(--green);margin-top:4px">✓ سيتم استخدام الصور السابقة في حالة التكرار</div>` : ''}
      </div>
      <div class="co-field">
        <label>الفئة</label>
        <select id="pf-cat"
          style="width:100%;background:var(--card2);border:1px solid var(--border2);
                 color:var(--text);padding:12px 14px;border-radius:10px;
                 font-family:'Cairo',sans-serif;font-size:14px;outline:none">
          ${cats.map(c => `<option ${p.category===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="co-field">
        <label>الشارة</label>
        <select id="pf-badge"
          style="width:100%;background:var(--card2);border:1px solid var(--border2);
                 color:var(--text);padding:12px 14px;border-radius:10px;
                 font-family:'Cairo',sans-serif;font-size:14px;outline:none">
          <option value="" ${!p.badge?'selected':''}>بدون شارة</option>
          <option ${p.badge==='جديد'?'selected':''}>جديد</option>
          <option ${p.badge==='الأكثر مبيعاً'?'selected':''}>الأكثر مبيعاً</option>
        </select>
      </div>
      <div class="co-field" style="grid-column:1/-1">
        <label>الوصف</label>
        <textarea id="pf-desc"
          style="width:100%;background:var(--card2);border:1px solid var(--border2);
                 color:var(--text);padding:12px 14px;border-radius:10px;
                 font-family:'Cairo',sans-serif;font-size:14px;
                 outline:none;resize:vertical;min-height:80px">${p.desc||''}</textarea>
      </div>
    </div>
    <div style="display:flex;gap:12px;margin-top:16px">
      <button class="btn-primary" style="padding:12px 24px"
              onclick="${isEdit ? `saveAdminProduct(${idx})` : 'saveNewAdminProduct()'}">
        ${isEdit ? '💾 حفظ التعديلات' : '➕ إضافة المنتج'}
      </button>
      <button class="btn-outline" style="padding:12px 24px"
              onclick="document.getElementById('adm-product-form').innerHTML=''">
        إلغاء
      </button>
    </div>
  </div>`;
}

async function saveNewAdminProduct() {
  const title    = document.getElementById('pf-name').value.trim();
  const price    = Number(document.getElementById('pf-price').value);
  const oldPrice = Number(document.getElementById('pf-oldprice').value) || null;
  const category = document.getElementById('pf-cat').value;
  const badge    = document.getElementById('pf-badge').value || null;
  const desc     = document.getElementById('pf-desc').value.trim();
  const files    = Array.from(document.getElementById('pf-image')?.files || []);
  
  const existingImagesAttr = document.querySelector('[data-existing-images]')?.dataset.existingImages;
  const inheritedImages = existingImagesAttr ? JSON.parse(existingImagesAttr) : [];

  if (!title || !price) return showToast('⚠️ أدخل الاسم والسعر');

  let imageUrls = [];
  if (files.length > 0) {
    for (const file of files) {
      const url = await uploadProductImage(file);
      if (url) imageUrls.push(url);
    }
  } else {
    imageUrls = inheritedImages;
  }

  if (!imageUrls.length) return showToast('⚠️ اختر صورة واحدة على الأقل');

  const product = {
    name: title, price, old_price: oldPrice,
    category, badge, description: desc,
    slug: slugify(title),
    image_url: imageUrls[0], image_urls: imageUrls,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST', headers: SB_HEADERS, body: JSON.stringify([product])
  });
  if (!res.ok) return showToast('❌ فشل إضافة المنتج');

  showToast('✅ تم إضافة المنتج');
  await loadProductsFromSupabase(false);
  adminState.section = 'products';
  renderAdmin();
}

async function saveAdminProduct(idx) {
  const title    = document.getElementById('pf-name').value.trim();
  const price    = Number(document.getElementById('pf-price').value);
  const oldPrice = Number(document.getElementById('pf-oldprice').value) || null;
  const category = document.getElementById('pf-cat').value;
  const badge    = document.getElementById('pf-badge').value || null;
  const desc     = document.getElementById('pf-desc').value.trim();
  const files    = Array.from(document.getElementById('pf-image')?.files || []);

  if (!title || !price) return showToast('⚠️ أدخل الاسم والسعر');

  let imageUrls = getProductImages(products[idx]);
  for (const file of files) {
    const url = await uploadProductImage(file);
    if (url) imageUrls.push(url);
  }

  const updates = {
    name: title, price, old_price: oldPrice,
    category, badge, description: desc,
    slug: slugify(title),
    image_url: imageUrls[0] || null, image_urls: imageUrls,
  };

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?id=eq.${products[idx].id}`,
    { method: 'PATCH', headers: SB_HEADERS, body: JSON.stringify(updates) }
  );
  if (!res.ok) return showToast('❌ فشل تعديل المنتج');

  showToast('✅ تم تعديل المنتج');
  await loadProductsFromSupabase(false);
  adminState.section = 'products';
  renderAdmin();
}

function duplicateProduct(idx) {
  const p = products[idx];
  const copy = {
    ...p,
    title: p.title + ' (نسخة)',
  };
  document.getElementById('adm-product-form').innerHTML = productFormHTML(-1, copy);
  document.getElementById('adm-product-form').scrollIntoView({behavior:'smooth'});
  showToast('👯 تم نسخ بيانات المنتج');
}

async function deleteAdminProduct(idx) {
  if (!confirm(`حذف "${products[idx].title}"؟`)) return;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?id=eq.${products[idx].id}`,
    { method: 'DELETE', headers: SB_HEADERS }
  );
  if (!res.ok) return showToast('❌ فشل حذف المنتج');
  showToast('🗑️ تم حذف المنتج');
  await loadProductsFromSupabase(false);
  renderAdmin();
}

// ==================== CUSTOMERS ====================
function renderAdminCustomers() {
  const customers = {};
  adminState.orders.forEach(o => {
    const k = o.customer?.phone;
    if (!k) return;
    if (!customers[k]) customers[k] = {...o.customer, orders:0, total:0};
    customers[k].orders++;
    customers[k].total += o.total || 0;
  });
  const list = Object.values(customers).sort((a, b) => b.total - a.total);

  return `
  <div class="adm-section fade-in">
    <div class="adm-header">
      <h1 class="adm-title">👥 العملاء</h1>
      <span style="background:var(--green-glow);border:1px solid rgba(57,255,20,0.2);
                   color:var(--green);padding:6px 16px;border-radius:20px;
                   font-size:13px;font-weight:700">
        ${list.length} عميل
      </span>
    </div>
    ${!list.length
      ? `<div class="adm-card" style="text-align:center;padding:60px">
           <div style="font-size:40px;margin-bottom:12px">👥</div>
           <p style="color:var(--muted)">لا يوجد عملاء بعد</p>
         </div>`
      : `<div class="adm-card">
           <table class="adm-table">
             <thead>
               <tr>
                 <th>#</th><th>الاسم</th><th>الهاتف</th>
                 <th>الولاية</th><th>الطلبات</th>
                 <th>المشتريات</th><th>تواصل</th>
               </tr>
             </thead>
             <tbody>
               ${list.map((c, i) => `
                 <tr>
                   <td data-label="#" style="color:var(--muted)">${i + 1}</td>
                   <td data-label="الاسم" style="font-weight:700">${escapeHTML(c.name)||'—'}</td>
                   <td data-label="الهاتف"><a href="tel:${c.phone}" style="color:var(--green)">${formatPhone(c.phone)}</a></td>
                   <td data-label="الولاية">${escapeHTML(c.wilaya)||'—'}</td>
                   <td data-label="الطلبات" style="text-align:center">
                     <span style="background:var(--green-glow);color:var(--green);
                                  padding:3px 10px;border-radius:20px;font-weight:700">
                       ${c.orders}
                     </span>
                   </td>
                   <td data-label="المشتريات" style="font-weight:900;color:var(--green)">${fmt(c.total)} دج</td>
                   <td data-label="تواصل">
                     <button class="adm-action-btn"
                             onclick="openWA('مرحبا ${escapeHTML(c.name).replace(/'/g, "\\'")}')">💬</button>
                   </td>
                 </tr>`).join('')}
             </tbody>
           </table>
         </div>`}
  </div>`;
}

// ==================== MARKETING & ADS ====================
function renderAdminMarketing() {
  const pixelId      = appSettings?.pixel_id        || '';
  const pixelEnabled = appSettings?.pixel_enabled   === 'true';
  const ttPixelId    = appSettings?.tiktok_pixel_id || '';
  const ttEnabled    = appSettings?.tiktok_enabled  === 'true';

  return `
  <div class="adm-section fade-in">
    <div class="adm-header">
      <h1 class="adm-title">📣 التسويق والإعلانات</h1>
    </div>

    <div class="adm-card" style="margin-bottom:20px; border-color:${pixelEnabled ? 'rgba(57,255,20,0.3)' : 'var(--border2)'}">
      <div class="adm-card-title">📘 Meta Pixel</div>
      <div style="display:grid;grid-template-columns:1fr auto; gap:16px; align-items:center; margin-bottom:20px">
        <div class="co-field" style="margin:0">
          <label>Pixel ID</label>
          <input id="mkt-pixel-id" type="text" placeholder="مثال: 123456789..." value="${pixelId}">
        </div>
        <div style="margin-top:20px">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:700">
            <input type="checkbox" id="mkt-pixel-enabled" ${pixelEnabled ? 'checked' : ''}> تفعيل
          </label>
        </div>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn-primary" onclick="saveMarketingSettings()">💾 حفظ الإعدادات</button>
        <button class="adm-action-btn" onclick="runPixelTest()">🧪 اختبار</button>
      </div>
      <div id="pixel-test-result" style="margin-top:12px"></div>
    </div>

    <div class="adm-card" style="border-color:${ttEnabled ? 'rgba(57,255,20,0.3)' : 'var(--border2)'}">
      <div class="adm-card-title">🎵 TikTok Pixel</div>
      <div style="display:grid;grid-template-columns:1fr auto; gap:16px; align-items:center; margin-bottom:20px">
        <div class="co-field" style="margin:0">
          <label>TikTok Pixel ID</label>
          <input id="mkt-tt-pixel-id" type="text" placeholder="مثال: C4..." value="${ttPixelId}">
        </div>
        <div style="margin-top:20px">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:700">
            <input type="checkbox" id="mkt-tt-enabled" ${ttEnabled ? 'checked' : ''}> تفعيل
          </label>
        </div>
      </div>
      <button class="btn-primary" onclick="saveMarketingSettings()">💾 حفظ</button>
    </div>
  </div>`;
}

async function saveMarketingSettings() {
  const pixelId   = document.getElementById('mkt-pixel-id')?.value?.trim()    || '';
  const pixelOn   = document.getElementById('mkt-pixel-enabled')?.checked      || false;
  const ttPixelId = document.getElementById('mkt-tt-pixel-id')?.value?.trim() || '';
  const ttOn      = document.getElementById('mkt-tt-enabled')?.checked         || false;

  showToast('⏳ جاري الحفظ...');

  const ok = await saveSettings({
    pixel_id:        pixelId,
    pixel_enabled:   String(pixelOn),
    tiktok_pixel_id: ttPixelId,
    tiktok_enabled:  String(ttOn),
  });

  if (ok) {
    showToast('✅ تم حفظ إعدادات التسويق');
    if (pixelOn && pixelId) initPixel();
    if (ttOn && ttPixelId)  initTikTokPixel();
    renderAdmin();
  } else {
    showToast('❌ فشل الحفظ');
  }
}

// ==================== GIVEAWAY MANAGEMENT ====================
function renderAdminGiveaway() {
  return `
  <div class="adm-section fade-in">
    <div class="adm-header">
      <h1 class="adm-title">🎁 إدارة المسابقات</h1>
      <button class="adm-action-btn" onclick="drawWinner()">🎯 سحب فائز عشوائي</button>
    </div>

    <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:20px;align-items:start">
      
      <!-- إعدادات المسابقة -->
      <div class="adm-card">
        <div class="adm-card-title">⚙️ إعدادات المسابقة الحالية</div>
        <div class="co-field"><label>عنوان المسابقة</label><input id="gw-title" value="${appSettings?.giveaway_title || ''}"></div>
        <div class="co-field"><label>الجائزة</label><input id="gw-gift" value="${appSettings?.giveaway_gift || ''}"></div>
        <div class="co-field"><label>تاريخ السحب (YYYY-MM-DD HH:MM)</label><input id="gw-date" value="${appSettings?.giveaway_end_date || ''}"></div>
        <div class="co-field">
          <label>حالة المسابقة</label>
          <select id="gw-status">
            <option value="active" ${appSettings?.giveaway_status==='active'?'selected':''}>نشطة</option>
            <option value="ended" ${appSettings?.giveaway_status==='ended'?'selected':''}>منتهية</option>
          </select>
        </div>
        <div class="co-field"><label>رابط منشور الفيسبوك</label><input id="gw-fb" value="${appSettings?.giveaway_fb_url || ''}"></div>
        <div class="co-field"><label>رابط منشور إنستغرام</label><input id="gw-ig" value="${appSettings?.giveaway_ig_url || ''}"></div>
        <div class="co-field"><label>رابط منشور تيك توك</label><input id="gw-tt" value="${appSettings?.giveaway_tt_url || ''}"></div>
        <div class="co-field"><label>الفائز (يُملأ يدوياً أو بالسحب)</label><input id="gw-winner" value="${appSettings?.giveaway_winner || ''}"></div>
        
        <button class="btn-primary" style="width:100%" onclick="saveGiveawaySettings()">💾 حفظ إعدادات المسابقة</button>
      </div>

      <!-- قائمة المشاركين -->
      <div class="adm-card">
        <div class="adm-card-title">👥 المشاركين (${adminState.participants.length})</div>
        <div style="max-height:600px;overflow-y:auto">
          <table class="adm-table">
            <thead><tr><th>الاسم</th><th>الهاتف</th></tr></thead>
            <tbody>
              ${adminState.participants.map(p => `
                <tr>
                  <td>${escapeHTML(p.name)}</td>
                  <td><a href="tel:${p.phone}" style="color:var(--green)">${p.phone}</a></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>`;
}

async function saveGiveawaySettings() {
  const settings = {
    giveaway_title:    document.getElementById('gw-title').value,
    giveaway_gift:     document.getElementById('gw-gift').value,
    giveaway_end_date: document.getElementById('gw-date').value,
    giveaway_status:   document.getElementById('gw-status').value,
    giveaway_fb_url:   document.getElementById('gw-fb').value,
    giveaway_ig_url:   document.getElementById('gw-ig').value,
    giveaway_tt_url:   document.getElementById('gw-tt').value,
    giveaway_winner:   document.getElementById('gw-winner').value,
  };
  showToast('⏳ جاري الحفظ...');
  if (await saveSettings(settings)) {
    showToast('✅ تم تحديث المسابقة');
    renderAdmin();
  }
}

function drawWinner() {
  if (!adminState.participants.length) return showToast('⚠️ لا يوجد مشاركون للسحب');
  const winner = adminState.participants[Math.floor(Math.random() * adminState.participants.length)];
  const winnerName = `${winner.name} (${winner.phone})`;
  
  if (confirm(`هل أنت متأكد من سحب فائز؟ الفائز المختار: ${winnerName}`)) {
    document.getElementById('gw-winner').value = winnerName;
    showToast('🎉 مبروك للفائز! اضغط حفظ لاعتماد النتيجة');
  }
}

async function runPixelTest() {
  const result  = document.getElementById('pixel-test-result');
  const pixelId = document.getElementById('mkt-pixel-id')?.value?.trim();
  if (!pixelId) return showToast('⚠️ يرجى إدخال Pixel ID أولاً');
  
  result.innerHTML = `<div style="color:var(--muted);font-size:13px">⏳ جاري الاختبار...</div>`;
  const isValid = /^\d+$/.test(pixelId);

  setTimeout(() => {
    result.innerHTML = isValid 
      ? `<div style="color:var(--green);font-size:13px">✅ صيغة المعرف صحيحة (${pixelId})</div>`
      : `<div style="color:var(--red);font-size:13px">❌ المعرف يجب أن يحتوي على أرقام فقط</div>`;
  }, 800);
}
// ==================== SETTINGS ====================
function renderAdminSettings() {
  return `
  <div class="adm-section fade-in">
    <div class="adm-header">
      <h1 class="adm-title">⚙️ الإعدادات</h1>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:800px">

      <div class="adm-card">
        <div class="adm-card-title">🏪 إعدادات المتجر العامة</div>
        <div class="co-field">
          <label>اسم المتجر</label>
          <input id="set-store-name" type="text" value="${appSettings?.store_name || 'CHAKI⚡'}">
        </div>
        <div class="co-field">
          <label>رقم واتساب (بصيغة 213...)</label>
          <input id="set-wa-number" type="text" value="${appSettings?.whatsapp_number || '213658307105'}">
        </div>
        <div class="co-field">
          <label>الحد الأدنى للشحن المجاني (دج)</label>
          <input id="set-free-shipping" type="number" value="${appSettings?.free_shipping_min || '5000'}">
        </div>
        <button class="btn-primary" style="padding:11px 24px" onclick="saveGeneralSettings()">
          💾 حفظ الإعدادات العامة
        </button>
      </div>

      <div class="adm-card">
        <div class="adm-card-title">🔐 تغيير كلمة المرور</div>
        <div class="co-field">
          <label>كلمة المرور الحالية</label>
          <input id="pass-current" type="password" placeholder="••••••••">
        </div>
        <div class="co-field">
          <label>كلمة المرور الجديدة</label>
          <input id="pass-new" type="password" placeholder="••••••••">
        </div>
        <div class="co-field">
          <label>تأكيد كلمة المرور</label>
          <input id="pass-confirm" type="password" placeholder="••••••••">
        </div>
        <button class="btn-primary" style="padding:11px 24px;margin-top:8px"
                onclick="changeAdminPass()">
          💾 حفظ كلمة المرور
        </button>
      </div>

      <div class="adm-card">
        <div class="adm-card-title">📊 إحصائيات سريعة</div>
        <div class="adm-info-row">
          <span>إجمالي الطلبات</span>
          <strong>${adminState.orders.length}</strong>
        </div>
        <div class="adm-info-row">
          <span>إجمالي المنتجات</span>
          <strong>${products.length}</strong>
        </div>
        <div class="adm-info-row">
          <span>آخر طلب</span>
          <strong style="font-size:12px">${adminState.orders[0]?.date || '—'}</strong>
        </div>
        <div class="adm-info-row">
          <span>مصدر البيانات</span>
          <strong style="color:var(--green)">Supabase ✓</strong>
        </div>
      </div>

      <div class="adm-card">
        <div class="adm-card-title">🗄️ البيانات المحلية</div>
        <p style="color:var(--muted);font-size:13px;margin-bottom:16px;line-height:1.7">
          حذف البيانات المحفوظة في المتصفح فقط — لا يؤثر على Supabase.
        </p>
        <button class="adm-action-btn"
                style="border-color:#e53935;color:#e53935;padding:10px 20px"
                onclick="if(confirm('حذف كل البيانات المحلية؟')){
                  localStorage.clear();
                  showToast('تم مسح البيانات المحلية');}">
          🗑️ مسح البيانات المحلية
        </button>
      </div>

      <div class="adm-card">
        <div class="adm-card-title">🔗 روابط سريعة</div>
        ${[
          ['🏪 المتجر',       'home'],
          ['📦 الطلبات',      'orders'],
          ['🛍️ المنتجات',    'products'],
          ['👥 العملاء',      'customers'],
          ['🎯 التسويق',      'marketing'],
          ['⚙️ الإعدادات',    'settings'],
        ].map(([label, section]) => `
          <button class="adm-nav-btn"
                  style="margin-bottom:6px;width:100%"
                  onclick="adminState.section='${section}';renderAdmin()">
            ${label}
          </button>`).join('')}
        <button class="adm-nav-btn"
                style="margin-bottom:6px;width:100%"
                onclick="navigateTo('home')">
          🌐 عرض المتجر
        </button>
      </div>

    </div>
  </div>`;
}

async function changeAdminPass() {
  const newPass = document.getElementById('pass-new')?.value?.trim();
  const confirm = document.getElementById('pass-confirm')?.value?.trim();

  if (!newPass || newPass.length < 6) return showToast('⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل');
  if (newPass !== confirm) return showToast('⚠️ كلمتا المرور غير متطابقتين');

  const btn = document.querySelector('button[onclick="changeAdminPass()"]');
  btn.textContent = '⏳ جاري الحفظ...';
  btn.disabled = true;

  const result = await updateAdminPassword(newPass);

  if (result.success) {
    showToast('✅ تم تحديث كلمة المرور بنجاح');
    document.querySelectorAll('.adm-card input[type="password"]').forEach(i => i.value = '');
  } else {
    showToast('❌ خطأ: ' + result.error);
  }
  btn.textContent = '💾 حفظ كلمة المرور';
  btn.disabled = false;
}

async function saveGeneralSettings() {
  const name  = document.getElementById('set-store-name')?.value?.trim();
  const wa    = document.getElementById('set-wa-number')?.value?.trim();
  const free  = document.getElementById('set-free-shipping')?.value?.trim();

  if (!name || !wa) return showToast('⚠️ يرجى ملء اسم المتجر ورقم الواتساب');

  showToast('⏳ جاري الحفظ...');
  const ok = await saveSettings({
    store_name: name,
    whatsapp_number: wa,
    free_shipping_min: free
  });

  if (ok) {
    showToast('✅ تم حفظ الإعدادات العامة');
    renderAdmin();
  } else {
    showToast('❌ فشل الحفظ');
  }
}