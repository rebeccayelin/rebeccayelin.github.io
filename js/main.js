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

function initNewsControls() {
  const newsList = document.getElementById('news-list');
  const newsToggle = document.querySelector('.news-toggle');
  const filterOptions = Array.from(document.querySelectorAll('.updates-filter-option'));

  if (!newsList) return;

  const collapsedCount =
    Number.parseInt(newsList.dataset.collapsedCount || '', 10) || 5;
  const items = Array.from(newsList.children);
  let isExpanded = false;
  let activeFilter =
    filterOptions.find((option) => option.classList.contains('is-active'))?.dataset.filter || 'all';

  const getMatchingItems = () =>
    items.filter((item) => {
      if (activeFilter === 'all') return true;
      const categories = (item.dataset.categories || '')
        .split(/\s+/)
        .filter(Boolean);
      return categories.includes(activeFilter);
    });

  const updateToggle = (matchingItems) => {
    if (!newsToggle) return;

    if (matchingItems.length <= collapsedCount) {
      newsToggle.hidden = true;
      newsToggle.setAttribute('aria-expanded', 'false');
      return;
    }

    newsToggle.hidden = false;
    const chevronPath = isExpanded
      ? 'M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z'
      : 'M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z';
    newsToggle.innerHTML = `<svg class="icon news-toggle-icon" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="${chevronPath}" /></svg>`;
    newsToggle.setAttribute('aria-label', isExpanded ? 'Show fewer updates' : 'Show more updates');
    newsToggle.setAttribute('aria-expanded', String(isExpanded));
  };

  const renderVisibleItems = () => {
    const matchingItems = getMatchingItems();

    items.forEach((item) => {
      item.style.display = 'none';
    });

    matchingItems.forEach((item, index) => {
      item.style.display = !isExpanded && index >= collapsedCount ? 'none' : 'grid';
    });

    updateToggle(matchingItems);
  };

  const syncFilterUI = () => {
    filterOptions.forEach((option) => {
      const isActive = option.dataset.filter === activeFilter;
      option.classList.toggle('is-active', isActive);
      option.setAttribute('aria-checked', String(isActive));
    });
  };

  filterOptions.forEach((option) => {
    option.addEventListener('click', () => {
      activeFilter = option.dataset.filter || 'all';
      syncFilterUI();
      isExpanded = false;
      renderVisibleItems();
    });
  });

  syncFilterUI();
  renderVisibleItems();

  if (newsToggle) {
    newsToggle.addEventListener('click', () => {
      isExpanded = !isExpanded;
      renderVisibleItems();
    });
  }
}

function initHoverImages() {
  const hoverTags = Array.from(document.querySelectorAll('.hover-image-tag'));
  if (hoverTags.length === 0) return;
  document.documentElement.dataset.hoverImagesReady = 'true';

  const previewHomes = new WeakMap();
  hoverTags.forEach((tag) => {
    const preview = tag.querySelector('.hover-image-preview');
    if (!preview) return;
    previewHomes.set(preview, {
      parent: tag,
      nextSibling: preview.nextSibling,
    });
  });

  const hoverPreviewLinks = new Set(
    hoverTags
      .map((tag) => tag.closest('a'))
      .filter(Boolean)
  );
  hoverPreviewLinks.forEach((link) => {
    link.classList.add('hover-preview-link');
  });

  const GAP = 8; // gap between the word and the preview
  const MARGIN = 8; // min gap from the viewport edges

  const movePreviewToTopLayer = (tag) => {
    const prev = tag.querySelector('.hover-image-preview') || tag._hoverPreview;
    if (!prev) return null;
    tag._hoverPreview = prev;
    if (prev.parentNode !== document.body) {
      document.body.appendChild(prev);
    }
    return prev;
  };

  const restorePreviewHome = (tag) => {
    const prev = tag._hoverPreview;
    if (!prev || prev.parentNode !== document.body) return;
    const home = previewHomes.get(prev);
    if (!home?.parent) return;
    home.parent.insertBefore(prev, home.nextSibling);
  };

  // Touch / no-hover devices (and narrow screens) use tap-to-toggle; precise
  // pointers with hover use hover-to-show.
  const usesClickPreviews = () => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isNarrowViewport = window.matchMedia('(max-width: 720px)').matches;
    return !canHover || isNarrowViewport;
  };

  // Center the preview on the word, but clamp it so it never leaves the page.
  // Default below the word; flip above if it would overflow the bottom.
  const positionPreview = (tag) => {
    const prev = movePreviewToTopLayer(tag);
    if (!prev) return;
    const word = tag.getBoundingClientRect();
    const pw = prev.offsetWidth;
    const ph = prev.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;

    let left = word.left + word.width / 2 - pw / 2;
    left = Math.max(MARGIN, Math.min(left, vw - pw - MARGIN));

    let top = word.bottom + GAP;
    if (top + ph > vh - MARGIN) {
      const above = word.top - ph - GAP;
      top = above >= MARGIN ? above : Math.max(MARGIN, vh - ph - MARGIN);
    }

    prev.style.left = `${Math.round(left)}px`;
    prev.style.top = `${Math.round(top)}px`;
    return prev;
  };

  const closeAll = () => {
    hoverTags.forEach((tag) => {
      tag.classList.remove('is-open');
      if (tag.hasAttribute('aria-expanded')) tag.setAttribute('aria-expanded', 'false');
      tag._hoverPreview?.classList.remove('is-open');
      restorePreviewHome(tag);
    });
  };

  const open = (tag) => {
    closeAll();
    const prev = positionPreview(tag);
    tag.classList.add('is-open');
    prev?.classList.add('is-open');
    if (tag.hasAttribute('aria-expanded')) tag.setAttribute('aria-expanded', 'true');
  };

  hoverTags.forEach((tag) => {
    // Hover devices: show on enter, hide on leave.
    tag.addEventListener('pointerenter', () => {
      if (!usesClickPreviews()) open(tag);
    });
    tag.addEventListener('pointerleave', () => {
      if (!usesClickPreviews()) {
        tag.classList.remove('is-open');
        tag._hoverPreview?.classList.remove('is-open');
        restorePreviewHome(tag);
      }
    });

    // Keyboard focus on hover devices (tabbing through) shows the preview.
    tag.addEventListener('focusin', () => {
      if (!usesClickPreviews()) open(tag);
    });
    tag.addEventListener('focusout', () => {
      if (!usesClickPreviews()) {
        tag.classList.remove('is-open');
        tag._hoverPreview?.classList.remove('is-open');
        restorePreviewHome(tag);
      }
    });

    // Touch / no-hover: tap (or Enter/Space) toggles.
    const toggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = tag.classList.contains('is-open');
      closeAll();
      if (!isOpen) open(tag);
    };
    tag.addEventListener('click', (e) => {
      if (usesClickPreviews()) toggle(e);
    });
    tag.addEventListener('keydown', (e) => {
      if (usesClickPreviews() && (e.key === 'Enter' || e.key === ' ')) toggle(e);
    });
  });

  const syncHoverImageAttributes = () => {
    const clickMode = usesClickPreviews();
    hoverTags.forEach((tag) => {
      if (clickMode) {
        tag.setAttribute('role', 'button');
        if (!tag.hasAttribute('aria-expanded')) tag.setAttribute('aria-expanded', 'false');
      } else {
        tag.removeAttribute('role');
        tag.removeAttribute('aria-expanded');
      }
    });
  };

  // Tapping/clicking elsewhere, scrolling, Escape, or resizing all dismiss the
  // preview so a fixed-position card can't drift away from its word.
  document.addEventListener('click', () => {
    if (usesClickPreviews()) closeAll();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
  window.addEventListener('scroll', () => closeAll(), { passive: true });
  window.addEventListener('resize', () => {
    closeAll();
    syncHoverImageAttributes();
  });
  syncHoverImageAttributes();
}

function initMarginFootnotes() {
  const footnotes = Array.from(document.querySelectorAll('[data-margin-footnote]'));
  if (footnotes.length === 0) return;

  const root = document.documentElement;
  const mainContainer = document.querySelector('main.container') || document.querySelector('main') || document.body;
  // The 814px editorial measure, rail gap, and 166px note need more room than
  // the general two-column layout. Keep notes inline until the rail is real.
  const marginQuery = window.matchMedia('(min-width: 1120px)');
  const verticalGap = 18;
  const verticalLead = 2;
  let frameId = null;
  const footnoteNotes = new WeakMap();

  const setInlineNote = (footnote, note) => {
    footnote.append(note);
    footnote.classList.remove('margin-footnote--left', 'margin-footnote--right', 'margin-footnote--hidden');
    footnote.classList.add('margin-footnote--inline');
    footnote.style.removeProperty('--margin-footnote-x');
    footnote.style.removeProperty('--margin-footnote-y');
    const toggle = footnote.querySelector('.margin-footnote-toggle');
    const isOpen = footnote.classList.contains('is-open');
    toggle?.setAttribute('aria-expanded', String(isOpen));
  };

  const setMarginNote = (footnote, note, leftOffset) => {
    footnote.append(note);
    footnote.classList.remove('margin-footnote--hidden', 'margin-footnote--left', 'margin-footnote--inline');
    footnote.classList.add('margin-footnote--right');
    footnote.style.setProperty('--margin-footnote-x', `${leftOffset}px`);
    footnote.classList.remove('is-open');
    footnote.querySelector('.margin-footnote-toggle')?.setAttribute('aria-expanded', 'false');
  };

  const updatePositions = () => {
    const containerRect = mainContainer.getBoundingClientRect();
    const railInset = Math.max(0, Math.min(26, containerRect.width * 0.025));
    root.style.setProperty('--margin-rail-inset', `${railInset}px`);
    const isBlogPost = document.body.classList.contains('blog-post-page');
    const rootStyles = window.getComputedStyle(root);
    const bodyStyles = window.getComputedStyle(document.body);
    const textMeasure = Number.parseFloat(rootStyles.getPropertyValue('--text-measure')) || 620;
    const blogRailGap = Number.parseFloat(bodyStyles.getPropertyValue('--blog-margin-rail-gap')) || 40;
    const placed = [];

    footnotes.forEach((footnote) => {
      const note = footnoteNotes.get(footnote);
      if (!note) return;

      footnote.append(note);
      footnote.classList.remove('margin-footnote--hidden', 'margin-footnote--left', 'margin-footnote--right');
      footnote.style.removeProperty('--margin-footnote-x');
      footnote.style.removeProperty('--margin-footnote-y');

      if (!marginQuery.matches) {
        setInlineNote(footnote, note);
        return;
      }

      const triggerRect = footnote.getBoundingClientRect();
      const noteWidth = note.getBoundingClientRect().width || 168;
      const outerRailLeft = containerRect.right - railInset - noteWidth;
      const targetLeft = isBlogPost
        ? Math.min(containerRect.left + textMeasure + blogRailGap, outerRailLeft)
        : outerRailLeft;

      setMarginNote(footnote, note, targetLeft - triggerRect.left);
      placed.push({
        footnote,
        note,
        targetTop: triggerRect.top - verticalLead,
        triggerTop: triggerRect.top
      });
    });

    let nextTop = Number.NEGATIVE_INFINITY;
    placed
      .sort((a, b) => a.targetTop - b.targetTop)
      .forEach(({ footnote, note, targetTop, triggerTop }) => {
        const noteHeight = note.getBoundingClientRect().height;
        const placedTop = Math.max(targetTop, nextTop);
        footnote.style.setProperty('--margin-footnote-y', `${Math.round(placedTop - triggerTop)}px`);
        nextTop = placedTop + noteHeight + verticalGap;
      });
  };

  const requestUpdate = () => {
    if (frameId !== null) return;
    frameId = window.requestAnimationFrame(() => {
      frameId = null;
      updatePositions();
    });
  };

  root.classList.add('margin-footnotes-ready');

  footnotes.forEach((footnote) => {
    const note = footnote.querySelector('.margin-footnote-note');
    if (!note) return;
    footnoteNotes.set(footnote, note);
    const toggle = footnote.querySelector('.margin-footnote-toggle');
    toggle?.addEventListener('click', () => {
      if (marginQuery.matches) return;
      const isOpen = footnote.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  });

  window.addEventListener('resize', requestUpdate);
  window.addEventListener('load', requestUpdate);
  marginQuery.addEventListener?.('change', requestUpdate);

  if (document.fonts?.ready) {
    document.fonts.ready.then(requestUpdate).catch(() => {});
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(requestUpdate).observe(mainContainer);
  }

  updatePositions();
}

initMobileMenu();
initAnchorScroll();
initDeferredVideos();
initGalleryCarousels();
initNewsControls();
initHoverImages();
initMarginFootnotes();
