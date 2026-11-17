(() => {
  'use strict';

  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);

  /* ---------- Nav: kaydırınca cam efekti ---------- */
  const nav = $('nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Kategori filtresi ---------- */
  const chips = document.querySelectorAll('.chip');
  const cards = document.querySelectorAll('#grid .card');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      cards.forEach((card) => {
        const show = f === 'all' || card.dataset.cat === f;
        card.classList.toggle('is-hidden', !show);
        card.classList.remove('is-entering');
        if (show) {
          card.classList.add('is-visible');   // filtrelenen kart görünmez kalmasın
          if (!reduce) {
            void card.offsetWidth;            // animasyonu yeniden başlat
            card.classList.add('is-entering');
          }
        }
      });
    });
  });

  /* ---------- Kaydırınca beliren bölümler ---------- */
  const revealEls = document.querySelectorAll(
    '.section__head, .filters, .card, .step, .poster__copy, .poster__img, .cta-band__inner'
  );
  revealEls.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const t = e.target;
        t.classList.add('is-visible');
        setTimeout(() => { t.style.transitionDelay = ''; }, 1000); // hover gecikmesi kalmasın
        io.unobserve(t);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    cards.forEach((card, i) => { card.style.transitionDelay = `${(i % 3) * 70}ms`; });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Üye kartı: imleçle eğilme ---------- */
  const card = $('memberCard');
  if (card && !reduce && window.matchMedia('(hover: hover)').matches) {
    const base = { ry: -12, rx: 6, rz: -3 };
    const hero = card.closest('.hero');
    let raf = 0;
    hero.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        card.style.transition = 'transform .12s ease-out';
        card.style.transform =
          `rotateY(${base.ry + x * 22}deg) rotateX(${base.rx - y * 22}deg) rotateZ(${base.rz}deg)`;
        card.style.setProperty('--shine', `${x * 140}%`);
      });
    });
    hero.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      card.style.transition = '';
      card.style.transform = '';
      card.style.setProperty('--shine', '-60%');
    });
  }

  /* ---------- Afiş lightbox ---------- */
  const dlg = $('lightbox');
  const open = () => (dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', ''));
  const close = () => (dlg.close ? dlg.close() : dlg.removeAttribute('open'));
  $('openPoster').addEventListener('click', open);
  $('posterThumb').addEventListener('click', open);
  $('closePoster').addEventListener('click', close);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });

  /* ---------- Paylaş ---------- */
  const toast = $('toast');
  let toastTimer = 0;
  const say = (msg) => {
    toast.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.textContent = ''; }, 3000);
  };

  $('shareBtn').addEventListener('click', async () => {
    const data = {
      title: 'EBYÜ Havacılık Kulübü | Üyelere Özel İndirimler',
      text: 'EBYÜ Havacılık Kulübü üyelerine özel 13 sponsor indirimi. Hemen üye ol!',
      url: location.href.split('#')[0],
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(data.url);
        say('Bağlantı kopyalandı ✓');
      } else {
        window.prompt('Bağlantıyı kopyalayın:', data.url);
      }
    } catch (err) {
      if (err && err.name !== 'AbortError') say('Paylaşım başarısız oldu, tekrar deneyin.');
    }
  });
})();
