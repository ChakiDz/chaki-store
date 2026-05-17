// ==================== PRODUCT CARD ====================
function renderProductCard(p, listMode = false, premiumHome = false) {
  const fav    = state.favs.includes(p.id);
  const imgSrc = getPrimaryImage(p);

  return `
  <div class="product-card ${premiumHome ? 'product-card-premium' : ''}"
       onclick="navigateTo('product', ${p.id})">

    <div class="product-img ${premiumHome ? 'product-img-premium' : ''}">
      ${p.badge ? `<span class="${p.badge==='جديد' ? 'badge-new' : 'badge-hot'}">${p.badge}</span>` : ''}
      <button class="fav-btn ${fav ? 'active' : ''}"
              onclick="toggleFav('${p.id}', event)">
        ${fav ? '❤️' : '🤍'}
      </button>
      ${imgSrc
        ? `<img src="${imgSrc}" alt="${p.title}" loading="lazy" 
                decoding="async" width="260" height="260">`
        : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:48px">📦</div>`
      }
    </div>

    <div class="product-info ${premiumHome ? 'product-info-premium' : ''}">
      ${premiumHome ? '' : `<span class="cat-tag">${p.category}</span>`}
      <h3>${p.title}</h3>
      ${premiumHome ? '' : `
        <div class="stars-row">
          <span style="color:var(--text);font-weight:700;font-size:11px;margin-left:4px">${p.rating}</span>
          ${stars(p.rating)}
          <span class="stars-count">(${p.reviews})</span>
        </div>`
      }
      <div class="price-row">
        <div>
          <span class="price-current">${fmt(p.price)} دج</span>
          ${p.oldPrice ? `<span class="price-old">${fmt(p.oldPrice)} دج</span>` : ''}
        </div>
        <button class="btn-add" onclick="addToCart('${p.id}', event)">🛒 أضف</button>
      </div>
    </div>

  </div>`;
}