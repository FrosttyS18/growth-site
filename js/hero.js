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
  const NOMES_CENA = ['Growth77 / Logo', 'One Drop / Lookbook Drop 07', 'Growth77 / Criativo 4:5', 'Meta Ads / Campanha de Leads', 'Google Analytics / Eventos'];
  const ROTEIRO = [
    { dur: 5000, escura: true, tarefas: [
      [0, 'Wesley', 'desenhar', 'guiaH', 450],
      [150, 'Design', 'desenhar', 'lg', 420], [300, 'Leo', 'desenhar', 'lr', 420], [450, 'Ivan', 'desenhar', 'lo', 420],
      [600, 'Thainan', 'desenhar', 'lw', 480], [750, 'Priscilla', 'desenhar', 'lt', 420], [900, 'Fabrizio', 'desenhar', 'lh', 420],
      [1050, 'Creator', 'desenhar', 'l7a', 420], [1200, 'Meta', 'desenhar', 'l7b', 420],
      [2000, 'Design', 'mostrar', 'paleta'], [2500, 'Wesley', 'clicar', 'swVerde', 'is-cor'], [2700, 'Copy', 'digitar', 'tag']
    ]},
    { dur: 7800, tarefas: [
      [100, 'Wesley', 'desenhar', 'fundo', 500], [500, 'Design', 'desenhar', 'nav', 400], [700, 'Ivan', 'desenhar', 'selo', 350],
      [900, 'Thainan', 'digitar', 'titulo'], [1100, 'Wesley', 'desenhar', 'img', 650], [1600, 'Ivan', 'desenhar', 'texto', 450],
      [2100, 'Design', 'desenhar', 'cta', 400], [2300, 'Wesley', 'desenhar', 'secao', 550], [2700, 'Design', 'desenhar', 'cards', 500],
      [3200, 'Design', 'clicar', 'corCta', 'is-cta'],
      [3700, 'Wesley', 'clicar', 'bpCel', 'is-cel'], [6000, 'Wesley', 'clicar', 'publicarLp', null, 'toastLp']
    ]},
    { dur: 5000, tarefas: [
      [100, 'Wesley', 'desenhar', 'peca', 800], [400, 'Design', 'mostrar', 'painel'],
      [1100, 'Thainan', 'digitar', 'cliente'], [1700, 'Design', 'clicar', 'feed'],
      [2100, 'Ivan', 'digitar', 'canal'], [3100, 'Wesley', 'clicar', 'exportar', null, 'toastCr']
    ]},
    { dur: 7200, tarefas: [
      [200, 'Copy', 'digitar', 'nome'], [600, 'Leo', 'clicar', 'formulario'],
      [1000, 'Leo', 'escolher', 'meta', 'metaOpt'], [1400, 'Thainan', 'digitar', 'orc'],
      [1700, 'Ivan', 'digitar', 'loc'], [2300, 'Ivan', 'escolher', 'loc', 'locOpt', 'is-loc'],
      [2900, 'Leo', 'arrastar', 'idMin', 30, 'is-idade'], [3600, 'Leo', 'arrastar', 'idMax', 115, 'is-idade'],
      [3500, 'Meta', 'desenhar', 'medidor', 600], [4300, 'Meta', 'desenhar', 'estim', 600],
      [5300, 'Leo', 'clicar', 'publicar', 'is-pub', 'status']
    ]},
    { dur: 6600, tarefas: [
      [300, 'Leo', 'clicar', 'criar', 'is-painel'], [1000, 'Copy', 'digitar', 'evento'],
      [1800, 'Thainan', 'digitar', 'valor'], [2700, 'Leo', 'clicar', 'tgLead'],
      [3400, 'Leo', 'clicar', 'criarOk', 'is-criado', 'linhaNova']
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
    const lateral = !compacto();
    const larga = lateral && w / h > 2.05;
    prancheta.classList.toggle('is-larga', larga);
    const PW = larga ? 1140 : 880;
    escala = compacto() ? Math.min(w / (W - 56), h / H) : Math.min(w / (PW + 24), h / 556);
    let s = escala, cx = lateral ? 40 + PW / 2 : W / 2, cy = lateral ? 287 : H / 2;
    if(prancheta.classList.contains('is-celular')){
      s = Math.min((h - 16) / (CEL.h + 40), (w - 32) / (CEL.w + 40), escala * 2.4);
    }
    const x = w / 2 - cx * s, y = h / 2 - cy * s;
    palcoIn.style.transform = `translate(${x}px,${y}px) scale(${s})`;
    palcoIn.style.setProperty('--inv', Math.max(.9, Math.min(1 / s, 1.5)));
    alinharHud(lateral && !prancheta.classList.contains('is-celular'));
  }

  const hud = heroCard.querySelector('.hud');
  const topo = document.querySelector('.site-header .wrap');
  function alinharTopo(ativo, r){
    if(!ativo){ topo.style.width = ''; topo.style.marginLeft = ''; topo.classList.remove('is-alinhado', 'is-justo'); return; }
    topo.classList.add('is-alinhado');
    topo.classList.remove('is-justo');
    const esq = 22, dir = 8, borda = parseFloat(getComputedStyle(topo.parentElement).paddingLeft) || 0;
    topo.style.width = Math.round(r.width + esq + dir) + 'px';
    if(topo.scrollWidth > topo.clientWidth + 1) topo.classList.add('is-justo');
    const extra = Math.max(0, topo.scrollWidth - topo.clientWidth);
    topo.style.width = Math.round(r.width + esq + dir + extra) + 'px';
    topo.style.marginLeft = Math.round(r.left - esq - borda - extra / 2) + 'px';
  }
  function alinharHud(ativo){
    const visivelHero = !!prancheta.offsetParent;
    alinharTopo(ativo && visivelHero, prancheta.getBoundingClientRect());
    if(!ativo){ hud.style.width = ''; hud.classList.remove('is-alinhado', 'is-curta'); return; }
    const largura = Math.round(prancheta.getBoundingClientRect().width);
    hud.style.width = largura + 'px';
    hud.classList.add('is-alinhado');
    hud.classList.remove('is-curta');
    const naoCabe = [...hud.querySelectorAll('.etapas-hero button')].some(b => b.scrollWidth > b.clientWidth + 1);
    hud.classList.toggle('is-curta', naoCabe);
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
    const congelados = [prancheta, ...prancheta.querySelectorAll('.ed-canvas,.lp-frame,.cena-lp [data-k]')];
    congelados.forEach(e => e.style.transition = 'none');
    prancheta.classList.remove('is-celular');
    void prancheta.offsetWidth;
    congelados.forEach(e => e.style.transition = '');
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
      contar(extra, s);
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

  const numero = n => n.toLocaleString('pt-BR');
  async function contar(el, s){
    const alvos = [...el.querySelectorAll('[data-conta]')];
    if(!alvos.length) return;
    const passos = 28;
    for(let i = 1; i <= passos; i++){
      if(!vivo(s)) return;
      const k = 1 - Math.pow(1 - i / passos, 3);
      alvos.forEach(a => a.textContent = numero(Math.round(+a.dataset.conta * k)));
      await esperar(40);
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
    if(acao === 'escolher') await escolher(c, el, s, a, b);
    if(acao === 'arrastar') await arrastar(c, el, s, a, b);
    if(vivo(s)) acenderCamada(cena, k);
    c.ocupado = false;
  }

  const TIMES = [['Wesley', 'Design', 'Creator', 'Priscilla'], ['Copy', 'Thainan', 'Ivan'], ['Leo', 'Meta', 'Fabrizio']];
  const timeDe = nome => TIMES.find(g => g.includes(nome)) || [];
  function limites(){
    return { x0: prancheta.offsetLeft + 24, x1: prancheta.offsetLeft + prancheta.offsetWidth - 90, y0: prancheta.offsetTop + 20, y1: prancheta.offsetTop + prancheta.offsetHeight - 40 };
  }
  function parceiro(c){
    const ocupados = Object.values(cursores).filter(o => o !== c && o.ocupado);
    if(!ocupados.length) return null;
    const meus = ocupados.filter(o => timeDe(c.nome).includes(o.nome));
    const lista = meus.length ? meus : ocupados;
    return posicao(lista[Math.floor(Math.random() * lista.length)]);
  }
  async function vagar(c, s){
    while(vivo(s)){
      if(!c.ocupado){
        const L = limites(), p = parceiro(c);
        let x, y;
        if(p){ x = p.x + (Math.random() - .5) * 170; y = p.y + 24 + Math.random() * 80; }
        else { x = L.x0 + Math.random() * (L.x1 - L.x0); y = L.y0 + Math.random() * (L.y1 - L.y0); }
        x = Math.max(L.x0, Math.min(L.x1, x)); y = Math.max(L.y0, Math.min(L.y1, y));
        await mover(c, x, y, s, 900 + Math.random() * 900);
      }
      await esperar(350 + Math.random() * 900);
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
      if(acao === 'clicar'){ if(!el.matches(SOLTA)) el.classList.add('is-on'); if(a) cena.classList.add(a); if(b){ const ex = alvo(cena, b); ex.classList.add('is-vis'); ex.querySelectorAll('[data-conta]').forEach(x => x.textContent = numero(+x.dataset.conta)); } }
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
    const atraso = celular ? 1900 : 0;
    const dur = r.dur + atraso - (celular ? 1400 : 0);
    if(celular){
      cenas[i].classList.add('is-cta');
      const c = cursores.Wesley;
      timers.push(setTimeout(() => {
        c.fila = c.fila.then(() => vivo(s) ? executar([0, 'Wesley', 'clicar', 'bpCel', 'is-cel'], cenas[i], s) : null).then(() => vivo(s) ? esperar(250).then(() => virarCelular(s)) : null);
      }, 500));
    }
    marcarEtapa(i, dur);
    Object.values(cursores).forEach(c => vagar(c, s));
    r.tarefas.forEach(t => {
      if(celular && ['publicarLp', 'bpCel', 'corCta'].includes(t[3])) return;
      timers.push(setTimeout(() => {
        const c = cursores[t[1]];
        c.fila = c.fila.then(() => vivo(s) ? executar(t, cenas[i], s) : null);
      }, t[0] + atraso));
    });
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
  requestAnimationFrame(() => palco.classList.add('is-pronto'));
  window.addEventListener('resize', () => { if(!compacto()) voltarDesktop(); ajustar(); });
  aplicarEstado();
})();
