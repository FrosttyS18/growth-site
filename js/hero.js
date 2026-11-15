(() => {
  const heroCard = document.getElementById('heroCard');
  const palco = document.getElementById('palco');
  const palcoIn = document.getElementById('palcoIn');
  const prancheta = document.getElementById('prancheta');
  const nomePrancheta = document.getElementById('pranchetaNome');
  const camadaCursores = document.getElementById('cursores');
  const botaoPausa = document.getElementById('pausaHero');
  const botoesEtapa = [...document.querySelectorAll('#etapasHero [data-ir]')];
  const cenas = [...document.querySelectorAll('.cena')];
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const W = 960, H = 600;
  const TIME = [
    ['Wesley', '#57c033'], ['Ivan', '#0ea5e9'], ['Thainan', '#eab308'], ['Leo', '#ec4899'], ['Design', '#8b5cf6'],
    ['Copy', '#14b8a6'], ['Creator', '#ef4444'], ['Meta', '#2563eb'], ['Priscilla', '#f97316'], ['Fabrizio', '#78716c']
  ];
  const corTexto = hex => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return .2126 * r + .7152 * g + .0722 * b > .3 ? '#0f0f0f' : '#ffffff';
  };

  const NOMES_CENA = ['Growth77 / Logo', 'Growth77 / Landing page', 'Growth77 / Criativo 4:5', 'Meta Ads / Campanha de Leads', 'Google Analytics / Eventos'];
  const ROTEIRO = [
    { dur: 5000, escura: true, tarefas: [
      [0, 'Wesley', 'desenhar', 'guiaH', 450],
      [150, 'Design', 'desenhar', 'lg', 420], [300, 'Leo', 'desenhar', 'lr', 420], [450, 'Ivan', 'desenhar', 'lo', 420],
      [600, 'Thainan', 'desenhar', 'lw', 480], [750, 'Priscilla', 'desenhar', 'lt', 420], [900, 'Fabrizio', 'desenhar', 'lh', 420],
      [1050, 'Creator', 'desenhar', 'l7a', 420], [1200, 'Meta', 'desenhar', 'l7b', 420],
      [2000, 'Design', 'mostrar', 'paleta'], [2500, 'Wesley', 'clicar', 'swVerde', 'is-cor'], [2700, 'Copy', 'digitar', 'tag']
    ]},
    { dur: 5200, tarefas: [
      [100, 'Leo', 'desenhar', 'barra', 450], [400, 'Ivan', 'desenhar', 'nav', 550],
      [800, 'Copy', 'digitar', 'titulo'], [700, 'Creator', 'desenhar', 'img', 700],
      [1500, 'Thainan', 'desenhar', 'texto', 500], [2100, 'Design', 'desenhar', 'cta', 450],
      [2400, 'Priscilla', 'desenhar', 'cards', 600], [3400, 'Wesley', 'clicar', 'cta']
    ]},
    { dur: 5000, tarefas: [
      [100, 'Creator', 'desenhar', 'peca', 800], [400, 'Priscilla', 'mostrar', 'painel'],
      [1100, 'Copy', 'digitar', 'cliente'], [1700, 'Design', 'clicar', 'feed'],
      [2100, 'Meta', 'digitar', 'canal'], [3100, 'Creator', 'clicar', 'exportar', null, 'toastCr']
    ]},
    { dur: 6000, tarefas: [
      [200, 'Copy', 'digitar', 'nome'], [500, 'Meta', 'clicar', 'formulario'],
      [900, 'Ivan', 'digitar', 'orc'], [1300, 'Priscilla', 'digitar', 'loc'],
      [2000, 'Leo', 'desenhar', 'medidor', 700], [2600, 'Thainan', 'desenhar', 'estim', 700],
      [3800, 'Meta', 'clicar', 'publicar', null, 'status']
    ]},
    { dur: 6000, tarefas: [
      [300, 'Fabrizio', 'clicar', 'criar', null, 'linhaNova'], [900, 'Fabrizio', 'digitar', 'evento'],
      [1000, 'Leo', 'desenhar', 'barras', 800], [1700, 'Ivan', 'desenhar', 'top', 600],
      [2500, 'Fabrizio', 'clicar', 'tgLead', null, 'toastGa']
    ]}
  ];

  let escala = 1, atual = 0, sessao = 0, pausado = reduzir, visivel = true, timers = [];
  const vivo = s => s === sessao;
  const esperar = ms => new Promise(r => timers.push(setTimeout(r, ms)));

  const avatares = document.getElementById('avatares');
  const cursores = {};
  TIME.forEach(([nome, cor], i) => {
    const t = corTexto(cor);
    const li = document.createElement('li');
    li.style.setProperty('--c', cor); li.style.setProperty('--t', t);
    li.textContent = nome[0]; li.title = nome;
    avatares.appendChild(li);
    const el = document.createElement('div');
    el.className = 'cur';
    el.style.setProperty('--c', cor); el.style.setProperty('--t', t);
    el.innerHTML = `<div class="cur-in"><svg viewBox="0 0 18 22"><path d="M2 2v16l4.2-4 3 6.4 2.8-1.3-3-6.3H15z"/></svg><span>${nome}</span></div>`;
    camadaCursores.appendChild(el);
    const ang = i / TIME.length * Math.PI * 2;
    const c = { nome, cor, t, el, x: W / 2 + Math.cos(ang) * 420, y: H / 2 + Math.sin(ang) * 250, anim: null, ocupado: false, fila: Promise.resolve() };
    el.style.transform = `translate(${c.x}px,${c.y}px)`;
    cursores[nome] = c;
  });

  function ajustar(){
    const compacto = window.innerWidth <= 768;
    const w = palco.clientWidth;
    if(compacto){ escala = w / (W - 56); palco.style.height = Math.round(H * escala) + 'px'; }
    else { palco.style.height = ''; escala = Math.min(w / W, palco.clientHeight / H); }
    const h = palco.clientHeight;
    const x = (w - W * escala) / 2, y = (h - H * escala) / 2;
    palcoIn.style.transform = `translate(${x}px,${y}px) scale(${escala})`;
    palcoIn.style.setProperty('--inv', Math.max(.9, Math.min(1 / escala, 1.5)));
  }

  function posicao(c){
    const m = new DOMMatrixReadOnly(getComputedStyle(c.el).transform);
    return { x: m.m41, y: m.m42 };
  }
  function pararCursor(c){
    if(c.anim){ const p = posicao(c); c.anim.cancel(); c.anim = null; c.x = p.x; c.y = p.y; c.el.style.transform = `translate(${c.x}px,${c.y}px)`; }
  }
  async function mover(c, x, y, s, dur){
    pararCursor(c);
    const dist = Math.hypot(x - c.x, y - c.y);
    const d = dur || Math.max(260, Math.min(750, dist * 1.05));
    const a = c.el.animate([{ transform: `translate(${c.x}px,${c.y}px)` }, { transform: `translate(${x}px,${y}px)` }], { duration: d, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards' });
    c.anim = a;
    try { await a.finished; } catch(e){ return; }
    if(c.anim !== a) return;
    c.x = x; c.y = y; c.el.style.transform = `translate(${x}px,${y}px)`;
    a.cancel(); c.anim = null;
  }

  function retangulo(el){
    let x = 0, y = 0, n = el;
    while(n && n !== palcoIn){ x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }
  const alvo = (cena, k) => cena.querySelector(`[data-k="${k}"]`);

  function caixa(c, r){
    const s = document.createElement('div');
    s.className = 'sel';
    s.style.setProperty('--c', c.cor); s.style.setProperty('--t', c.t);
    Object.assign(s.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
    s.innerHTML = `<i></i><em>${Math.round(r.w)} × ${Math.round(r.h)}</em>`;
    camadaCursores.before(s);
    return s;
  }
  function soltarCaixa(s, ms){ timers.push(setTimeout(() => { s.style.opacity = 0; timers.push(setTimeout(() => s.remove(), 400)); }, ms)); }

  async function desenhar(c, el, s, dur = 600){
    const r = retangulo(el);
    await mover(c, r.x, r.y, s);
    if(!vivo(s)) return;
    const sel = caixa(c, r);
    el.classList.add('is-vis');
    const ini = { width: '0px', height: '0px' }, fim = { width: r.w + 'px', height: r.h + 'px' };
    sel.animate([ini, fim], { duration: dur, easing: 'cubic-bezier(.4,0,.2,1)' });
    el.animate([{ clipPath: 'inset(0 100% 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: dur, easing: 'cubic-bezier(.4,0,.2,1)' });
    await mover(c, r.x + r.w, r.y + r.h, s, dur);
    soltarCaixa(sel, 500);
  }
  async function mostrar(c, el, s){
    const r = retangulo(el);
    await mover(c, r.x + r.w * .5, r.y + r.h * .5, s);
    if(!vivo(s)) return;
    c.el.classList.add('is-click');
    el.classList.add('is-vis');
    el.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    await esperar(160);
    c.el.classList.remove('is-click');
  }
  async function digitar(c, el, s){
    const r = retangulo(el);
    await mover(c, r.x + 6, r.y + r.h * .5, s);
    if(!vivo(s)) return;
    el.classList.add('is-vis');
    const texto = el.dataset.txt;
    const caret = '<span class="caret"></span>';
    for(let i = 1; i <= texto.length; i++){
      if(!vivo(s)) return;
      el.innerHTML = texto.slice(0, i) + caret;
      await esperar(22 + Math.random() * 28);
    }
    el.textContent = texto;
  }
  async function clicar(c, el, s, classeCena, revelar){
    const r = retangulo(el);
    await mover(c, r.x + r.w * .55, r.y + r.h * .55, s);
    if(!vivo(s)) return;
    c.el.classList.add('is-click');
    el.classList.add('is-on');
    if(classeCena) el.closest('.cena').classList.add(classeCena);
    await esperar(170);
    c.el.classList.remove('is-click');
    if(el.matches('.lp-cta,.cr-exportar,.ma-publicar,.ga-criar')) timers.push(setTimeout(() => el.classList.remove('is-on'), 260));
    if(revelar){
      const extra = alvo(el.closest('.cena'), revelar);
      extra.classList.add('is-vis');
      extra.animate([{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0' }], { duration: 320, easing: 'ease-out' });
    }
  }

  async function executar(t, cena, s){
    const [, nome, acao, k, a, b] = t;
    const c = cursores[nome], el = alvo(cena, k);
    c.ocupado = true;
    if(acao === 'desenhar') await desenhar(c, el, s, a || 600);
    if(acao === 'mostrar') await mostrar(c, el, s);
    if(acao === 'digitar') await digitar(c, el, s);
    if(acao === 'clicar') await clicar(c, el, s, a, b);
    c.ocupado = false;
  }

  async function vagar(c, s){
    while(vivo(s)){
      if(!c.ocupado){
        const lado = Math.random();
        const x = lado < .5 ? 60 + Math.random() * 840 : (Math.random() < .5 ? 10 + Math.random() * 60 : 890 + Math.random() * 50);
        const y = lado < .5 ? (Math.random() < .5 ? 8 + Math.random() * 30 : 560 + Math.random() * 30) : 60 + Math.random() * 480;
        await mover(c, x, y, s, 1800 + Math.random() * 1600);
      }
      await esperar(500 + Math.random() * 1400);
    }
  }

  function limparCena(cena){
    cena.classList.remove('is-cor');
    cena.querySelectorAll('[data-k]').forEach(e => e.classList.remove('is-vis', 'is-on'));
    cena.querySelectorAll('[data-txt]').forEach(e => e.textContent = '');
  }
  function completarCena(i){
    const cena = cenas[i];
    ROTEIRO[i].tarefas.forEach(([, , acao, k, a, b]) => {
      const el = alvo(cena, k);
      if(acao === 'digitar') el.textContent = el.dataset.txt;
      if(acao === 'clicar'){ if(!el.matches('.lp-cta,.cr-exportar,.ma-publicar,.ga-criar')) el.classList.add('is-on'); if(a) cena.classList.add(a); if(b) alvo(cena, b).classList.add('is-vis'); }
      el.classList.add('is-vis');
    });
  }

  function marcarEtapa(i, prog){
    botoesEtapa.forEach((b, k) => {
      if(k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      b.parentElement.classList.toggle('is-feita', k < i);
      const barra = b.querySelector('b');
      barra.getAnimations().forEach(a => a.cancel());
      barra.style.width = k < i ? '100%' : '0';
    });
    if(prog){
      const barra = botoesEtapa[i].querySelector('b');
      barra.animate([{ width: '0%' }, { width: '100%' }], { duration: prog, easing: 'linear', fill: 'forwards' });
    } else botoesEtapa[i].querySelector('b').style.width = '100%';
  }

  function mostrarCena(i){
    cenas.forEach((c, k) => c.classList.toggle('is-on', k === i));
    prancheta.classList.toggle('is-escura', !!ROTEIRO[i].escura);
    nomePrancheta.textContent = NOMES_CENA[i];
  }

  function interromper(){
    sessao++;
    timers.forEach(clearTimeout); timers = [];
    Object.values(cursores).forEach(c => { pararCursor(c); c.ocupado = false; c.el.classList.remove('is-click'); });
    palcoIn.querySelectorAll('.sel').forEach(s => s.remove());
  }

  async function rodar(i){
    interromper();
    const s = sessao;
    atual = i;
    limparCena(cenas[i]);
    mostrarCena(i);
    const r = ROTEIRO[i];
    marcarEtapa(i, r.dur);
    Object.values(cursores).forEach(c => vagar(c, s));
    r.tarefas.forEach(t => {
      timers.push(setTimeout(() => {
        const c = cursores[t[1]];
        c.fila = c.fila.then(() => vivo(s) ? executar(t, cenas[i], s) : null);
      }, t[0]));
    });
    await esperar(r.dur);
    if(!vivo(s)) return;
    rodar((i + 1) % ROTEIRO.length);
  }

  function congelar(i){
    interromper();
    atual = i;
    limparCena(cenas[i]);
    completarCena(i);
    mostrarCena(i);
    marcarEtapa(i, 0);
  }

  function aplicarEstado(){
    botaoPausa.setAttribute('aria-pressed', pausado);
    botaoPausa.querySelector('span').textContent = pausado ? 'Retomar animação' : 'Pausar animação';
    if(pausado || !visivel) congelar(atual); else rodar(atual);
  }

  botaoPausa.addEventListener('click', () => { pausado = !pausado; aplicarEstado(); });
  botoesEtapa.forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.ir;
    if(pausado) congelar(i); else rodar(i);
  }));
  new IntersectionObserver(([e]) => {
    const antes = visivel;
    visivel = e.isIntersecting;
    if(antes !== visivel && !pausado){ if(visivel) rodar(atual); else congelar(atual); }
  }, { threshold: .15 }).observe(heroCard);
  document.addEventListener('visibilitychange', () => {
    if(pausado || !visivel) return;
    if(document.hidden) congelar(atual); else rodar(atual);
  });

  ajustar();
  window.addEventListener('resize', ajustar);
  aplicarEstado();
})();
