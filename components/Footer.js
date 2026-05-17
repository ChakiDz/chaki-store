// ==================== FOOTER ====================
function renderFooter() {
  const storeName = appSettings?.store_name || 'CHAKI⚡';
  const waNumber  = appSettings?.whatsapp_number || '213658307105';
  const displayTitle = storeName.includes('⚡') 
    ? storeName.replace('⚡', '<span class="green">I⚡</span>').replace('I<span class="green">I⚡</span>', '<span class="green">I⚡</span>')
    : storeName;

  return `
  <footer>
    <div class="footer-grid">

      <div class="footer-brand">
        <div class="brand-logo">
          <span class="logo-text" style="font-size:24px;font-weight:900">${displayTitle}</span>
        </div>
        <p>متجر ${storeName} للمنتجات المطبوعة ثلاثية الأبعاد. نقدم منتجات فريدة بجودة عالية وتوصيل لجميع ولايات الجزائر.</p>
        <div class="socials">
          <a class="social-btn" href="https://www.facebook.com/profile.php?id=61588036349245" target="_blank">📘</a>
          <a class="social-btn" href="https://www.instagram.com/chakishopdz" target="_blank">📸</a>
          <a class="social-btn" href="https://www.tiktok.com/@chaki.dz" target="_blank">🎵</a>
          <a class="social-btn" href="https://wa.me/${waNumber}" target="_blank">💬</a>
        </div>
      </div>

      <div class="footer-col">
        <h4>المتجر</h4>
        <a href="#" onclick="navigateTo('home')">الرئيسية</a>
        <a href="#" onclick="navigateTo('products')">المنتجات</a>
        <a href="#" onclick="navigateTo('free')">🎁 مجاناً</a>
        <a href="#" onclick="handleCustomOrderLink()">طلب مخصص</a>
      </div>

      <div class="footer-col">
        <h4>مساعدة</h4>
        <a href="#" onclick="navigateTo('contact')">تواصل معنا</a>
        <a href="#" onclick="navigateTo('track')">تتبع طلبك</a>
        <a href="#" onclick="navigateTo('faq')">الأسئلة الشائعة</a>
        <a href="#" onclick="navigateTo('privacy')">سياسة الخصوصية</a>
        <a href="#" onclick="navigateTo('terms')">الشروط والأحكام</a>
      </div>

      <div class="footer-col">
        <h4>تواصل معنا</h4>
        <a onclick="openWA()" style="cursor:pointer">📞 ${formatPhone(waNumber)}</a>
        <a href="#">📱 @ChakiDz</a>
        <a href="#">📍 عنابة، الجزائر</a>
        <a href="#">⏰ يومياً 9:00 – 21:00</a>
      </div>

    </div>
    <div class="footer-bottom">
      <p>© 2026 ${storeName} — جميع الحقوق محفوظة</p>
      <p style="color:var(--green)">صُنع بـ ❤️ في الجزائر 🇩🇿</p>
      <span onclick="navigateTo('admin')"
        style="color:var(--border2);font-size:11px;cursor:pointer"
        onmouseover="this.style.color='var(--muted)'"
        onmouseout="this.style.color='var(--border2)'">⚙</span>
    </div>
  </footer>`;
}