(function () {
	const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduced) return;

	const items = document.querySelectorAll('[data-reveal]');
	if (!items.length) return;

	const io = new IntersectionObserver((entries) => {
		for (const e of entries) {
			if (!e.isIntersecting) continue;
			e.target.classList.add('animate-rise');
			io.unobserve(e.target);
		}
	}, { threshold: 0.12 });

	items.forEach((el) => io.observe(el));
})();
