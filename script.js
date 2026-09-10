(() => {
  'use strict';

  /* =========================================================
     CONTENIDO DEL PORTAFOLIO
     Para agregar una nueva categoría, copia un objeto del
     arreglo "categories" y ajústalo. Para agregar un video,
     copia un objeto dentro de "videos".
     - embed: URL de YouTube/Vimeo (déjalo vacío "" si aún no hay video)
     - thumbnail: URL de una imagen de portada (opcional). Para YouTube puedes
       dejarlo vacío o pegar el mismo link que en "embed": la miniatura oficial
       se genera sola.
     - orientation: "portrait" (Reels/Shorts) o "landscape" (narrativos)
     - tags: arreglo de etiquetas del video (puedes poner una o varias),
       por ejemplo: tags: ['Publicidad', 'Motion Graphics']
     - highlight: opcional. Texto corto para resaltar un dato de la pieza
       (por ejemplo, vistas por día). Déjalo fuera del objeto si no aplica.
     ========================================================= */
  const categories = [
    {
      id: 'Reels',
      title: 'Videos cortos (Reels/Shorts)',
      description: 'Producciones rápidas y entretenidas, pensadas para captar la atención en segundos y generar interacción en redes sociales.',
      videos: [
        { title: '¿Es rentable una gasolinera en Madrid?', tags: ['Finanzas'], orientation: 'portrait', embed: 'https://youtube.com/shorts/R3L4cnzVVWE', thumbnail: 'https://youtube.com/shorts/R3L4cnzVVWE' },
        { title: 'Arranca con tu emprendimiento', tags: ['Emprendimiento'], orientation: 'portrait', embed: 'https://youtube.com/shorts/IDysYdCRWuU?feature=share', thumbnail: 'https://youtube.com/shorts/IDysYdCRWuU?feature=share' },
        { title: 'El mejor lavadero de motos', tags: ['Publicidad'], orientation: 'portrait', embed: 'https://youtube.com/shorts/6aBTwmZmMes', thumbnail: 'https://youtube.com/shorts/6aBTwmZmMes' }
      ]
    },
    {
      id: 'dinamicos',
      title: 'Videos dinámicos',
      description: 'Ediciones ágiles con ritmo acelerado, cortes rápidos y transiciones dinámicas, pensadas para captar la atención en segundos en redes sociales y contenido publicitario.',
      videos: [
        { title: 'Así edito mis videos', tags: ['Publicidad'], orientation: 'landscape', embed: 'https://youtu.be/gMqMnTWsiio?si=JRTznDsGsRYpDGVN', thumbnail: 'https://youtu.be/gMqMnTWsiio?si=JRTznDsGsRYpDGVN' }
      ]
    },
    {
      id: 'narrativos',
      title: 'Videos narrativos',
      description: 'Producciones con ritmo narrativo, pensadas para mantener la atención del espectador y transmitir mensajes claros en formatos más largos.',
      videos: [
        { title: 'Introspección de un rodaje', tags: ['Mini documental', 'Ficción', 'Cine'], orientation: 'landscape', embed: 'https://youtu.be/HvZB4duQxyM?si=-sdYFZnEhtfPqyg2', thumbnail: 'https://youtu.be/HvZB4duQxyM?si=-sdYFZnEhtfPqyg2' },
        { title: 'Carnotaurus: El Último Gran Depredador de Sudamérica', tags: ['Mini documental', 'Faceless'], orientation: 'landscape', embed: 'https://youtu.be/jXqpq4qKemk?si=0qUZVyJCh6bg7U-w', thumbnail: 'https://youtu.be/jXqpq4qKemk?si=0qUZVyJCh6bg7U-w', highlight: '+100 mil vistas/día en sus primeros días' }
      ]
    },
    {
      id: 'crecimiento',
      title: 'Videos de crecimiento personal',
      description: 'Producciones con ritmo entretenido pero serio, pensadas en comunicar contenido de alto valor y al mismo tiempo manteniendo la retención',
      videos: [
        { title: 'La dieta más fácil del mundo para eliminar grasa visceral', tags: ['Salud', 'Alimentación', 'Emprendimiento', 'Producido con ayuda de IA'], orientation: 'landscape', embed: 'https://youtu.be/SlgukfstmI0', thumbnail: 'https://youtu.be/SlgukfstmI0' }
      ]
    }
    // Agrega aquí nuevas categorías siguiendo el mismo formato.
  ];

  /* Oficios del ticker (sustituye a las píldoras de skills) */
  const oficios = [
    'Edición de video', 'DaVinci Resolve', 'Motion graphics', 'Corrección de sonido',
    'Corrección de color', 'Storytelling', 'Reels', 'Documentales', 'IA'
  ];

  /* ---------- Estado de filtros ---------- */
  const filterState = { category: 'all', tag: 'all' };

  function getTagsForCategory(categoryId) {
    const relevant = categoryId === 'all' ? categories : categories.filter(c => c.id === categoryId);
    const tagSet = new Set();
    relevant.forEach(c => c.videos.forEach(v => (v.tags || []).forEach(t => tagSet.add(t))));
    return Array.from(tagSet);
  }

  const playIconSVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z"/></svg>';

  /* ---------- Utilidades ---------- */
  function extractYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  }

  /* `playsinline=1` no es decorativo: sin él, iOS se lleva el video a pantalla
     completa, que es justo lo contrario de reproducirlo dentro de la tarjeta. */
  function toEmbedUrl(url) {
    if (!url) return '';
    const ytId = extractYouTubeId(url);
    if (ytId) return 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0&playsinline=1';
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return 'https://player.vimeo.com/video/' + vimeo[1] + '?autoplay=1&playsinline=1';
    return url;
  }

  /* La miniatura se elige por ORIENTACIÓN, no por defecto.
     Medido contra la API de YouTube:
       oardefault.jpg    -> 1080x1920 (9:16 real) en Shorts · 120x90 inservible en apaisados
       maxresdefault.jpg -> 1280x720  (16:9 real) siempre
       hqdefault.jpg     -> 480x360   (4:3) CON BARRAS NEGRAS incrustadas
     Usar hqdefault para todo era la causa de que las piezas se vieran
     cuadradas y con marco negro. */
  function resolveThumbnail(video) {
    const ytId = extractYouTubeId(video.thumbnail) || extractYouTubeId(video.embed);
    if (!ytId) return video.thumbnail || '';
    const ep = (video.orientation === 'portrait') ? 'oardefault' : 'maxresdefault';
    return 'https://img.youtube.com/vi/' + ytId + '/' + ep + '.jpg';
  }

  /* Cuando el endpoint elegido no existe para ese video, la imagen se cae a
     `data-fallback`. Lo usan las piezas del mazo y la portada de la presentación,
     así que vive suelto en vez de dentro de renderDeck(). */
  function wireThumbFallback(imgs) {
    imgs.forEach(img => {
      img.addEventListener('error', function onFail() {
        img.removeEventListener('error', onFail);
        const fb = img.dataset.fallback;
        if (fb && img.src !== fb) img.src = fb;
      });
    });
  }

  /* Si el endpoint bueno no existe para ese video, se cae a hqdefault. */
  function fallbackThumb(video) {
    const ytId = extractYouTubeId(video.thumbnail) || extractYouTubeId(video.embed);
    return ytId ? 'https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg' : '';
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  /* Aplana las categorías en una sola lista: el diseño usa UN carrusel,
     no uno por categoría. Con 6 piezas y tres categorías de una sola,
     cuatro carruseles serían cuatro carruseles vacíos. */
  const pieces = [];
  categories.forEach(cat => {
    cat.videos.forEach(v => pieces.push({ ...v, category: cat.id }));
  });

  /* ---------- Render ---------- */
  const deckEl = document.getElementById('workDeck');
  const filtersEl = document.getElementById('portfolioFilters');
  const tagFiltersEl = document.getElementById('portfolioTagFilters');
  const noteEl = document.getElementById('workNote');
  const titlesEl = document.getElementById('workTitles');
  const tickerEl = document.getElementById('tickerRow');

  function renderDeck() {
    if (!deckEl) return;

    deckEl.innerHTML = pieces.map((v, i) => {
      const thumbUrl = resolveThumbnail(v);
      const tags = v.tags || [];
      // <button> nativo: el sitio anterior usaba article[role=button][tabindex=0]
      // con un único listener de click, así que con teclado se podía enfocar
      // pero NO activar. Esto lo arregla de raíz.
      return '<button class="piece" type="button"' +
        ' data-category="' + esc(v.category) + '"' +
        ' data-tags="' + esc(tags.join('|')) + '"' +
        ' data-embed="' + esc(v.embed || '') + '"' +
        ' data-orientation="' + esc(v.orientation || 'portrait') + '"' +
        ' data-index="' + i + '"' +
        ' aria-label="Reproducir: ' + esc(v.title) + '">' +
        '<span class="piece__thumb">' +
          (thumbUrl ? '<img src="' + esc(thumbUrl) + '" alt="" loading="lazy" data-fallback="' + esc(fallbackThumb(v)) + '">' : '') +
          '<span class="piece__play">' + playIconSVG + '</span>' +
        '</span>' +
        '<span class="piece__meta">' +
          '<span class="piece__name">' + esc(v.title) + '</span>' +
          (tags.length ? '<span class="piece__tags">' + esc(tags.join(' · ')) + '</span>' : '') +
          (v.highlight ? '<span class="piece__highlight">' + esc(v.highlight) + '</span>' : '') +
        '</span>' +
      '</button>';
    }).join('');

    deckEl.querySelectorAll('.piece').forEach(el => {
      el.addEventListener('click', () => onPieceClick(el));
    });

    wireThumbFallback(deckEl.querySelectorAll('.piece__thumb img'));
  }

  function renderTitles() {
    if (!titlesEl) return;
    titlesEl.innerHTML = pieces.map(v => '<li>' + esc(v.title) + '</li>').join('');
  }

  function renderTicker() {
    if (!tickerEl) return;
    // Se duplica la lista para que el bucle del ticker no muestre huecos.
    const once = oficios.map(o => '<span class="ticker__item">' + esc(o) + '</span>').join('');
    tickerEl.innerHTML = once + once;
  }

  function renderFilters() {
    if (!filtersEl) return;
    const buttons = [{ id: 'all', title: 'Todo' }].concat(categories.map(c => ({ id: c.id, title: c.title })));
    filtersEl.innerHTML = buttons.map((f, i) =>
      '<button class="filter' + (i === 0 ? ' is-active' : '') + '" type="button"' +
      ' data-filter="' + esc(f.id) + '" aria-pressed="' + (i === 0) + '">' + esc(f.title) + '</button>'
    ).join('');

    filtersEl.querySelectorAll('.filter').forEach(btn => {
      btn.addEventListener('click', () => setCategoryFilter(btn.dataset.filter));
    });
    renderTagFilters();
    updateNote();
  }

  function renderTagFilters() {
    if (!tagFiltersEl) return;
    const tags = getTagsForCategory(filterState.category);
    if (!tags.length) {
      tagFiltersEl.innerHTML = '';
      tagFiltersEl.classList.add('is-empty');
      return;
    }
    tagFiltersEl.classList.remove('is-empty');

    const buttons = [{ id: 'all', title: 'Todas las etiquetas' }].concat(tags.map(t => ({ id: t, title: t })));
    tagFiltersEl.innerHTML = buttons.map(t =>
      '<button class="filter filter--tag' + (t.id === filterState.tag ? ' is-active' : '') + '" type="button"' +
      ' data-tag="' + esc(t.id) + '" aria-pressed="' + (t.id === filterState.tag) + '">' + esc(t.title) + '</button>'
    ).join('');

    tagFiltersEl.querySelectorAll('.filter').forEach(btn => {
      btn.addEventListener('click', () => setTagFilter(btn.dataset.tag));
    });
  }

  /* La descripción de cada categoría no se pierde con el carrusel único:
     aparece aquí cuando esa categoría está activa. */
  function updateNote() {
    if (!noteEl) return;
    const cat = categories.find(c => c.id === filterState.category);
    const visibles = countVisible();
    const cuenta = visibles + (visibles === 1 ? ' pieza' : ' piezas');
    noteEl.textContent = cat ? cat.description + ' — ' + cuenta : cuenta + ' en total.';
  }

  function countVisible() {
    return pieces.filter(v => {
      const okCat = filterState.category === 'all' || v.category === filterState.category;
      const okTag = filterState.tag === 'all' || (v.tags || []).includes(filterState.tag);
      return okCat && okTag;
    }).length;
  }

  /* ---------- Filtros ---------- */
  function setCategoryFilter(categoryId) {
    filterState.category = categoryId;
    filterState.tag = 'all';
    if (filtersEl) {
      filtersEl.querySelectorAll('.filter').forEach(b => {
        const on = b.dataset.filter === categoryId;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
    }
    renderTagFilters();
    applyFilters();
  }

  function setTagFilter(tag) {
    filterState.tag = tag;
    if (tagFiltersEl) {
      tagFiltersEl.querySelectorAll('.filter').forEach(b => {
        const on = b.dataset.tag === tag;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
    }
    applyFilters();
  }

  function applyFilters() {
    const mutate = () => {
      if (!deckEl) return;
      deckEl.querySelectorAll('.piece').forEach(card => {
        const cardTags = (card.dataset.tags || '').split('|').filter(Boolean);
        const okCat = filterState.category === 'all' || card.dataset.category === filterState.category;
        const okTag = filterState.tag === 'all' || cardTags.includes(filterState.tag);
        card.hidden = !(okCat && okTag);
      });
      updateNote();
    };

    // Si motion.js está vivo, deja que Flip anime el reacomodo.
    // Si no, el cambio es instantáneo pero igual de correcto.
    if (window.CCMotion && typeof window.CCMotion.reflow === 'function') {
      window.CCMotion.reflow(mutate);
    } else {
      mutate();
    }
    railRefresh();
  }

  /* ---------- Carrusel móvil ----------
     Debajo de 768px el mazo no es un abanico: es una tira que corre de
     izquierda a derecha, anclada al borde izquierdo. Esto vive aquí y no
     en motion.js a propósito — si el CDN de GSAP cae, el carrusel tiene
     que seguir funcionando.

     El mando nace `hidden` en el HTML y se destapa desde aquí: sin JS no
     aparecen flechas que no llevan a ninguna parte. */
  const railEl = document.getElementById('workRail');
  const dotsEl = document.getElementById('workDots');
  const mqRail = window.matchMedia('(max-width: 768px)');
  let railTick = false;

  function visiblePieces() {
    if (!deckEl) return [];
    return Array.from(deckEl.querySelectorAll('.piece')).filter(el => !el.hidden);
  }

  function deckPadLeft() {
    return deckEl ? (parseFloat(getComputedStyle(deckEl).paddingLeft) || 0) : 0;
  }

  /* La pieza anclada es la más cercana a la línea de anclaje —borde
     izquierdo más padding—. Se mide con rects y no con offsetLeft: dentro
     de un contenedor con scroll, offsetLeft cambia de origen según quién
     esté posicionado, y devuelve números que no significan lo mismo. */
  function railIndex() {
    const list = visiblePieces();
    if (!deckEl || !list.length) return 0;
    const linea = deckEl.getBoundingClientRect().left + deckPadLeft();
    let idx = 0, mejor = Infinity;
    list.forEach((el, i) => {
      const d = Math.abs(el.getBoundingClientRect().left - linea);
      if (d < mejor) { mejor = d; idx = i; }
    });
    return idx;
  }

  function railGo(i) {
    const list = visiblePieces();
    if (!deckEl || !list.length) return;
    const el = list[Math.max(0, Math.min(list.length - 1, i))];
    const x = deckEl.scrollLeft
      + el.getBoundingClientRect().left - deckEl.getBoundingClientRect().left
      - deckPadLeft();
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    deckEl.scrollTo({ left: Math.max(0, x), behavior: suave ? 'smooth' : 'auto' });
  }

  function renderDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = visiblePieces().map((el, i) => {
      const name = el.querySelector('.piece__name');
      const label = name ? name.textContent : ('la pieza ' + (i + 1));
      return '<button class="rail__dot" type="button" data-go="' + i +
        '" aria-label="Ir a ' + esc(label) + '"></button>';
    }).join('');
    dotsEl.querySelectorAll('.rail__dot').forEach(btn => {
      btn.addEventListener('click', () => railGo(Number(btn.dataset.go)));
    });
  }

  function railSync() {
    if (!railEl || !deckEl || railEl.hidden) return;
    const activo = railIndex();
    if (dotsEl) {
      dotsEl.querySelectorAll('.rail__dot').forEach((d, k) => {
        d.classList.toggle('is-on', k === activo);
        if (k === activo) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    }
    const prev = railEl.querySelector('[data-rail="prev"]');
    const next = railEl.querySelector('[data-rail="next"]');
    // El tope se mide por scroll, no por índice: la última pieza puede no
    // llegar nunca a la línea de anclaje y estar aun así entera a la vista.
    const fin = deckEl.scrollLeft + deckEl.clientWidth >= deckEl.scrollWidth - 4;
    if (prev) prev.disabled = deckEl.scrollLeft <= 4;
    if (next) next.disabled = fin;
  }

  /* Cambió el filtro o el ancho: otras piezas, otros puntos, y la tira
     vuelve al principio. Con una sola pieza visible el mando sobra. */
  function railRefresh() {
    if (!railEl) return;
    railEl.hidden = !mqRail.matches || visiblePieces().length < 2;
    renderDots();
    if (!railEl.hidden && deckEl) deckEl.scrollTo({ left: 0, behavior: 'auto' });
    railSync();
  }

  function railInit() {
    if (!railEl || !deckEl) return;

    railEl.querySelectorAll('[data-rail]').forEach(btn => {
      btn.addEventListener('click', () => {
        railGo(railIndex() + (btn.dataset.rail === 'next' ? 1 : -1));
      });
    });

    deckEl.addEventListener('scroll', () => {
      if (railTick) return;
      railTick = true;
      requestAnimationFrame(() => { railTick = false; railSync(); });
    }, { passive: true });

    // Safari viejo no tiene addEventListener en MediaQueryList.
    if (mqRail.addEventListener) mqRail.addEventListener('change', railRefresh);
    else if (mqRail.addListener) mqRail.addListener(railRefresh);
    window.addEventListener('resize', railSync, { passive: true });

    railRefresh();
  }

  /* ---------- Modal ---------- */
  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');
  let lastFocused = null;

  function openModal(embedUrl) {
    if (!modal || !modalVideo) return;
    lastFocused = document.activeElement;
    modalVideo.innerHTML = '<iframe src="' + toEmbedUrl(embedUrl) + '" title="Reproductor de video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const close = modal.querySelector('.modal__close');
    if (close) close.focus();
  }

  function closeModal() {
    if (!modal || !modalVideo) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modalVideo.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onPieceClick(card) {
    const embed = card.dataset.embed;
    if (embed) {
      openModal(embed);
    } else {
      const name = card.querySelector('.piece__name');
      showToast('"' + (name ? name.textContent : 'Esta pieza') + '" próximamente');
    }
  }

  document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));

  /* ---------- Calculadora de precios ----------
     PRICING es un espejo de la tabla #precios de index.html. Si esa tabla
     cambia, este objeto se actualiza a mano también: no hay una sola
     fuente de verdad para los dos, y por ahora eso es preferible a que
     script.js tenga que parsear el texto de las celdas para adivinar los
     números.

     Los precios de la tabla son rangos porque el detalle real de un
     proyecto los mueve. Cada extra "de rango" usa aquí su punto medio. El
     total final se redondea siempre HACIA ARRIBA (Math.ceil, nunca
     Math.round): es la regla de negocio que pidió Camilo — el margen de
     redondeo lo absorbe el estimado, no al revés. */
  const PRICING = {
    tiers: {
      basico: { label: 'Básico', points: [[1, 15], [2, 30], [5, 60], [10, 90], [15, 120], [20, 140]], revisions: 1 },
      medio: { label: 'Medio', points: [[1, 25], [2, 50], [5, 100], [10, 170], [15, 220], [20, 280]], revisions: 2 },
      pro: { label: 'Pro', points: [[1, 50], [2, 100], [5, 230], [10, 450], [15, 650], [20, 850]], revisions: 2 }
    },
    extras: [
      { id: 'broll', label: 'Buscar o limpiar B-roll', kind: 'perMin', rate: 7.5 },    // $5–10/min, punto medio
      { id: 'musica', label: 'Música con licencia', kind: 'flat', amount: 10 },
      { id: 'sfx', label: 'SFX (efectos de sonido) fuera de mi librería', kind: 'flat', amount: 10 }, // $5–15, punto medio
      { id: 'locucion', label: 'Locución o voz en off (IA)', kind: 'flat', amount: 20 }, // $15–25, punto medio
      { id: 'miniatura', label: 'Miniatura', kind: 'flat', amount: 12 }    // $10–15, punto medio
    ],
    resolucion: {
      sd: { label: 'Hasta 1080p', pct: 0 },
      '2k': { label: '1440p / 2K', pct: 0.15 },
      '4k': { label: '2160p / 4K', pct: 0.25 }
    },
    multicamLabel: 'Sincronizar 2+ cámaras',
    multicamPct: 0.18, // +15–20%, punto medio
    revisionExtraPct: 0.15 // por ronda extra, sobre el precio de la pieza — Tarifas.md
  };

  /* Interpolación lineal por tramos entre los puntos (minuto, precio) de
     la tabla. Antes del primer punto la tarifa es plana (regla del
     catálogo: un video de 20 segundos no cuesta menos que uno de 1
     minuto). Después del último punto, extiende la tarifa marginal del
     último tramo — igual que dice la nota bajo la tabla. */
  function priceForDuration(tierKey, minutes) {
    const points = PRICING.tiers[tierKey].points;
    const m = Math.max(0, minutes);
    if (m <= points[0][0]) return points[0][1];
    for (let i = 1; i < points.length; i++) {
      const [m0, p0] = points[i - 1];
      const [m1, p1] = points[i];
      if (m <= m1) return p0 + (m - m0) / (m1 - m0) * (p1 - p0);
    }
    const [m0, p0] = points[points.length - 2];
    const [m1, p1] = points[points.length - 1];
    const rate = (p1 - p0) / (m1 - m0);
    return p1 + rate * (m - m1);
  }

  /* "2:40" se escribe como 2 min + 40 seg, no como 2.40 minutos: por eso
     la duración vive en dos campos (minutos y segundos), no en uno solo
     con decimales que nadie usaría bien. */
  function readCalcState() {
    const calcModal = document.getElementById('calcModal');
    if (!calcModal) return null;
    const tier = (calcModal.querySelector('input[name="calcTier"]:checked') || {}).value || 'basico';
    const resolucion = (calcModal.querySelector('input[name="calcRes"]:checked') || {}).value || 'sd';
    const minInput = document.getElementById('calcMin');
    const secInput = document.getElementById('calcSec');
    const min = minInput ? Math.max(0, Number(minInput.value) || 0) : 1;
    const sec = secInput ? Math.min(59, Math.max(0, Number(secInput.value) || 0)) : 0;
    const minutes = min + sec / 60;
    const extras = Array.from(calcModal.querySelectorAll('input[name="calcExtra"]:checked')).map(el => el.value);
    const multicamEl = document.getElementById('calcMulticam');
    const multicam = !!(multicamEl && multicamEl.checked);
    const revInput = document.getElementById('calcRevisiones');
    const extraRevisions = revInput ? Math.min(5, Math.max(0, Number(revInput.value) || 0)) : 0;
    return { tier, min, sec, minutes, resolucion, extras, multicam, extraRevisions };
  }

  function computeEstimate(state) {
    const base = priceForDuration(state.tier, state.minutes);
    let extrasTotal = 0;
    state.extras.forEach(id => {
      const ex = PRICING.extras.find(e => e.id === id);
      if (!ex) return;
      extrasTotal += ex.kind === 'perMin' ? ex.rate * state.minutes : ex.amount;
    });
    const subtotal = base + extrasTotal;
    let pct = PRICING.resolucion[state.resolucion] ? PRICING.resolucion[state.resolucion].pct : 0;
    if (state.multicam) pct += PRICING.multicamPct;
    pct += PRICING.revisionExtraPct * state.extraRevisions;
    const total = subtotal * (1 + pct);
    return { base, extrasTotal, pct, total: Math.ceil(total) };
  }

  function formatDuration(state) {
    if (state.min === 0) return state.sec + ' seg';
    if (state.sec === 0) return state.min + ' min';
    return state.min + ' min ' + state.sec + ' seg';
  }

  let calcCurrentState = null;
  let calcCurrentResult = null;

  /* Cuenta hacia el nuevo total en vez de saltar de golpe — el mismo
     principio "muy smooth" del modal, aplicado al número. Sin GSAP a
     propósito: script.js tiene que seguir funcionando si el CDN de GSAP
     cae, y esto es solo un requestAnimationFrame con un ease propio. */
  function animateCalcTotal(newValue) {
    const el = document.getElementById('calcTotal');
    if (!el) return;
    const from = Number(el.textContent) || 0;
    if (from === newValue) { el.textContent = newValue; return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = newValue;
      return;
    }
    const duration = 380;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (newValue - from) * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = newValue;
    }
    requestAnimationFrame(tick);
  }

  function updateCalc() {
    const state = readCalcState();
    if (!state) return;
    const result = computeEstimate(state);
    calcCurrentState = state;
    calcCurrentResult = result;

    animateCalcTotal(result.total);

    const noteEl = document.getElementById('calcLongNote');
    if (noteEl) noteEl.hidden = state.minutes <= 20;
  }

  /* details es opcional: el botón "Descargar PDF" de la calculadora lo
     llama sin él (esa vista no conoce el modal de detalles) y el PDF
     sale genérico, sin sección de proyecto; "Confirmar y enviar" sí lo
     tiene y lo pasa completo.

     Camilo pidió que el PDF quepa **siempre en una sola página** — nunca
     paginado. `layout(scale, draw)` dibuja todo el contenido dos veces:
     la primera (`scale=1, draw=false`) solo mide, recorriendo el mismo
     código pero sin pintar nada, para saber cuánta altura pide el
     contenido real; la segunda pinta a la escala que haga falta para que
     esa altura entre en el alto disponible de una A4. Reducir el tamaño
     de letra también achica el ancho de cada palabra, así que el texto
     envuelto (`doc.splitTextToSize`) sale en menos líneas a menor escala
     — nunca en más—, lo que garantiza matemáticamente que la segunda
     pasada quepa: la altura a escala `s` es como máximo `s` veces la
     altura medida a escala 1. */
  function generatePdf(state, result, details) {
    const nombre = details && details.nombre;
    if (!window.jspdf || !window.jspdf.jsPDF) {
      showToast('No pude generar el PDF: la librería no cargó. Intenta de nuevo.');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const mx = 56;
    const topY = 60;
    const bottomMargin = 50;
    const available = pageH - topY - bottomMargin;

    function layout(scale, draw) {
      const S = n => n * scale;
      let y = topY;

      function put(txt, yy) { if (draw) doc.text(txt, mx, yy); }
      function textRight(txt, yy) { if (draw) doc.text(txt, pageW - mx - doc.getTextWidth(txt), yy); }
      function divider(yy) {
        if (!draw) return;
        doc.setDrawColor(224, 224, 224);
        doc.setLineWidth(1);
        doc.line(mx, yy, pageW - mx, yy);
      }

      doc.setFont('helvetica', 'bold'); doc.setFontSize(S(10.5)); doc.setTextColor(227, 100, 20);
      put('CAMILO CREATIVO', y);

      y += S(32);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(S(22)); doc.setTextColor(0, 51, 102);
      put(nombre ? ('Cotización para ' + nombre) : 'Cotización de edición de video', y);

      y += S(17);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(S(9.5)); doc.setTextColor(135, 135, 135);
      put(new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }), y);

      y += S(20);
      divider(y);

      y += S(28);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(S(11)); doc.setTextColor(0, 51, 102);
      put('Nivel', y);
      doc.setFont('helvetica', 'bold'); textRight(PRICING.tiers[state.tier].label, y);

      y += S(23);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(S(11));
      put('Duración', y);
      doc.setFont('helvetica', 'bold'); textRight(formatDuration(state), y);

      y += S(26);
      divider(y);
      y += S(22);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(S(8.5)); doc.setTextColor(90, 62, 43);
      put('EXTRAS', y);

      PRICING.extras.forEach(ex => {
        const on = state.extras.indexOf(ex.id) !== -1;
        y += S(20);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(S(10.5));
        doc.setTextColor(on ? 0 : 178, on ? 51 : 178, on ? 102 : 178);
        put(ex.label, y);
        textRight(on ? 'Sí' : 'No aplica', y);
      });

      y += S(26);
      divider(y);
      y += S(22);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(S(8.5)); doc.setTextColor(90, 62, 43);
      put('RECARGOS', y);

      y += S(20);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(S(10.5)); doc.setTextColor(0, 51, 102);
      put('Resolución de entrega', y);
      textRight(PRICING.resolucion[state.resolucion].label, y);

      y += S(20);
      const mcOn = state.multicam;
      doc.setTextColor(mcOn ? 0 : 178, mcOn ? 51 : 178, mcOn ? 102 : 178);
      put(PRICING.multicamLabel, y);
      textRight(mcOn ? 'Sí' : 'No aplica', y);

      y += S(20);
      const revIncluded = PRICING.tiers[state.tier].revisions;
      doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 51, 102);
      put('Revisiones incluidas', y);
      doc.setFont('helvetica', 'bold'); textRight(revIncluded + (revIncluded === 1 ? ' ronda' : ' rondas'), y);

      y += S(20);
      const revExtra = state.extraRevisions || 0;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(revExtra > 0 ? 0 : 178, revExtra > 0 ? 51 : 178, revExtra > 0 ? 102 : 178);
      put('Rondas de revisión extra', y);
      textRight(revExtra > 0 ? (revExtra + ' (+' + Math.round(PRICING.revisionExtraPct * revExtra * 100) + '%)') : 'No aplica', y);

      if (details) {
        y += S(26);
        divider(y);
        y += S(22);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(S(8.5)); doc.setTextColor(90, 62, 43);
        put('PROYECTO', y);

        y += S(20);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(S(10.5)); doc.setTextColor(0, 51, 102);
        put('Para', y);
        doc.setFont('helvetica', 'bold'); textRight(details.nombre || 'No especificado', y);

        const addWrapped = (label, txt) => {
          doc.setFont('helvetica', 'normal'); doc.setFontSize(S(10));
          const lines = doc.splitTextToSize(txt, pageW - mx * 2);
          y += S(22);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(S(8)); doc.setTextColor(0, 51, 102);
          put(label.toUpperCase(), y);
          y += S(14);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(S(10)); doc.setTextColor(0, 51, 102);
          lines.forEach(line => {
            put(line, y);
            y += S(14);
          });
        };
        addWrapped('Descripción', details.descripcion || 'No especificada');
        addWrapped('Formato', details.formato.length ? details.formato.join(', ') : 'No especificado');
        addWrapped('Estilo', details.estilo.length ? details.estilo.join(', ') : 'No especificado');
        addWrapped('Tono', details.tono.length ? details.tono.join(', ') : 'No especificado');
        addWrapped('Ritmo', details.ritmo.length ? details.ritmo.join(', ') : 'No especificado');
        addWrapped('Requerimientos específicos', details.requerimientos || 'Ninguno');
      }

      y += S(44);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(S(9)); doc.setTextColor(135, 135, 135);
      put('ESTIMADO', y);
      y += S(33);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(S(29)); doc.setTextColor(0, 51, 102);
      put('$' + result.total + ' USD', y);

      y += S(24);
      doc.setFont('helvetica', 'italic'); doc.setFontSize(S(8)); doc.setTextColor(165, 165, 165);
      put('No es una cotizacion cerrada: el numero final puede variar segun el detalle del proyecto.', y);

      return y;
    }

    const neededHeight = layout(1, false) - topY;
    const scale = neededHeight > available ? available / neededHeight : 1;

    doc.setFillColor(227, 100, 20);
    doc.rect(0, 0, pageW, 10, 'F');
    layout(scale, true);

    doc.save('cotizacion-camilo-creativo' + (nombre ? '-' + slugify(nombre) : '') + '.pdf');
  }

  /* "Ana Pérez" -> "ana-perez", para nombrar el PNG de la cotización con
     detalles. Comparte la normalización que antes vivía en el PDF. */
  function slugify(text) {
    return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  /* El texto de WhatsApp es deliberadamente corto: el detalle completo
     —nivel, duración, extras, proyecto— ya va en el PDF descargado.
     Esto solo abre la conversación. */
  function buildSimpleWhatsappText(details) {
    const nombre = details && details.nombre;
    return 'Hola Camilo!' + (nombre ? ' Soy ' + nombre + '.' : '') + ' Aquí tienes mi cotización, ¿hablamos?';
  }

  /* Mismo contenido que generatePdf(), dibujado en un <canvas> en vez de
     con jsPDF: esto es lo que viaja pegado al mensaje de WhatsApp vía
     Web Share API. Se ejecuta dos veces con el mismo código —draw=false
     solo mide, draw=true además pinta— para que el alto del canvas final
     salga exacto sin necesidad de paginar como el PDF: al ser una sola
     imagen no hay límite de página que respetar. */
  function renderEstimateImage(ctx, state, result, details, draw) {
    const width = 960;
    const mx = 64;
    const contentWidth = width - mx * 2;
    let y = 0;

    function setFont(weight, size) {
      ctx.font = weight + ' ' + size + 'px Helvetica, Arial, sans-serif';
    }
    function text(txt, x, yy) {
      if (draw) ctx.fillText(txt, x, yy);
    }
    function textRight(txt, yy) {
      text(txt, width - mx - ctx.measureText(txt).width, yy);
    }
    function divider(yy) {
      if (!draw) return;
      ctx.strokeStyle = 'rgb(224,224,224)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mx, yy);
      ctx.lineTo(width - mx, yy);
      ctx.stroke();
    }
    function wrap(txt, maxWidth) {
      const words = txt.split(' ');
      const lines = [];
      let line = '';
      words.forEach(word => {
        const test = line ? line + ' ' + word : word;
        if (line && ctx.measureText(test).width > maxWidth) { lines.push(line); line = word; }
        else line = test;
      });
      if (line) lines.push(line);
      return lines;
    }

    if (draw) { ctx.fillStyle = 'rgb(227,100,20)'; ctx.fillRect(0, 0, width, 10); }

    const nombre = details && details.nombre;
    y = 56;
    setFont('bold', 15); ctx.fillStyle = 'rgb(227,100,20)';
    text('CAMILO CREATIVO', mx, y);

    y += 40;
    setFont('bold', 28); ctx.fillStyle = 'rgb(0,51,102)';
    text(nombre ? ('Cotización para ' + nombre) : 'Cotización de edición de video', mx, y);

    y += 24;
    setFont('normal', 13); ctx.fillStyle = 'rgb(135,135,135)';
    text(new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }), mx, y);

    y += 26;
    divider(y);

    y += 36;
    setFont('normal', 15); ctx.fillStyle = 'rgb(0,51,102)';
    text('Nivel', mx, y);
    setFont('bold', 15); textRight(PRICING.tiers[state.tier].label, y);

    y += 30;
    setFont('normal', 15); ctx.fillStyle = 'rgb(0,51,102)';
    text('Duración', mx, y);
    setFont('bold', 15); textRight(formatDuration(state), y);

    y += 34;
    divider(y);
    y += 28;
    setFont('bold', 12); ctx.fillStyle = 'rgb(90,62,43)';
    text('EXTRAS', mx, y);

    PRICING.extras.forEach(ex => {
      const on = state.extras.indexOf(ex.id) !== -1;
      y += 26;
      setFont('normal', 14);
      ctx.fillStyle = on ? 'rgb(0,51,102)' : 'rgb(178,178,178)';
      text(ex.label, mx, y);
      textRight(on ? 'Sí' : 'No aplica', y);
    });

    y += 34;
    divider(y);
    y += 28;
    setFont('bold', 12); ctx.fillStyle = 'rgb(90,62,43)';
    text('RECARGOS', mx, y);

    y += 26;
    setFont('normal', 14); ctx.fillStyle = 'rgb(0,51,102)';
    text('Resolución de entrega', mx, y);
    setFont('bold', 14); textRight(PRICING.resolucion[state.resolucion].label, y);

    y += 26;
    const mcOn = state.multicam;
    setFont('normal', 14);
    ctx.fillStyle = mcOn ? 'rgb(0,51,102)' : 'rgb(178,178,178)';
    text(PRICING.multicamLabel, mx, y);
    textRight(mcOn ? 'Sí' : 'No aplica', y);

    y += 26;
    const revIncluded = PRICING.tiers[state.tier].revisions;
    setFont('normal', 14); ctx.fillStyle = 'rgb(0,51,102)';
    text('Revisiones incluidas', mx, y);
    setFont('bold', 14); textRight(revIncluded + (revIncluded === 1 ? ' ronda' : ' rondas'), y);

    y += 26;
    const revExtra = state.extraRevisions || 0;
    setFont('normal', 14);
    ctx.fillStyle = revExtra > 0 ? 'rgb(0,51,102)' : 'rgb(178,178,178)';
    text('Rondas de revisión extra', mx, y);
    textRight(revExtra > 0 ? (revExtra + ' (+' + Math.round(PRICING.revisionExtraPct * revExtra * 100) + '%)') : 'No aplica', y);

    if (details) {
      y += 34;
      divider(y);
      y += 28;
      setFont('bold', 12); ctx.fillStyle = 'rgb(90,62,43)';
      text('PROYECTO', mx, y);

      y += 26;
      setFont('normal', 14); ctx.fillStyle = 'rgb(0,51,102)';
      text('Para', mx, y);
      setFont('bold', 14); textRight(details.nombre || 'No especificado', y);

      const addWrapped = (label, txt) => {
        setFont('normal', 13);
        const lines = wrap(txt, contentWidth);
        y += 28;
        setFont('bold', 11); ctx.fillStyle = 'rgb(0,51,102)';
        text(label.toUpperCase(), mx, y);
        y += 18;
        setFont('normal', 13); ctx.fillStyle = 'rgb(0,51,102)';
        lines.forEach(line => { text(line, mx, y); y += 18; });
      };
      addWrapped('Descripción', details.descripcion || 'No especificada');
      addWrapped('Formato', details.formato.length ? details.formato.join(', ') : 'No especificado');
      addWrapped('Estilo', details.estilo.length ? details.estilo.join(', ') : 'No especificado');
      addWrapped('Tono', details.tono.length ? details.tono.join(', ') : 'No especificado');
      addWrapped('Ritmo', details.ritmo.length ? details.ritmo.join(', ') : 'No especificado');
      addWrapped('Requerimientos específicos', details.requerimientos || 'Ninguno');
    }

    y += 50;
    setFont('normal', 12); ctx.fillStyle = 'rgb(135,135,135)';
    text('ESTIMADO', mx, y);
    y += 40;
    setFont('bold', 38); ctx.fillStyle = 'rgb(0,51,102)';
    text('$' + result.total + ' USD', mx, y);

    y += 28;
    setFont('italic', 11); ctx.fillStyle = 'rgb(165,165,165)';
    text('No es una cotización cerrada: el número final puede variar según el detalle del proyecto.', mx, y);

    return y + 40;
  }

  /* Doble pasada: la primera mide sin pintar (canvas de 10px de alto solo
     para tener un contexto con el que medir texto), la segunda pinta sobre
     un canvas ya del alto correcto. Sin esto habría que adivinar el alto
     de antemano o recortar contenido. */
  function generateEstimateImageBlob(state, result, details) {
    return new Promise((resolve, reject) => {
      const width = 960;
      const measureCanvas = document.createElement('canvas');
      measureCanvas.width = width;
      measureCanvas.height = 10;
      const mctx = measureCanvas.getContext('2d');
      const height = renderEstimateImage(mctx, state, result, details, false);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = Math.ceil(height);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      renderEstimateImage(ctx, state, result, details, true);

      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('No se pudo generar la imagen de la cotización.'));
      }, 'image/png');
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const calcModal = document.getElementById('calcModal');
  const calcExportBtn = document.getElementById('calcExportBtn');
  const calcWhatsappBtn = document.getElementById('calcWhatsappBtn');
  let calcLastFocused = null;

  function openCalcModal() {
    if (!calcModal) return;
    calcLastFocused = document.activeElement;
    updateCalc();
    calcModal.classList.add('is-open');
    calcModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const first = calcModal.querySelector('input, button');
    if (first) first.focus();
  }

  function closeCalcModal() {
    if (!calcModal) return;
    calcModal.classList.remove('is-open');
    calcModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (calcLastFocused && calcLastFocused.focus) calcLastFocused.focus();
  }

  document.querySelectorAll('[data-calc-open]').forEach(btn => btn.addEventListener('click', openCalcModal));
  if (calcModal) {
    calcModal.querySelectorAll('input').forEach(el => {
      el.addEventListener('change', updateCalc);
      if (el.type === 'number' || el.type === 'text') el.addEventListener('input', updateCalc);
    });
  }
  if (calcExportBtn) calcExportBtn.addEventListener('click', () => {
    if (!calcCurrentState || !calcCurrentResult) updateCalc();
    generatePdf(calcCurrentState, calcCurrentResult);
  });
  if (calcWhatsappBtn) calcWhatsappBtn.addEventListener('click', () => {
    if (!calcCurrentState || !calcCurrentResult) updateCalc();
    closeCalcModal();
    openDetailsModal();
  });
  document.querySelectorAll('[data-close-calc]').forEach(el => el.addEventListener('click', closeCalcModal));

  /* ---------- Modal de detalles del proyecto ----------
     Se abre al pulsar "Enviar" en la calculadora. Mismo patrón de
     apertura/cierre/foco que los otros dos modales. */
  const detailsModal = document.getElementById('detailsModal');
  const detailsConfirmBtn = document.getElementById('detailsConfirmBtn');
  let detailsLastFocused = null;

  function readDetailsState() {
    const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const checked = name => !detailsModal ? [] : Array.from(detailsModal.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(el => (el.nextElementSibling ? el.nextElementSibling.textContent : el.value));
    return {
      nombre: val('detName'),
      descripcion: val('detDescripcion'),
      formato: checked('detFormato'),
      estilo: checked('detEstilo'),
      tono: checked('detTono'),
      ritmo: checked('detRitmo'),
      requerimientos: val('detRequerimientos')
    };
  }

  function openDetailsModal() {
    if (!detailsModal) return;
    detailsLastFocused = document.activeElement;
    detailsModal.classList.add('is-open');
    detailsModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const first = detailsModal.querySelector('input, textarea, button');
    if (first) first.focus();
  }

  function closeDetailsModal() {
    if (!detailsModal) return;
    detailsModal.classList.remove('is-open');
    detailsModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (detailsLastFocused && detailsLastFocused.focus) detailsLastFocused.focus();
  }

  /* La Web Share API se había probado y descartado una vez por el
     selector nativo de apps que aparece antes de llegar a WhatsApp.
     Camilo pidió retomarla: ese único toque le parece aceptable a
     cambio de que la imagen llegue puesta en el mensaje, sin que la
     persona tenga que descargarla ni adjuntarla a mano. `navigator
     .share()` con `files` es la única API que logra eso — sin ella
     (navegadores de escritorio sin soporte, Firefox) cae al camino
     anterior: descarga la imagen y abre `wa.me` solo con texto,
     avisando por toast que hay que adjuntarla. */
  async function confirmAndSend() {
    if (!calcCurrentState || !calcCurrentResult) updateCalc();
    const details = readDetailsState();
    const text = buildSimpleWhatsappText(details);

    let blob;
    try {
      blob = await generateEstimateImageBlob(calcCurrentState, calcCurrentResult, details);
    } catch (err) {
      showToast('No pude generar la imagen de la cotización. Intenta de nuevo.');
      return;
    }
    const file = new File([blob], 'cotizacion-camilo-creativo.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text });
        closeDetailsModal();
      } catch (err) {
        if (err && err.name !== 'AbortError') showToast('No se pudo compartir la imagen. Intenta de nuevo.');
      }
      return;
    }

    downloadBlob(file, 'cotizacion-camilo-creativo.png');
    window.open('https://wa.me/573213275783?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
    showToast('Tu navegador no admite compartir imágenes directo — descargué la cotización y te abrí WhatsApp, adjúntala a mano.');
    closeDetailsModal();
  }

  const detailsPdfBtn = document.getElementById('detailsPdfBtn');
  if (detailsPdfBtn) detailsPdfBtn.addEventListener('click', () => {
    if (!calcCurrentState || !calcCurrentResult) updateCalc();
    generatePdf(calcCurrentState, calcCurrentResult, readDetailsState());
  });
  if (detailsConfirmBtn) detailsConfirmBtn.addEventListener('click', confirmAndSend);
  document.querySelectorAll('[data-close-details]').forEach(el => el.addEventListener('click', closeDetailsModal));

  /* Escape y el atrapa-foco valen para el modal que esté abierto —video,
     calculadora o detalles—: solo puede haber uno a la vez, porque el
     fondo del que está abierto bloquea el clic al disparador de los
     otros dos. */
  const modalRegistry = [
    { el: modal, close: closeModal },
    { el: calcModal, close: closeCalcModal },
    { el: detailsModal, close: closeDetailsModal }
  ];
  function openModalEl() {
    const found = modalRegistry.find(m => m.el && m.el.classList.contains('is-open'));
    return found ? found.el : null;
  }
  document.addEventListener('keydown', e => {
    const open = openModalEl();
    if (!open) return;
    if (e.key === 'Escape') {
      const found = modalRegistry.find(m => m.el === open);
      if (found) found.close();
    }
    if (e.key === 'Tab') {
      const focusables = open.querySelectorAll('button, iframe, [href], input, select, textarea');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Presentación en video ----------
     Fachada. En el HTML la portada es un enlace de verdad a YouTube: sin JS el
     video sigue estando a un clic. Aquí ese enlace se convierte en el
     reproductor de la propia tarjeta —la caja ya trae su proporción, así que el
     cambio no mueve nada de sitio— y nadie sale de la página. */
  const pitchEl = document.getElementById('pitchPlayer');
  const pitchCover = pitchEl ? pitchEl.querySelector('.pitch__cover') : null;
  if (pitchEl && pitchCover) {
    wireThumbFallback(pitchEl.querySelectorAll('img[data-fallback]'));

    pitchCover.addEventListener('click', e => {
      e.preventDefault();
      const src = toEmbedUrl(pitchCover.dataset.embed || pitchCover.href);
      pitchEl.innerHTML = '<iframe src="' + esc(src) + '"' +
        ' title="Presentación en video de Camilo Creativo"' +
        ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"' +
        ' allowfullscreen></iframe>';
      pitchEl.classList.add('is-playing');
    });
  }

  /* ---------- Embed de TikTok, perezoso ----------
     Antes `embed.js` se cargaba siempre desde el HTML, así lo viera o no
     quien entra. Se pide solo cuando Marca personal está a punto de
     entrar en pantalla: menos peticiones a TikTok en cada carga, que es
     justo lo que puede disparar su propia protección "overload-protect"
     cuando hay demasiadas de golpe. Sin IntersectionObserver (navegador
     muy viejo) se carga de una: sin JS el enlace real del blockquote
     sigue funcionando igual, así que no hay nada que degradar de más. */
  const personalSection = document.getElementById('personal');
  if (personalSection && personalSection.querySelector('.tiktok-embed')) {
    const loadTiktokEmbed = () => {
      if (document.querySelector('script[data-tiktok-embed]')) return;
      const s = document.createElement('script');
      s.src = 'https://www.tiktok.com/embed.js';
      s.async = true;
      s.dataset.tiktokEmbed = 'true';
      document.body.appendChild(s);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { loadTiktokEmbed(); io.disconnect(); }
        });
      }, { rootMargin: '600px 0px' });
      io.observe(personalSection);
    } else {
      loadTiktokEmbed();
    }
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2600);
  }

  /* ---------- Copiar el correo ---------- */
  const emailCta = document.getElementById('ctaEmail');
  if (emailCta) {
    emailCta.addEventListener('click', () => {
      const email = emailCta.getAttribute('href').replace('mailto:', '').split('?')[0];
      if (navigator.clipboard) navigator.clipboard.writeText(email).catch(() => {});
      showToast('Correo copiado: ' + email);
    });
  }

  /* ---------- Navegación móvil ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Nav pegajosa y enlace activo ----------
     Vive aquí y no en motion.js a propósito: si GSAP no carga,
     la navegación tiene que seguir funcionando. */
  const navEl = document.getElementById('nav');
  // `[data-nav="off"]` deja fuera a las secciones que no tienen enlace en el
  // menú: si entraran, al pasar por ellas no quedaría ningún enlace encendido.
  const sections = document.querySelectorAll('main section[id]:not([data-nav="off"])');
  const navAnchors = document.querySelectorAll('.nav__link');

  function onScroll() {
    if (navEl) navEl.classList.toggle('is-stuck', window.scrollY > 40);
    let current = sections.length ? sections[0].id : '';
    const pos = window.scrollY + window.innerHeight * 0.35;
    sections.forEach(s => { if (pos >= s.offsetTop) current = s.id; });
    navAnchors.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));
  }
  document.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Año ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Arranque ---------- */
  renderDeck();
  renderTitles();
  renderTicker();
  renderFilters();
  railInit();
  onScroll();

  /* motion.js consume esto. Si motion.js no llega a correr,
     nada de lo de arriba se rompe. */
  window.CCData = { pieces, categories, deckEl };
})();
