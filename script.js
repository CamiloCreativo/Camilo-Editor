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
      { id: 'sfx', label: 'SFX (efectos de sonido)', kind: 'flat', amount: 10 }, // $5–15, punto medio
      { id: 'locucion', label: 'Locución o voz en off (IA)', kind: 'flat', amount: 20 }, // $15–25, punto medio
      { id: 'miniatura', label: 'Miniatura', kind: 'flat', amount: 12 },   // $10–15, punto medio
      { id: 'guion', label: 'Redactar guion o estructura', kind: 'flat', amount: 20 } // $15–25, punto medio — repuesto 2026-09-10
    ],
    resolucion: {
      sd: { label: 'Hasta 1080p', pct: 0 },
      '2k': { label: '1440p / 2K', pct: 0.15 },
      '4k': { label: '2160p / 4K', pct: 0.25 }
    },
    /* "Tú"/"yo" funciona en el formulario en vivo (Camilo le habla al
       cliente que lo está llenando), pero estas etiquetas viajan al
       PDF/imagen — el documento que termina leyendo Camilo, no el
       cliente. Ahí "tú" y "yo" se vuelven ambiguos: quien lee es Camilo,
       así que se nombra en tercera persona a quien corresponda, sin
       depender de quién tiene el documento en la mano. */
    almacenamiento: {
      cliente: { label: 'Lo aporta el cliente', amount: 0 },
      camilo: { label: 'Lo aporta Camilo Creativo (Google Drive)', amount: 5 } // propuesto — sin calibrar
    },
    multicamLabel: 'Sincronizar 2+ cámaras',
    multicamPct: 0.18, // +15–20%, punto medio
    revisionExtraPct: 0.15, // por ronda extra, sobre el precio de la pieza — Tarifas.md
    rushLabel: 'Entrega urgente (mitad del plazo estimado)',
    rushPct: 0.5, // propuesto por el asistente — a propósito alto, Camilo no quiere fomentar pedirlo
    /* Referencia real de Camilo, un solo punto por nivel a 1 min: Básico
       1–3 días, Medio 2–4, Pro 4–5 (confirmado como días hábiles,
       lunes a viernes). El resto de tramos (2–5, 5–10, 10–15, 15–20 min)
       es criterio del asistente extendiendo esa referencia — igual que
       ya pasó con los `points` de precio — sin calibrar contra tiempo
       real todavía. Por tramo, no interpolado: un plazo no se promedia
       entre minutos como un precio. Días en números (no una etiqueta ya
       armada) para poder calcular la mitad cuando se pide entrega
       urgente. */
    plazos: {
      basico: [
        { max: 2, minDays: 1, maxDays: 3 },
        { max: 5, minDays: 2, maxDays: 4 },
        { max: 10, minDays: 3, maxDays: 5 },
        { max: 15, minDays: 4, maxDays: 6 },
        { max: 20, minDays: 5, maxDays: 7 }
      ],
      medio: [
        { max: 2, minDays: 2, maxDays: 4 },
        { max: 5, minDays: 3, maxDays: 5 },
        { max: 10, minDays: 4, maxDays: 6 },
        { max: 15, minDays: 5, maxDays: 7 },
        { max: 20, minDays: 6, maxDays: 8 }
      ],
      pro: [
        { max: 2, minDays: 4, maxDays: 5 },
        { max: 5, minDays: 5, maxDays: 7 },
        { max: 10, minDays: 7, maxDays: 9 },
        { max: 15, minDays: 9, maxDays: 11 },
        { max: 20, minDays: 11, maxDays: 13 }
      ]
    }
  };

  function formatPlazo(minDays, maxDays) {
    return (minDays === maxDays ? minDays : minDays + '–' + maxDays) + ' días hábiles';
  }

  /* Compartida entre el PDF y la imagen. Si el cliente aporta el
     almacenamiento y hay un modal de detalles de por medio (el PDF
     genérico de la calculadora no lo tiene), siempre se dice algo sobre
     el método — el método si lo escribió, o "No especificado" si lo
     dejó en blanco. Antes, dejarlo en blanco simplemente omitía la
     mención por completo, que se leía como que faltaba información en
     vez de confirmar que no se especificó nada. Con "camilo" no aplica:
     ya se sabe que es por Drive, preguntar sería ruido. */
  function formatAlmacenamiento(state, details) {
    const almacen = PRICING.almacenamiento[state.almacenamiento];
    let label = almacen.label;
    if (state.almacenamiento === 'cliente' && details) {
      const metodo = details.almacenamientoMetodo ? details.almacenamientoMetodo.trim() : '';
      label += ' — ' + (metodo || 'No especificado');
    }
    return almacen.amount > 0 ? (label + ' (+$' + almacen.amount + ')') : label;
  }

  /* Por debajo del primer tramo el plazo es plano, igual que el precio
     (priceForDuration): un video de 20 segundos no se entrega más rápido
     que uno de 1–2 min. Por encima del último tramo (20 min) devuelve el
     tramo más largo — el aviso `calcLongNote` ya redirige a escribir
     directo para esos casos. Con `urgent`, la mitad de cada extremo
     (redondeando hacia arriba, nunca menos de 1 día) — la entrega
     urgente reduce el plazo, nunca lo garantiza en menos de un día. */
  function plazoForDuration(tierKey, minutes, urgent) {
    const tramos = PRICING.plazos[tierKey];
    const m = Math.max(0, minutes);
    const tramo = tramos.find(t => m <= t.max) || tramos[tramos.length - 1];
    if (!urgent) return formatPlazo(tramo.minDays, tramo.maxDays);
    return formatPlazo(Math.max(1, Math.ceil(tramo.minDays / 2)), Math.max(1, Math.ceil(tramo.maxDays / 2))) + ' (urgente)';
  }

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
    const almacenamiento = (calcModal.querySelector('input[name="calcAlmacenamiento"]:checked') || {}).value || 'cliente';
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
    const urgenteEl = document.getElementById('calcUrgente');
    const urgente = !!(urgenteEl && urgenteEl.checked);
    return { tier, min, sec, minutes, resolucion, almacenamiento, extras, multicam, extraRevisions, urgente };
  }

  function computeEstimate(state) {
    const base = priceForDuration(state.tier, state.minutes);
    let extrasTotal = 0;
    state.extras.forEach(id => {
      const ex = PRICING.extras.find(e => e.id === id);
      if (!ex) return;
      extrasTotal += ex.kind === 'perMin' ? ex.rate * state.minutes : ex.amount;
    });
    extrasTotal += PRICING.almacenamiento[state.almacenamiento] ? PRICING.almacenamiento[state.almacenamiento].amount : 0;
    const subtotal = base + extrasTotal;
    let pct = PRICING.resolucion[state.resolucion] ? PRICING.resolucion[state.resolucion].pct : 0;
    if (state.multicam) pct += PRICING.multicamPct;
    pct += PRICING.revisionExtraPct * state.extraRevisions;
    if (state.urgente) pct += PRICING.rushPct;
    const total = subtotal * (1 + pct);
    const plazo = plazoForDuration(state.tier, state.minutes, state.urgente);
    return { base, extrasTotal, pct, total: Math.ceil(total), plazo };
  }

  function formatDuration(state) {
    if (state.min === 0) return state.sec + ' seg';
    if (state.sec === 0) return state.min + ' min';
    return state.min + ' min ' + state.sec + ' seg';
  }

  let calcCurrentState = null;
  let calcCurrentResult = null;
  let currentQuoteNumber = null;

  /* Un número por sesión de calculadora (se genera al abrir el modal),
     no por documento: así el PDF y la imagen que salen de la misma
     apertura comparten referencia, aunque se descarguen en momentos
     distintos. Fecha + 4 caracteres al azar alcanza para diferenciar
     cotizaciones sin backend ni contador persistente — no hace falta que
     sea único a nivel mundial, solo que sirva de referencia entre Camilo
     y quien cotizó. Alfabeto sin 0/O ni 1/I para que no se confundan al
     leerlo en voz alta. */
  function generateQuoteNumber() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
    return 'COT-' + y + m + day + '-' + suffix;
  }

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

    const plazoEl = document.getElementById('calcPlazo');
    if (plazoEl) plazoEl.textContent = result.plazo;

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
      return 'error';
    }
    /* Todo lo de abajo queda envuelto en un try/catch a propósito: sin él,
       cualquier fallo inesperado del navegador dibujando el PDF (visto
       primero en iOS, confirmado después en Android/Edge) no truena nada
       en consola visible ni avisa — el botón "no hace nada", que es
       justo lo contrario de la regla de CLAUDE.md de fallar ruidosamente. */
    try {
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
      /* Fila label-izquierda/valor-derecha que puede llevar un valor
         largo (método de entrega, un "Otro" escrito a mano) — a
         diferencia de las filas de valor fijo (Resolución, extras), que
         nunca necesitan envolver. Mide antes de decidir entre una línea
         o el valor envuelto debajo, y siempre deja el font en
         normal/S(10.5) al terminar, sin importar qué rama tomó: dejarlo
         en cualquier otro estado filtraría a la fila siguiente, que no
         vuelve a fijar su propio font por su cuenta. */
      function wrapSafeRow(label, value) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(S(10.5)); doc.setTextColor(0, 51, 102);
        put(label, y);
        const fits = doc.getTextWidth(value) <= (pageW - mx * 2) * 0.58;
        if (fits) {
          textRight(value, y);
        } else {
          y += S(14);
          doc.setFontSize(S(9.5));
          doc.splitTextToSize(value, pageW - mx * 2).forEach((line, i) => {
            if (i > 0) y += S(13);
            put(line, y);
          });
        }
        doc.setFont('helvetica', 'normal'); doc.setFontSize(S(10.5));
      }

      doc.setFont('helvetica', 'bold'); doc.setFontSize(S(10.5)); doc.setTextColor(227, 100, 20);
      put('CAMILO CREATIVO', y);

      y += S(32);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(S(22)); doc.setTextColor(0, 51, 102);
      put(nombre ? ('Cotización para ' + nombre) : 'Cotización de edición de video', y);

      y += S(17);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(S(9.5)); doc.setTextColor(135, 135, 135);
      const today = new Date();
      put(today.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }), y);
      if (currentQuoteNumber) textRight(currentQuoteNumber, y);

      y += S(14);
      doc.setFontSize(S(8.5));
      put('Válida hasta el ' + formatValidUntil(today), y);

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

      y += S(23);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(S(11)); doc.setTextColor(0, 51, 102);
      put('Entrega estimada', y);
      doc.setFont('helvetica', 'bold'); textRight(result.plazo, y);

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
      wrapSafeRow('Almacenamiento de entrega', formatAlmacenamiento(state, details));

      y += S(20);
      const mcOn = state.multicam;
      doc.setTextColor(mcOn ? 0 : 178, mcOn ? 51 : 178, mcOn ? 102 : 178);
      put(PRICING.multicamLabel, y);
      textRight(mcOn ? 'Sí' : 'No aplica', y);

      y += S(20);
      const rushOn = state.urgente;
      doc.setTextColor(rushOn ? 0 : 178, rushOn ? 51 : 178, rushOn ? 102 : 178);
      put(PRICING.rushLabel, y);
      textRight(rushOn ? ('Sí (+' + Math.round(PRICING.rushPct * 100) + '%)') : 'No aplica', y);

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
        addWrapped('Guion o estructura', details.guion || 'No especificado');
        addWrapped('Formato', details.formato.length ? details.formato.join(', ') : 'No especificado');
        addWrapped('Estilo', details.estilo.length ? details.estilo.join(', ') : 'No especificado');
        addWrapped('Tono', details.tono.length ? details.tono.join(', ') : 'No especificado');
        addWrapped('Ritmo', details.ritmo.length ? details.ritmo.join(', ') : 'No especificado');
        addWrapped('Requerimientos específicos', details.requerimientos || 'Ninguno');

        /* Especificaciones de exportación: antes era un solo resumen que
           unía solo los parámetros que la persona cambiaba, así que
           dejar todo en "Estándar" hacía que el bloque entero
           desapareciera del documento — Camilo lo reportó como que el
           formato de audio "no se veía". Ahora cada uno de los cinco
           parámetros es su propia fila, con "No especificado" cuando
           quedó en Estándar, igual que el resto de los campos de
           PROYECTO — y separados en Video/Audio, como ya está agrupado
           el formulario. */
        y += S(22);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(S(8)); doc.setTextColor(0, 51, 102);
        put('ESPECIFICACIONES DE EXPORTACIÓN — VIDEO', y);
        y += S(16);
        wrapSafeRow('Formato de archivo', details.expContainer || 'No especificado');
        y += S(18);
        wrapSafeRow('Códec de video', details.expVideoCodec || 'No especificado');
        y += S(18);
        wrapSafeRow('Cuadros por segundo', details.expFps || 'No especificado');

        y += S(22);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(S(8)); doc.setTextColor(0, 51, 102);
        put('ESPECIFICACIONES DE EXPORTACIÓN — AUDIO', y);
        y += S(16);
        wrapSafeRow('Códec de audio', details.expAudioCodec || 'No especificado');
        y += S(18);
        wrapSafeRow('Frecuencia de muestreo', details.expSampleRate || 'No especificado');
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

      y += S(12);
      put('Cambios de alcance respecto a lo descrito aqui pueden requerir una nueva cotizacion.', y);

      return y;
    }

    const neededHeight = layout(1, false) - topY;
    const scale = neededHeight > available ? available / neededHeight : 1;

    doc.setFillColor(227, 100, 20);
    doc.rect(0, 0, pageW, 10, 'F');
    layout(scale, true);

    const filename = 'cotizacion-camilo-creativo' + (nombre ? '-' + slugify(nombre) : '') + '.pdf';

    /* `doc.save()` simula un clic en un <a download> hacia un blob: URL.
       Primero se confirmó que iOS (todo navegador ahí, todos WebKit) ignora
       esa propiedad y solo navega al blob sin descargar nada. Camilo probó
       el arreglo desde un Android con Edge y seguía sin pasar nada —el
       mismo truco falla también ahí, no es exclusivo de iOS—, así que la
       condición pasó de "es iOS" a "es un celular": en cualquier navegador
       móvil se abre el blob en una pestaña nueva en vez de intentar
       `doc.save()`, y ahí el visor de PDF nativo deja compartir/guardar en
       un toque. En escritorio nada cambia. */
    if (isMobileDevice()) {
      const opened = window.open(doc.output('bloburl'), '_blank');
      if (!opened) {
        showToast('El navegador bloqueó la pestaña del PDF — permite ventanas emergentes en este sitio e intenta de nuevo.');
        return 'error';
      }
      return 'tab';
    }
    doc.save(filename);
    return 'download';
    } catch (err) {
      showToast('No pude generar el PDF: ' + (err && err.message ? err.message : 'ocurrió un error') + '. Intenta de nuevo.');
      return 'error';
    }
  }

  /* iPadOS se anuncia como "Macintosh" desde 2019, así que el user agent
     solo no alcanza: se distingue de un Mac de verdad por tener pantalla
     táctil (`maxTouchPoints`), algo que ningún Mac trae. */
  function isMobileDevice() {
    return /Android|iP(hone|od|ad)/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  /* "Ana Pérez" -> "ana-perez", para nombrar el PNG de la cotización con
     detalles. Comparte la normalización que antes vivía en el PDF. */
  function slugify(text) {
    return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  /* 15 días de vigencia, pedido explícito de Camilo — protege contra un
     PDF viejo que alguien retoma meses después con precios que ya
     cambiaron. */
  function formatValidUntil(fromDate) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + 15);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /* Reemplaza a buildSimpleWhatsappText(): Camilo pidió que el mensaje
     lleve todo el desglose (antes era un saludo corto porque el detalle
     vivía solo en la imagen/PDF). Ahora que "Confirmar y enviar" ya no
     depende de que la imagen viaje adjunta —ver confirmAndSend()—, el
     texto es la garantía de que la información completa llega a Camilo
     sin importar si la persona además adjunta el PDF o no. Mismo
     contenido y mismo criterio que generatePdf() (todos los extras y
     recargos, marcados o no) pero en texto plano con *negrita* de
     WhatsApp, no en un documento aparte. */
  function buildDetailedWhatsappText(state, result, details) {
    const nombre = details && details.nombre;
    const lines = [];
    lines.push('Hola Camilo!' + (nombre ? ' Soy ' + nombre + '.' : '') + ' Aquí está mi cotización:');
    if (currentQuoteNumber) lines.push('_Referencia: ' + currentQuoteNumber + '_');
    lines.push('');
    lines.push('*Nivel:* ' + PRICING.tiers[state.tier].label);
    lines.push('*Duración:* ' + formatDuration(state));
    lines.push('*Entrega estimada:* ' + result.plazo);
    lines.push('');
    lines.push('*Extras:*');
    PRICING.extras.forEach(ex => {
      const on = state.extras.indexOf(ex.id) !== -1;
      lines.push('- ' + ex.label + ': ' + (on ? 'Sí' : 'No aplica'));
    });
    lines.push('');
    lines.push('*Recargos:*');
    lines.push('- Resolución de entrega: ' + PRICING.resolucion[state.resolucion].label);
    lines.push('- Almacenamiento de entrega: ' + formatAlmacenamiento(state, details));
    lines.push('- ' + PRICING.multicamLabel + ': ' + (state.multicam ? 'Sí' : 'No aplica'));
    lines.push('- ' + PRICING.rushLabel + ': ' + (state.urgente ? ('Sí (+' + Math.round(PRICING.rushPct * 100) + '%)') : 'No aplica'));
    const revIncluded = PRICING.tiers[state.tier].revisions;
    lines.push('- Revisiones incluidas: ' + revIncluded + (revIncluded === 1 ? ' ronda' : ' rondas'));
    const revExtra = state.extraRevisions || 0;
    lines.push('- Rondas de revisión extra: ' + (revExtra > 0 ? (revExtra + ' (+' + Math.round(PRICING.revisionExtraPct * revExtra * 100) + '%)') : 'No aplica'));

    if (details) {
      lines.push('');
      lines.push('*Proyecto:*');
      lines.push('- Descripción: ' + (details.descripcion || 'No especificada'));
      lines.push('- Guion o estructura: ' + (details.guion || 'No especificado'));
      lines.push('- Formato: ' + (details.formato.length ? details.formato.join(', ') : 'No especificado'));
      lines.push('- Estilo: ' + (details.estilo.length ? details.estilo.join(', ') : 'No especificado'));
      lines.push('- Tono: ' + (details.tono.length ? details.tono.join(', ') : 'No especificado'));
      lines.push('- Ritmo: ' + (details.ritmo.length ? details.ritmo.join(', ') : 'No especificado'));
      lines.push('- Requerimientos específicos: ' + (details.requerimientos || 'Ninguno'));
      lines.push('- Formato de archivo: ' + (details.expContainer || 'No especificado'));
      lines.push('- Códec de video: ' + (details.expVideoCodec || 'No especificado'));
      lines.push('- Cuadros por segundo: ' + (details.expFps || 'No especificado'));
      lines.push('- Códec de audio: ' + (details.expAudioCodec || 'No especificado'));
      lines.push('- Frecuencia de muestreo: ' + (details.expSampleRate || 'No especificado'));
    }

    lines.push('');
    lines.push('*Estimado: $' + result.total + ' USD*');
    lines.push('_Válida hasta el ' + formatValidUntil(new Date()) + '. No es una cotización cerrada — puede variar según el detalle del proyecto. Cambios de alcance pueden requerir una nueva cotización._');
    lines.push('');
    lines.push('También descargué el PDF completo — te lo mando si lo quieres ver. ¿Hablamos?');

    return lines.join('\n');
  }

  const calcModal = document.getElementById('calcModal');
  const calcExportBtn = document.getElementById('calcExportBtn');
  const calcWhatsappBtn = document.getElementById('calcWhatsappBtn');
  let calcLastFocused = null;

  function openCalcModal() {
    if (!calcModal) return;
    calcLastFocused = document.activeElement;
    currentQuoteNumber = generateQuoteNumber();
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
    const mode = generatePdf(calcCurrentState, calcCurrentResult);
    if (mode === 'tab') showToast('Tu cotización se abrió en una pestaña nueva — toca "Compartir" para guardarla como PDF.');
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
  let detailsLastFocused = null;

  function readDetailsState() {
    const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    /* El pill "Otro" no se reporta como el texto "Otro": se resuelve
       contra el input que revela (`data-other`), y si la persona no
       escribió nada igual se avisa que marcó "Otro" sin especificar,
       en vez de perder la selección en silencio. */
    const checked = name => !detailsModal ? [] : Array.from(detailsModal.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(el => {
        if (el.value === 'otro') {
          const other = el.dataset.other ? document.getElementById(el.dataset.other) : null;
          const custom = other ? other.value.trim() : '';
          return custom ? ('Otro: ' + custom) : 'Otro (sin especificar)';
        }
        return el.nextElementSibling ? el.nextElementSibling.textContent : el.value;
      });
    /* Mismo tratamiento que el pill "Otro" de arriba, pero para un
       <select>: si vale "otro", se resuelve contra su campo de texto
       (o "Otro (sin especificar)" si quedó vacío); si no, el valor tal
       cual — vacío para "Estándar", que el PDF/imagen convierten en
       "No especificado" al mostrarlo, en vez de omitir el parámetro en
       silencio como hacía el resumen anterior. */
    const selVal = (id, otherId) => {
      const el = document.getElementById(id);
      if (!el) return '';
      if (el.value === 'otro') {
        const other = document.getElementById(otherId);
        const custom = other ? other.value.trim() : '';
        return custom || 'Otro (sin especificar)';
      }
      return el.value;
    };
    return {
      nombre: val('detName'),
      descripcion: val('detDescripcion'),
      guion: val('detGuion'),
      formato: checked('detFormato'),
      estilo: checked('detEstilo'),
      tono: checked('detTono'),
      ritmo: checked('detRitmo'),
      requerimientos: val('detRequerimientos'),
      expContainer: selVal('detExpContainer', 'detExpContainerOtro'),
      expVideoCodec: selVal('detExpVideoCodec', 'detExpVideoCodecOtro'),
      expFps: selVal('detExpFps', 'detExpFpsOtro'),
      expAudioCodec: selVal('detExpAudioCodec', 'detExpAudioCodecOtro'),
      expSampleRate: selVal('detExpSampleRate', 'detExpSampleRateOtro'),
      almacenamientoMetodo: val('detAlmacenamientoMetodo')
    };
  }

  /* El campo de método de entrega solo tiene sentido si el cliente
     aporta el almacenamiento — si lo aporta Camilo, ya se sabe que es
     por Drive y no hace falta preguntar nada más. Se decide acá, al
     abrir, en vez de en el radio de la calculadora, porque es un dato
     del proyecto (dónde vive el archivo), no del precio. */
  function openDetailsModal() {
    if (!detailsModal) return;
    detailsLastFocused = document.activeElement;
    const almacenField = document.getElementById('detAlmacenamientoField');
    if (almacenField) almacenField.hidden = !calcCurrentState || calcCurrentState.almacenamiento !== 'cliente';
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

  /* Cada pill "Otro" (Formato/Estilo/Tono/Ritmo) revela su propio campo
     de texto vía `data-other`, en vez de un solo campo compartido —así
     "Otro" en Estilo no se confunde con "Otro" en Tono si alguien marca
     los dos. */
  if (detailsModal) {
    detailsModal.querySelectorAll('input[value="otro"]').forEach(el => {
      const other = el.dataset.other ? document.getElementById(el.dataset.other) : null;
      if (!other) return;
      el.addEventListener('change', () => {
        other.hidden = !el.checked;
        if (el.checked) other.focus();
      });
    });
    /* Mismo mecanismo que las pills, adaptado a un <select>: revela su
       campo de texto cuando el valor elegido es "otro", en vez de
       cuando un checkbox se marca. */
    detailsModal.querySelectorAll('select[data-other]').forEach(sel => {
      const other = document.getElementById(sel.dataset.other);
      if (!other) return;
      sel.addEventListener('change', () => {
        other.hidden = sel.value !== 'otro';
        if (sel.value === 'otro') other.focus();
      });
    });
  }

  /* `wa.me/<número>` sigue siendo el único camino: es la única vía que
     garantiza que el mensaje llega al chat de Camilo, sin selector de
     apps de por medio — ver el historial en [[Estructura del sitio]].
     La imagen por portapapeles se retira: ya no hace falta un mecanismo
     aparte para que el detalle llegue "adjunto", porque ahora el texto
     mismo lo lleva completo (buildDetailedWhatsappText()). El PDF se
     descarga automáticamente al confirmar, como respaldo visual
     opcional — si la persona quiere, lo adjunta ella misma; si no, el
     texto ya tiene todo lo que Camilo necesita para responder. */
  function confirmAndSend() {
    if (!calcCurrentState || !calcCurrentResult) updateCalc();
    const details = readDetailsState();
    const text = buildDetailedWhatsappText(calcCurrentState, calcCurrentResult, details);

    /* WhatsApp abre primero. En celular, generatePdf() también puede abrir
       una pestaña (ver isMobileDevice() más abajo) — si el navegador solo
       deja pasar una ventana emergente por gesto, que se sacrifique la
       del PDF y no la de WhatsApp, que es "el canal que de verdad cierra
       una consulta" (ver más abajo, "Los botones de enviar cambiaron de
       peso visual"). */
    window.open('https://wa.me/573213275783?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
    const mode = generatePdf(calcCurrentState, calcCurrentResult, details);
    if (mode === 'tab') {
      showToast('Te abrí WhatsApp con todos los detalles — tu cotización en PDF se abrió en otra pestaña, mándasela también si quieres que Camilo la vea completa.');
    } else if (mode !== 'error') {
      showToast('Descargué tu cotización en PDF y te abrí WhatsApp con todos los detalles — mándale el PDF también si quieres que Camilo lo vea completo.');
    }
    closeDetailsModal();
  }

  const detailsPdfBtn = document.getElementById('detailsPdfBtn');
  if (detailsPdfBtn) detailsPdfBtn.addEventListener('click', () => {
    if (!calcCurrentState || !calcCurrentResult) updateCalc();
    const mode = generatePdf(calcCurrentState, calcCurrentResult, readDetailsState());
    if (mode === 'tab') showToast('Tu cotización se abrió en una pestaña nueva — toca "Compartir" para guardarla como PDF.');
  });
  /* Dos botones —arriba y al final del formulario, ya largo con guion,
     tags y especificaciones de exportación— para que nadie tenga que
     bajar todo el modal solo para encontrar "Confirmar y enviar". */
  document.querySelectorAll('[data-details-confirm]').forEach(btn => btn.addEventListener('click', confirmAndSend));
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
