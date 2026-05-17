// ==================== FREE / GIVEAWAY PAGE ====================
function renderFreePage() {
  const title    = appSettings?.giveaway_title    || 'مسابقة CHAKI⚡';
  const gift     = appSettings?.giveaway_gift     || 'هدية مميزة';
  const status   = appSettings?.giveaway_status   || 'active';
  const winner   = appSettings?.giveaway_winner   || '';
  const fbLink   = appSettings?.giveaway_fb_url   || '#';
  const igLink   = appSettings?.giveaway_ig_url   || '#';
  const ttLink   = appSettings?.giveaway_tt_url   || '#';
  const giftImg  = appSettings?.giveaway_image     || '';
  const countdown = getCountdownTime();
  const userEntered = state.giveawayEnteredUser;

  return `
  <div class="free-page-container fade-in">

    <!-- العنوان -->
    <div class="giveaway-header">
      <h1 class="giveaway-title">${title}</h1>
      <p class="giveaway-desc">نحن نحب تقدير عملائنا! شارك الآن واربح منتجات 3D فريدة وحصرية.</p>
    </div>

    <!-- بطاقة المسابقة -->
    <div class="contest-card">
      <div class="contest-badge">🔥 نشط الآن</div>
      <h2 class="contest-title">الجائزة: ${gift}</h2>

      <div class="contest-image">
        ${giftImg ? `<img src="${giftImg}" alt="${gift}">` : `<span style="font-size:80px;">🎁</span>`}
      </div>

      ${winner ? `
        <div class="contest-winner-box"><h3>🥳 الفائز المحظوظ: ${escapeHTML(winner)}</h3></div>
      ` : `<p class="contest-desc">شارك الآن لتكون أحد الفائزين بـ <b class="green">${gift}</b> مطبوعة بتقنية الـ 3D خصيصاً لك!</p>`}

      <!-- العد التنازلي -->
      <div class="countdown-wrap">
        <div class="countdown-title">⏰ الوقت المتبقي حتى السحب</div>
        <div class="countdown-grid">
          ${[
            {id:'cd-days',    val:countdown.days,    label:'يوم'},
            {id:'cd-hours',   val:countdown.hours,   label:'ساعة'},
            {id:'cd-minutes', val:countdown.minutes, label:'دقيقة'},
            {id:'cd-seconds', val:countdown.seconds, label:'ثانية'},
          ].map(item => `
            <div class="countdown-item">
              <div id="${item.id}" class="val">${String(item.val).padStart(2, '0')}</div>
              <div class="lbl">${item.label}</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- فورم التسجيل أو رسالة النجاح -->
      ${userEntered ? `
        <div class="signup-success">
          <div class="icon">✅</div>
          <div class="green" style="font-size:16px; font-weight:900; margin-bottom:6px;">شكراً لمشاركتك!</div>
          <div style="font-size:13px;color:var(--muted2);">تم تسجيل بياناتك بنجاح. منتظر السحب الحي في الوقت المحدد 🎯</div>
          <div style="font-size:12px;color:var(--muted);margin-top:8px;">اسم المشارك: <strong>${escapeHTML(userEntered.name)}</strong></div>
        </div>
      ` : `
        <div class="contest-signup">
          <h3>📝 سجل بياناتك للمشاركة</h3>
          <div class="signup-inputs">
            <input id="giveaway-name" type="text" placeholder="الاسم الكامل">
            <input id="giveaway-phone" type="tel" placeholder="رقم الهاتف (06..)">
          </div>
          <button class="btn-primary w-full" id="giveaway-btn" onclick="handleGiveawaySignup()">
            🎯 سجل الآن
          </button>
        </div>
      `}

      <!-- روابط السوشيال -->
      <div class="social-section">
        <h3>👉 تابع المسابقة على حساباتنا</h3>
        <div class="social-links-col">
          <a href="${igLink}" target="_blank" class="social-link-btn social-link-ig">تابعنا على إنستغرام 📸</a>
          <a href="${ttLink}" target="_blank" class="social-link-btn social-link-tt">🎵 تابعنا على تيك توك</a>
          <a href="${fbLink}" target="_blank" class="social-link-btn social-link-fb">📘 تابعنا على فيسبوك</a>
        </div>
      </div>
    </div>

    <!-- خطوات المشاركة -->
    <div class="steps-container">
      ${[
        {n:'01', title:'تابعنا',       desc:'تابع حساباتنا على فيسبوك، إنستغرام وتيك توك.'},
        {n:'02', title:'تفاعل',        desc:'لايك وتاغ لصديق في منشور المسابقة.'},
        {n:'03', title:'انتظر السحب', desc:'يتم السحب لايف في الوقت المحدد.'},
      ].map(s => `
        <div class="step-item">
          <div class="num">${s.n}</div>
          <h3>${s.title}</h3>
          <p>${s.desc}</p>
        </div>`).join('')}
    </div>

    <!-- الشروط والأحكام -->
    <div class="free-terms">
      <h3>⚖️ الشروط والأحكام</h3>
      <ul>
        <li>• المسابقات مفتوحة لجميع المقيمين في الجزائر فقط.</li>
        <li>• يجب أن يكون الحساب المشارك حقيقياً.</li>
        <li>• يتم اختيار الفائزين بشكل عشوائي تماماً.</li>
        <li>• الجوائز لا تُستبدل بمبالغ نقدية.</li>
        <li>• جميع قرارات الإدارة نهائية وغير قابلة للطعن.</li>
      </ul>
    </div>

  </div>`;
}