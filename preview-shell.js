(() => {
  const desktop=matchMedia('(min-width: 601px)'),embedded=window.self!==window.top;
  if(embedded||!desktop.matches){
    const sources=['figma-screens.js', 'figma-qna.js', 'figma-project-screens.js', 'figma-project-refresh.js', 'figma-projects.js', 'figma-collection-screens.js', 'figma-refresh.js', 'onboarding.js', 'figma-commerce.js', 'figma-search.js', 'figma-comment-screen.js', 'figma-posts.js', 'figma-app.js', 'button-motion.js', 'cat-easter-egg.js'];
    (async()=>{for(const src of sources)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.append(script)})})().catch(()=>{document.getElementById('status').textContent='화면을 불러오지 못했습니다. 새로고침해 주세요.'});
    if(!embedded)desktop.addEventListener('change',()=>location.reload());
    return;
  }
  document.body.classList.add('desktop-preview');
  document.getElementById('app').remove();
  const device=document.createElement('div');device.className='preview-device';
  const screen=document.createElement('iframe');screen.title='Komoa 앱 미리보기';screen.src=location.pathname+location.search+location.hash;
  device.append(screen);document.body.append(device);
  let guideEnabled=localStorage.getItem('komoa-interaction-guide')==='true';
  const guideToggle=document.createElement('button');guideToggle.type='button';guideToggle.className='preview-guide-toggle';guideToggle.setAttribute('aria-label','상호작용 가이드 켜기');document.body.append(guideToggle);
  const syncGuide=()=>{guideToggle.setAttribute('aria-pressed',String(guideEnabled));guideToggle.setAttribute('aria-label',`상호작용 가이드 ${guideEnabled?'끄기':'켜기'}`);guideToggle.innerHTML=`<span>가이드</span><strong>${guideEnabled?'ON':'OFF'}</strong>`;screen.contentWindow?.postMessage({type:'komoa-interaction-guide',enabled:guideEnabled},location.origin)};
  guideToggle.onclick=()=>{guideEnabled=!guideEnabled;localStorage.setItem('komoa-interaction-guide',String(guideEnabled));syncGuide()};
  const fit=()=>{device.style.setProperty('--preview-scale',Math.min(1,(innerHeight-48)/932,(innerWidth-48)/430));requestAnimationFrame(()=>{const rect=device.getBoundingClientRect();guideToggle.style.left=rect.right+12+'px';guideToggle.style.top=rect.top+24+'px'})};
  fit();addEventListener('resize',fit);
  screen.addEventListener('load',()=>{
    const child=screen.contentWindow,original=child.history.replaceState.bind(child.history);
    child.history.replaceState=(...args)=>{original(...args);history.replaceState(null,'',location.pathname+location.search+child.location.hash);document.title=child.document.title};
    document.title=child.document.title;
    syncGuide();
  });
  addEventListener('hashchange',()=>{if(screen.contentWindow.location.hash!==location.hash)screen.contentWindow.location.hash=location.hash});
  desktop.addEventListener('change',()=>location.reload());
})();
