(() => {
  const desktop=matchMedia('(min-width: 601px)'),embedded=window.self!==window.top;
  if(embedded||!desktop.matches){
    const sources=['figma-screens.js', 'figma-qna.js', 'figma-project-screens.js', 'figma-projects.js', 'figma-collection-screens.js', 'figma-refresh.js', 'figma-commerce.js', 'figma-search.js', 'figma-comment-screen.js', 'figma-posts.js', 'figma-app.js', 'button-motion.js'];
    (async()=>{for(const src of sources)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.append(script)})})().catch(()=>{document.getElementById('status').textContent='화면을 불러오지 못했습니다. 새로고침해 주세요.'});
    if(!embedded)desktop.addEventListener('change',()=>location.reload());
    return;
  }
  document.body.classList.add('desktop-preview');
  document.getElementById('app').remove();
  const device=document.createElement('div');device.className='preview-device';
  const screen=document.createElement('iframe');screen.title='Komoa 앱 미리보기';screen.src=location.pathname+location.search+location.hash;
  device.append(screen);document.body.append(device);
  const fit=()=>device.style.setProperty('--preview-scale',Math.min(1,(innerHeight-48)/932,(innerWidth-48)/430));
  fit();addEventListener('resize',fit);
  screen.addEventListener('load',()=>{
    const child=screen.contentWindow,original=child.history.replaceState.bind(child.history);
    child.history.replaceState=(...args)=>{original(...args);history.replaceState(null,'',location.pathname+location.search+child.location.hash);document.title=child.document.title};
    document.title=child.document.title;
  });
  addEventListener('hashchange',()=>{if(screen.contentWindow.location.hash!==location.hash)screen.contentWindow.location.hash=location.hash});
  desktop.addEventListener('change',()=>location.reload());
})();
