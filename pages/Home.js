// ==================== HOME PAGE ====================
function renderHero() {
  const featured = products.slice(0, 3);
  return `
  <section class="hero" id="hero">
    <div class="hero-bg"></div>
    <div class="hero-grid-lines"></div>

    <div class="hero-left">
      <div class="hero-badge">
        <span class="dot"></span>
        متجر الطباعة ثلاثية الأبعاد رقم 1 في الجزائر
      </div>
      <h1 class="hero-h1">
        اصنع عالمك<br>
        <span class="line2">بأسلوب CHAKI</span><br>
        <span class="line3">منتجات فريدة • جودة استثنائية</span>
      </h1>
      <p class="hero-desc">
        نحوّل أفكارك إلى منتجات مطبوعة ثلاثية الأبعاد بدقة عالية وتصميم عصري.
        من ديكور المنزل إلى إكسسوارات الألعاب — كل ما تحتاجه موجود هنا.
      </p>
      <div class="hero-btns">
        <button class="btn-primary"
          onclick="document.getElementById('products-section').scrollIntoView({behavior:'smooth'})">
          🛍️ تسوق الآن
        </button>
        <button class="btn-outline" onclick="openWA()">
          ✏️ طلب مخصص
        </button>
      </div>
      <div class="hero-trust">
        <div class="trust-item">⭐ <strong>4.6</strong> / 5 تقييم</div>
        <div class="trust-sep"></div>
        <div class="trust-item">📦 <strong>500+</strong> طلب مكتمل</div>
        <div class="trust-sep"></div>
        <div class="trust-item">🇩🇿 <strong>58</strong> ولاية</div>
      </div>
    </div>

    <div class="hero-right">
      <div class="hero-products-showcase">
        ${featured.map((p, index) => `
          <div class="showcase-card ${index === 0 ? 'featured' : ''}"
               onclick="navigateTo('product', ${p.id})">
            <div>
              ${p.badge ? `<span class="showcase-badge">${p.badge}</span>` : ''}
              ${p.image_url
                ? `<img src="${p.image_url}" alt="${p.title}"
                     style="width:100%;height:180px;border-radius:18px;object-fit:cover;margin-bottom:12px" 
                     loading="eager" decoding="async" fetchpriority="high">`
                : `<div style="width:100%;height:180px;border-radius:18px;background:rgba(255,255,255,0.05);
                     display:flex;align-items:center;justify-content:center;
                     margin-bottom:12px;font-size:46px;color:var(--muted)">📦</div>`
              }
              <div class="showcase-name">${p.title}</div>
              <div class="showcase-price">${fmt(p.price)} دج</div>
            </div>
            <button class="btn-add" onclick="addToCart(${p.id}, event)">اكتشف المنتج⚡</button>
          </div>`).join('')}
      </div>
    </div>
  </section>`;
}

function renderBenefits() {
  const items = [
    {icon:'💵', title:'دفع عند الاستلام',  desc:'ادفع فقط عند استلام طلبك'},
    {icon:'🚚', title:'توصيل سريع',        desc:'2-5 أيام لجميع الولايات'},
    {icon:'✅', title:'جودة مضمونة',       desc:'100% منتجات أصلية وعالية الجودة'},
    {icon:'💬', title:'دعم 24/7',          desc:'فريقنا دائماً في خدمتك'},
  ];
  return `
  <div class="benefits-bar reveal">
    ${items.map(i => `
      <div class="benefit-item">
        <div class="benefit-icon">${i.icon}</div>
        <div class="benefit-info">
          <h4>${i.title}</h4>
          <p>${i.desc}</p>
        </div>
      </div>`).join('')}
  </div>`;
}

function renderProductsSection() {
  const featured = products.slice(0, 5);
  return `
  <section class="section reveal" id="products-section">
    <div class="section-header">
      <div class="section-tag">🔥 منتجات مميزة</div>
      <h2>اكتشف أفضل منتجات <span class="hl">CHAKI⚡</span></h2>
      <div class="section-divider"></div>
      <p>منتجات مطبوعة ثلاثية الأبعاد بتصميم عصري وجودة عالية</p>
    </div>
    <div class="products-grid">
      ${featured.map(p => renderProductCard(p, false, true)).join('')}
    </div>
    <div class="show-more-wrap">
      <button class="btn-primary" style="padding:15px 38px;font-size:15px"
              onclick="navigateTo('products')">
        عرض جميع المنتجات ⚡
      </button>
    </div>
  </section>`;
}

function renderStats() {
  return `
  <div class="section" style="padding-top:0">
    <div class="stats-section reveal">
      <div class="stat-box">
        <div class="stat-num">500<span>+</span></div>
        <div class="stat-label">طلب مكتمل بنجاح</div>
      </div>
      <div class="stat-box">
        <div class="stat-num">48</div>
        <div class="stat-label">ولاية نغطيها في الجزائر</div>
      </div>
      <div class="stat-box">
        <div class="stat-num">4.9<span>★</span></div>
        <div class="stat-label">متوسط تقييم العملاء</div>
      </div>
      <div class="stat-box">
        <div class="stat-num">100<span>%</span></div>
        <div class="stat-label">دفع عند الاستلام</div>
      </div>
    </div>
  </div>`;
}

function renderCategories() {
  return `
  <section class="section reveal" id="categories-section" style="padding-top:0">
    <div class="section-header">
      <div class="section-tag">📂 الأقسام</div>
      <h2>تسوق حسب <span class="hl">التصنيف</span></h2>
      <div class="section-divider"></div>
    </div>
    <div class="cats-grid">
      ${categories.map(c => {
        const realCount = products.filter(p => p.category === c.name).length;
        const displayCount = c.name === 'قريباً' ? 'قريباً' : (c.name === 'مخصصات' ? 'طلب مخصص' : `${realCount} منتج`);
        return `
        <div class="cat-card"
             onclick="navigateTo('products', {cat:'${c.name === 'هدايا' ? 'الكل' : c.name}'})">
          <span class="cat-icon">${c.icon}</span>
          <div class="cat-name">${c.name}</div>
          <div class="cat-count">${displayCount}</div>
        </div>`}).join('')}
    </div>
  </section>`;
}

function renderCustomOrders() {
  const steps = [
    {n:'1', title:'أرسل فكرتك',    desc:'وصف أو صورة أو ملف STL/3D'},
    {n:'2', title:'نراجع ونقيّم',  desc:'سعر عادل ووقت تنفيذ دقيق'},
    {n:'3', title:'نبدأ الطباعة',  desc:'بأعلى معايير الجودة والدقة'},
    {n:'4', title:'التوصيل والدفع',desc:'تدفع فقط عند استلام منتجك'},
  ];
  const features = [
    'تصميم حسب مواصفاتك الدقيقة',
    'مواد متعددة وألوان لا محدودة',
    'توصيل لجميع ولايات الجزائر',
    'أسعار تنافسية وشفافية كاملة',
    'دعم فني من البداية حتى التسليم',
  ];
  return `
  <section class="section reveal" id="custom-section" style="padding-top:0">
    <div class="custom-section">
      <div class="custom-left">
        <div class="section-tag" style="margin-bottom:16px">✏️ طلبات مخصصة</div>
        <h2>أفكارك تستحق<br>أن تُصبح <span class="hl">واقعاً</span></h2>
        <p>لديك فكرة منتج؟ أرسل لنا الوصف أو الصورة وسنحوله إلى منتج مطبوع ثلاثي الأبعاد.</p>
        <div class="custom-features">
          ${features.map(f => `
            <div class="custom-feat">
              <div class="feat-check">✓</div>
              <span>${f}</span>
            </div>`).join('')}
        </div>
        <button class="btn-primary" style="font-size:15px;padding:15px 32px"
                onclick="openWA('مرحبا، أريد طلب منتج مخصص من CHAKI⚡')">
          💬 تواصل معنا على واتساب
        </button>
      </div>
      <div class="custom-right">
        ${steps.map(s => `
          <div class="step-card">
            <div class="step-num">${s.n}</div>
            <div class="step-body">
              <h4>${s.title}</h4>
              <p>${s.desc}</p>
            </div>
          </div>`).join('')}
      </div>
    </div>
  </section>`;
}

function renderTestimonials() {
  const testis = [
    {name:'أحمد بن علي',  city:'الجزائر العاصمة', rating:5, color:'var(--green)', initials:'أح',
     text:'جودة رائعة وتوصيل سريع! التمثال وصل بحالة ممتازة وفاق توقعاتي بكثير.'},
    {name:'سمية خالدي',   city:'وهران',            rating:5, color:'#FF6B00',      initials:'سم',
     text:'طلبت حاملاً مخصصاً لمكتبي والنتيجة كانت مذهلة. الدقة في التفاصيل فاقت التوقعات.'},
    {name:'يوسف مزياني',  city:'قسنطينة',          rating:4, color:'#1565C0',      initials:'يو',
     text:'منتجات مميزة وفريدة لا تجدها في أي مكان. الدفع عند الاستلام أعطاني راحة بال.'},
  ];
  return `
  <section class="section reveal" style="padding-top:0">
    <div class="section-header">
      <div class="section-tag">⭐ آراء العملاء</div>
      <h2>ماذا يقول <span class="hl">عملاؤنا</span></h2>
      <div class="section-divider"></div>
    </div>
    <div class="testi-grid">
      ${testis.map(t => `
        <div class="testi-card">
          <div class="testi-top">
            <div class="testi-avatar"
                 style="background:${t.color};color:${t.color === 'var(--green)' ? '#000' : '#fff'}">
              ${t.initials}
            </div>
            <div>
              <div class="testi-name">${t.name}</div>
              <div class="testi-loc">📍 ${t.city}</div>
            </div>
          </div>
          <div class="testi-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
          <div class="testi-text">${t.text}</div>
        </div>`).join('')}
    </div>
  </section>`;
}

function renderNewsletter() {
  return `
  <div class="section" style="padding-top:0">
    <div class="newsletter-section reveal">
      <div class="section-tag">📱 تابعنا</div>
      <h2>ابق على اطلاع بكل <span style="color:var(--green)">جديد</span></h2>
      <p>تابعنا على حساباتنا لتكون أول من يعلم بالعروض الحصرية والمنتجات الجديدة</p>
      <div class="social-media-links">
        <a href="${appSettings?.giveaway_fb_url || '#'}" target="_blank" 
           style="background:#1877F2; color:#fff; border:none;">
          📘 فيسبوك
        </a>
        <a href="${appSettings?.giveaway_ig_url || '#'}" target="_blank"
           style="background:linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); color:#fff; border:none;">
          📸 إنستغرام
        </a>
        <a href="${appSettings?.giveaway_tt_url || '#'}" target="_blank"
           style="background:#000; color:#fff; border:1px solid #fe2c55;">
          🎵 تيك توك
        </a>
      </div>
    </div>
  </div>`;
}