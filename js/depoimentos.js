(() => {
  const raiz = document.getElementById('stories');
  const palco = document.getElementById('storiesPalco');
  const cards = [...palco.querySelectorAll('.story')];
  const nomes = document.getElementById('stNomes');
  const botaoPausa = document.getElementById('stPausa');
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = cards.length;
  const TROCA = 6000;

  let ativo = 0, pausado = reduzir, tocando = false, visivel = false, inicio = 0, duracao = TROCA, raf = 0, decorrido = 0;

  const segundos = d => { const [m, s] = d.split(':').map(Number); return (m * 60 + s) * 1000; };

  cards.forEach((c, i) => {
    c.querySelector('.st-barras').innerHTML = cards.map(() => '<i><b></b></i>').join('');
    const li = document.createElement('li');
    li.innerHTML = `<button type="button">${c.dataset.cliente}</button>`;
    li.querySelector('button').addEventListener('click', () => ir(i));
    nomes.appendChild(li);
    c.addEventListener('click', e => {
      if(e.target.closest('.st-play')) return;
      if(i !== ativo) ir(i);
    });
    c.querySelector('.st-play').addEventListener('click', () => {
      if(i !== ativo){ ir(i); return; }
      tocando ? pararVideo() : tocarVideo();
    });
  });

  function posicionar(){
    const compacto = window.innerWidth <= 768;
    cards.forEach((c, i) => {
      let d = i - ativo;
      if(d > N / 2) d -= N;
      if(d < -N / 2) d += N;
      const a = Math.abs(d);
      const x = d * (compacto ? 78 : 68);
      const esc = a === 0 ? 1 : Math.max(.62, 1 - a * .16);
      c.style.transform = `translateX(${x}%) perspective(1400px) rotateY(${(-d * 16).toFixed(1)}deg) scale(${esc.toFixed(3)})`;
      c.style.zIndex = 20 - a;
      c.style.opacity = a > (compacto ? 1 : 2) ? 0 : a === 0 ? 1 : .42 - (a - 1) * .22;
      c.classList.toggle('is-ativo', a === 0);
      c.setAttribute('aria-hidden', a === 0 ? 'false' : 'true');
      c.querySelectorAll('button').forEach(b => b.tabIndex = a === 0 ? 0 : -1);
      c.querySelectorAll('.st-barras i').forEach((seg, k) => seg.classList.toggle('is-feito', k < ativo));
    });
    [...nomes.children].forEach((li, k) => {
      const b = li.firstChild;
      if(k === ativo) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }

  function barraAtual(){ return cards[ativo].querySelectorAll('.st-barras b')[ativo]; }

  function limparBarras(){
    cards.forEach(c => c.querySelectorAll('.st-barras b').forEach(b => b.style.width = ''));
  }

  function laco(t){
    if(!inicio) inicio = t - decorrido;
    decorrido = t - inicio;
    const p = Math.min(1, decorrido / duracao);
    barraAtual().style.width = (p * 100) + '%';
    if(p >= 1){ proximo(); return; }
    raf = requestAnimationFrame(laco);
  }
  function rodar(){
    cancelAnimationFrame(raf);
    if((pausado && !tocando) || !visivel) return;
    inicio = 0;
    raf = requestAnimationFrame(laco);
  }

  function ir(i){
    pararVideo(true);
    ativo = (i + N) % N;
    decorrido = 0; duracao = TROCA;
    limparBarras();
    posicionar();
    rodar();
  }
  const proximo = () => ir(ativo + 1);
  const anterior = () => ir(ativo - 1);

  function tocarVideo(){
    const c = cards[ativo];
    tocando = true; c.classList.add('is-tocando');
    decorrido = 0; duracao = segundos(c.dataset.dur);
    if(typeof medir === 'function') medir('depoimento_play', { cliente: c.dataset.cliente });
    rodar();
  }
  function pararVideo(silencioso){
    if(!tocando) return;
    tocando = false;
    cards.forEach(c => c.classList.remove('is-tocando'));
    if(!silencioso){ decorrido = 0; duracao = TROCA; barraAtual().style.width = ''; rodar(); }
  }

  document.getElementById('stProx').addEventListener('click', proximo);
  document.getElementById('stAnt').addEventListener('click', anterior);
  botaoPausa.addEventListener('click', () => {
    pausado = !pausado;
    botaoPausa.setAttribute('aria-pressed', pausado);
    botaoPausa.setAttribute('aria-label', pausado ? 'Retomar troca automática' : 'Pausar troca automática');
    rodar();
  });
  raiz.addEventListener('keydown', e => {
    if(e.key === 'ArrowRight'){ proximo(); e.preventDefault(); }
    if(e.key === 'ArrowLeft'){ anterior(); e.preventDefault(); }
  });

  let toque = null;
  palco.addEventListener('pointerdown', e => { toque = { x: e.clientX, y: e.clientY }; });
  palco.addEventListener('pointerup', e => {
    if(!toque) return;
    const dx = e.clientX - toque.x, dy = e.clientY - toque.y;
    toque = null;
    if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? proximo() : anterior();
  });

  new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
    if(!visivel){ cancelAnimationFrame(raf); pararVideo(true); } else rodar();
  }, { threshold: .35 }).observe(raiz);

  if(reduzir){ botaoPausa.setAttribute('aria-pressed', 'true'); botaoPausa.setAttribute('aria-label', 'Retomar troca automática'); }
  posicionar();
  window.addEventListener('resize', posicionar);
})();
