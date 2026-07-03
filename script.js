document.addEventListener('DOMContentLoaded', () => {
    const intro = document.getElementById('intro');
    const landing = document.getElementById('landing');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // --- Intro sequence: logo in, then reveal landing ---
    setTimeout(() => {
        intro.classList.add('done');
        landing.classList.remove('hidden');
    }, 2200);

    // --- Toast notification ---
    let toastTimeout;
    function showToast(name) {
        toastMessage.textContent = `Bringing you to ${name}...`;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    document.querySelectorAll('a[data-toast]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const name = link.getAttribute('data-toast');
            const href = link.getAttribute('href');
            const target = link.getAttribute('target');
            showToast(name);
            setTimeout(() => {
                if (target === '_blank') {
                    window.open(href, '_blank');
                } else {
                    window.location.href = href;
                }
            }, 2200);
        });
    });

    // --- Mouse spotlight background ---
    const spotlight = document.createElement('div');
    spotlight.className = 'mouse-spotlight';
    document.body.insertBefore(spotlight, document.body.firstChild);

    document.addEventListener('mousemove', (e) => {
        spotlight.style.setProperty('--mouse-x', e.clientX + 'px');
        spotlight.style.setProperty('--mouse-y', e.clientY + 'px');
    });

    // --- Ambient particles ---
    const canvas = document.createElement('canvas');
    canvas.id = 'ambient-canvas';
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    const particles = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    window.addEventListener('resize', resize);
    resize();

    let mouseX = width / 2;
    let mouseY = height / 2;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            alpha: Math.random() * 0.35 + 0.1,
            baseAlpha: Math.random() * 0.35 + 0.1
        });
    }

    function drawParticles() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            // Mouse repulsion
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
                const force = (140 - dist) / 140;
                p.vx += (dx / dist) * force * 0.08;
                p.vy += (dy / dist) * force * 0.08;
            }

            // Damping
            p.vx *= 0.99;
            p.vy *= 0.99;

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = '#6b7280';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;
        requestAnimationFrame(drawParticles);
    }

    drawParticles();
});
