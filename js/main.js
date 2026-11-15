const $ = id => document.getElementById(id);
const limitar = (v, min, max) => Math.min(Math.max(v, min), max);
const misturar = (a, b, t) => a + (b - a) * t;
const suavizar = t => 1 - Math.pow(1 - t, 3);
const faixa = (p, a, b) => limitar((p - a) / (b - a), 0, 1);
const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function medir(evento, dados){ window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({ event:evento }, dados || {})); }

const FATIAS = 3;

const LOGO_LINHA = LOGO.letras.reduce((t, l) => t + l.w + l.gap, 0);
function montarLetras(alvo, comFatias){
  alvo.textContent = '';
  LOGO.letras.forEach(l => {
    const lt = document.createElement('span');
    lt.className = 'lt';
    lt.style.setProperty('--w', l.w);
    lt.style.setProperty('--gap', l.gap);
    const img = `<img${comFatias ? ' class="fatia"' : ''} src="${l.src}" alt="" draggable="false">`;
    lt.innerHTML = comFatias ? img.repeat(FATIAS) : img;
    alvo.appendChild(lt);
  });
}
const linhaLogo = document.querySelector('[data-quebra]');
linhaLogo.setAttribute('aria-hidden', 'true');
montarLetras(linhaLogo, true);
const letrasLogo = [...linhaLogo.querySelectorAll('.lt')];
const totalPedacos = letrasLogo.length * FATIAS;
$('zerouTotal').textContent = totalPedacos;

let audio = null;
let somLigado = true;
function tocarMoeda(){
  if(!somLigado) return;
  audio = audio || new (window.AudioContext || window.webkitAudioContext)();
  const agora = audio.currentTime;
  const saida = audio.createGain();
  saida.gain.value = .16;
  saida.connect(audio.destination);
  [[1568, 0, .07], [2093, .07, .32]].forEach(([freq, ini, dur]) => {
    const osc = audio.createOscillator();
    const env = audio.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, agora + ini);
    env.gain.linearRampToValueAtTime(1, agora + ini + .005);
    env.gain.exponentialRampToValueAtTime(.001, agora + ini + dur);
    osc.connect(env); env.connect(saida);
    osc.start(agora + ini); osc.stop(agora + ini + dur + .02);
  });
}
function tocarQuebra(){
  if(!somLigado || !audio) return;
  const agora = audio.currentTime;
  const tam = audio.sampleRate * .06;
  const buf = audio.createBuffer(1, tam, audio.sampleRate);
  const d = buf.getChannelData(0);
  for(let i = 0; i < tam; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / tam);
  const ruido = audio.createBufferSource();
  const filtro = audio.createBiquadFilter();
  const env = audio.createGain();
  ruido.buffer = buf; filtro.type = 'lowpass'; filtro.frequency.value = 1800; env.gain.value = .12;
  ruido.connect(filtro); filtro.connect(env); env.connect(audio.destination);
  ruido.start(agora);
}
$('somBtn').addEventListener('click', e => {
  somLigado = !somLigado;
  e.currentTarget.setAttribute('aria-pressed', somLigado);
});

let moedas = 0;
const cacos = [];

function letraMaisProxima(x, y){
  let melhor = null, dist = Infinity;
  letrasLogo.forEach(lt => {
    if(!lt.querySelector('.fatia:not(.is-gone)')) return;
    const b = lt.getBoundingClientRect();
    const d = Math.hypot(b.left + b.width / 2 - x, b.top + b.height / 2 - y);
    if(d < dist){ dist = d; melhor = lt; }
  });
  return melhor;
}

function quebrar(x, y){
  const lt = letraMaisProxima(x, y);
  if(!lt) return;
  const restantes = [...lt.querySelectorAll('.fatia:not(.is-gone)')];
  const fatia = restantes[restantes.length - 1];
  const indice = [...lt.querySelectorAll('.fatia')].indexOf(fatia);

  const b = lt.getBoundingClientRect();
  const caco = fatia.cloneNode();
  caco.className = 'caco';
  caco.style.width = b.width + 'px';
  caco.style.height = b.height + 'px';
  caco.style.clipPath = getComputedStyle(fatia).clipPath;
  document.body.appendChild(caco);
  fatia.classList.add('is-gone');
  cacos.push({ el:caco, x:b.left, y:b.top, vx:(Math.random() - .5) * 420, vy:-260 - Math.random() * 200, r:0, vr:(Math.random() - .5) * 540 });
  if(!animandoCacos){ animandoCacos = true; requestAnimationFrame(cairCacos); }

  lt.classList.remove('is-hit'); void lt.offsetWidth; lt.classList.add('is-hit');

  soltarMoeda(x, y);
  tocarQuebra();
  tocarMoeda();

  moedas++;
  $('contador').textContent = String(moedas).padStart(2, '0');
  $('placar').classList.remove('is-bump'); void $('placar').offsetWidth; $('placar').classList.add('is-bump');
  medir('logo_moeda', { moedas, letra: indice });

  if(moedas % totalPedacos === 0) setTimeout(logoZerado, 700);
}

function soltarMoeda(x, y){
  const m = document.createElement('span');
  m.className = 'moeda';
  m.innerHTML = '<i></i>';
  m.style.left = x + 'px'; m.style.top = y + 'px';
  document.body.appendChild(m);
  const g = document.createElement('span');
  g.className = 'ganho';
  g.textContent = '+1';
  g.style.left = x + 'px'; g.style.top = y + 'px';
  document.body.appendChild(g);
  setTimeout(() => { m.remove(); g.remove(); }, 950);
}

let animandoCacos = false, ultimoQuadro = 0;
function cairCacos(t){
  const dt = ultimoQuadro ? Math.min((t - ultimoQuadro) / 1000, .04) : .016;
  ultimoQuadro = t;
  for(let i = cacos.length - 1; i >= 0; i--){
    const c = cacos[i];
    c.vy += 1900 * dt;
    c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt;
    c.el.style.transform = `translate(${c.x}px, ${c.y}px) rotate(${c.r}deg)`;
    if(c.y > window.innerHeight + 200){ c.el.remove(); cacos.splice(i, 1); }
  }
  if(cacos.length){ requestAnimationFrame(cairCacos); }
  else { animandoCacos = false; ultimoQuadro = 0; }
}

function logoZerado(){
  $('zerouTotal').textContent = moedas;
  $('logo').classList.add('is-zerado');
  $('zerou').classList.add('is-on');
  medir('logo_zerado', { moedas });
}

function remontarLogo(){
  $('zerou').classList.remove('is-on');
  $('logo').classList.remove('is-zerado');
  letrasLogo.forEach((lt, i) => {
    lt.querySelectorAll('.fatia').forEach((f, k) => {
      setTimeout(() => f.classList.remove('is-gone'), i * 70 + k * 40);
    });
  });
}

$('heroCard').addEventListener('click', e => {
  if(e.target.closest('a, button')) return;
  if($('zerou').classList.contains('is-on')){ remontarLogo(); return; }
  quebrar(e.clientX, e.clientY);
});

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

const orbitas = [...document.querySelectorAll('.orbit')];
function posicionarOrbitas(){
  const mobile = window.innerWidth <= 768;
  orbitas.forEach(o => {
    const [rw, rh] = o.dataset.r.split('/').map(Number);
    const w = (mobile ? o.dataset.w * 1.8 : +o.dataset.w) * window.innerWidth / 100;
    const h = w * rh / rw;
    Object.assign(o.style, { width:w + 'px', height:h + 'px',
      left:(o.dataset.x * window.innerWidth / 100 - w / 2) + 'px',
      top:(o.dataset.y * window.innerHeight / 100 - h / 2) + 'px' });
  });
}

const tiles = [...document.querySelectorAll('.tile')];
let alvo = { w:0, h:0, x:0, y:0 };
function montarGrade(){
  const vw = window.innerWidth, vh = window.innerHeight;
  const mobile = vw <= 768;
  const gap = mobile ? 10 : 18;
  const w = mobile ? vw * .78 : vw * .56;
  const h = mobile ? vh * .42 : vh * .62;
  const x = (vw - w) / 2, y = (vh - h) / 2;
  alvo = { w, h, x, y };
  const lado = mobile ? vw * .5 : vw * .2;
  const meia = (w - gap) / 2;
  const alturaFaixa = vh * .34;
  const pos = {
    'topo-esq': [x, y - gap - alturaFaixa, meia, alturaFaixa],
    'topo-dir': [x + meia + gap, y - gap - alturaFaixa, meia, alturaFaixa],
    'base-esq': [x, y + h + gap, meia, alturaFaixa],
    'base-dir': [x + meia + gap, y + h + gap, meia, alturaFaixa],
    'esq-1':    [x - gap - lado, y - vh * .18, lado, vh * .44],
    'esq-2':    [x - gap - lado, y - vh * .18 + vh * .44 + gap, lado, vh * .5],
    'dir-1':    [x + w + gap, y - vh * .08, lado, vh * .38],
    'dir-2':    [x + w + gap, y - vh * .08 + vh * .38 + gap, lado, vh * .46]
  };
  tiles.forEach(t => {
    const [tx, ty, tw, th] = pos[t.dataset.slot];
    Object.assign(t.style, { left:tx + 'px', top:ty + 'px', width:tw + 'px', height:th + 'px' });
  });
}

const cena = $('metodo');
const l1 = $('fraseL1');
const midia = $('midia');
const palEsq = $('palEsq');
const palDir = $('palDir');
const copia = $('sceneCopy');
const grade = $('grade');
const frase = document.querySelector('.frase');

function atualizarCena(){
  const vh = window.innerHeight, vw = window.innerWidth;
  const topo = cena.getBoundingClientRect().top;
  const p = limitar(-topo / (cena.offsetHeight - vh), 0, 1);

  const a = suavizar(faixa(p, 0, .14));
  orbitas.forEach(o => {
    const dx = (o.dataset.x - 50) / 50, dy = (o.dataset.y - 50) / 50;
    o.style.transform = `translate(${dx * a * vw * .18}px, ${dy * a * vh * .18}px) scale(${misturar(1, .85, a)})`;
    o.style.opacity = 1 - a;
  });
  l1.style.opacity = misturar(1, .28, a) * (1 - faixa(p, .14, .24));
  l1.style.transform = `translateY(${-faixa(p, .14, .24) * 40}px)`;

  const c = suavizar(faixa(p, .2, .62));
  const tamFonte = parseFloat(getComputedStyle(palEsq).fontSize);
  const w = misturar(0, alvo.w, c);
  const h = misturar(tamFonte * .8, alvo.h, c);
  midia.style.width = w + 'px';
  midia.style.height = h + 'px';
  midia.style.borderRadius = misturar(6, 18, c) + 'px';
  midia.style.marginLeft = midia.style.marginRight = misturar(tamFonte * .22, tamFonte * .6, c) + 'px';
  const fuga = suavizar(faixa(p, .45, .64)) * vw * .4;
  palEsq.style.transform = `translateX(${-fuga}px)`;
  palDir.style.transform = `translateX(${fuga}px)`;
  palEsq.style.opacity = palDir.style.opacity = 1 - faixa(p, .56, .64);
  frase.style.transform = `translateY(${misturar(0, -(l1.offsetHeight / 2), faixa(p, .14, .3))}px)`;

  const g = suavizar(faixa(p, .58, .78));
  tiles.forEach((t, i) => {
    const atraso = faixa(g, i * .06, i * .06 + .5);
    t.style.opacity = atraso;
    t.style.transform = `scale(${misturar(.88, 1, atraso)}) translateY(${misturar(30, 0, atraso)}px)`;
  });

  const tx = suavizar(faixa(p, .74, .88));
  copia.style.opacity = tx;
  copia.style.transform = `translateY(${misturar(30, 0, tx)}px)`;
  copia.classList.toggle('is-on', tx > .5);

  const saida = faixa(p, .86, 1) * -vh * .35;
  grade.style.transform = `translateY(${saida}px)`;
  midia.style.translate = `0 ${saida}px`;
}

function atualizarInterface(){
  const passouHero = window.scrollY > $('hero').offsetHeight - 80;
  $('siteHeader').classList.toggle('is-solid', window.scrollY > 20);
  $('ctaFixa').classList.toggle('is-on', passouHero);
}

let agendado = false;
function aoRolar(){
  if(agendado) return;
  agendado = true;
  requestAnimationFrame(() => {
    if(!semMovimento) atualizarCena();
    atualizarInterface();
    agendado = false;
  });
}

function igualarPalavras(){
  palEsq.style.width = palDir.style.width = 'auto';
  const maior = Math.max(palEsq.offsetWidth, palDir.offsetWidth);
  palEsq.style.width = palDir.style.width = maior + 'px';
  palEsq.style.textAlign = 'right';
}
function recalcular(){ igualarPalavras(); posicionarOrbitas(); montarGrade(); aoRolar(); }
window.addEventListener('scroll', aoRolar, { passive:true });
window.addEventListener('resize', recalcular);
recalcular();
if(document.fonts) document.fonts.ready.then(recalcular);

if(semMovimento){
  orbitas.forEach(o => o.style.opacity = 0);
  l1.style.opacity = 0;
  palEsq.style.opacity = palDir.style.opacity = 0;
  Object.assign(midia.style, { width:alvo.w + 'px', height:alvo.h + 'px' });
  tiles.forEach(t => t.style.opacity = 1);
  copia.style.opacity = 1; copia.style.transform = 'none';
}

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

const depTrilho = $('depTrilho');
function atualizarDep(){
  const max = depTrilho.scrollWidth - depTrilho.clientWidth;
  const larg = Math.max(depTrilho.clientWidth / depTrilho.scrollWidth * 100, 10);
  $('depBarra').style.width = larg + '%';
  $('depBarra').style.left = max > 0 ? (depTrilho.scrollLeft / max) * (100 - larg) + '%' : '0%';
}
depTrilho.addEventListener('scroll', atualizarDep, { passive:true });
window.addEventListener('resize', atualizarDep);
atualizarDep();

let arrasto = null;
depTrilho.addEventListener('pointerdown', e => {
  if(e.pointerType !== 'mouse' || e.target.closest('button')) return;
  arrasto = { x:e.clientX, s:depTrilho.scrollLeft, moveu:false };
});
window.addEventListener('pointermove', e => {
  if(!arrasto) return;
  const dx = e.clientX - arrasto.x;
  if(Math.abs(dx) > 4){ arrasto.moveu = true; depTrilho.classList.add('is-arrastando'); }
  depTrilho.scrollLeft = arrasto.s - dx;
});
window.addEventListener('pointerup', () => {
  if(!arrasto) return;
  depTrilho.classList.remove('is-arrastando');
  const card = depTrilho.querySelector('.dep');
  const passo = card.offsetWidth + (parseFloat(getComputedStyle(depTrilho).columnGap) || 0);
  depTrilho.scrollTo({ left: Math.round(depTrilho.scrollLeft / passo) * passo, behavior:'smooth' });
  arrasto = null;
});

let tocando = null, rafDep = 0;
function parar(){
  if(!tocando) return;
  tocando.card.classList.remove('is-tocando');
  cancelAnimationFrame(rafDep);
  tocando = null;
}
function tocar(card){
  const [m, s] = card.dataset.dur.split(':').map(Number);
  const total = (m * 60 + s) * 1000;
  const barra = card.querySelector('.dep-barra i');
  const inicio = performance.now() - (parseFloat(barra.style.width) || 0) / 100 * total;
  tocando = { card };
  card.classList.add('is-tocando');
  const passo = t => {
    const p = Math.min((t - inicio) / total, 1);
    barra.style.width = (p * 100) + '%';
    if(p < 1 && tocando && tocando.card === card) rafDep = requestAnimationFrame(passo);
    else if(p >= 1){ barra.style.width = '0%'; parar(); }
  };
  rafDep = requestAnimationFrame(passo);
  medir('depoimento_play', { cliente: card.dataset.cliente });
}
depTrilho.addEventListener('click', e => {
  const btn = e.target.closest('.dep-play');
  if(!btn) return;
  const card = btn.closest('.dep');
  if(tocando && tocando.card === card){ parar(); return; }
  parar();
  tocar(card);
});
new IntersectionObserver(([e]) => { if(!e.isIntersecting) parar(); }).observe(depTrilho);

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
    ctxChuva.font = '500 11px "JetBrains Mono", monospace';
    colunas.forEach(c => {
      c.y = (c.y + c.vel * dt) % 18;
      if(Math.random() < .15) c.digs[Math.floor(Math.random() * c.digs.length)] = Math.floor(Math.random() * 10);
      c.digs.forEach((d, k) => {
        const y = k * 18 + c.y;
        ctxChuva.fillStyle = `rgba(15,15,15,${.06 + .08 * Math.sin((k + c.x) * .7) ** 2})`;
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

montarLetras($('marcaGigante'), false);

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

document.querySelectorAll('.real').forEach(el => {
  if(el.dataset.recorte){ el.innerHTML = `<img src="${RECORTES[el.dataset.recorte]}" alt="${el.getAttribute('aria-label') || ''}">`; return; }
  const p = PECAS[el.dataset.peca];
  el.innerHTML = p.t === 'vid'
    ? `<video src="${p.s}" poster="${p.p}" muted loop playsinline autoplay aria-label="${el.getAttribute('aria-label') || p.c}"></video>`
    : `<img src="${p.s}" alt="${el.getAttribute('aria-label') || 'Peça ' + p.e + ', ' + p.c}">`;
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
  if(nome === 'home'){ document.title = 'Preview: Growth77, site institucional'; window.dispatchEvent(new Event('resize')); }
  if(nome === 'portfolio') document.title = 'Preview: Growth77, portfólio';
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
