(() => {
  const heroCard = document.getElementById('heroCard');
  const palco = document.getElementById('palco');
  const palcoIn = document.getElementById('palcoIn');
  const prancheta = document.getElementById('prancheta');
  const nomePrancheta = document.getElementById('pranchetaNome');
  const camadaCursores = document.getElementById('cursores');
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

  const SOLTA = '.lp-cta,.cr-exportar,.ma-publicar,.ga-criar,.ga-ok,.ed-publicar';
  const NOMES_CENA = ['Growth77 / Logo', 'Growth77 / Landing page', 'Growth77 / Criativo 4:5', 'Meta Ads / Campanha de Leads', 'Google Analytics / Eventos'];
  const ROTEIRO = [
    { dur: 5000, escura: true, tarefas: [
      [0, 'Wesley', 'desenhar', 'guiaH', 450],
      [150, 'Design', 'desenhar', 'lg', 420], [300, 'Leo', 'desenhar', 'lr', 420], [450, 'Ivan', 'desenhar', 'lo', 420],
      [600, 'Thainan', 'desenhar', 'lw', 480], [750, 'Priscilla', 'desenhar', 'lt', 420], [900, 'Fabrizio', 'desenhar', 'lh', 420],
      [1050, 'Creator', 'desenhar', 'l7a', 420], [1200, 'Meta', 'desenhar', 'l7b', 420],
      [2000, 'Design', 'mostrar', 'paleta'], [2500, 'Wesley', 'clicar', 'swVerde', 'is-cor'], [2700, 'Copy', 'digitar', 'tag']
    ]},
    { dur: 6400, tarefas: [
      [100, 'Leo', 'desenhar', 'nav', 450], [500, 'Copy', 'digitar', 'titulo'], [500, 'Creator', 'desenhar', 'img', 700],
      [1400, 'Thainan', 'desenhar', 'texto', 450], [1900, 'Design', 'desenhar', 'cta', 400], [2300, 'Priscilla', 'desenhar', 'cards', 550],
      [2700, 'Design', 'clicar', 'corVerde', 'is-verde'], [2900, 'Fabrizio', 'desenhar', 'logos', 450],
      [3600, 'Ivan', 'clicar', 'bpCel', 'is-cel'], [5000, 'Wesley', 'clicar', 'publicarLp', null, 'toastLp']
    ]},
    { dur: 5000, tarefas: [
      [100, 'Creator', 'desenhar', 'peca', 800], [400, 'Priscilla', 'mostrar', 'painel'],
      [1100, 'Copy', 'digitar', 'cliente'], [1700, 'Design', 'clicar', 'feed'],
      [2100, 'Meta', 'digitar', 'canal'], [3100, 'Creator', 'clicar', 'exportar', null, 'toastCr']
    ]},
    { dur: 7200, tarefas: [
      [200, 'Copy', 'digitar', 'nome'], [600, 'Meta', 'clicar', 'formulario'],
      [1000, 'Ivan', 'escolher', 'meta', 'metaOpt'], [1300, 'Leo', 'digitar', 'orc'],
      [1700, 'Priscilla', 'digitar', 'loc'], [2300, 'Priscilla', 'escolher', 'loc', 'locOpt', 'is-loc'],
      [3100, 'Leo', 'arrastar', 'idMin', 30, 'is-idade'], [3100, 'Thainan', 'arrastar', 'idMax', 115, 'is-idade'],
      [3600, 'Design', 'desenhar', 'medidor', 600], [4000, 'Creator', 'desenhar', 'estim', 600],
      [5200, 'Meta', 'clicar', 'publicar', 'is-pub', 'status']
    ]},
    { dur: 6600, tarefas: [
      [300, 'Fabrizio', 'clicar', 'criar', 'is-painel'], [1000, 'Fabrizio', 'digitar', 'evento'],
      [1800, 'Ivan', 'digitar', 'valor'], [2700, 'Leo', 'clicar', 'tgLead'],
      [3400, 'Fabrizio', 'clicar', 'criarOk', 'is-criado', 'linhaNova']
    ]}
  ];

  let escala = 1, atual = 0, sessao = 0, pausado = reduzir, visivel = true, timers = [], pendentes = new Set();
  const vivo = s => s === sessao;
  const esperar = ms => new Promise(r => { pendentes.add(r); timers.push(setTimeout(() => { pendentes.delete(r); r(); }, ms)); });

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

  const compacto = () => window.innerWidth <= 768;
  const CEL = { w: 300, h: 520 };

  function ajustar(){
    const w = palco.clientWidth, h = palco.clientHeight;
    escala = compacto() ? Math.min(w / (W - 56), h / H) : Math.min(w / W, h / H);
    let s = escala, cx = W / 2, cy = H / 2;
    if(prancheta.classList.contains('is-celular')){
      s = Math.min((h - 16) / (CEL.h + 40), (w - 32) / (CEL.w + 40), escala * 2.4);
    }
    const x = w / 2 - cx * s, y = h / 2 - cy * s;
    palcoIn.style.transform = `translate(${x}px,${y}px) scale(${s})`;
    palcoIn.style.setProperty('--inv', Math.max(.9, Math.min(1 / s, 1.5)));
  }

  function virarCelular(s){
    if(!vivo(s)) return;
    palco.classList.add('is-morph');
    prancheta.classList.add('is-celular');
    ajustar();
  }

  function voltarDesktop(){
    if(!prancheta.classList.contains('is-celular')) return;
    palco.classList.remove('is-morph');
    prancheta.classList.remove('is-celular');
    ajustar();
  }

  function posicao(c){
    const m = new DOMMatrixReadOnly(getComputedStyle(c.el).transform);
    return { x: m.m41, y: m.m42 };
  }
  function pararCursor(c){
    if(c.anim){ const p = posicao(c); c.anim.cancel(); c.anim = null; c.x = p.x; c.y = p.y; c.el.style.transform = `translate(${c.x}px,${c.y}px)`; }
  }
  const ARRASTE = 'cubic-bezier(.4,0,.2,1)';
  async function mover(c, x, y, s, dur, curva){
    pararCursor(c);
    const dist = Math.hypot(x - c.x, y - c.y);
    const d = dur || Math.max(260, Math.min(750, dist * 1.05));
    const a = c.el.animate([{ transform: `translate(${c.x}px,${c.y}px)` }, { transform: `translate(${x}px,${y}px)` }], { duration: d, easing: curva || 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards' });
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
    sel.animate([ini, fim], { duration: dur, easing: ARRASTE });
    el.animate([{ clipPath: 'inset(0 100% 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: dur, easing: ARRASTE });
    await mover(c, r.x + r.w, r.y + r.h, s, dur, ARRASTE);
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
    if(el.matches(SOLTA)) timers.push(setTimeout(() => el.classList.remove('is-on'), 260));
    if(revelar){
      const extra = alvo(el.closest('.cena'), revelar);
      extra.classList.add('is-vis');
      extra.animate([{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0' }], { duration: 320, easing: 'ease-out' });
    }
  }

  async function escolher(c, el, s, chave, classeCena){
    const cena = el.closest('.cena');
    const r = retangulo(el);
    await mover(c, r.x + r.w * .5, r.y + r.h * .5, s);
    if(!vivo(s)) return;
    c.el.classList.add('is-click');
    el.classList.add('is-aberto');
    await esperar(170);
    c.el.classList.remove('is-click');
    await esperar(380);
    if(!vivo(s)) return;
    const op = alvo(cena, chave);
    const ro = retangulo(op);
    await mover(c, ro.x + Math.min(60, ro.w * .4), ro.y + ro.h * .5, s, 420);
    if(!vivo(s)) return;
    op.classList.add('is-on');
    c.el.classList.add('is-click');
    await esperar(200);
    c.el.classList.remove('is-click');
    aplicarEscolha(el, op, cena, classeCena);
  }
  function aplicarEscolha(el, op, cena, classeCena){
    const val = el.querySelector('.val');
    if(val) val.textContent = op.firstChild.textContent;
    el.classList.remove('is-aberto');
    if(classeCena) cena.classList.add(classeCena);
  }

  async function arrastar(c, el, s, destino, classeCena){
    const r = retangulo(el);
    await mover(c, r.x + r.w * .5, r.y + r.h * .5, s);
    if(!vivo(s)) return;
    c.el.classList.add('is-click');
    const ini = parseFloat(getComputedStyle(el).left);
    const dx = destino - ini;
    el.animate([{ left: ini + 'px' }, { left: destino + 'px' }], { duration: 650, easing: ARRASTE });
    el.style.left = destino + 'px';
    if(classeCena) el.closest('.cena').classList.add(classeCena);
    await mover(c, r.x + r.w * .5 + dx, r.y + r.h * .5, s, 650, ARRASTE);
    c.el.classList.remove('is-click');
  }

  function acenderCamada(cena, k){
    const cam = cena.querySelector(`[data-cam="${k}"]`);
    if(!cam) return;
    cena.querySelectorAll('[data-cam].is-sel').forEach(x => x.classList.remove('is-sel'));
    cam.classList.add('is-vis', 'is-sel');
  }

  async function executar(t, cena, s){
    const [, nome, acao, k, a, b] = t;
    const c = cursores[nome], el = alvo(cena, k);
    c.ocupado = true;
    if(acao === 'desenhar') await desenhar(c, el, s, a || 600);
    if(acao === 'mostrar') await mostrar(c, el, s);
    if(acao === 'digitar') await digitar(c, el, s);
    if(acao === 'clicar') await clicar(c, el, s, a, b);
    if(acao === 'escolher') await escolher(c, el, s, a, b);
    if(acao === 'arrastar') await arrastar(c, el, s, a, b);
    if(vivo(s)) acenderCamada(cena, k);
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
    cena.className = cena.className.split(' ').filter(c => c === 'cena' || c.startsWith('cena-')).join(' ');
    cena.querySelectorAll('[data-k],[data-cam]').forEach(e => e.classList.remove('is-vis', 'is-on', 'is-aberto', 'is-sel'));
    cena.querySelectorAll('[data-txt]').forEach(e => e.textContent = '');
    cena.querySelectorAll('[data-ini]').forEach(e => e.textContent = e.dataset.ini);
    cena.querySelectorAll('[data-x0]').forEach(e => e.style.left = '');
  }
  function completarCena(i){
    const cena = cenas[i];
    ROTEIRO[i].tarefas.forEach(([, , acao, k, a, b]) => {
      const el = alvo(cena, k);
      if(acao === 'digitar') el.textContent = el.dataset.txt;
      if(acao === 'clicar'){ if(!el.matches(SOLTA)) el.classList.add('is-on'); if(a) cena.classList.add(a); if(b) alvo(cena, b).classList.add('is-vis'); }
      if(acao === 'escolher'){ const op = alvo(cena, a); op.classList.add('is-on'); aplicarEscolha(el, op, cena, b); }
      if(acao === 'arrastar'){ el.style.left = a + 'px'; if(b) cena.classList.add(b); }
      el.classList.add('is-vis');
      const cam = cena.querySelector(`[data-cam="${k}"]`);
      if(cam) cam.classList.add('is-vis');
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
    pendentes.forEach(r => r()); pendentes.clear();
    Object.values(cursores).forEach(c => { pararCursor(c); c.ocupado = false; c.fila = Promise.resolve(); c.el.classList.remove('is-click'); });
    palcoIn.querySelectorAll('.sel').forEach(s => s.remove());
    voltarDesktop();
  }

  async function rodar(i){
    interromper();
    const s = sessao;
    atual = i;
    limparCena(cenas[i]);
    mostrarCena(i);
    const r = ROTEIRO[i];
    const celular = i === 1 && compacto();
    const dur = r.dur + (celular ? 1200 : 0);
    marcarEtapa(i, dur);
    Object.values(cursores).forEach(c => vagar(c, s));
    r.tarefas.forEach(t => {
      if(celular && t[3] === 'publicarLp') return;
      timers.push(setTimeout(() => {
        const c = cursores[t[1]];
        c.fila = c.fila.then(() => vivo(s) ? executar(t, cenas[i], s) : null);
      }, t[0]));
    });
    if(celular) timers.push(setTimeout(() => { const c = cursores.Ivan; c.fila = c.fila.then(() => vivo(s) ? esperar(500).then(() => virarCelular(s)) : null); }, 3600));
    await esperar(dur);
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
    if(pausado || !visivel) congelar(atual); else rodar(atual);
  }

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
