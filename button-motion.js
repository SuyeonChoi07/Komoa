'use strict';
(() => {
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pressed=null;
  const animations=new WeakMap();
  const releasedAt=new WeakMap();
  let clickButton=null,navigationTimer=null,runningNavigation=false;
  window.deferButtonNavigation=callback=>{
    if(runningNavigation||reduced()||!clickButton)return false;
    const remaining=240-(performance.now()-(releasedAt.get(clickButton)??-Infinity));
    if(remaining<=0)return false;
    clearTimeout(navigationTimer);
    navigationTimer=setTimeout(()=>{runningNavigation=true;try{callback()}finally{runningNavigation=false;navigationTimer=null}},remaining);
    return true;
  };
  const buttonFor=target=>{
    if(!(target instanceof Element)||target.closest('input,textarea,select,[contenteditable="true"]'))return null;
    const button=target.closest('button,[role="button"],[role="tab"],a[href]');
    if(!button||button.matches(':disabled,[aria-disabled="true"]'))return null;
    if(button.closest('.overlay-frame [data-name^="검색창"]')&&button.matches('[aria-label="검색하기"],[aria-label="초기화"]'))return button;
    if(button.matches('[data-name="검색결과"],[data-name="게시글 timeline"],.saved-product-card,.search-product-card,[aria-label="검색창 열기"],.cart-icon-button,.community-tab')||
       button.closest('.overlay-frame [data-name^="검색창"],[data-name="프로필"]')||
       button.matches('[data-name="아이콘 / bell"],[data-name="아이콘 / bag"],[data-name="settings"]')||
       button.querySelector('[data-name="아이콘 / bell"],[data-name="아이콘 / bag"],[data-name="settings"]'))return null;
    return button;
  };
  const animate=(button,frames,options)=>{
    animations.get(button)?.cancel();
    const animation=button.animate(frames,options);animations.set(button,animation);
    animation.finished.then(()=>{if(animations.get(button)===animation){animations.delete(button);animation.cancel()}},()=>{});
  };
  const reset=()=>{if(!pressed)return;const button=pressed.button;pressed=null;const scale=getComputedStyle(button).scale;animate(button,[{scale:scale==='none'?'1':scale},{scale:'1'}],{duration:120,easing:'ease-out'})};
  const start=(button,extra)=>{
    reset();if(!button||reduced())return;
    const scale=getComputedStyle(button).scale;
    pressed={button,...extra};
    animations.get(button)?.cancel();
    const animation=button.animate([{scale:scale==='none'?'1':scale},{scale:'.95'}],{duration:100,easing:'ease-out',fill:'forwards'});animations.set(button,animation);
  };
  const release=()=>{
    if(!pressed)return;const button=pressed.button;pressed=null;
    const bounce=target=>animate(target,[{scale:'.95'},{scale:'1.03',offset:.55},{scale:'1'}],{duration:240,easing:'ease-out'});
    const navName=button.closest('#fixed-navigation')?button.dataset.name:null,nodeId=button.dataset.nodeId;
    releasedAt.set(button,performance.now());
    bounce(button);
    requestAnimationFrame(()=>{if(button.isConnected)return;const replacement=navName?document.querySelector('#fixed-navigation [data-name="'+CSS.escape(navName)+'"]'):nodeId?document.querySelector('[data-node-id="'+CSS.escape(nodeId)+'"]'):null;if(replacement)bounce(replacement)});
  };
  document.addEventListener('pointerdown',e=>{if(e.isPrimary&&e.button===0)start(buttonFor(e.target),{id:e.pointerId,x:e.clientX,y:e.clientY})},true);
  document.addEventListener('pointermove',e=>{if(pressed?.id===e.pointerId&&Math.hypot(e.clientX-pressed.x,e.clientY-pressed.y)>12)reset()},true);
  document.addEventListener('pointerup',e=>{if(pressed?.id===e.pointerId)release()},true);
  document.addEventListener('pointercancel',reset,true);
  document.addEventListener('keydown',e=>{if(!e.repeat&&(e.key==='Enter'||e.key===' '))start(buttonFor(e.target),{key:e.key})},true);
  document.addEventListener('keyup',e=>{if(pressed?.key===e.key)release()},true);
  document.addEventListener('click',e=>{
    clickButton=buttonFor(e.target);
    if(pressed?.button===clickButton)release();
    setTimeout(()=>{clickButton=null},0);
  },true);
  window.addEventListener('blur',reset);
})();
