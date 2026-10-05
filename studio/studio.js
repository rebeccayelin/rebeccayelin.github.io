// Content is visible without JavaScript; only offscreen entries need a reveal.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });
  document.querySelectorAll('.entry').forEach(entry => {
    if (entry.getBoundingClientRect().top > window.innerHeight) {
      entry.classList.add('reveal-pending');
      observer.observe(entry);
    }
  });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) {
      observer.disconnect();
      document.querySelectorAll('.reveal-pending').forEach(entry => entry.classList.remove('reveal-pending'));
    }
  });
}
