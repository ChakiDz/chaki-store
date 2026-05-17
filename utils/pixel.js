// ==================== META PIXEL ====================

function initPixel() {
  const pixelId = appSettings?.pixel_id;
  const enabled = appSettings?.pixel_enabled === 'true';

  if (!enabled || !pixelId) {
    console.log('ℹ️ Meta Pixel: معطل أو غير مضبوط');
    return;
  }

  // حقن كود الـ Pixel
  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', pixelId);
  fbq('track', 'PageView');
  console.log('✅ Meta Pixel يعمل — ID:', pixelId);

  // إضافة noscript تلقائياً
  if (document.getElementById('fb-noscript')) return;
  const noscript = document.createElement('noscript');
  noscript.id = 'fb-noscript';
  noscript.innerHTML = `<img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
  document.head.appendChild(noscript);
}

// ==================== TIKTOK PIXEL ====================

function initTikTokPixel() {
  const pixelId = appSettings?.tiktok_pixel_id;
  const enabled = appSettings?.tiktok_enabled === 'true';

  if (!enabled || !pixelId) return;

  !function(w,d,t){
    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
    ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
    ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
    for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
    ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
    ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
    ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");
    o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
    var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
    ttq.load(pixelId);ttq.page();
  }(window,document,'ttq');

  console.log('✅ TikTok Pixel يعمل — ID:', pixelId);
}

// ==================== EVENTS ====================

function pixelViewContent(product) {
  if (typeof fbq !== 'undefined' && appSettings?.pixel_enabled === 'true') {
    fbq('track', 'ViewContent', {
      content_ids:  [String(product.id)],
      content_name: product.title,
      content_type: 'product',
      value:        product.price,
      currency:     'DZD',
    });
  }
  if (typeof ttq !== 'undefined' && appSettings?.tiktok_enabled === 'true') {
    ttq.track('ViewContent', {
      content_id:   String(product.id),
      content_name: product.title,
      value:        product.price,
      currency:     'DZD',
    });
  }
}

function pixelAddToCart(product) {
  if (typeof fbq !== 'undefined' && appSettings?.pixel_enabled === 'true') {
    fbq('track', 'AddToCart', {
      content_ids:  [String(product.id)],
      content_name: product.title,
      content_type: 'product',
      value:        product.price,
      currency:     'DZD',
    });
  }
  if (typeof ttq !== 'undefined' && appSettings?.tiktok_enabled === 'true') {
    ttq.track('AddToCart', {
      content_id:   String(product.id),
      content_name: product.title,
      value:        product.price,
      currency:     'DZD',
    });
  }
}

function pixelInitiateCheckout() {
  if (typeof fbq !== 'undefined' && appSettings?.pixel_enabled === 'true') {
    fbq('track', 'InitiateCheckout', {
      content_ids: state.cart.map(i => String(i.id)),
      num_items:   cartCount(),
      value:       getTotal(),
      currency:    'DZD',
    });
  }
  if (typeof ttq !== 'undefined' && appSettings?.tiktok_enabled === 'true') {
    ttq.track('InitiateCheckout', {
      value:    getTotal(),
      currency: 'DZD',
    });
  }
}

function pixelPurchase(order) {
  if (typeof fbq !== 'undefined' && appSettings?.pixel_enabled === 'true') {
    fbq('track', 'Purchase', {
      content_ids:  order.items.map(i => String(i.id)),
      content_type: 'product',
      num_items:    order.items.reduce((s, i) => s + i.qty, 0),
      value:        order.total,
      currency:     'DZD',
      order_id:     order.orderId,
    });
  }
  if (typeof ttq !== 'undefined' && appSettings?.tiktok_enabled === 'true') {
    ttq.track('CompletePayment', {
      value:    order.total,
      currency: 'DZD',
    });
  }
}