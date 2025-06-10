// Animación simple de partículas para el fondo de la Hero About
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('aboutParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = 260;

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = 260;
  });

  const particles = Array.from({length: 32}, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 2 + Math.random() * 2.5,
    dx: -0.3 + Math.random() * 0.6,
    dy: -0.2 + Math.random() * 0.4,
    alpha: 0.22 + Math.random() * 0.28
  }));

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#6a89cc';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
    }
    requestAnimationFrame(draw);
  }
  draw();
});
