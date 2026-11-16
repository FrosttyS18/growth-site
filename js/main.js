const $ = id => document.getElementById(id);
const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function medir(evento, dados){ window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({ event:evento }, dados || {})); }

const LOGO_LINHA = LOGO.letras.reduce((t, l) => t + l.w + l.gap, 0);
function montarLetras(alvo){
  alvo.textContent = '';
  LOGO.letras.forEach(l => {
    const lt = document.createElement('span');
    lt.className = 'lt';
    lt.style.setProperty('--w', l.w);
    lt.style.setProperty('--gap', l.gap);
    lt.innerHTML = `<img src="${l.src}" alt="" draggable="false">`;
    alvo.appendChild(lt);
  });
}

function abrirMenu(){
  $('mobileMenu').classList.add('is-open');
  $('mobileMenu').setAttribute('aria-hidden', 'false');
  $('openMenu').setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function fecharMenu(){
  $('mobileMenu').classList.remove('is-open');
  $('mobileMenu').setAttribute('aria-hidden', 'true');
  $('openMenu').setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
$('openMenu').addEventListener('click', abrirMenu);
$('closeMenu').addEventListener('click', fecharMenu);
$('mobileMenu').querySelectorAll('a').forEach(a => a.addEventListener('click', fecharMenu));
document.addEventListener('keydown', e => { if(e.key === 'Escape') fecharMenu(); });

function atualizarInterface(){
  $('siteHeader').classList.toggle('is-solid', window.scrollY > 20);
}

let agendado = false;
function aoRolar(){
  if(agendado) return;
  agendado = true;
  requestAnimationFrame(() => {
    atualizarInterface();
    agendado = false;
  });
}

window.addEventListener('scroll', aoRolar, { passive:true });
aoRolar();

const esteiras = [...document.querySelectorAll('[data-esteira]')].map(el => {
  const trilho = el.querySelector('.trilho');
  const original = [...trilho.children];
  const est = { el, trilho, original, larg:0, x:0, vel:+el.dataset.vel, dir:+el.dataset.dir, visivel:true };
  montarEsteira(est);
  new IntersectionObserver(([e]) => { est.visivel = e.isIntersecting; }).observe(el);
  return est;
});
function montarEsteira(est){
  est.trilho.querySelectorAll('[data-clone]').forEach(c => c.remove());
  est.larg = est.trilho.scrollWidth;
  let total = est.larg;
  while(total < window.innerWidth * 2 + est.larg){
    est.original.forEach(item => {
      const c = item.cloneNode(true);
      c.setAttribute('data-clone', '');
      c.setAttribute('aria-hidden', 'true');
      est.trilho.appendChild(c);
    });
    total += est.larg;
  }
  const gap = parseFloat(getComputedStyle(est.trilho).columnGap) || 0;
  est.larg += gap;
}
let ultimoEst = 0;
function andarEsteiras(t){
  const dt = ultimoEst ? Math.min((t - ultimoEst) / 1000, .05) : 0;
  ultimoEst = t;
  esteiras.forEach(est => {
    if(!est.visivel) return;
    est.x = (est.x + est.vel * est.dir * dt) % est.larg;
    const pos = est.dir > 0 ? est.x - est.larg : est.x;
    est.trilho.style.transform = `translate3d(${pos}px,0,0)`;
  });
  requestAnimationFrame(andarEsteiras);
}
if(!semMovimento) requestAnimationFrame(andarEsteiras);
window.addEventListener('resize', () => esteiras.forEach(montarEsteira));

const etapas = [
  { nome:'Diagnóstico', desc:'Antes de investir, a gente lê o funil que já existe.',
    nos:[['Funil',.18,[0]],['Dados',.5,[0]],['Mercado',.82,[0]]] },
  { nome:'Estratégia', desc:'Meta por etapa e verba distribuída pelo que vira venda.',
    nos:[['Plano',.5,[0,1,2]]] },
  { nome:'Criativos', desc:'Ângulos, formatos e ofertas prontos para teste contínuo.',
    nos:[['Estático',.18,[0]],['Vídeo',.5,[0,1]],['Copy',.82,[1]]] },
  { nome:'Aquisição', desc:'Mídia no ar em Meta e Google, otimizada por venda.',
    nos:[['Meta Ads',.32,[0]],['Google Ads',.68,[0]]] },
  { nome:'Conversão', desc:'Página e formulário feitos para a intenção de quem chega.',
    nos:[['Landing page',.5,[0,1,2]]] },
  { nome:'Retenção', desc:'CRM e automação levam o lead até o fechamento e além.',
    nos:[['CRM',.18,[0]],['Automação',.5,[0]],['Remarketing',.82,[0]]] },
  { nome:'Receita', desc:'', fim:true, nos:[['Receita',.5,[]]] }
];
const rede = $('rede'), svgRede = $('redeSvg');
const NS = 'http://www.w3.org/2000/svg';
let nosEl = [], rotulos = [], arestas = [], luzes = [];

function montarRede(){
  rede.querySelectorAll('.no, .camada-rot').forEach(n => n.remove());
  svgRede.innerHTML = '';
  nosEl = []; rotulos = []; arestas = []; luzes = [];
  const mobile = window.innerWidth <= 768;
  const W = rede.clientWidth, H = rede.clientHeight;
  const x0 = mobile ? 0 : W * .2, larg = W - x0;
  const passoY = H / (etapas.length - 1 + .6);
  etapas.forEach((e, c) => {
    const y = passoY * (c + .3);
    if(!e.fim){
      const r = document.createElement('span');
      r.className = 'camada-rot'; r.textContent = e.nome; r.style.top = y + 'px';
      rede.appendChild(r); rotulos.push(r);
    }
    nosEl[c] = e.nos.map(([txt, fx]) => {
      const n = document.createElement('span');
      n.className = 'no' + (e.fim ? ' ultimo' : '');
      n.textContent = txt;
      n.style.left = (x0 + larg * (mobile ? .06 + fx * .88 : fx)) + 'px';
      n.style.top = y + 'px';
      rede.appendChild(n);
      return n;
    });
    if(mobile && nosEl[c].length > 1){
      const gap = 6, medir = () => nosEl[c].map(n => n.offsetWidth);
      let larguras = medir(), total = larguras.reduce((t, w) => t + w, 0) + gap * (larguras.length - 1);
      if(total > W - 12){ nosEl[c].forEach(n => n.classList.add('no-mini')); larguras = medir(); total = larguras.reduce((t, w) => t + w, 0) + gap * (larguras.length - 1); }
      let x = (W - total) / 2;
      nosEl[c].forEach((n, i) => { n.style.left = (x + larguras[i] / 2) + 'px'; x += larguras[i] + gap; });
    }
  });
  etapas.forEach((e, c) => {
    e.nos.forEach(([, , liga], i) => liga.forEach(k => {
      const a = nosEl[c][i], b = nosEl[c + 1][k];
      const x1 = parseFloat(a.style.left), y1 = parseFloat(a.style.top) + a.offsetHeight / 2;
      const x2 = parseFloat(b.style.left), y2 = parseFloat(b.style.top) - b.offsetHeight / 2;
      const m = (y2 - y1) * .55;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', `M${x1},${y1} C${x1},${y1 + m} ${x2},${y2 - m} ${x2},${y2}`);
      p.setAttribute('class', 'aresta');
      svgRede.appendChild(p);
      const comp = p.getTotalLength();
      const ar = { p, comp, de:c };
      arestas.push(ar);
      [0, .5].forEach(fase => {
        const l = document.createElementNS(NS, 'circle');
        l.setAttribute('r', 2.6); l.setAttribute('class', 'luz'); l.style.opacity = 0;
        svgRede.appendChild(l);
        luzes.push({ el:l, ar, fase });
      });
    }));
  });
  acenderTudo();
}

function acenderTudo(){
  nosEl.forEach((camada, c) => camada.forEach(n => {
    n.classList.add('is-on');
    n.classList.toggle('is-fim', !!etapas[c].fim);
  }));
  rotulos.forEach(r => r.classList.add('is-on'));
  arestas.forEach(a => a.p.classList.add('is-on'));
}

let redeVisivel = false;
new IntersectionObserver(([e]) => { redeVisivel = e.isIntersecting; }).observe(rede);
function correrLuzes(t){
  if(redeVisivel){
    luzes.forEach(L => {
      const k = ((t / 1700) + L.fase + L.ar.de * .13) % 1;
      const pt = L.ar.p.getPointAtLength(k * L.ar.comp);
      L.el.setAttribute('cx', pt.x); L.el.setAttribute('cy', pt.y);
      L.el.style.opacity = Math.sin(k * Math.PI);
    });
  }
  requestAnimationFrame(correrLuzes);
}

const chuva = $('chuva'), ctxChuva = chuva.getContext('2d');
let colunas = [], ultimoChuva = 0;
function prepararChuva(){
  const r = chuva.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
  chuva.width = r.width * dpr; chuva.height = r.height * dpr;
  ctxChuva.setTransform(dpr, 0, 0, dpr, 0, 0);
  const passo = 22;
  colunas = Array.from({ length: Math.ceil(r.width / passo) }, (_, i) => ({
    x: i * passo + 6, y: Math.random() * r.height, vel: 8 + Math.random() * 18,
    digs: Array.from({ length: Math.ceil(r.height / 18) + 2 }, () => Math.floor(Math.random() * 10))
  }));
}
function pingarChuva(t){
  if(redeVisivel && t - ultimoChuva > 90){
    const dt = ultimoChuva ? (t - ultimoChuva) / 1000 : 0; ultimoChuva = t;
    const w = chuva.clientWidth, hgt = chuva.clientHeight;
    ctxChuva.clearRect(0, 0, w, hgt);
    ctxChuva.font = '600 11px "Inter", sans-serif';
    colunas.forEach(c => {
      c.y = (c.y + c.vel * dt) % 18;
      if(Math.random() < .15) c.digs[Math.floor(Math.random() * c.digs.length)] = Math.floor(Math.random() * 10);
      c.digs.forEach((d, k) => {
        const y = k * 18 + c.y;
        ctxChuva.fillStyle = `rgba(244,243,234,${.05 + .08 * Math.sin((k + c.x) * .7) ** 2})`;
        ctxChuva.fillText(d, c.x, y);
      });
    });
  }
  requestAnimationFrame(pingarChuva);
}

montarRede();
prepararChuva();
if(!semMovimento){ requestAnimationFrame(correrLuzes); requestAnimationFrame(pingarChuva); }
window.addEventListener('resize', () => { montarRede(); prepararChuva(); });
if(document.fonts) document.fonts.ready.then(montarRede);

montarLetras($('marcaGigante'));

function encaixarMarca(){
  const el = $('marcaGigante');
  el.style.fontSize = (el.parentElement.clientWidth * .96 / LOGO_LINHA) + 'px';
}
encaixarMarca();
window.addEventListener('resize', encaixarMarca);
$('mobileMenu').querySelectorAll('[data-fecha]').forEach(a => a.addEventListener('click', fecharMenu));

const playSvg = '<svg viewBox="0 0 24 24"><path d="M7 5v14l12-7z"/></svg>';
function cardPeca(p, n){
  const alt = `Peça ${p.e}, ${p.c}`;
  let midia;
  if(p.t === 'vid') midia = `<span class="peca-video">${playSvg}Vídeo</span><video data-n="${n}" muted loop playsinline preload="none" aria-label="${alt}"></video>`;
  else if(p.t === 'lp') midia = `<span class="barra" aria-hidden="true"><i></i><i></i><i></i></span><img data-n="${n}" alt="${alt}" draggable="false">`;
  else midia = `<img data-n="${n}" alt="${alt}">`;
  const prop = p.t === 'lp' ? '' : ` style="aspect-ratio:${p.w}/${p.h}"`;
  return `<figure class="peca${p.t === 'lp' ? ' peca-lp' : ''}">
    <div class="peca-midia"${prop}>${midia}</div>
    <figcaption class="peca-leg"><strong>${p.c}</strong><span class="selo">${p.e}</span></figcaption>
  </figure>`;
}
$('mosaico').innerHTML = PECAS.map(cardPeca).join('');

function carregar(el){
  const p = PECAS[el.dataset.n];
  if(el.tagName === 'VIDEO'){ el.poster = p.p; el.src = p.s; }
  else el.src = p.s;
  el.dataset.ok = '1';
}
const olhoPecas = new IntersectionObserver(entradas => {
  entradas.forEach(en => {
    const el = en.target;
    if(en.isIntersecting && !el.dataset.ok) carregar(el);
    if(el.tagName === 'VIDEO'){ if(en.isIntersecting) el.play().catch(() => {}); else el.pause(); }
  });
}, { rootMargin:'600px 0px' });
document.querySelectorAll('#mosaico [data-n]').forEach(el => olhoPecas.observe(el));

function rolarLp(fig, ir){
  const img = fig.querySelector('img'), jan = fig.querySelector('.peca-midia');
  const dist = Math.max(0, img.offsetHeight - jan.clientHeight);
  img.style.transitionDuration = ir ? Math.max(2, dist / 260) + 's' : '1.2s';
  img.style.transform = ir ? `translateY(${-dist}px)` : '';
  fig.classList.toggle('is-rolando', ir);
}
document.querySelectorAll('.peca-lp').forEach(fig => {
  fig.addEventListener('mouseenter', () => rolarLp(fig, true));
  fig.addEventListener('mouseleave', () => rolarLp(fig, false));
  fig.addEventListener('click', () => rolarLp(fig, !fig.classList.contains('is-rolando')));
});

const linksMenu = [...document.querySelectorAll('.main-nav a')];
const secoesMenu = linksMenu.map(a => a.getAttribute('href')).filter(h => !h.startsWith('#/')).map(h => document.querySelector(h));
function marcarMenu(){
  let atual = null;
  if(document.body.dataset.view === 'portfolio') atual = '#/portfolio';
  else {
    const linha = window.innerHeight * .4;
    secoesMenu.forEach(sec => { if(sec && sec.getBoundingClientRect().top <= linha) atual = '#' + sec.id; });
  }
  linksMenu.forEach(a => {
    const ativo = a.getAttribute('href') === atual;
    a.classList.toggle('is-ativo', ativo);
    if(ativo) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', marcarMenu, { passive:true });

const views = { home:$('view-home'), portfolio:$('view-portfolio') };
function mostrarView(nome){
  Object.entries(views).forEach(([k, v]) => v.classList.toggle('is-on', k === nome));
  document.body.dataset.view = nome;
  if(nome === 'home'){ document.title = 'Growth77 | First Acquisition Agency'; window.dispatchEvent(new Event('resize')); }
  if(nome === 'portfolio') document.title = 'Portfólio | Growth77';
  marcarMenu();
}

function rotear(){
  const hash = location.hash || '#/';
  if(hash.startsWith('#/portfolio')){ mostrarView('portfolio'); window.scrollTo(0, 0); medir('ver_portfolio'); return; }
  const estavaFora = !views.home.classList.contains('is-on');
  mostrarView('home');
  const alvo = hash.length > 2 && !hash.startsWith('#/') ? document.querySelector(hash) : null;
  if(alvo) requestAnimationFrame(() => alvo.scrollIntoView({ behavior: estavaFora ? 'auto' : 'smooth' }));
  else if(estavaFora) window.scrollTo(0, 0);
}
window.addEventListener('hashchange', rotear);
rotear();

document.addEventListener('click', e => {
  const el = e.target.closest('[data-evento]');
  if(el) medir('clique_cta', { posicao:el.dataset.evento });
});
