// ==================== 404 ERROR PAGE ====================
function render404Page() {
  // اختيار 4 منتجات عشوائية لجذب الزبون من المصفوفة العالمية
  const suggested = products && products.length > 0 ? [...products].sort(() => 0.5 - Math.random()).slice(0, 4) : [];

  return `
  <div class="cart-page fade-in error-container">
    <div class="icon">🔍</div>
    <h1>404</h1>
    <h2>عذراً، الصفحة غير موجودة!</h2>
    <p class="desc">
      يبدو أن الرابط الذي اتبعته غير صحيح أو أن الصفحة قد تم نقلها أو حذفها.<br>
      يمكنك العودة للصفحة الرئيسية وتصفح أحدث تصاميمنا المطبوعة بتقنية الـ 3D.
    </p>
    <div class="error-actions">
      <button class="btn-primary" onclick="navigateTo('home')">🏠 العودة للرئيسية</button>
      <button class="btn-outline" onclick="navigateTo('products', {cat:'الكل'})">🛍️ تصفح المنتجات</button>
    </div>

    ${suggested.length > 0 ? `
      <div class="error-suggestions">
        <h3>قد يعجبك <span class="green">أيضاً</span></h3>
        <div class="products-grid">
          ${suggested.map(p => renderProductCard(p)).join('')}
        </div>
      </div>` 
    : ''}

    <div style="margin-top:60px; color:var(--muted); font-size:13px">
      CHAKI⚡ — ابتكار بلا حدود
    </div>
  </div>`;
}