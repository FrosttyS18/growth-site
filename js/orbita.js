(() => {
  const secao = document.getElementById('metodo');
  const canvas = document.getElementById('orbitaCanvas');
  const camada = document.getElementById('orbitaPecas');
  const bolso = secao.querySelector('.orbita-copy-in');
  const rotulo = document.getElementById('orbitaRotulo');
  const ctx = canvas.getContext('2d');
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const FONTE = [4, 7, 8, 9, 10, 12, 13, 21, 22, 24, 27, 33, 45, 50, 57, 61, 18, 19, 23, 25, 26, 28, 29, 31];
  const DESKTOP = { arms: 6, turns: 1.05, rMax: .7, birth: .08, cardN: 40, cardH: .22, jitter: .76, ticks: 16, circ: .56 };
  const MOBILE = { arms: 3, turns: .7, rMax: .8, birth: .08, cardN: 24, cardH: .2, jitter: .76, ticks: 10, circ: .56 };
  const MOV = { idle: .57 / 60, scrub: .2 / 1000, spin: -50 * Math.PI / 180 / 60, wobble: 6, wobbleHz: .25, waveDur: 4, burst: 3, burstDur: 2.5, band: 220, pulseSpeed: .19, pulseLen: .05, pulses: 3 };
  const LOOK = { density: .82, innerCap: .45, aspectEnd: .3, blurMax: 12, blurEnd: .18, fade: .15, pad: 10, keepBand: 40, keepScale: .7 };

  let L = DESKTOP, W = 0, H = 0, dpr = 1, cx = 0, cy = 0, rOut = 0, cartas = [], bolsoR = null;
  let jornada = 0, giro = 0, relogio = 0, intro = reduzir ? 99 : -1, ultimo = 0, rodando = false, naTela = false;
  let ultimoScroll = window.scrollY, ponteiro = null, segura = null, freio = 1;

  function montarCartas(){
    camada.textContent = '';
    cartas = [];
    const area = W * H / 1e6;
    const n = L === MOBILE ? L.cardN : Math.max(16, Math.min(L.cardN, Math.round(L.cardN * area / 1.3)));
    const porBraco = Math.ceil(n / L.arms);
    for(let k = 0; k < n; k++){
      const p = PECAS[FONTE[k % FONTE.length]];
      const el = document.createElement('figure');
      el.className = 'orb-carta';
      el.innerHTML = `<img src="${p.s}" alt="" loading="lazy" decoding="async" draggable="false">`;
      camada.appendChild(el);
      const braco = k % L.arms, i = Math.floor(k / L.arms);
      cartas.push({ el, p, braco, fase: (i + braco * L.jitter) / porBraco, semente: Math.random() * 6.28, x: 0, y: 0, w: 0, h: 0 });
    }
  }

  function medir(){
    const r = secao.getBoundingClientRect();
    W = r.width; H = r.height;
    const novo = W * H / 1e6 < .6 || W <= 768 ? MOBILE : DESKTOP;
    const trocou = novo !== L || !cartas.length;
    L = novo;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const b = bolso.getBoundingClientRect();
    cx = W / 2; cy = H / 2;
    rOut = Math.hypot(W, H) / 2 * L.rMax;
    bolsoR = { x0: b.left - r.left - LOOK.pad, y0: b.top - r.top - LOOK.pad, x1: b.right - r.left + LOOK.pad, y1: b.bottom - r.top + LOOK.pad };
    if(trocou) montarCartas();
    quadroUnico();
  }

  const raioDe = j => rOut * (L.birth + (1.45 - L.birth) * j);
  const anguloDe = (braco, r) => braco / L.arms * Math.PI * 2 + Math.PI * 2 * L.turns * (r / rOut) + giro;
  const suave = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
  const raioFrente = () => {
    const t = Math.min(1, Math.max(0, intro / MOV.waveDur));
    return (1 - Math.pow(1 - t, 3)) * Math.hypot(W, H) * .75;
  };

  function distBolso(x, y){
    const dx = Math.max(bolsoR.x0 - x, 0, x - bolsoR.x1), dy = Math.max(bolsoR.y0 - y, 0, y - bolsoR.y1);
    if(dx === 0 && dy === 0) return -Math.min(x - bolsoR.x0, bolsoR.x1 - x, y - bolsoR.y0, bolsoR.y1 - y);
    return Math.hypot(dx, dy);
  }

  function ponto(a, u){
    const r = rOut * (L.birth + 1.4 * u), t = anguloDe(a, r);
    return [cx + Math.cos(t) * r, cy + Math.sin(t) * r, t];
  }

  function desenharFundo(){
    ctx.clearRect(0, 0, W, H);
    const frente = intro < 0 ? 0 : raioFrente();
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, Math.max(0, frente), 0, Math.PI * 2); ctx.clip();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(15,15,15,.14)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, rOut * L.circ, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineCap = 'round';
    for(let a = 0; a < L.arms; a++){
      ctx.beginPath();
      for(let s = 0; s <= 120; s++){
        const [x, y] = ponto(a, s / 120);
        s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = 'rgba(15,15,15,.13)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.strokeStyle = 'rgba(15,15,15,.24)'; ctx.lineWidth = 1;
      for(let k = 0; k < L.ticks; k++){
        const r = rOut * (.5 + .5 * k / L.ticks), t = anguloDe(a, r);
        const tx = -Math.sin(t), ty = Math.cos(t), x = cx + Math.cos(t) * r, y = cy + Math.sin(t) * r;
        ctx.beginPath(); ctx.moveTo(x - tx * 5, y - ty * 5); ctx.lineTo(x + tx * 5, y + ty * 5); ctx.stroke();
      }
      for(let p = 0; p < MOV.pulses; p++){
        const cabeca = (relogio * MOV.pulseSpeed + p / MOV.pulses + a * .137) % 1;
        const passos = 16;
        for(let s = 0; s < passos; s++){
          const u0 = cabeca - MOV.pulseLen * s / passos, u1 = cabeca - MOV.pulseLen * (s + 1) / passos;
          if(u1 < 0) break;
          const [x0, y0] = ponto(a, u0), [x1, y1] = ponto(a, u1);
          const k = 1 - s / passos;
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
          ctx.strokeStyle = `rgba(87,192,51,${(.8 * k).toFixed(3)})`;
          ctx.lineWidth = 1.5 + 3.5 * k;
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  function posicionarCartas(){
    const frente = intro < 0 ? -1 : raioFrente();
    const capH = L === MOBILE ? W * .3 : H * L.cardH;
    const banda = L === MOBILE ? 12 : LOOK.keepBand;
    let alvoHover = null, melhor = -1;
    cartas.forEach(c => {
      const j = ((c.fase + jornada) % 1 + 1) % 1;
      const r = raioDe(j), t = anguloDe(c.braco, r);
      const wob = MOV.wobble * Math.sin(relogio * Math.PI * 2 * MOV.wobbleHz + c.semente);
      let x = cx + Math.cos(t) * r + wob, y = cy + Math.sin(t) * r + wob * .7;
      if(ponteiro){
        const dx = ponteiro.x - x, dy = ponteiro.y - y, d = Math.hypot(dx, dy);
        if(d < 320){ const f = (1 - d / 320) * 8 / Math.max(d, 1); x += dx * f; y += dy * f; }
      }
      const vao = Math.min(Math.PI * 2 * r / L.arms, rOut / L.turns);
      const cresc = LOOK.innerCap + (1 - LOOK.innerCap) * suave(j / .7);
      const h = Math.min(capH, vao * LOOK.density * .8) * cresc;
      const w = h * (1 - .2 * suave(j / LOOK.aspectEnd));
      let op = suave(j / LOOK.fade), blur = LOOK.blurMax * (1 - suave(j / LOOK.blurEnd)), esc = 1;
      if(frente >= 0){
        const onda = suave((frente - r) / MOV.band);
        op *= onda; blur += (1 - onda) * 10;
      }
      const db = distBolso(x, y) - Math.max(w, h) / 2;
      if(db < banda){
        const k = Math.max(0, db / banda);
        op *= k; esc = LOOK.keepScale + (1 - LOOK.keepScale) * k; blur += (1 - k) * 6;
      }
      if(x < -w || x > W + w || y < -h || y > H + h) op = 0;
      if(c === segura) esc *= 1.08;
      c.x = x; c.y = y; c.w = w * esc; c.h = h * esc;
      c.el.style.width = w.toFixed(1) + 'px'; c.el.style.height = h.toFixed(1) + 'px';
      c.el.style.transform = `translate(${(x - w / 2).toFixed(1)}px,${(y - h / 2).toFixed(1)}px) scale(${esc.toFixed(3)})`;
      c.el.style.opacity = op.toFixed(3);
      c.el.style.filter = blur > .3 ? `blur(${blur.toFixed(1)}px)` : '';
      c.el.style.zIndex = Math.round(j * 100);
      if(ponteiro && op > .6 && Math.abs(ponteiro.x - x) < c.w / 2 && Math.abs(ponteiro.y - y) < c.h / 2 && j > melhor){ melhor = j; alvoHover = c; }
    });
    if(alvoHover !== segura){
      segura?.el.classList.remove('is-segura');
      segura = alvoHover;
      if(segura){ segura.el.classList.add('is-segura'); rotulo.textContent = `${segura.p.c} · ${segura.p.e}`; }
    }
    if(segura){
      rotulo.style.opacity = 1;
      rotulo.style.transform = `translate(${segura.x.toFixed(1)}px,${(segura.y + segura.h / 2 + 12).toFixed(1)}px) translateX(-50%)`;
    } else rotulo.style.opacity = 0;
  }

  function quadroUnico(){ desenharFundo(); posicionarCartas(); }

  function quadro(t){
    if(!rodando) return;
    const dt = ultimo ? Math.min((t - ultimo) / 1000, .05) : 0;
    ultimo = t;
    relogio += dt;
    if(intro >= 0 && intro < 99) intro += dt;
    const burst = intro >= 0 && intro < MOV.burstDur ? 1 + (MOV.burst - 1) * (1 - intro / MOV.burstDur) : 1;
    freio += ((segura ? 0 : 1) - freio) * (1 - Math.exp(-dt / (segura ? .15 : 1)));
    const sy = window.scrollY, ds = sy - ultimoScroll; ultimoScroll = sy;
    jornada += (MOV.idle * burst * dt + ds * MOV.scrub) * freio;
    giro += MOV.spin * dt * freio;
    quadroUnico();
    requestAnimationFrame(quadro);
  }

  function iniciar(){
    if(rodando || reduzir) return;
    rodando = true; ultimo = 0; ultimoScroll = window.scrollY;
    requestAnimationFrame(quadro);
  }

  secao.addEventListener('pointermove', e => {
    if(e.pointerType !== 'mouse') return;
    const r = secao.getBoundingClientRect();
    ponteiro = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  secao.addEventListener('pointerleave', () => { ponteiro = null; });

  new IntersectionObserver(([e]) => {
    naTela = e.isIntersecting;
    if(naTela){
      if(intro < 0){ intro = 0; secao.classList.add('is-vista'); }
      iniciar();
    } else rodando = false;
  }, { threshold: .15 }).observe(secao);
  document.addEventListener('visibilitychange', () => { if(document.hidden) rodando = false; else if(naTela) iniciar(); });

  window.addEventListener('resize', medir);
  if(document.fonts) document.fonts.ready.then(medir);
  if(reduzir){ jornada = .35; secao.classList.add('is-vista'); }
  medir();
})();
