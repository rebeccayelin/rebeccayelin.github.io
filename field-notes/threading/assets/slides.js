function initSlideViewers() {
  document.querySelectorAll('[data-slide-viewer]').forEach((viewer) => {
    const image = viewer.querySelector('[data-slide-image]');
    const previous = viewer.querySelector('[data-slide-prev]');
    const next = viewer.querySelector('[data-slide-next]');
    const counter = viewer.querySelector('[data-slide-counter]');
    const count = Number(viewer.dataset.slideCount);
    let page = Number(viewer.dataset.slideStart) || 1;

    const show = (requested) => {
      page = Math.max(1, Math.min(count, requested));
      image.src = `${viewer.dataset.slideBase}${String(page).padStart(2, '0')}.webp`;
      image.alt = `Graph Threading presentation, slide ${page} of ${count}`;
      counter.textContent = `${page} / ${count}`;
      previous.disabled = page === 1;
      next.disabled = page === count;
    };

    previous.addEventListener('click', () => show(page - 1));
    next.addEventListener('click', () => show(page + 1));
    viewer.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      show(event.key === 'Home' ? 1 : event.key === 'End' ? count : page + (event.key === 'ArrowRight' ? 1 : -1));
    });
    show(page);
    viewer.querySelector('[data-slide-controls]').hidden = false;
  });
}


initSlideViewers();
