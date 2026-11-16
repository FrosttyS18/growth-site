(() => {
  const secao = document.getElementById('servicos');
  const canvas = document.getElementById('dnaCanvas');
  const ctx = canvas.getContext('2d');
  const l1 = secao.querySelector('.dna-l1');
  const l2 = secao.querySelector('.dna-l2');
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const METRICAS = ['CPL', 'ROAS', 'CAC', 'LTV', 'CTR', 'CPA', 'MQL', 'SQL', 'CRO', 'ROI'];
  const PARES = 64;
  let W = 0, H = 0, dpr = 1, estrelas = [], relogio = 0, ultimo = 0, rodando = false, naTela = false, progresso = 0;

  function medir(){
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    estrelas = Array.from({ length: Math.round(W * H / 9000) }, () => ({ x: Math.random(), y: Math.random(), z: .2 + Math.random() * .8 }));
    desenhar();
  }

  function lerProgresso(){
    const r = secao.getBoundingClientRect();
    const total = secao.offsetHeight - window.innerHeight;
    progresso = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
  }

  function desenhar(){
    ctx.clearRect(0, 0, W, H);
    const p = progresso;
    const fase = relogio * .35 + p * 7;
    const compacto = W <= 768;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    estrelas.forEach(e => {
      const x = ((e.x - p * .08 * e.z) % 1 + 1) % 1 * W, y = (e.y + p * .25 * e.z) % 1 * H;
      ctx.fillStyle = `rgba(244,243,234,${.12 + e.z * .25})`;
      ctx.fillRect(x, y, e.z * 1.6, e.z * 1.6);
    });

    const cx = W / 2, cy = H * (.5 + (p - .5) * .12);
    const zoom = 1.12 - p * .22;
    const inclina = -.24 + p * .1;
    const comp = W * (compacto ? 2.2 : 1.45) * zoom;
    const amp = Math.min(H * .2, compacto ? 120 : 220) * zoom;
    const passo = comp / PARES;
    const cos = Math.cos(inclina), sen = Math.sin(inclina);

    const pontos = [];
    for(let i = 0; i < PARES; i++){
      const u = -comp / 2 + i * passo;
      const t = i * .33 + fase;
      const a = Math.sin(t) * amp, b = -a, za = Math.cos(t), zb = -za;
      const pa = [cx + u * cos - a * sen, cy + u * sen + a * cos];
      const pb = [cx + u * cos - b * sen, cy + u * sen + b * cos];
      pontos.push({ i, pa, pb, za, zb });
    }

    pontos.forEach(({ i, pa, pb, za, zb }) => {
      const prof = (za + zb) / 2;
      const g = ctx.createLinearGradient(pa[0], pa[1], pb[0], pb[1]);
      g.addColorStop(0, `rgba(87,192,51,${.18 + (za + 1) * .16})`);
      g.addColorStop(1, `rgba(244,243,234,${.08 + (zb + 1) * .1})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
      if(i % 4 === 0){
        const mx = (pa[0] + pb[0]) / 2, my = (pa[1] + pb[1]) / 2;
        ctx.fillStyle = `rgba(87,192,51,${.25 + Math.abs(prof) * .2})`;
        ctx.fillRect(mx - 2, my - 2, 4, 4);
      }
    });

    [['pa', 'za', [87, 192, 51]], ['pb', 'zb', [244, 243, 234]]].forEach(([pk, zk, cor]) => {
      ctx.beginPath();
      pontos.forEach((pt, k) => { const [x, y] = pt[pk]; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.strokeStyle = `rgba(${cor.join(',')},.35)`;
      ctx.lineWidth = 2;
      ctx.stroke();
      pontos.forEach(pt => {
        const [x, y] = pt[pk], z = pt[zk];
        const r = 2.2 + (z + 1) * 2.6;
        const brilho = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
        brilho.addColorStop(0, `rgba(${cor.join(',')},${.25 + (z + 1) * .2})`);
        brilho.addColorStop(1, `rgba(${cor.join(',')},0)`);
        ctx.fillStyle = brilho;
        ctx.beginPath(); ctx.arc(x, y, r * 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${cor.join(',')},${.55 + (z + 1) * .22})`;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      });
    });
    ctx.restore();

    ctx.font = `500 ${compacto ? 10 : 11}px "JetBrains Mono", monospace`;
    ctx.textBaseline = 'middle';
    pontos.forEach(({ i, pa, za }) => {
      if(i % 6 !== 3 || za < .2) return;
      const nome = METRICAS[(i / 6 | 0) % METRICAS.length];
      const x = pa[0] + 14, y = pa[1] - 18;
      ctx.strokeStyle = 'rgba(87,192,51,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(x - 4, y); ctx.stroke();
      const largura = ctx.measureText(nome).width + 14;
      ctx.fillStyle = 'rgba(15,15,15,.85)';
      ctx.fillRect(x - 4, y - 10, largura, 20);
      ctx.strokeStyle = 'rgba(87,192,51,.6)';
      ctx.strokeRect(x - 4, y - 10, largura, 20);
      ctx.fillStyle = `rgba(244,243,234,${.5 + za * .5})`;
      ctx.fillText(nome, x + 3, y);
    });

    const desl = (p - .45) * W * (compacto ? .12 : .4);
    l1.style.transform = `translateX(${(-desl).toFixed(1)}px)`;
    l2.style.transform = `translateX(${desl.toFixed(1)}px)`;
  }

  function quadro(t){
    if(!rodando) return;
    const dt = ultimo ? Math.min((t - ultimo) / 1000, .05) : 0;
    ultimo = t;
    relogio += dt;
    lerProgresso();
    desenhar();
    requestAnimationFrame(quadro);
  }
  function iniciar(){
    if(rodando) return;
    rodando = true; ultimo = 0;
    requestAnimationFrame(quadro);
  }

  new IntersectionObserver(([e]) => {
    naTela = e.isIntersecting;
    if(naTela && !reduzir) iniciar(); else rodando = false;
  }).observe(secao);
  document.addEventListener('visibilitychange', () => { if(document.hidden) rodando = false; else if(naTela && !reduzir) iniciar(); });
  if(reduzir) progresso = .5;
  window.addEventListener('resize', medir);
  if(document.fonts) document.fonts.ready.then(medir);
  medir();
})();
