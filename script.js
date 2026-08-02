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

  /* ---------- Estado de filtros ---------- */
  const filterState = { category: 'all', tag: 'all' };

  function getTagsForCategory(categoryId) {
    const relevant = categoryId === 'all' ? categories : categories.filter(c => c.id === categoryId);
    const tagSet = new Set();
    relevant.forEach(c => c.videos.forEach(v => (v.tags || []).forEach(t => tagSet.add(t))));
    return Array.from(tagSet);
  }

  const playIconSVG = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;

  /* ---------- Utilidades ---------- */
  function extractYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  }

  function toEmbedUrl(url) {
    if (!url) return '';
    const ytId = extractYouTubeId(url);
    if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
    return url;
  }

  function resolveThumbnail(video) {
    const ytId = extractYouTubeId(video.thumbnail) || extractYouTubeId(video.embed);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    return video.thumbnail || '';
  }

  /* ---------- Render del portafolio ---------- */
  function renderPortfolio() {
    const filtersEl = document.getElementById('portfolioFilters');
    const categoriesEl = document.getElementById('portfolioCategories');
    if (!filtersEl || !categoriesEl) return;

    const filterButtons = [{ id: 'all', title: 'Todos' }, ...categories.map(c => ({ id: c.id, title: c.title }))];
    filtersEl.innerHTML = filterButtons
      .map((f, i) => `<button class="filter-btn${i === 0 ? ' active' : ''}" data-filter="${f.id}">${f.title}</button>`)
      .join('');

    categoriesEl.innerHTML = categories.map(cat => `
      <div class="portfolio-category" data-category="${cat.id}">
        <div class="portfolio-category-inner">
          <div class="category-header">
            <h3>${cat.title}</h3>
            <p>${cat.description}</p>
          </div>
          <div class="portfolio-grid">
            ${cat.videos.map(v => renderVideoCard(v, cat.id)).join('')}
          </div>
        </div>
      </div>
    `).join('');

    filtersEl.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => setCategoryFilter(btn.dataset.filter));
    });

    categoriesEl.querySelectorAll('.video-card').forEach(card => {
      card.addEventListener('click', () => onVideoCardClick(card));
    });

    renderTagFilters();
  }

  function renderVideoCard(video, categoryId) {
    const thumbnailUrl = resolveThumbnail(video);
    const thumb = thumbnailUrl
      ? `<img src="${thumbnailUrl}" alt="${video.title}" loading="lazy">`
      : '';
    const tags = video.tags || [];
    const badges = tags.map(t => `<span class="video-badge">${t}</span>`).join('');
    return `
      <article class="video-card" data-category="${categoryId}" data-tags="${tags.join('|')}" data-embed="${video.embed || ''}" data-orientation="${video.orientation || 'portrait'}" tabindex="0" role="button" aria-label="Reproducir ${video.title}">
        <div class="video-thumb">
          <div class="video-badges">${badges}</div>
          ${thumb}
          <span class="play-icon">${playIconSVG}</span>
        </div>
        <div class="video-info">
          <h4>${video.title}</h4>
          <span>${tags.join(' · ')}</span>
        </div>
      </article>
    `;
  }

  /* ---------- Filtro por tipo (categoría) + filtro por etiqueta ---------- */
  function setCategoryFilter(categoryId) {
    filterState.category = categoryId;
    filterState.tag = 'all';
    document.querySelectorAll('#portfolioFilters .filter-btn')
      .forEach(b => b.classList.toggle('active', b.dataset.filter === categoryId));
    renderTagFilters();
    applyFilters();
  }

  function setTagFilter(tag) {
    filterState.tag = tag;
    document.querySelectorAll('#portfolioTagFilters .filter-btn')
      .forEach(b => b.classList.toggle('active', b.dataset.tag === tag));
    applyFilters();
  }

  function renderTagFilters() {
    const tagFiltersEl = document.getElementById('portfolioTagFilters');
    if (!tagFiltersEl) return;

    const tags = getTagsForCategory(filterState.category);
    if (tags.length === 0) {
      tagFiltersEl.innerHTML = '';
      tagFiltersEl.classList.add('is-empty');
      return;
    }
    tagFiltersEl.classList.remove('is-empty');

    const tagButtons = [{ id: 'all', title: 'Todas las etiquetas' }, ...tags.map(t => ({ id: t, title: t }))];
    tagFiltersEl.innerHTML = tagButtons
      .map(t => `<button class="filter-btn filter-btn-tag${t.id === filterState.tag ? ' active' : ''}" data-tag="${t.id}">${t.title}</button>`)
      .join('');

    tagFiltersEl.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => setTagFilter(btn.dataset.tag));
    });
  }

  function applyFilters() {
    document.querySelectorAll('.portfolio-category').forEach(block => {
      const categoryMatches = filterState.category === 'all' || block.dataset.category === filterState.category;
      let anyVisible = false;
      block.querySelectorAll('.video-card').forEach(card => {
        const cardTags = (card.dataset.tags || '').split('|').filter(Boolean);
        const tagMatches = filterState.tag === 'all' || cardTags.includes(filterState.tag);
        const visible = categoryMatches && tagMatches;
        card.classList.toggle('hidden', !visible);
        if (visible) anyVisible = true;
      });
      block.classList.toggle('is-hidden', !anyVisible);
    });
  }

  /* ---------- Modal de video ---------- */
  const modal = document.getElementById('videoModal');
  const modalVideo = document.getElementById('modalVideo');

  function openModal(embedUrl) {
    modalVideo.innerHTML = `<iframe src="${toEmbedUrl(embedUrl)}" title="Reproductor de video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalVideo.innerHTML = '';
    document.body.style.overflow = '';
  }

  function onVideoCardClick(card) {
    const embed = card.dataset.embed;
    if (embed) {
      openModal(embed);
    } else {
      showToast(`"${card.querySelector('h4').textContent}" próximamente 🎬`);
    }
  }

  document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  /* ---------- Contacto por correo ---------- */
  const emailCard = document.querySelector('.contact-card[href^="mailto:"]');
  if (emailCard) {
    emailCard.addEventListener('click', () => {
      const email = emailCard.getAttribute('href').replace('mailto:', '').split('?')[0];
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).catch(() => {});
      }
      showToast(`Correo copiado: ${email}`);
    });
  }

  /* ---------- Navegación móvil ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Header al hacer scroll + link activo ---------- */
  const header = document.getElementById('siteHeader');
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-link[href^="#"]');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);

    let current = sections[0] ? sections[0].id : '';
    const scrollPos = window.scrollY + window.innerHeight * 0.35;
    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) current = section.id;
    });
    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
  }
  document.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('in-view'));
  }

  /* ---------- Año del footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Init ---------- */
  renderPortfolio();
  onScroll();
})();
