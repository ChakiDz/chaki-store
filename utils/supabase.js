// ==================== SUPABASE CONFIG ====================
const SUPABASE_URL = 'https://oejecrvngcidmobpubci.supabase.co';
const SUPABASE_KEY = 'sb_publishable_OwnWEAUco1f0Y7FQvpMZtA_Q-_LsU0Y';

const SB_HEADERS = {
  'Content-Type':  'application/json',
  'apikey':        SUPABASE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_KEY,
  'Prefer':        'return=representation',
};

// وظيفة مساعدة لجلب الترويسات مع التوكن إذا كان متاحاً
function getAdminHeaders() {
  const token = sessionStorage.getItem('sb_admin_token');
  return {
    ...SB_HEADERS,
    'Authorization': token ? `Bearer ${token}` : SB_HEADERS.Authorization
  };
}

// ---- نظام الحماية والدخول ----
async function signInAdmin(email, password) {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.message);
    
    // حفظ التوكن في sessionStorage للأمان
    sessionStorage.setItem('sb_admin_token', data.access_token);
    return { success: true };
  } catch (err) {
    console.error('❌ Login Error:', err.message);
    return { success: false, error: err.message };
  }
}

function signOutAdmin() {
  sessionStorage.removeItem('sb_admin_token');
  sessionStorage.removeItem('chaki_admin');
}

function isAdminLoggedIn() {
  return !!sessionStorage.getItem('sb_admin_token');
}

async function updateAdminPassword(newPassword) {
  const token = sessionStorage.getItem('sb_admin_token');
  if (!token) return { success: false, error: 'جلسة العمل انتهت، يرجى تسجيل الدخول مجدداً' };

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'فشل تحديث كلمة المرور');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ---- جلب المنتجات ----
async function loadProductsFromSupabase(renderNow = true) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
      headers: SB_HEADERS
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) return;

    products = data.map((item, index) => ({
      id:         item.id ?? Date.now() + index,
      title:      item.name ?? 'منتج جديد',
      price:      Number(item.price ?? 0),
      oldPrice:   item.old_price ?? null,
      image_url:  item.image_url ?? null,
      image_urls: Array.isArray(item.image_urls) ? item.image_urls.filter(Boolean) : [],
      category:   item.category ?? 'عام',
      rating:     Number((4.4 + Math.random() * 0.5).toFixed(1)),
      reviews:    Math.floor(20 + Math.random() * 65),
      badge:      item.badge ?? null,
      desc:       item.description ?? '',
      slug:       item.slug ?? null,
      specs:      item.specs ?? null,
    }));

    if (renderNow) render();
  } catch (err) {
    console.error('❌ Supabase load:', err.message);
  }
}

// ---- جلب الأقسام ----
async function fetchCategoriesFromSupabase() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*&order=sort_order.asc`, {
      headers: SB_HEADERS
    });
    if (!res.ok) return []; // العودة بمصفوفة فارغة بدلاً من التعطل
    const data = await res.json();
    if (Array.isArray(data)) {
      categories = data;
    }
  } catch (err) {
    console.error('❌ Categories load:', err.message);
  }
}

// ---- التحقق من الأسعار لمنع التلاعب ----
async function verifyOrderPrices(cartItems) {
  try {
    const ids = cartItems.map(item => item.id).join(',');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=in.(${ids})&select=id,price`, {
      headers: SB_HEADERS
    });
    if (!res.ok) return false;
    const dbProducts = await res.json();

    let dbSubtotal = 0;
    cartItems.forEach(item => {
      const dbP = dbProducts.find(p => p.id === item.id);
      if (dbP) dbSubtotal += Number(dbP.price) * item.qty;
    });
    return dbSubtotal;
  } catch (err) {
    return false;
  }
}

// ---- حفظ طلب جديد ----
async function saveOrderToSupabase(order) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method:  'POST',
      headers: SB_HEADERS,
      body: JSON.stringify({
        order_id:      order.orderId,
        date:          order.date,
        customer_name: order.customer.name,
        phone:         order.customer.phone,
        wilaya:        order.customer.wilaya,
        commune:       order.customer.commune,
        address:       order.customer.address || '',
        notes:         order.customer.notes   || '',
        delivery_type: order.customer.deliveryType,
        items:         order.items,
        subtotal:      order.subtotal,
        discount:      order.discount || 0,
        shipping:      order.shipping,
        total:         order.total,
        status:        'جديد',
      })
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  } catch (err) {
    console.error('❌ Save order:', err.message);
    return false;
  }
}

// ---- جلب الطلبات (للأدمن) ----
async function fetchOrdersFromSupabase() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`,
      { headers: getAdminHeaders() }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('❌ Fetch orders:', err.message);
    return null;
  }
}

// ---- البحث عن طلب محدد ----
async function getOrderByIdOrPhone(value) {
  try {
    const isId = value.startsWith('#') || value.startsWith('CH');
    const column = isId ? 'order_id' : 'phone';
    const queryValue = isId ? (value.startsWith('#') ? value : '#' + value) : value;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?${column}=eq.${encodeURIComponent(queryValue)}&select=*`,
      { headers: SB_HEADERS }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] || null;
  } catch (err) {
    return null;
  }
}

// ---- تحديث حالة طلب ----
async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?order_id=eq.${encodeURIComponent(orderId)}`,
      { method: 'PATCH', headers: getAdminHeaders(), body: JSON.stringify({ status: newStatus }) }
    );
    return res.ok;
  } catch (err) {
    return false;
  }
}

// ---- رفع صورة ----
async function uploadProductImage(file) {
  try {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const buffer   = await file.arrayBuffer();
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/products-images/${fileName}`,
      {
        method:  'POST',
        headers: {
          'apikey':        SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type':  file.type || 'application/octet-stream',
          'x-upsert':      'true',
        },
        body: buffer,
      }
    );
    if (!res.ok) throw new Error(await res.text());
    return `${SUPABASE_URL}/storage/v1/object/public/products-images/${fileName}`;
  } catch (err) {
    showToast('فشل رفع الصورة: ' + err.message);
    return null;
  }
}

// ==================== SETTINGS ====================
let appSettings = {};

async function loadSettings() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/settings?select=*`, {
      headers: SB_HEADERS
    });
    if (!res.ok) return appSettings; // العودة للقيم الحالية في حالة الخطأ
    const data = await res.json();

    // تحويل المصفوفة إلى كائن سهل الاستخدام
    appSettings = {};
    data.forEach(row => {
      appSettings[row.key] = row.value;
    });

    console.log('✅ Settings loaded:', appSettings);
    return appSettings;
  } catch (err) {
    console.error('❌ Load settings:', err.message);
    return {};
  }
}

async function saveSetting(key, value) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/settings?key=eq.${encodeURIComponent(key)}`,
      {
        method:  'PATCH',
        headers: getAdminHeaders(),
        body:    JSON.stringify({ value: String(value), updated_at: new Date().toISOString() }),
      }
    );
    if (!res.ok) throw new Error(await res.text());
    appSettings[key] = String(value);
    return true;
  } catch (err) {
    console.error('❌ Save setting:', err.message);
    return false;
  }
}

async function saveSettings(settingsObj) {
  const results = await Promise.all(
    Object.entries(settingsObj).map(([key, value]) => saveSetting(key, value))
  );
  return results.every(Boolean);
}

// ==================== GIVEAWAY ====================
async function saveGiveawayParticipantToSupabase(participant) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/giveaway_participants`, {
      method: 'POST',
      headers: SB_HEADERS,
      body: JSON.stringify(participant)
    });
    if (res.status === 409) throw new Error('هذا الرقم مسجل بالفعل في المسابقة');
    if (!res.ok) throw new Error(await res.text());
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function fetchGiveawayParticipants() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/giveaway_participants?select=*&order=created_at.desc`, {
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (err) {
    console.error('❌ Fetch participants:', err.message);
    return [];
  }
}