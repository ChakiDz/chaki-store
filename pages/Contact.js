// ==================== CONTACT PAGE ====================
function renderContactPage() {
  return `
  <div class="cart-page fade-in">
    <div class="breadcrumb">
      <a onclick="navigateTo('home')">الرئيسية</a>
      <span class="sep">›</span>
      <span class="cur">تواصل معنا</span>
    </div>
    <div style="max-width:800px;margin:0 auto">
      <div style="text-align:center;margin-bottom:44px">
        <div style="font-size:52px;margin-bottom:14px">💬</div>
        <h1 style="font-size:30px;font-weight:900;margin-bottom:8px">
          تواصل <span style="color:var(--green)">معنا</span>
        </h1>
        <p style="color:var(--muted2)">فريقنا متاح يومياً من 9 صباحاً إلى 9 مساءً</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">

        <!-- معلومات التواصل -->
        <div style="display:flex;flex-direction:column;gap:14px">
          ${[
            {icon:'📱', title:'واتساب',     val:formatPhone(appSettings?.whatsapp_number || '0658307105'),  action:`openWA()`},
            {icon:'📸', title:'إنستغرام',   val:'@chakishopdz',  action:`window.open('https://instagram.com/chakishopdz','_blank')`},
            {icon:'📘', title:'فيسبوك',     val:'CHAKI Store',   action:`window.open('https://www.facebook.com/profile.php?id=61588036349245','_blank')`},
            {icon:'🎵', title:'تيك توك',    val:'@chaki.dz',     action:`window.open('https://www.tiktok.com/@chaki.dz','_blank')`},
            {icon:'📍', title:'الموقع',     val:'عنابة، الجزائر', action:`null`},
            {icon:'⏰', title:'أوقات العمل',val:'يومياً 9:00 – 21:00', action:`null`},
          ].map(c => `
            <div onclick="${c.action !== 'null' ? c.action : ''}"
                 style="background:var(--card);border:1px solid var(--border2);
                        border-radius:14px;padding:18px;
                        display:flex;align-items:center;gap:14px;
                        ${c.action !== 'null' ? 'cursor:pointer;' : ''}
                        transition:border-color 0.2s;"
                 ${c.action !== 'null' ? `onmouseover="this.style.borderColor='rgba(57,255,20,0.4)'"
                   onmouseout="this.style.borderColor='var(--border2)'"` : ''}>
              <div style="width:44px;height:44px;border-radius:12px;
                          background:var(--green-glow);
                          border:1px solid rgba(57,255,20,0.2);
                          display:flex;align-items:center;
                          justify-content:center;font-size:20px;flex-shrink:0">
                ${c.icon}
              </div>
              <div>
                <div style="font-size:12px;color:var(--muted);margin-bottom:2px">${c.title}</div>
                <div style="font-weight:700;font-size:15px">${c.val}</div>
              </div>
              ${c.action !== 'null'
                ? '<div style="margin-right:auto;color:var(--green);font-size:18px">←</div>'
                : ''}
            </div>`).join('')}
        </div>

        <!-- فورم الرسالة -->
        <div class="co-form-card">
          <div class="co-section-title">📩 أرسل رسالة</div>
          <div class="co-field">
            <label>الاسم</label>
            <input id="ct-name" type="text" placeholder="اسمك الكامل">
          </div>
          <div class="co-field">
            <label>رقم الهاتف</label>
            <input id="ct-phone" type="tel" placeholder="06 XX XX XX XX" dir="ltr">
          </div>
          <div class="co-field">
            <label>الموضوع</label>
            <select id="ct-subject"
              style="width:100%;background:var(--card2);border:1px solid var(--border2);
                     color:var(--text);padding:12px 14px;border-radius:10px;
                     font-family:'Cairo',sans-serif;font-size:14px;outline:none">
              <option>استفسار عن منتج</option>
              <option>مشكلة في طلب</option>
              <option>طلب مخصص</option>
              <option>أخرى</option>
            </select>
          </div>
          <div class="co-field">
            <label>الرسالة</label>
            <textarea id="ct-msg" placeholder="اكتب رسالتك هنا..."
              style="min-height:110px;width:100%;background:var(--card2);
                     border:1px solid var(--border2);color:var(--text);
                     padding:12px 14px;border-radius:10px;
                     font-family:'Cairo',sans-serif;font-size:14px;
                     outline:none;resize:vertical"></textarea>
          </div>
          <button class="btn-primary"
                  style="width:100%;justify-content:center;padding:14px"
                  onclick="sendContactMsg()">
            💬 إرسال عبر واتساب
          </button>
        </div>

      </div>
    </div>
  </div>`;
}

function sendContactMsg() {
  const name    = document.getElementById('ct-name')?.value?.trim();
  const phone   = document.getElementById('ct-phone')?.value?.trim();
  const subject = document.getElementById('ct-subject')?.value;
  const msg     = document.getElementById('ct-msg')?.value?.trim();
  if (!name || !msg) { showToast('⚠️ يرجى ملء الاسم والرسالة'); return; }
  const text = `📩 رسالة من الموقع\n━━━━━━━━\n👤 ${name}\n📞 ${phone||'—'}\n📋 ${subject}\n━━━━━━━━\n💬 ${msg}`;
  openWA(text);
}

// ==================== TRACK PAGE ====================
function renderTrackPage() {
  return `
  <div class="cart-page fade-in">
    <div class="breadcrumb">
      <a onclick="navigateTo('home')">الرئيسية</a>
      <span class="sep">›</span>
      <span class="cur">تتبع الطلب</span>
    </div>
    <div style="max-width:600px;margin:0 auto">
      <div style="text-align:center;margin-bottom:40px">
        <div style="font-size:56px;margin-bottom:16px">📦</div>
        <h1 style="font-size:28px;font-weight:900;margin-bottom:8px">
          تتبع <span style="color:var(--green)">طلبك</span>
        </h1>
        <p style="color:var(--muted2)">أدخل رقم طلبك أو رقم هاتفك</p>
      </div>

      <div class="co-form-card" style="margin-bottom:24px">
        <div class="co-section-title">🔍 ابحث عن طلبك</div>

        <div style="display:flex;gap:8px;margin-bottom:20px">
          <button class="adm-filter-tab active" id="tab-id"
                  onclick="switchTrackTab('id')">📋 برقم الطلب</button>
          <button class="adm-filter-tab" id="tab-phone"
                  onclick="switchTrackTab('phone')">📞 برقم الهاتف</button>
        </div>

        <div id="track-input-id">
          <div class="co-field">
            <label>رقم الطلب</label>
            <input id="track-order-id" type="text" placeholder="مثال: #CH4521">
          </div>
        </div>
        <div id="track-input-phone" style="display:none">
          <div class="co-field">
            <label>رقم الهاتف</label>
            <input id="track-phone" type="tel" placeholder="06 XX XX XX XX" dir="ltr">
          </div>
        </div>

        <button class="btn-primary"
                style="width:100%;margin-top:12px;justify-content:center;padding:14px"
                onclick="searchOrder()">
          🔍 ابحث عن طلبي
        </button>
      </div>

      <div id="track-result"></div>

      <!-- حالات الطلب -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:24px">
        ${[
          {icon:'⏳', title:'قيد الانتظار',   desc:'تم استلام طلبك'},
          {icon:'⚙️', title:'قيد المعالجة',   desc:'يتم تجهيز طلبك'},
          {icon:'🚚', title:'في الطريق',       desc:'طلبك في الطريق إليك'},
          {icon:'✅', title:'تم التسليم',      desc:'استلمت طلبك بنجاح'},
        ].map(s => `
          <div style="background:var(--card);border:1px solid var(--border2);
                      border-radius:14px;padding:18px;text-align:center">
            <div style="font-size:28px;margin-bottom:8px">${s.icon}</div>
            <div style="font-weight:700;font-size:13px;margin-bottom:4px">${s.title}</div>
            <div style="font-size:11px;color:var(--muted);line-height:1.5">${s.desc}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function switchTrackTab(tab) {
  document.getElementById('tab-id').classList.toggle('active', tab === 'id');
  document.getElementById('tab-phone').classList.toggle('active', tab === 'phone');
  document.getElementById('track-input-id').style.display    = tab === 'id'    ? 'block' : 'none';
  document.getElementById('track-input-phone').style.display = tab === 'phone' ? 'block' : 'none';
}

async function searchOrder() {
  const byId    = document.getElementById('track-order-id')?.value?.trim().toUpperCase();
  const byPhone = document.getElementById('track-phone')?.value?.trim();
  const value   = byId || byPhone;
  const result  = document.getElementById('track-result');
  
  if (!value) return showToast('⚠️ يرجى إدخال رقم الطلب أو الهاتف');
  result.innerHTML = '<div style="text-align:center;padding:20px">⏳ جاري البحث...</div>';

  const found = await getOrderByIdOrPhone(value);

  if (!found) {
    result.innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border2);
                border-radius:16px;padding:40px;text-align:center;margin-top:16px">
      <div style="font-size:40px;margin-bottom:12px">😕</div>
      <h3 style="font-size:18px;font-weight:700;margin-bottom:8px">لم يُعثر على طلب</h3>
      <p style="color:var(--muted);font-size:14px">تأكد من رقم الطلب أو الهاتف وحاول مجدداً</p>
    </div>`;
    return;
  }

  const colors = {
    'جديد':'#39FF14','قيد المعالجة':'#FF6B00',
    'في الطريق':'#2196F3','تم التسليم':'#4CAF50','ملغي':'#e53935'
  };
  const status = found.status || 'جديد';
  const sc = colors[status] || 'var(--green)';

  result.innerHTML = `
  <div style="background:var(--card);border:1px solid var(--border2);
              border-radius:20px;padding:28px;margin-top:16px">
    <div style="display:flex;justify-content:space-between;
                align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-size:22px;font-weight:900;color:var(--green)">${found.order_id}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px">${found.date}</div>
      </div>
      <span style="padding:8px 18px;border-radius:20px;border:1px solid ${sc};
                   background:${sc}22;color:${sc};font-weight:900;font-size:14px">
        ${status}
      </span>
    </div>

    <div style="font-size:13px;font-weight:900;color:var(--green);
                letter-spacing:1px;margin-bottom:12px;
                padding-right:10px;border-right:3px solid var(--green)">
      👤 بيانات التوصيل
    </div>
    ${[
      ['الاسم',    found.customer_name],
      ['الهاتف',   found.phone],
      ['الولاية',  found.wilaya],
      ['البلدية',  found.commune || '—'],
      ['التوصيل',  found.delivery_type || '—'],
    ].map(([k, v]) => `
      <div style="display:flex;justify-content:space-between;
                  padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
        <span style="color:var(--muted2)">${k}</span>
        <strong>${v}</strong>
      </div>`).join('')}

    <div style="font-size:13px;font-weight:900;color:var(--green);
                letter-spacing:1px;margin:20px 0 12px;
                padding-right:10px;border-right:3px solid var(--green)">
      📦 المنتجات
    </div>
    ${found.items?.map(i => `
      <div style="display:flex;justify-content:space-between;
                  padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
        <span>${i.title} × ${i.qty}</span>
        <strong style="color:var(--green)">${fmt(i.price * i.qty)} دج</strong>
      </div>`).join('')}

    <div style="display:flex;justify-content:space-between;
                font-size:16px;font-weight:900;
                margin-top:16px;padding-top:12px;border-top:2px solid var(--border2)">
      <span>💰 الإجمالي</span>
      <span style="color:var(--green)">${fmt(found.total)} دج</span>
    </div>

    <div style="text-align:center;margin-top:20px">
      <button class="btn-outline" style="padding:11px 28px;font-size:13px"
              onclick="openWA('مرحبا، أريد الاستفسار عن طلبي ${found.order_id}')">
        💬 تواصل بشأن طلبك
      </button>
    </div>
  </div>`;
}

// ==================== FAQ PAGE ====================
function renderFaqPage() {
  const faqs = [
    {q:'كيف أطلب منتجاً؟',           a:'أضف المنتج لسلة التسوق، ثم اذهب لإتمام الطلب وأدخل بياناتك. سيتواصل معك فريقنا لتأكيد التوصيل.'},
    {q:'ما هي طريقة الدفع؟',          a:'الدفع عند الاستلام فقط — تدفع نقداً عند استلام طلبك. لا حاجة لبطاقة بنكية.'},
    {q:'كم يستغرق التوصيل؟',          a:'من 2 إلى 5 أيام عمل لجميع ولايات الجزائر.'},
    {q:'هل يمكنني إلغاء طلبي؟',       a:'يمكنك إلغاء الطلب قبل شحنه. تواصل معنا عبر واتساب في أقرب وقت.'},
    {q:'هل تقبلون طلبات مخصصة؟',     a:'نعم! أرسل لنا فكرتك عبر واتساب وسنحولها لمنتج مطبوع ثلاثي الأبعاد.'},
    {q:'ماذا لو وصل المنتج تالفاً؟',  a:'تواصل معنا خلال 48 ساعة مع صورة وسنحل المشكلة فوراً.'},
    {q:'هل تغطون جميع الولايات؟',     a:'نعم، نوصّل لجميع الولايات. تكلفة الشحن تتفاوت حسب الولاية.'},
    {q:'كيف أتتبع طلبي؟',             a:'اذهب لصفحة تتبع الطلب وأدخل رقم طلبك أو رقم هاتفك.'},
  ];

  return `
  <div class="cart-page fade-in">
    <div class="breadcrumb">
      <a onclick="navigateTo('home')">الرئيسية</a>
      <span class="sep">›</span>
      <span class="cur">الأسئلة الشائعة</span>
    </div>
    <div style="max-width:720px;margin:0 auto">
      <div style="text-align:center;margin-bottom:44px">
        <div style="font-size:52px;margin-bottom:14px">❓</div>
        <h1 style="font-size:30px;font-weight:900;margin-bottom:8px">
          الأسئلة <span style="color:var(--green)">الشائعة</span>
        </h1>
      </div>

      <div style="display:flex;flex-direction:column;gap:12px">
        ${faqs.map((f, i) => `
          <div style="background:var(--card);border:1px solid var(--border2);
                      border-radius:14px;overflow:hidden" id="faq-${i}">
            <button onclick="toggleFaqItem(${i})"
              style="width:100%;background:transparent;border:none;
                     color:var(--text);padding:18px 20px;text-align:right;
                     font-family:'Cairo',sans-serif;font-weight:700;font-size:15px;
                     cursor:pointer;display:flex;justify-content:space-between;align-items:center">
              <span>${f.q}</span>
              <span id="farrow-${i}" style="color:var(--green);font-size:12px">▼</span>
            </button>
            <div id="fans-${i}"
                 style="display:none;padding:0 20px 18px;
                        color:var(--muted2);font-size:14px;
                        line-height:1.8;border-top:1px solid var(--border)">
              ${f.a}
            </div>
          </div>`).join('')}
      </div>

      <div style="text-align:center;margin-top:40px;background:var(--card);
                  border:1px solid var(--border2);border-radius:18px;padding:28px">
        <div style="font-size:28px;margin-bottom:10px">💬</div>
        <h3 style="font-weight:700;margin-bottom:8px">لم تجد إجابتك؟</h3>
        <button class="btn-primary"
                style="margin:0 auto;padding:12px 28px"
                onclick="navigateTo('contact')">
          💬 تواصل معنا
        </button>
      </div>
    </div>
  </div>`;
}

function toggleFaqItem(i) {
  const ans   = document.getElementById(`fans-${i}`);
  const arrow = document.getElementById(`farrow-${i}`);
  const open  = ans.style.display === 'none';
  ans.style.display  = open ? 'block' : 'none';
  arrow.textContent  = open ? '▲' : '▼';
}

// ==================== PRIVACY PAGE ====================
function renderPrivacyPage() {
  const sections = [
    {t:'جمع المعلومات',   b:'نجمع فقط المعلومات الضرورية لتنفيذ طلبك: الاسم، رقم الهاتف، الولاية، والعنوان.'},
    {t:'استخدام المعلومات',b:'تُستخدم معلوماتك حصراً لتنفيذ طلبك والتواصل معك. لا نشارك بياناتك مع أي طرف ثالث.'},
    {t:'حفظ البيانات',    b:'يتم حفظ بيانات الطلبات في قاعدة بيانات آمنة. بياناتك محمية بالكامل.'},
    {t:'حقوقك',           b:'يمكنك في أي وقت طلب حذف بياناتك بالتواصل معنا عبر واتساب.'},
    {t:'التعديلات',       b:'قد نُحدّث سياسة الخصوصية من وقت لآخر. سيتم نشر أي تغييرات على هذه الصفحة.'},
  ];
  return `
  <div class="cart-page fade-in">
    <div class="breadcrumb">
      <a onclick="navigateTo('home')">الرئيسية</a>
      <span class="sep">›</span>
      <span class="cur">سياسة الخصوصية</span>
    </div>
    <div style="max-width:720px;margin:0 auto">
      <div style="text-align:center;margin-bottom:40px">
        <div style="font-size:48px;margin-bottom:12px">🔒</div>
        <h1 style="font-size:28px;font-weight:900">
          سياسة <span style="color:var(--green)">الخصوصية</span>
        </h1>
        <p style="color:var(--muted);font-size:13px;margin-top:8px">آخر تحديث: مايو 2026</p>
      </div>
      ${sections.map(s => `
        <div style="background:var(--card);border:1px solid var(--border2);
                    border-radius:16px;padding:24px;margin-bottom:14px">
          <h3 style="font-size:16px;font-weight:900;color:var(--green);
                     margin-bottom:10px;padding-right:12px;
                     border-right:3px solid var(--green)">
            ${s.t}
          </h3>
          <p style="color:var(--muted2);font-size:14px;line-height:1.9">${s.b}</p>
        </div>`).join('')}
    </div>
  </div>`;
}

// ==================== TERMS PAGE ====================
function renderTermsPage() {
  const sections = [
    {t:'قبول الشروط',      b:'باستخدامك لموقع CHAKI⚡ أو تقديمك لطلب، فإنك توافق على هذه الشروط والأحكام.'},
    {t:'المنتجات والأسعار',b:'جميع المنتجات مطبوعة ثلاثية الأبعاد. الأسعار بالدينار الجزائري وقابلة للتغيير.'},
    {t:'الطلبات والتسليم', b:'مدة التوصيل من 2 إلى 5 أيام عمل. نحن غير مسؤولين عن تأخيرات شركات التوصيل.'},
    {t:'الدفع',            b:'الدفع عند الاستلام فقط (نقداً). لا نقبل أي دفع مسبق.'},
    {t:'الإرجاع والاستبدال',b:'يُقبل الإرجاع خلال 48 ساعة من الاستلام في حالة وجود عيب في التصنيع. المنتجات المخصصة غير قابلة للإرجاع.'},
    {t:'الملكية الفكرية',  b:'جميع تصاميم CHAKI⚡ محمية. لا يجوز إعادة إنتاجها أو بيعها دون إذن مسبق.'},
  ];
  return `
  <div class="cart-page fade-in">
    <div class="breadcrumb">
      <a onclick="navigateTo('home')">الرئيسية</a>
      <span class="sep">›</span>
      <span class="cur">الشروط والأحكام</span>
    </div>
    <div style="max-width:720px;margin:0 auto">
      <div style="text-align:center;margin-bottom:40px">
        <div style="font-size:48px;margin-bottom:12px">📋</div>
        <h1 style="font-size:28px;font-weight:900">
          الشروط <span style="color:var(--green)">والأحكام</span>
        </h1>
        <p style="color:var(--muted);font-size:13px;margin-top:8px">آخر تحديث: مايو 2026</p>
      </div>
      ${sections.map(s => `
        <div style="background:var(--card);border:1px solid var(--border2);
                    border-radius:16px;padding:24px;margin-bottom:14px">
          <h3 style="font-size:16px;font-weight:900;color:var(--green);
                     margin-bottom:10px;padding-right:12px;
                     border-right:3px solid var(--green)">
            ${s.t}
          </h3>
          <p style="color:var(--muted2);font-size:14px;line-height:1.9">${s.b}</p>
        </div>`).join('')}
    </div>
  </div>`;
}