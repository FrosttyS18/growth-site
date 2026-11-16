(() => {
  const janela = document.getElementById('depoJanela');
  const trilho = document.getElementById('depoTrilho');
  if(!janela || !trilho) return;
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const originais = [...trilho.querySelectorAll('.depo-slide')];
  const N = originais.length;

  const slides = originais;
  const midia = janela.parentElement;

  let atual = 0, visivel = false, comSom = false, tocando = !reduzir;

  function deslocar(semAnimacao){
    const w = slides[0].offsetWidth;
    const compacto = window.innerWidth <= 768;
    if(!compacto) janela.style.width = Math.max(w, window.innerWidth - midia.getBoundingClientRect().left) + 'px';
    else janela.style.width = '';
    const base = compacto ? (janela.clientWidth - w) / 2 : 0;
    trilho.classList.toggle('sem-transicao', !!semAnimacao);
    trilho.style.transform = `translateX(${(base - atual * w).toFixed(1)}px)`;
    if(semAnimacao){ void trilho.offsetWidth; trilho.classList.remove('sem-transicao'); }
  }

  function video(slide){
    const src = slide.dataset.video;
    if(!src) return null;
    let v = slide.querySelector('.depo-video');
    if(!v){
      v = document.createElement('video');
      v.className = 'depo-video';
      v.playsInline = true;
      v.preload = 'metadata';
      v.src = src;
      v.addEventListener('playing', () => slide.classList.remove('is-carregando'));
      v.addEventListener('waiting', () => slide.classList.add('is-carregando'));
      v.addEventListener('ended', () => { if(slide.classList.contains('is-ativo')) ir(atual + 1); });
      slide.querySelector('.depo-poster').after(v);
    }
    return v;
  }

  function aplicar(){
    slides.forEach((s, i) => {
      const ativo = i === atual;
      s.classList.toggle('is-ativo', ativo);
      s.classList.toggle('com-som', ativo && comSom);
      s.querySelectorAll('button').forEach(b => b.tabIndex = ativo ? 0 : -1);
      if(!ativo){
        s.classList.remove('is-tocando', 'is-carregando');
        const v = s.querySelector('.depo-video');
        if(v){ v.pause(); v.currentTime = 0; }
      }
    });
    const s = slides[atual];
    const deveTocar = tocando && visivel;
    s.classList.toggle('is-tocando', deveTocar);
    const botao = s.querySelector('.depo-tocar');
    botao.setAttribute('aria-label', deveTocar ? 'Pausar depoimento' : 'Reproduzir depoimento');
    s.querySelector('.depo-som').setAttribute('aria-label', comSom ? 'Desativar som' : 'Ativar som');
    const v = video(s);
    if(v){
      v.muted = !comSom;
      if(deveTocar){ s.classList.add('is-carregando'); v.play().catch(() => s.classList.remove('is-carregando')); }
      else v.pause();
    }
  }

  function ir(i){
    atual = (i + N) % N;
    deslocar(reduzir);
    aplicar();
  }

  slides.forEach(s => {
    s.querySelector('.depo-ant').addEventListener('click', () => ir(atual - 1));
    s.querySelector('.depo-prox').addEventListener('click', () => ir(atual + 1));
    s.querySelector('.depo-tocar').addEventListener('click', () => { tocando = !tocando; aplicar(); });
    s.querySelector('.depo-som').addEventListener('click', () => { comSom = !comSom; aplicar(); });
    s.querySelector('.depo-repetir').addEventListener('click', () => {
      const v = video(slides[atual]);
      if(v) v.currentTime = 0;
      tocando = true;
      aplicar();
    });
  });

  janela.addEventListener('keydown', e => {
    if(e.key === 'ArrowRight'){ ir(atual + 1); e.preventDefault(); }
    if(e.key === 'ArrowLeft'){ ir(atual - 1); e.preventDefault(); }
  });

  let toque = null;
  janela.addEventListener('pointerdown', e => { toque = { x: e.clientX, y: e.clientY }; });
  janela.addEventListener('pointerup', e => {
    if(!toque) return;
    const dx = e.clientX - toque.x, dy = e.clientY - toque.y;
    toque = null;
    if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) ir(atual + (dx < 0 ? 1 : -1));
  });

  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; aplicar(); }, { threshold: .4 }).observe(janela);
  window.addEventListener('resize', () => deslocar(true));
  deslocar(true);
  aplicar();
})();
