(function () {
	// Previously we skipped the effect when the OS requested reduced motion,
	// which hid the stars for many users. Keep an opt-out via localStorage.
	if (localStorage.getItem('starsDisabled') === '1') return;

	const canvas = document.createElement('canvas');
	canvas.id = 'stars-canvas';
	document.body.prepend(canvas);

	const ctx = canvas.getContext('2d');
	let w = 0, h = 0, dpr = 1;

	function resize() {
		dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
		w = Math.floor(window.innerWidth);
		h = Math.floor(window.innerHeight);
		canvas.width = Math.floor(w * dpr);
		canvas.height = Math.floor(h * dpr);
		canvas.style.width = w + 'px';
		canvas.style.height = h + 'px';
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}
	window.addEventListener('resize', resize, { passive: true });
	window.addEventListener('orientationchange', resize, { passive: true }); // Для мобильных
	resize();

	const STAR_COUNT = 90; // Увеличил для лучшего покрытия экрана
	const stars = Array.from({ length: STAR_COUNT }).map(() => spawn(true));

	function spawn(initial) {
		const x = Math.random() * w;
		const y = initial ? Math.random() * h : -20 - Math.random() * 200;
		const len = 60 + Math.random() * 140;
		const speed = 6 + Math.random() * 10;
		const alpha = 0.35 + Math.random() * 0.55; // Увеличил базовую яркость
		const thickness = 1 + Math.random() * 1.5;

		// diagonal “fall” — сделал меньше диагонали для более вертикального падения
		const vx = 0.3 * speed;
		const vy = 1.0 * speed;

		return { x, y, vx, vy, len, alpha, thickness };
	}

	let animId;
	function draw() {
		ctx.clearRect(0, 0, w, h);

		// subtle vignette — сделал слабее
		const g = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, Math.max(w, h) * 0.8);
		g.addColorStop(0, 'rgba(10,132,255,0.04)');
		g.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, w, h);

		for (let i = 0; i < stars.length; i++) {
			const s = stars[i];

			const x2 = s.x - (s.vx / s.vy) * s.len;
			const y2 = s.y - s.len;

			// glow
			ctx.beginPath();
			ctx.strokeStyle = `rgba(10,132,255,${s.alpha * 0.35})`;
			ctx.lineWidth = s.thickness * 4;
			ctx.lineCap = 'round';
			ctx.moveTo(s.x, s.y);
			ctx.lineTo(x2, y2);
			ctx.stroke();

			// core
			ctx.beginPath();
			ctx.strokeStyle = `rgba(255,255,255,${s.alpha})`;
			ctx.lineWidth = s.thickness;
			ctx.lineCap = 'round';
			ctx.moveTo(s.x, s.y);
			ctx.lineTo(x2, y2);
			ctx.stroke();

			s.x += s.vx;
			s.y += s.vy;

			if (s.y - s.len > h + 50 || s.x - s.len > w + 50) {
				stars[i] = spawn(false);
			}
		}

		animId = requestAnimationFrame(draw);
	}

	draw();

	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			cancelAnimationFrame(animId);
		} else {
			draw();
		}
	});
})();
