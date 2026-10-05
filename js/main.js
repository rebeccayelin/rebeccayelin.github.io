function initMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.menu');

  if (!navToggle || !menu) return;

  const setMenuState = (isOpen) => {
    menu.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  };

  navToggle.setAttribute('aria-expanded', 'false');

  navToggle.addEventListener('click', () => {
    setMenuState(!menu.classList.contains('active'));
  });

  document.addEventListener('click', (e) => {
    if (
      !menu.contains(e.target) &&
      !navToggle.contains(e.target) &&
      menu.classList.contains('active')
    ) {
      setMenuState(false);
    }
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setMenuState(false);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
      setMenuState(false);
    }
  });
}

function initAnchorScroll() {
  document
    .querySelectorAll('a[href^="#"]:not([href="#"])')
    .forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        const targetEl = document.getElementById(href.slice(1));
        if (!targetEl) return;

        e.preventDefault();
        if (history.pushState) history.pushState(null, null, href);

        const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - 16;
        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      });
    });
}

function initDeferredVideos() {
  const videos = Array.from(document.querySelectorAll('[data-deferred-video]'));
  if (videos.length === 0) return;

  const loadVideo = (video) => {
    if (video.dataset.loaded === 'true') return;

    video.querySelectorAll('source[data-src]').forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute('data-src');
    });

    video.load();
    video.dataset.loaded = 'true';
  };

  const playVideo = (video) => {
    loadVideo(video);
    const playback = video.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(() => {});
    }
  };

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            playVideo(video);
          } else if (video.dataset.loaded === 'true') {
            video.pause();
          }
        });
      }, {
        rootMargin: '240px 0px',
        threshold: 0.01
      })
    : null;

  videos.forEach((video) => {
    if (observer) {
      observer.observe(video);
      return;
    }

    playVideo(video);
  });
}

function initGalleryCarousels() {
  document.querySelectorAll('[data-gallery-carousel]').forEach((carousel) => {
    const slides = [...carousel.querySelectorAll('[data-gallery-slide]')];
    const dots = [...carousel.querySelectorAll('[data-gallery-dot]')];
    const controls = carousel.querySelector('.gallery-carousel-dots');
    const showSlide = (index) => {
      slides.forEach((slide, i) => { slide.hidden = i !== index; });
      dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
    };
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
      dot.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? dots.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + dots.length) % dots.length;
        showSlide(next);
        dots[next].focus();
      });
    });
    controls.hidden = false;
  });
}

initMobileMenu();
initAnchorScroll();
initDeferredVideos();
initGalleryCarousels();
