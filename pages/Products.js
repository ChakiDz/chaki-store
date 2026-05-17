// ==================== PRODUCTS PAGE ====================
function getFilteredSorted() {
  let list = products.filter(p => {
    const catOk   = state.filterCat === 'الكل' || p.category === state.filterCat;
    const searchOk= !state.search || p.title.includes(state.search) || p.category.includes(state.search);
    const priceOk = p.price >= state.priceMin && p.price <= state.priceMax;
    const badgeOk = !state.filterBadge || p.badge === state.filterBadge;
    return catOk && searchOk && priceOk && badgeOk;
  });
  if (state.sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
  if (state.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (state.sort === 'rating')     list.sort((a, b) => b.rating - a.rating);
  return list;
}

function renderProductsPage() {
  const catDef = [{name:'الكل', icon:'🔮', count: products.length}, ...categories.map(c => ({
    name: c.name,
    icon: c.icon,
    count: products.filter(p => p.category === c.name).length
  }))];

  const filtered = getFilteredSorted();
  const isList   = state.viewMode === 'list';

  return `
  <div class="products-page fade-in">

    <div class="breadcrumb">
      <a onclick="navigateTo('home')">الرئيسية</a>
      <span class="sep">›</span>
      <span class="cur">المنتجات</span>
    </div>

    <!-- Overlay للموبايل -->
    <div class="sidebar-overlay ${state.mobileFiltersOpen ? 'active' : ''}"
         onclick="toggleMobileFilters(false)"></div>

    <!-- زر الفلتر في الموبايل -->
    <div class="mobile-filter-bar">
      <button class="mobile-filter-btn" onclick="toggleMobileFilters(true)">
        <span>🔍 تصفية وتصنيف</span>
        <span class="filter-count-badge">${filtered.length} منتج</span>
      </button>
    </div>

    <div class="products-page-layout">

      <!-- SIDEBAR -->
      <aside class="sidebar ${state.mobileFiltersOpen ? 'drawer-open' : ''}">

        <div class="sidebar-header-mobile">
          <h3>🔍 الفلاتر</h3>
          <button class="close-sidebar-btn" onclick="toggleMobileFilters(false)">✕</button>
        </div>

        <!-- الأقسام -->
        <div class="sidebar-block">
          <div class="sidebar-title">الأقسام</div>
          ${catDef.map(c => `
            <button class="cat-filter-btn ${state.filterCat === c.name ? 'active' : ''}"
                    onclick="state.filterCat='${c.name}'; render()">
              <span>${c.icon} ${c.name}</span>
              <span class="count">${c.count}</span>
            </button>`).join('')}
        </div>

        <!-- السعر -->
        <div class="sidebar-block">
          <div class="sidebar-title">نطاق السعر (دج)</div>
          <div class="price-range">
            <div class="price-range-inputs">
              <input class="price-input" type="number" placeholder="من"
                value="${state.priceMin || ''}"
                onchange="state.priceMin=Number(this.value)||0; render()">
              <span class="price-sep">—</span>
              <input class="price-input" type="number" placeholder="إلى"
                value="${state.priceMax === 10000 ? '' : state.priceMax}"
                onchange="state.priceMax=Number(this.value)||10000; render()">
            </div>
            <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
              ${[[0,1000],[1000,2000],[2000,5000],[5000,10000]].map(([mn, mx]) => `
                <button class="badge-filter-btn ${state.priceMin===mn && state.priceMax===mx ? 'active' : ''}"
                        onclick="state.priceMin=${mn}; state.priceMax=${mx}; render()">
                  ${fmt(mn)}–${fmt(mx)}
                </button>`).join('')}
            </div>
          </div>
        </div>

        <!-- الترتيب -->
        <div class="sidebar-block">
          <div class="sidebar-title">الترتيب</div>
          <select class="sort-select" onchange="state.sort=this.value; render()">
            <option value="default"    ${state.sort==='default'    ?'selected':''}>الافتراضي</option>
            <option value="price-asc"  ${state.sort==='price-asc'  ?'selected':''}>السعر: من الأقل</option>
            <option value="price-desc" ${state.sort==='price-desc' ?'selected':''}>السعر: من الأعلى</option>
            <option value="rating"     ${state.sort==='rating'     ?'selected':''}>الأعلى تقييماً</option>
          </select>
        </div>

        <!-- حالة المنتج -->
        <div class="sidebar-block">
          <div class="sidebar-title">حالة المنتج</div>
          <div>
            <button class="badge-filter-btn ${state.filterBadge==='جديد' ? 'active' : ''}"
                    onclick="state.filterBadge=state.filterBadge==='جديد'?null:'جديد'; render()">
              🆕 جديد
            </button>
            <button class="badge-filter-btn ${state.filterBadge==='الأكثر مبيعاً' ? 'active' : ''}"
                    onclick="state.filterBadge=state.filterBadge==='الأكثر مبيعاً'?null:'الأكثر مبيعاً'; render()">
              🔥 الأكثر مبيعاً
            </button>
          </div>
        </div>

        <!-- إعادة تعيين -->
        <button class="clear-filters-btn"
                onclick="state.filterCat='الكل'; state.search=''; state.sort='default';
                         state.priceMin=0; state.priceMax=10000; state.filterBadge=null; render()">
          🗑️ إعادة تعيين الفلاتر
        </button>

      </aside>

      <!-- MAIN AREA -->
      <div>
        <div class="prod-topbar">
          <div class="prod-count">
            عرض <strong>${filtered.length}</strong> من أصل
            <strong>${products.length}</strong> منتج
            ${state.filterCat !== 'الكل'
              ? ` — <span style="color:var(--green)">${state.filterCat}</span>`
              : ''}
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <div class="search-wrap" style="display:flex">
              <input type="text" placeholder="بحث سريع..." value="${state.search}"
                style="width:180px"
                oninput="state.search=this.value; render()">
            </div>
            <div class="view-toggle">
              <button class="view-btn ${!isList ? 'active' : ''}"
                      onclick="state.viewMode='grid'; render()" title="شبكة">⊞</button>
              <button class="view-btn ${isList ? 'active' : ''}"
                      onclick="state.viewMode='list'; render()" title="قائمة">≡</button>
            </div>
          </div>
        </div>

        ${filtered.length === 0
          ? `<div class="empty-products">
               <div class="eicon">😕</div>
               <h3>لا توجد منتجات مطابقة</h3>
               <p>جرب تغيير الفلاتر أو البحث بكلمة مختلفة</p>
               <button class="btn-primary"
                 onclick="state.filterCat='الكل'; state.search='';
                          state.priceMin=0; state.priceMax=10000; render()">
                 عرض جميع المنتجات
               </button>
             </div>`
          : isList
            ? `<div>${filtered.map(p => renderProductCard(p, true)).join('')}</div>`
            : `<div class="products-grid">${filtered.map(p => renderProductCard(p)).join('')}</div>`
        }
      </div>

    </div>
  </div>`;
}

// ==================== PRODUCT DETAIL PAGE ====================
function renderProductDetailPage() {
  const p = state.selectedProduct;
  if (!p) return `
    <div style="padding:80px;text-align:center">
      <p>المنتج غير موجود</p>
      <button class="btn-primary" onclick="navigateTo('products')">العودة للمنتجات</button>
    </div>`;

  const allImages = getProductImages(p);
  const waMsg     = `مرحبا، أريد طلب: ${p.title} بسعر ${fmt(p.price)} دج`;
  let related = products.filter(x => x.id !== p.id && x.category === p.category);
  if (related.length === 0) {
    // إذا لم تتوفر منتجات من نفس الفئة، اختر منتجات عشوائية من باقي المتجر
    related = [...products].filter(x => x.id !== p.id).sort(() => 0.5 - Math.random());
  }
  related = related.slice(0, 4);

  return `
  <div class="product-detail-page fade-in">

    <div class="breadcrumb">
      <a onclick="navigateTo('home')">الرئيسية</a>
      <span class="sep">›</span>
      <a onclick="navigateTo('products')">المنتجات</a>
      <span class="sep">›</span>
      <a onclick="navigateTo('products',{cat:'${p.category}'})">${p.category}</a>
      <span class="sep">›</span>
      <span class="cur">${p.title}</span>
    </div>

    <div class="prod-detail-grid">

      <!-- معرض الصور -->
      <div class="product-gallery">
        <div class="main-img-container">
          ${allImages.length > 0
            ? `<img id="expanded-img" src="${allImages[0]}" alt="${p.title}">`
            : `<div style="display:flex;align-items:center;justify-content:center;
                           height:100%;color:var(--muted);font-size:60px">📦</div>`
          }
        </div>
        ${allImages.length > 1 ? `
          <div class="thumb-strip">
            ${allImages.map((img, idx) => `
              <div class="thumb-item ${idx === 0 ? 'active' : ''}"
                   onclick="changeGalleryImage('${img}', this)">
                <img src="${img}" alt="صورة ${idx + 1}">
              </div>`).join('')}
          </div>` : ''}
      </div>

      <!-- معلومات المنتج -->
      <div class="prod-detail-info">
        <div style="display:flex;gap:8px;margin-bottom:12px">
          ${p.badge
            ? `<span style="background:${p.badge==='جديد'?'var(--green)':'var(--orange)'};
                color:${p.badge==='جديد'?'#000':'#fff'};
                padding:4px 12px;border-radius:20px;font-size:12px;font-weight:900">
                ${p.badge}</span>`
            : ''}
          <span class="cat-tag">${p.category}</span>
        </div>

        <h1>${p.title}</h1>
        <div class="price-big">${fmt(p.price)} دج</div>
        ${p.oldPrice
          ? `<div class="price-old-big">${fmt(p.oldPrice)} دج —
               خصم ${Math.round((1 - p.price / p.oldPrice) * 100)}%</div>`
          : ''}
        <div style="color:#FFD700;margin-bottom:20px;font-size:15px">
          <strong style="color:var(--text);margin-left:5px">${p.rating}</strong>
          ${stars(p.rating)}
          <span style="color:var(--muted);font-size:13px">(${p.reviews} تقييم)</span>
        </div>
        <p class="prod-desc">${p.desc || 'منتج مطبوع ثلاثي الأبعاد بجودة عالية وتصميم عصري.'}</p>

        <!-- الكمية -->
        <div class="qty-row">
          <span style="font-size:13px;font-weight:700;color:var(--muted)">الكمية:</span>
          <div class="qty-ctrl">
            <button onclick="this.nextElementSibling.textContent=
              Math.max(1,+this.nextElementSibling.textContent-1)">−</button>
            <span>1</span>
            <button onclick="this.previousElementSibling.textContent=
              +this.previousElementSibling.textContent+1">+</button>
          </div>
        </div>

        <!-- الأزرار -->
        <div class="detail-btns">
          <button class="btn-primary" style="flex:1;font-size:15px;padding:15px"
                  onclick="handleAddToCartWithQty('${p.id}', event)">
            🛒 أضف إلى السلة
          </button>
          <button class="btn-whatsapp"
                  onclick="openWA('${waMsg.replace(/'/g, "\\'")}')">
            💬 اطلب عبر واتساب
          </button>
        </div>
        <div class="delivery-badge">
          ✓ دفع عند الاستلام — توصيل 2-5 أيام لجميع ولايات الجزائر
        </div>
      </div>
    </div>

    <!-- منتجات مشابهة -->
    ${related.length > 0 ? `
      <div style="margin-top:60px">
        <h2 style="font-size:24px;font-weight:900;margin-bottom:24px">
          منتجات <span style="color:var(--green)">مشابهة</span>
        </h2>
        <div class="products-grid">
          ${related.map(p => renderProductCard(p)).join('')}
        </div>
      </div>` : ''}

  </div>`;
}