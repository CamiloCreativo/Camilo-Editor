/* =========================================================
   CAMILO CREATIVO — coreografía
   GSAP 3.15.0 · ScrollTrigger · Flip · SplitText

   REGLA DE ORO: este archivo APLICA los estados iniciales.
   El CSS ya entrega la página final y legible. Si esto no
   corre —CDN caído, JS bloqueado, movimiento reducido— el
   sitio se ve entero. Nunca al revés.
   ========================================================= */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined'
    && typeof window.ScrollTrigger !== 'undefined';

  // Dos motivos para no hacer nada. En ambos la página ya está bien.
  if (reduce || !hasGSAP) return;

  gsap.registerPlugin(ScrollTrigger);
  if (window.Flip) gsap.registerPlugin(Flip);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  const deck = document.getElementById('workDeck');
  const stage = document.getElementById('workStage');
  const frame = document.getElementById('workFrame');
  const titles = document.getElementById('workTitles');

  /* Dispersión determinista: la misma pieza cae siempre en el mismo
     sitio. Con Math.random() el hero cambiaría en cada recarga. */
  const seeded = (i, salt) => {
    const x = Math.sin((i + 1) * 127.1 + salt * 311.7) * 43758.5453;
    return x - Math.floor(x);            // 0..1 estable
  };

  const splits = [];
  const makeSplit = el => {
    if (!window.SplitText) return null;
    // Solo titulares cortos. Un párrafo partido en caracteres
    // destroza a los lectores de pantalla.
    const label = el.textContent.trim();
    el.setAttribute('aria-label', label);
    const s = new SplitText(el, { type: 'chars', charsClass: 'ch' });
    s.chars.forEach(c => c.setAttribute('aria-hidden', 'true'));
    splits.push(s);
    return s;
  };

  /* =======================================================
     INTRO — se arma el nombre. Una vez por sesión.
     ======================================================= */
  function playIntro(done) {
    const intro = document.getElementById('intro');
    const already = sessionStorage.getItem('cc_intro') === '1';

    if (!intro || already) { if (intro) intro.remove(); done(); return; }

    sessionStorage.setItem('cc_intro', '1');
    intro.classList.add('is-on');
    document.body.style.overflow = 'hidden';

    const words = intro.querySelectorAll('.intro__type span');
    const chars = [];
    words.forEach(w => {
      const s = new SplitText(w, { type: 'chars', charsClass: 'ch' });
      chars.push(...s.chars);
    });

    gsap.set(chars, {
      opacity: 0,
      x: i => (seeded(i, 3) - 0.5) * 620,
      y: i => (seeded(i, 7) - 0.5) * 420,
      rotation: i => (seeded(i, 11) - 0.5) * 150,
      scale: i => 0.4 + seeded(i, 13) * 1.4
    });

    gsap.timeline({
      onComplete: () => {
        intro.remove();
        document.body.style.overflow = '';
        done();
      }
    })
      .to(chars, {
        opacity: 1, x: 0, y: 0, rotation: 0, scale: 1,
        duration: 1.05, ease: 'expo.out', stagger: { each: 0.022, from: 'random' }
      })
      .to(intro.querySelector('.intro__wipe'), {
        scaleY: 1, duration: 0.55, ease: 'expo.inOut'
      }, '+=0.18')
      .to(intro, { opacity: 0, duration: 0.3, ease: 'power2.in' });
  }

  /* =======================================================
     HERO — colisión de capas
     ======================================================= */
  function hero() {
    const words = gsap.utils.toArray('[data-hero-word]');
    const echo = document.querySelector('.hero__echo');
    const stroke = document.querySelector('.hero__stroke');
    const block = document.querySelector('.hero__block');
    const line = document.querySelector('.hero__line');
    const cue = document.querySelector('.hero__cue');

    // Entrada: cada palabra llega desde un lado distinto, con inclinación.
    gsap.from(words, {
      yPercent: 118, rotation: 4, opacity: 0,
      duration: 1.15, ease: 'expo.out', stagger: 0.08
    });
    if (block) gsap.from(block, { scaleY: 0, transformOrigin: 'bottom', duration: 1.1, ease: 'expo.inOut' }, 0);
    if (echo) gsap.from(echo, { opacity: 0, scale: 1.14, duration: 1.5, ease: 'power2.out' }, 0);
    if (stroke) gsap.from(stroke, { opacity: 0, x: -60, duration: 1.3, ease: 'expo.out' }, 0);
    gsap.from([line, cue], { opacity: 0, y: 22, duration: 0.9, ease: 'power2.out', delay: 0.45, stagger: 0.1 });

    // Al salir, las capas se separan a distinta velocidad: la palabra se desarma.
    gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    })
      .to(words[0], { xPercent: -16, ease: 'none' }, 0)
      .to(words[1], { xPercent: 14, ease: 'none' }, 0)
      .to(echo, { yPercent: -26, ease: 'none' }, 0)
      .to(stroke, { xPercent: 22, yPercent: 10, ease: 'none' }, 0)
      .to(block, { yPercent: 34, ease: 'none' }, 0)
      .to(line, { opacity: 0, y: -30, ease: 'none' }, 0);

    // Parallax de ratón, solo con puntero fino (escritorio).
    if (window.matchMedia('(pointer: fine)').matches) {
      const layers = [
        { el: echo, k: 26 }, { el: stroke, k: -18 }, { el: block, k: 12 }
      ].filter(l => l.el);
      const move = e => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        layers.forEach(l => gsap.to(l.el, {
          x: nx * l.k, y: ny * l.k * 0.6, duration: 0.9, ease: 'power2.out', overwrite: 'auto'
        }));
      };
      document.querySelector('.hero').addEventListener('mousemove', move);
    }
  }

  /* =======================================================
     TITULARES — caracteres, solo en frases cortas
     ======================================================= */
  function headings() {
    gsap.utils.toArray('[data-split]').forEach(el => {
      const s = makeSplit(el);
      if (!s) return;
      gsap.from(s.chars, {
        opacity: 0,
        yPercent: 110,
        rotationX: -78,
        transformOrigin: '50% 100% -30px',
        duration: 0.75,
        ease: 'expo.out',
        stagger: 0.028,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
  }

  /* =======================================================
     TRABAJO — desfile, dispersión y abanico
     ======================================================= */
  /* Reparte las piezas alternando orientación. Sin esto salen las tres
     verticales juntas y luego las tres apaisadas, y el arco queda con un
     bloque alto y otro bajo en vez de tener ritmo. */
  function intercalar(list) {
    const v = list.filter(e => e.dataset.orientation !== 'landscape');
    const h = list.filter(e => e.dataset.orientation === 'landscape');
    const out = [];
    while (v.length || h.length) {
      if (v.length) out.push(v.shift());
      if (h.length) out.push(h.shift());
    }
    return out;
  }

  function fanCoords(list) {
    const out = [];
    const n = list.length;
    if (!n) return out;

    const W = deck.clientWidth;
    const H = deck.clientHeight;
    const ws = list.map(el => el.offsetWidth || 200);
    const hs = list.map(el => el.offsetHeight || 300);

    // Todas comparten ancho, así que el avance es uniforme.
    const solape = 0.72;
    const avance = ws.map(w => w * solape);
    let total = ws[n - 1];
    for (let i = 0; i < n - 1; i++) total += avance[i];

    // Margen real de seguridad: la rotación ensancha la huella.
    const disponible = W - 90;
    const k = total > disponible ? disponible / total : 1;

    let x = (W - total * k) / 2;
    const eje = H / 2;

    list.forEach((el, i) => {
      const mid = (n - 1) / 2;
      const u = n === 1 ? 0 : (i - mid) / mid;      // -1 .. 1
      out.push({
        x: x,
        // Cada pieza se centra en el MISMO eje pese a tener alturas
        // distintas: si no, las apaisadas quedarían colgando arriba.
        y: eje - hs[i] / 2 + u * u * 52,
        rotation: u * 7.5,
        z: 100 - Math.round(Math.abs(u) * 40)
      });
      x += avance[i] * k;
    });
    return out;
  }

  function layoutFan(animate) {
    if (!deck) return;
    const list = intercalar(Array.from(deck.querySelectorAll('.piece')).filter(el => !el.hidden));
    const coords = fanCoords(list);
    list.forEach((el, i) => {
      const c = coords[i];
      const props = { x: c.x, y: c.y, rotation: c.rotation, zIndex: c.z, opacity: 1, scale: 1 };
      if (animate) gsap.to(el, { ...props, duration: 0.6, ease: 'expo.inOut' });
      else gsap.set(el, props);
    });
  }

  function work() {
    if (!deck || !stage) return;
    const cards = gsap.utils.toArray('.piece', deck);
    if (!cards.length) return;

    deck.classList.add('is-fan');
    if (frame) frame.classList.add('is-on');
    if (titles && window.innerWidth > 1024) titles.classList.add('is-on');

    const lis = titles ? Array.from(titles.querySelectorAll('li')) : [];
    const W = deck.clientWidth;
    const H = deck.clientHeight || 700;
    const cw = cards[0].offsetWidth || 240;
    const ch = cards[0].offsetHeight || 420;

    // El marco vive al 50%/50% del escenario y el mazo ya cubre el
    // escenario entero: por eso el centro del mazo ES el del marco.
    const parkX = W / 2 - cw / 2;
    const parkY = H / 2 - ch / 2;
    const step = ch * 1.18;

    // Coordenadas de las tres fases
    const paradeY = cards.map((_, i) => parkY + i * step);
    const scatter = cards.map((_, i) => ({
      x: parkX + (seeded(i, 2) - 0.5) * Math.min(W * 0.86, 1000),
      y: parkY + (seeded(i, 5) - 0.5) * H * 0.44,
      rotation: (seeded(i, 9) - 0.5) * 34
    }));
    const orden = intercalar(cards);
    const fanPos = fanCoords(orden);
    // Devuelve las coordenadas al orden del DOM para poder indexar por i.
    const fan = cards.map(el => fanPos[orden.indexOf(el)]);

    cards.forEach((el, i) => gsap.set(el, {
      x: parkX, y: paradeY[i], rotation: 0, opacity: 1, scale: 0.9, zIndex: 10 + i
    }));

    const proxy = { p: 0 };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=260%',
        scrub: 0.8,
        pin: true,                 // PIN 2 de 2 en toda la página
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    // Fase 1 — desfile por el marco
    tl.to(proxy, {
      p: 1, ease: 'none',
      onUpdate: () => {
        const shift = proxy.p * step * cards.length;   // los pasa a todos por el marco
        cards.forEach((el, i) => gsap.set(el, { y: paradeY[i] - shift }));
        if (lis.length) {
          const idx = Math.min(cards.length - 1, Math.floor(proxy.p * cards.length));
          lis.forEach((li, i) => li.classList.toggle('is-lit', i === idx));
        }
      }
    }, 0);

    // Fase 2 — salen del marco y se dispersan
    tl.to(frame, { opacity: 0, scale: 1.25, ease: 'power2.in', duration: 0.35 }, 0.9);
    if (titles) tl.to(titles, { opacity: 0, ease: 'none', duration: 0.3 }, 0.9);
    cards.forEach((el, i) => {
      tl.to(el, {
        x: scatter[i].x, y: scatter[i].y, rotation: scatter[i].rotation,
        scale: 1, ease: 'power2.out', duration: 0.55
      }, 0.95 + i * 0.035);
    });

    // Fase 3 — se acomodan en abanico
    cards.forEach((el, i) => {
      tl.to(el, {
        x: fan[i].x, y: fan[i].y, rotation: fan[i].rotation, zIndex: fan[i].z,
        ease: 'expo.inOut', duration: 0.7
      }, 1.75 + i * 0.045);
    });

    // OJO: aquí NO va un ScrollTrigger que llame a layoutFan(). Se disparaba
    // durante el desfile y arrastraba las piezas al abanico antes de tiempo.
    // La fase 3 de la timeline ya las deja en su sitio.

    // El abanico no se queda quieto una vez acomodado. La flotación va sobre
    // .piece__thumb, NO sobre .piece: ahí viven las coordenadas del abanico y
    // pisarlas rompería la posición y el reacomodo por filtros.
    idle(cards);
    wireHover(cards);

    // La sombra de suelo entra cuando el abanico ya está formado.
    ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: '+=260%',
      onUpdate: self => stage.classList.toggle('is-settled', self.progress > 0.72)
    });
  }

  /* Vida propia del abanico: cada pieza respira a su ritmo. Periodos
     primos entre sí para que el conjunto no lata a la vez. */
  function idle(cards) {
    cards.forEach((el, i) => {
      const thumb = el.querySelector('.piece__thumb');
      if (!thumb) return;
      gsap.to(thumb, {
        y: (seeded(i, 21) - 0.5) * 22 - 6,
        rotation: (seeded(i, 23) - 0.5) * 2.6,
        duration: 2.9 + seeded(i, 27) * 2.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: seeded(i, 29) * 1.6
      });
    });
  }

  /* Reacomodo por filtros — aquí Flip sí es la herramienta:
     es un cambio de estado discreto, no una animación con scrub. */
  /* Al pasar por encima, la pieza sale del vaivén y se adelanta. */
  function wireHover(cards) {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    cards.forEach(el => {
      const thumb = el.querySelector('.piece__thumb');
      if (!thumb) return;
      el.addEventListener('pointerenter', () => {
        gsap.to(thumb, { scale: 1.045, duration: 0.45, ease: 'expo.out', overwrite: 'auto' });
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(thumb, { scale: 1, duration: 0.55, ease: 'expo.out', overwrite: 'auto' });
      });
    });
  }

  function wireFlip() {
    if (!window.Flip || !deck) return;
    window.CCMotion = window.CCMotion || {};
    window.CCMotion.reflow = mutate => {
      const targets = deck.querySelectorAll('.piece');
      const state = Flip.getState(targets, { props: 'opacity' });
      mutate();
      layoutFan(false);
      Flip.from(state, {
        duration: 0.6,
        ease: 'expo.inOut',
        absolute: true,
        zIndex: 100,
        onEnter: els => gsap.fromTo(els, { opacity: 0, scale: 0.78 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'expo.out' }),
        onLeave: els => gsap.to(els, { opacity: 0, scale: 0.78, duration: 0.3, ease: 'power2.in' })
      });
    };
  }

  /* =======================================================
     PROCESO — fragmentos. Bloques y líneas, NUNCA caracteres:
     partir párrafos por carácter arruina la lectura asistida.
     ======================================================= */
  function proc() {
    const stageEl = document.querySelector('.proc__stage');
    const frags = gsap.utils.toArray('.frag');
    const photo = document.querySelector('.proc__photo');
    if (!stageEl || !frags.length) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stageEl,
        start: 'top top',
        end: '+=190%',
        scrub: 0.7,
        pin: true,                 // PIN 1 de 2 en toda la página
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    frags.forEach((el, i) => {
      const fromLeft = i % 2 === 0;
      gsap.set(el, { opacity: 0, x: fromLeft ? -70 : 70, y: 26, rotation: fromLeft ? -1.4 : 1.4 });
      tl.to(el, { opacity: 1, x: 0, y: 0, rotation: 0, ease: 'expo.out', duration: 0.6 }, i * 0.42)
        .to(el, { opacity: 0.26, ease: 'none', duration: 0.5 }, i * 0.42 + 1.5);
    });

    if (photo) {
      gsap.set(photo, { opacity: 0, scale: 0.86, rotation: -9 });
      tl.to(photo, { opacity: 1, scale: 1, rotation: -2.2, ease: 'expo.out', duration: 0.7 }, 1.3);
    }
  }

  /* =======================================================
     TICKER — corre solo y reacciona a la velocidad del scroll
     ======================================================= */
  function ticker() {
    const row = document.getElementById('tickerRow');
    if (!row) return;
    const half = row.scrollWidth / 2;
    if (!half) return;

    const loop = gsap.to(row, {
      x: -half, duration: 22, ease: 'none', repeat: -1,
      modifiers: { x: gsap.utils.unitize(v => parseFloat(v) % half) }
    });

    ScrollTrigger.create({
      onUpdate: self => {
        const v = self.getVelocity();
        loop.timeScale(gsap.utils.clamp(-4, 4, 1 + v / 900));
        gsap.to(loop, { timeScale: 1, duration: 0.8, overwrite: true });
      }
    });
  }

  /* =======================================================
     CONTACTO — la tipografía choca con el bloque naranja.
     Sin pin: el presupuesto se gastó en proceso y trabajo.
     ======================================================= */
  function contact() {
    const sec = document.querySelector('.contact');
    const block = document.querySelector('.contact__block');
    const title = document.querySelector('.contact__title');
    const ctas = gsap.utils.toArray('.cta');
    if (!sec) return;

    if (block) {
      gsap.fromTo(block,
        { yPercent: -100 },
        { yPercent: 0, ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 30%', scrub: 0.6 } });
    }

    if (title) {
      gsap.from(title, {
        xPercent: -12, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top 72%', end: 'top 22%', scrub: 0.6 }
      });
    }

    gsap.from(ctas, {
      opacity: 0, y: 44, duration: 0.7, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: '.contact__actions', start: 'top 88%', once: true }
    });

    // Hover magnético, solo con puntero fino.
    if (window.matchMedia('(pointer: fine)').matches) {
      ctas.forEach(cta => {
        const val = cta.querySelector('.cta__value');
        cta.addEventListener('mousemove', e => {
          const r = cta.getBoundingClientRect();
          gsap.to(val, { x: ((e.clientX - r.left) / r.width - 0.5) * 26, duration: 0.5, ease: 'power2.out' });
        });
        cta.addEventListener('mouseleave', () => gsap.to(val, { x: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' }));
      });
    }
  }

  /* =======================================================
     MÓVIL — sin pins. Versión corta que no secuestra el scroll.
     ======================================================= */
  function mobile() {
    gsap.utils.toArray('.frag, .proc__photo, .piece').forEach(el => {
      gsap.from(el, {
        opacity: 0, y: 30, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });
    const sec = document.querySelector('.contact');
    if (sec) gsap.from('.cta', {
      opacity: 0, y: 26, duration: 0.55, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.contact__actions', start: 'top 92%', once: true }
    });
  }

  /* =======================================================
     ARRANQUE
     ======================================================= */
  function boot() {
    hero();
    headings();
    ticker();
    contact();
    wireFlip();

    const mm = gsap.matchMedia();
    mm.add('(min-width: 769px)', () => { work(); proc(); });
    mm.add('(max-width: 768px)', () => { mobile(); });

    // El pin necesita altura determinista: recalcular cuando las
    // miniaturas de YouTube terminen de cargar.
    let pending = 0;
    document.querySelectorAll('img').forEach(img => {
      if (img.complete) return;
      pending++;
      const settle = () => { if (--pending <= 0) ScrollTrigger.refresh(); };
      img.addEventListener('load', settle, { once: true });
      img.addEventListener('error', settle, { once: true });
    });

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { layoutFan(false); ScrollTrigger.refresh(); }, 220);
    });
  }

  // SplitText mide glifos: si Bebas todavía no cargó, parte mal.
  const start = () => playIntro(boot);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else window.addEventListener('load', start);

  // Devuelve el texto original a los lectores de pantalla al salir.
  window.addEventListener('pagehide', () => splits.forEach(s => s.revert()));
})();
