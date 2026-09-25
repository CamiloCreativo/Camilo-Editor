/* =========================================================
   CAMILO CREATIVO — coreografía
   GSAP 3.15.0 · ScrollTrigger · SplitText

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
  if (window.SplitText) gsap.registerPlugin(SplitText);
  if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);

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
        pin: true,                 // el único pin de la página
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
     Sin pin: más de dos pines pelean contra el scroll nativo.
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
     PRESENTACIÓN — la tarjeta y su línea entran una vez.
     SIN PIN: el presupuesto sigue siendo dos secciones
     fijadas —proceso y trabajo— y esta no entra en él.
     El titular no necesita código: lleva `data-split` y
     headings() ya recorre todos.
     ======================================================= */
  function pitch() {
    const sec = document.querySelector('.pitch');
    const player = document.getElementById('pitchPlayer');
    if (!sec || !player) return;

    const line = sec.querySelector('.pitch__line');
    const cue = sec.querySelector('.pitch__cue');

    gsap.from([player, line, cue].filter(Boolean), {
      opacity: 0, y: 30, duration: 0.7, ease: 'expo.out', stagger: 0.08,
      clearProps: 'transform',
      scrollTrigger: { trigger: sec, start: 'top 82%', once: true }
    });
  }

  /* =======================================================
     REDES FLOTANTES — el pulso y el anillo ya viven en CSS
     (así siguen sin JS). Esto solo añade la entrada: llegan
     de rebote un instante después de que el hero se asiente,
     para no competir con la palabra armándose.
     ======================================================= */
  function social() {
    const links = gsap.utils.toArray('.social__link');
    if (!links.length) return;

    gsap.from(links, {
      opacity: 0, scale: 0.4, y: 40,
      duration: 0.8, ease: 'back.out(1.7)', stagger: 0.12, delay: 0.5,
      clearProps: 'transform'
    });
  }

  /* =======================================================
     MARCA PERSONAL — misma lógica que la presentación: sin
     pin, entra una vez. El titular lleva `data-split` y ya
     lo recorre headings().
     ======================================================= */
  function personal() {
    const sec = document.querySelector('.personal');
    if (!sec) return;

    const line = sec.querySelector('.personal__line');
    const cards = gsap.utils.toArray('.personal__card', sec);

    gsap.from([line, ...cards].filter(Boolean), {
      opacity: 0, y: 30, duration: 0.7, ease: 'expo.out', stagger: 0.1,
      clearProps: 'transform',
      scrollTrigger: { trigger: sec, start: 'top 82%', once: true }
    });
  }

  /* =======================================================
     PRECIOS — misma lógica que MARCA PERSONAL: sin pin, entra
     una vez. El titular lleva `data-split` y ya lo recorre
     headings().
     ======================================================= */
  function precios() {
    const sec = document.querySelector('.precios');
    if (!sec) return;

    const leads = gsap.utils.toArray('.precios__lead', sec);
    const table = sec.querySelector('.precios__table-wrap');
    const extras = sec.querySelector('.precios__extras');

    gsap.from([...leads, table, extras].filter(Boolean), {
      opacity: 0, y: 30, duration: 0.7, ease: 'expo.out', stagger: 0.1,
      clearProps: 'transform',
      scrollTrigger: { trigger: sec, start: 'top 82%', once: true }
    });
  }

  /* =======================================================
     MÓVIL — sin pins. Versión corta que no secuestra el scroll.
     ======================================================= */
  function mobile() {
    gsap.utils.toArray('.frag, .proc__photo').forEach(el => {
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
     SCROLL SUAVE A ANCLAS — reemplaza scroll-behavior:smooth (CSS).
     GSAP mismo lo advierte: scroll-behavior:smooth del navegador y
     ScrollTrigger con pines pelean por la misma posición de scroll. El
     síntoma real fue un clic en "Precios" de la nav que apenas se movía
     unos píxeles y se quedaba ahí, en vez de llegar a la sección. Con
     ScrollToPlugin, GSAP hace el scroll Y sabe convivir con los pines.
     Sin este archivo (CDN caído, JS bloqueado), el CSS ya no trae
     scroll-behavior:smooth: el salto queda instantáneo pero exacto. */
  function anchors() {
    if (!window.ScrollToPlugin) return;
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      a.addEventListener('click', e => {
        e.preventDefault();
        gsap.to(window, {
          duration: 1, ease: 'power3.inOut',
          scrollTo: { y: target, autoKill: true },
          overwrite: 'auto'
        });
      });
    });
  }

  /* =======================================================
     ARRANQUE
     ======================================================= */
  function boot() {
    hero();
    headings();
    ticker();
    pitch();
    personal();
    precios();
    social();
    contact();
    anchors();

    // Proceso es el único pin que queda en la página, y sigue siendo de
    // escritorio: en móvil `mobile()` sirve los mismos fragmentos sin
    // secuestrar el scroll.
    const mm = gsap.matchMedia();
    mm.add('(min-width: 769px)', () => { proc(); });
    mm.add('(max-width: 768px)', () => { mobile(); });

    // El pin necesita altura determinista: recalcular cuando la portada
    // de la presentación termine de cargar.
    let pending = 0;
    document.querySelectorAll('img').forEach(img => {
      if (img.complete) return;
      pending++;
      const settle = () => { if (--pending <= 0) ScrollTrigger.refresh(); };
      img.addEventListener('load', settle, { once: true });
      img.addEventListener('error', settle, { once: true });
    });

    /* Lo de arriba solo cubre <img>. El embed de TikTok en Marca personal
       llega tarde (a propósito, es perezoso) y cuando carga cambia de
       tamaño por su cuenta, sin disparar ningún evento que script.js
       pueda escuchar — es un iframe de otro origen. Sin recalcular ahí,
       .proc y todo lo que va después (Precios, Contacto) quedan pineados
       sobre una altura que ya no es la real: un clic en "Precios" en la
       nav aterriza en Personal o en Proceso, no en Precios. Un
       ResizeObserver sobre <main> agarra CUALQUIER cambio de alto —el del
       TikTok incluido, y cualquier otro que aparezca a futuro— sin tener
       que saber la causa. */
    let resizeObsRt;
    let resizeObsFirst = true;
    const mainEl = document.querySelector('main');
    if (mainEl && window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        // El propio observe() dispara una primera llamada con el alto que
        // ScrollTrigger.create() ya midió bien: refrescar ahí es ruido, y
        // si coincide con un clic de nav en curso, puede cortarle el scroll
        // suave a mitad de camino.
        if (resizeObsFirst) { resizeObsFirst = false; return; }
        clearTimeout(resizeObsRt);
        resizeObsRt = setTimeout(() => ScrollTrigger.refresh(), 260);
      });
      ro.observe(mainEl);
    }

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => ScrollTrigger.refresh(), 220);
    });
  }

  // SplitText mide glifos: si Bebas todavía no cargó, parte mal.
  const start = () => playIntro(boot);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else window.addEventListener('load', start);

  // Devuelve el texto original a los lectores de pantalla al salir.
  window.addEventListener('pagehide', () => splits.forEach(s => s.revert()));
})();
