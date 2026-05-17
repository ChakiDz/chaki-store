// ==================== NAVBAR ====================
function renderNavbar() {
  const cc = cartCount();
  const storeName = appSettings?.store_name || 'CHAKI⚡';
  
  // تقسيم الاسم لإعطاء البرق لوناً مختلفاً إذا كان موجوداً
  const displayTitle = storeName.includes('⚡') 
    ? storeName.replace('⚡', '<span class="green">I⚡</span>').replace('I<span class="green">I⚡</span>', '<span class="green">I⚡</span>')
    : storeName;

  return `
  <nav class="navbar">
    <div class="nav-container">

      <div class="nav-right-menu">
        <button class="hamburger" id="hamburger-btn" onclick="openMobileMenu()">
          <span></span><span></span><span></span>
        </button>
        <a class="nav-link ${state.page==='home'?'active':''}"
           onclick="navigateTo('home')">الرئيسية</a>
        <a class="nav-link ${state.page==='products'||state.page==='product'?'active':''}"
           onclick="navigateTo('products')">المنتجات</a>
        <a class="nav-link ${state.page==='free'?'active':''}"
           onclick="navigateTo('free')">🎁 مجاناً</a>
        <a class="nav-link"
           onclick="handleCustomOrderLink()">طلب مخصص</a>
        <a class="nav-link" onclick="openWA()">تواصل معنا</a>
      </div>

      <div class="nav-left-actions">
        <div class="search-wrap">
          <input type="text" placeholder="ابحث عن منتج..."
            value="${state.search}" oninput="handleNavbarSearch(this)">
        </div>
        <button class="cart-btn" onclick="navigateTo('cart')">
          🛒 السلة
          ${cc > 0 ? `<span class="cart-badge">${cc}</span>` : ''}
        </button>
        <div class="logo" onclick="navigateTo('home')">
          <span class="logo-text">${displayTitle}</span>
        </div>
      </div>

    </div>
  </nav>`;
}

// ==================== ANNOUNCE BAR ====================
function renderAnnounce() {
  return `
  <div class="announce">
    <div class="announce-inner">
      <div class="announce-item">🚀 توصيل لجميع ولايات الجزائر</div>
      <div class="announce-item">•</div>
      <div class="announce-item">💵 الدفع عند الاستلام فقط</div>
      <div class="announce-item">•</div>
      <div class="announce-item">✅ جودة مضمونة 100%</div>
      <div class="announce-item">•</div>
      <div class="announce-item">⚡ طلبات مخصصة بسعر خاص</div>
    </div>
  </div>`;
}