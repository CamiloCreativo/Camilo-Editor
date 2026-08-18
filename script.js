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
        { title: 'Introspección de un rodaje', tags: ['Mini documental', 'Ficción', 'Cine'], orientation: 'landscape', embed: 'https://youtu.be/HvZB4duQxyM?si=-sdYFZnEhtfPqyg2', thumbnail: 'https://youtu.be/HvZB4duQxyM?si=-sdYFZnEhtfPqyg2' }
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

  function toEmbedUrl(url) {
    if (!url) return '';
    const ytId = extractYouTubeId(url);
    if (ytId) return 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0';
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return 'https://player.vimeo.com/video/' + vimeo[1] + '?autoplay=1';
    return url;
  }

  function resolveThumbnail(video) {
    const ytId = extractYouTubeId(video.thumbnail) || extractYouTubeId(video.embed);
    if (ytId) return 'https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg';
    return video.thumbnail || '';
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
          (thumbUrl ? '<img src="' + esc(thumbUrl) + '" alt="" loading="lazy">' : '') +
          '<span class="piece__play">' + playIconSVG + '</span>' +
        '</span>' +
        '<span class="piece__meta">' +
          '<span class="piece__name">' + esc(v.title) + '</span>' +
          (tags.length ? '<span class="piece__tags">' + esc(tags.join(' · ')) + '</span>' : '') +
        '</span>' +
      '</button>';
    }).join('');

    deckEl.querySelectorAll('.piece').forEach(el => {
      el.addEventListener('click', () => onPieceClick(el));
    });
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
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) closeModal();
    // El foco no se escapa del modal mientras está abierto.
    if (e.key === 'Tab' && modal && modal.classList.contains('is-open')) {
      const focusables = modal.querySelectorAll('button, iframe, [href]');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

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
  const sections = document.querySelectorAll('main section[id]');
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
  onScroll();

  /* motion.js consume esto. Si motion.js no llega a correr,
     nada de lo de arriba se rompe. */
  window.CCData = { pieces, categories, deckEl };
})();
