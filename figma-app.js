'use strict';
// Compiled, editable HTML/CSS from Figma page 518:3200; reference screenshots are never UI assets.
const S=window.FIGMA_SCREENS,links=new Map(window.FIGMA_LINKS),app=document.getElementById('app'),frame=document.getElementById('frame');
const aliases={'610:1549':'632:1383','610:1386':'518:3609','572:1946':'518:3609','572:2043':'518:3609','570:1853':'518:3609','302:4050':'518:3469','302:3730':'518:3816'};
const routes={home:'518:3609',community:'518:3549',qna:'572:2390',projects:'518:3202',counter:'518:3255',newProject:'518:3303',projectView:'660:4880',my:'518:3476',post:'518:3544',compose:'518:3576',product:'518:3710',searchResults:'518:3781',cart:'518:3816',checkout:'518:3840',orderComplete:'518:3866',notifications:'518:3469',editProfile:'518:3879',login:'632:1383',intro:'518:3908',signup:'518:3995'};
let state;try{state=JSON.parse(localStorage.getItem('komoa-figma-v2')||'{}')}catch{state={}}state={saved:[],liked:[],counters:{},fields:{},...state};initCommerceState();initPostsState();initProjectsState();
let pagePush=null;
let current='',overlay=null,lastFocus=null,historyStack=[],uploadedPhoto='';
const q=(id,root=document)=>root.querySelector(`[data-node-id="${id}"]`),all=(sel,root=document)=>[...root.querySelectorAll(sel)];
function ownProfileAvatar(previous){return state.avatar||(previous&&previous!=='assets/figma-exact/24baf.png'?previous:'assets/default-avatar.jpg')}
function announce(text){document.getElementById('status').textContent=text}
function save(){try{localStorage.setItem('komoa-figma-v2',JSON.stringify(state))}catch{announce('저장 공간을 확인해 주세요.')}}
function setText(id,text,root=document){const n=q(id,root);if(n)(n.querySelector('p')||n).textContent=text}
function interactive(el,fn,label){if(!el)return;el.setAttribute('role','button');el.tabIndex=0;if(label)el.setAttribute('aria-label',label);el.onclick=e=>{e.stopPropagation();if(el.getAttribute('aria-disabled')==='true'){e.preventDefault();return}fn(e)};el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}}}
function scale(){const s=Math.min(1,innerWidth/430);frame.style.transform=`scale(${s})`;app.style.height=(parseFloat(frame.style.height)||932)*s+'px';document.getElementById('fixed-navigation')?.style.setProperty('--nav-scale',s);document.getElementById('fixed-header')?.style.setProperty('--header-scale',s);if(overlay){overlay.el.style.transform=`scale(${s})`;if(overlay.id===routes.notifications)overlay.el.style.height=Math.min(800,(innerHeight-20)/s)+'px'}}
function mountNavigation(){let host=document.getElementById('fixed-navigation');if(!host){host=document.createElement('nav');host.id='fixed-navigation';host.setAttribute('aria-label','주요 메뉴');document.body.append(host)}const oldSelection=host.querySelector('[data-name="프로젝트 배경"]'),oldStyle=oldSelection&&!host.hidden?getComputedStyle(oldSelection):null,previous=oldStyle?{left:parseFloat(oldStyle.left),width:parseFloat(oldStyle.width),height:parseFloat(oldStyle.height),top:parseFloat(oldStyle.top)}:null;host.replaceChildren();const nav=frame.querySelector('[data-name="하단 내비게이션-수정"]');host.hidden=!nav;let bg=document.querySelector('.nav-bg');if(!bg){bg=document.createElement('div');bg.className='nav-bg';bg.setAttribute('aria-hidden','true');document.body.append(bg)}bg.hidden=!nav;if(nav){host.append(nav);animateNavigationSelection(nav,previous);for(const [name,dest]of [['홈','home'],['탐색','community'],['프로젝트','projects'],['MY','518:4895']])interactive(nav.querySelector('[data-name="탭 / '+name+'"]'),()=>go(dest,true,'NAV_PUSH'),name==='탐색'?'커뮤니티':name)}}

function animateNavigationSelection(nav,previous){
  const selection=nav.querySelector('[data-name="프로젝트 배경"]');if(!selection)return;
  selection.classList.add('nav-liquid-selection');selection.setAttribute('aria-hidden','true');
  const style=getComputedStyle(selection),left=parseFloat(style.left),width=parseFloat(style.width),height=parseFloat(style.height),top=parseFloat(style.top);
  if(!previous||Math.abs(previous.left-left)<.5||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const delta=left-previous.left,distance=Math.abs(delta),stretch=Math.min(100,distance*.65),middle=previous.left+delta*.55;
  selection.animate([
    {left:previous.left+'px',width:previous.width+'px',height:previous.height+'px',top:previous.top+'px',borderRadius:'28px',offset:0},
    {left:(middle-stretch/2)+'px',width:(width+stretch)+'px',height:'36px',top:'13px',borderRadius:'24px 18px',offset:.48},
    {left:(left+Math.sign(delta)*3)+'px',width:(width-16)+'px',height:'60px',top:'1px',borderRadius:'30px',offset:.8},
    {left:left+'px',width:width+'px',height:height+'px',top:top+'px',borderRadius:'28px',offset:1}
  ],{duration:420,easing:'cubic-bezier(0.22,1,0.36,1)'});
}
function mountHeader(){let host=document.getElementById('fixed-header');if(!host){host=document.createElement('header');host.id='fixed-header';document.body.append(host)}host.replaceChildren();const header=frame.querySelector('.f57');host.hidden=!header;if(header)host.append(header)}
let cartToastTimer,carouselTimer,carouselResetTimer;
function showCartToast(){
  let toast=document.getElementById('cart-toast');if(!toast){toast=document.createElement('div');toast.id='cart-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.append(toast)}
  clearTimeout(cartToastTimer);toast.hidden=false;toast.textContent='장바구니에 제품을 담았습니다';cartToastTimer=setTimeout(()=>{toast.hidden=true;toast.textContent=''},2200);
}
function updateCartBadges(){
  const count=cartItems().reduce((sum,p)=>sum+p.quantity,0);
  all('[data-name="상단바"] [data-name="아이콘 / bag"]').forEach(icon=>{const button=icon.parentElement;let badge=button.querySelector('.cart-badge');if(!badge){badge=document.createElement('span');badge.className='cart-badge';badge.setAttribute('aria-hidden','true');button.append(badge)}button.classList.add('cart-icon-button');button.setAttribute('aria-label',`장바구니, 상품 ${count}개`);badge.textContent=String(count);badge.hidden=count===0});
  const unread=['518:3473','518:3474','518:3475'].filter(id=>!state.readNotifications?.includes(id)).length;
  all('[data-name="상단바"] [data-name="아이콘 / bell"]').forEach(icon=>{const button=icon.parentElement;let badge=button.querySelector('.notification-badge');if(!badge){badge=document.createElement('span');badge.className='cart-badge notification-badge';badge.setAttribute('aria-hidden','true');button.append(badge)}button.classList.add('cart-icon-button');button.setAttribute('aria-label',`알림, 읽지 않은 알림 ${unread}개`);badge.textContent=String(unread);badge.hidden=unread===0});
}
function mountFloatingAction(){
  let host=document.getElementById('fixed-action');if(!host){host=document.createElement('div');host.id='fixed-action';host.hidden=true;document.body.append(host)}
  const button=[routes.projects,routes.community,routes.qna].includes(current)?frame.querySelector('[data-name="글쓰기"]'):null;
  const visible=!host.hidden&&!!host.firstElementChild,wasExiting=host.dataset.exiting==='true',style=getComputedStyle(host),from={transform:style.transform==='none'?'translateY(0px)':style.transform,opacity:style.opacity};
  host.getAnimations().forEach(a=>a.cancel());delete host.dataset.exiting;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(button){
    host.replaceChildren(button);host.hidden=false;host.inert=false;button.setAttribute('aria-label',current===routes.projects?'새 프로젝트 만들기':'새 게시글 작성');
    if(!reduced&&(!visible||wasExiting))host.animate([visible?from:{transform:'translateY(100px)',opacity:0},{transform:'translateY(0px)',opacity:1}],{duration:300,easing:'cubic-bezier(0.22,1,0.36,1)'});
  }else if(visible&&!reduced){
    host.dataset.exiting='true';host.inert=true;
    const animation=host.animate([from,{transform:'translateY(100px)',opacity:0}],{duration:300,easing:'cubic-bezier(0.4,0,1,1)',fill:'forwards'});
    animation.finished.then(()=>{if(host.dataset.exiting!=='true')return;host.hidden=true;host.replaceChildren();delete host.dataset.exiting;animation.cancel()},()=>{});
  }else{host.hidden=true;host.replaceChildren();host.inert=true}
}
function mountCarousel(){
  clearInterval(carouselTimer);clearTimeout(carouselResetTimer);if(current!==routes.home)return;
  const track=q('518:3631',frame),dots=q('518:3656',frame),slides=[...track.children],viewport=document.createElement('div');viewport.className='ad-viewport';viewport.setAttribute('aria-label','추천 광고');track.before(viewport);viewport.append(track);track.classList.add('ad-track');dots.replaceChildren();dots.classList.add('ad-dots');let index=0;
  // Animate to a duplicate first slide, then reset to its identical original without motion.
  const clone=slides[0].cloneNode(true);for(const node of [clone,...clone.querySelectorAll('[data-node-id]')])node.removeAttribute('data-node-id');clone.inert=true;clone.setAttribute('aria-hidden','true');track.append(clone);let wrapping=false;
  const reset=()=>{if(!wrapping)return;clearTimeout(carouselResetTimer);wrapping=false;track.style.transition='none';track.style.transform='translateX(0px)';void track.offsetWidth;track.style.removeProperty('transition')};
  track.addEventListener('transitionend',e=>{if(e.target===track&&e.propertyName==='transform')reset()});
  const show=(next,forward=false)=>{reset();index=next;wrapping=forward&&index===0&&!matchMedia('(prefers-reduced-motion: reduce)').matches;track.style.transform=`translateX(-${(wrapping?slides.length:index)*430}px)`;track.dataset.slide=String(index);slides.forEach((slide,i)=>{slide.setAttribute('aria-hidden',String(i!==index));slide.inert=i!==index});[...dots.children].forEach((dot,i)=>dot.setAttribute('aria-current',String(i===index)));if(wrapping)carouselResetTimer=setTimeout(reset,500)};
  const restart=()=>{clearInterval(carouselTimer);carouselTimer=setInterval(()=>{if(!document.hidden&&!overlay)show((index+1)%slides.length,true)},3000)};
  let gesture=null,suppressClickUntil=0;
  viewport.addEventListener('dragstart',e=>e.preventDefault());
  viewport.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;reset();clearInterval(carouselTimer);gesture={id:e.pointerId,x:e.clientX,y:e.clientY,horizontal:false}});
  viewport.addEventListener('pointermove',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(!gesture.horizontal&&Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){gesture=null;restart();return}if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)){gesture.horizontal=true;viewport.setPointerCapture(e.pointerId);e.preventDefault()}});
  const finishGesture=(e,cancel=false)=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;const swipe=!cancel&&Math.abs(dx)>=40&&Math.abs(dx)>Math.abs(dy);if(gesture.horizontal||swipe)suppressClickUntil=Date.now()+500;gesture=null;if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);if(swipe){if(dx<0)show((index+1)%slides.length,true);else{if(index===0&&!matchMedia('(prefers-reduced-motion: reduce)').matches){track.style.transition='none';track.style.transform=`translateX(-${slides.length*430}px)`;void track.offsetWidth;track.style.removeProperty('transition')}show((index-1+slides.length)%slides.length)}}restart()};
  viewport.addEventListener('pointerup',e=>finishGesture(e));viewport.addEventListener('pointercancel',e=>finishGesture(e,true));
  viewport.addEventListener('click',e=>{if(Date.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
  slides.forEach((slide,i)=>{const dot=document.createElement('button');dot.type='button';dot.setAttribute('aria-label',`${i+1}번째 광고 보기`);dot.onclick=()=>{show(i);restart()};dots.append(dot)});show(0);restart();
}
let motionDirection='LEFT',motionEasing='EASE_IN_AND_OUT';
function animateOverlay(element,id){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const from=id===routes.notifications?'translateY(-100%)':id==='518:3522'?'translateX(100%)':'translateY(100%)';element.animate([{transform:from},{transform:'translate(0,0)'}],{duration:300,easing:'cubic-bezier(0.22,1,0.36,1)'});}
function closeOverlay(restoreFocus=true){
  if(!overlay||overlay.closing)return;
  const closing=overlay,focusTarget=lastFocus,panel=closing.el.firstElementChild;closing.closing=true;
  const finish=()=>{closing.backdrop.remove();if(overlay!==closing)return;overlay=null;document.body.style.overflow='';if(restoreFocus&&focusTarget?.isConnected)focusTarget.focus({preventScroll:true})};
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return}
  const from=getComputedStyle(panel).transform;panel.getAnimations().forEach(animation=>animation.cancel());
  const to=closing.id===routes.notifications?'translateY(-100%)':closing.id==='518:3522'?'translateX(100%)':'translateY(100%)';
  panel.animate([{transform:from==='none'?'translate(0,0)':from},{transform:to}],{duration:300,easing:'cubic-bezier(0.4,0,1,1)',fill:'forwards'}).finished.then(finish,finish);
}
function showOverlay(id,transition='MOVE_IN',duration=.3){if(window.deferButtonNavigation?.(()=>showOverlay(id,transition,duration)))return;if(!S[id])return;const previous=overlay;const searchSwap=previous&&!previous.closing&&Object.values(SEARCH_SCOPES).includes(previous.id)&&Object.values(SEARCH_SCOPES).includes(id);const swapSnapshot=searchSwap?captureSearchOptions(previous):null;lastFocus=previous?lastFocus:document.activeElement;if(previous)previous.backdrop.remove();const f=S[id],backdrop=document.createElement('div');backdrop.className='overlay-backdrop'+(id===routes.notifications?' notification-overlay':id==='518:3522'?' drawer':'');backdrop.innerHTML=`<div class="overlay-frame" role="dialog" aria-modal="true" aria-label="${f.name}" style="width:${f.width}px;height:${f.height}px">${f.html}</div>`;document.body.append(backdrop);overlay={id,backdrop,el:backdrop.firstElementChild};backdrop.onclick=e=>{if(e.target===backdrop)closeOverlay()};document.body.style.overflow='hidden';wire(overlay.el,id);scale();if(searchSwap)animateSearchOptions(overlay,swapSnapshot);else animateOverlay(overlay.el.firstElementChild,id);(id===routes.notifications?overlay.el.firstElementChild:overlay.el.querySelector('[tabindex],input,select'))?.focus({preventScroll:true})}
function go(to,push=true,transition=null,duration=.3,restoreY=0){
  if(window.deferButtonNavigation?.(()=>go(to,push,transition,duration,restoreY)))return;
  const [base,params='']=to.split('?'),id=aliases[base]||routes[base]||base;if(!S[id])return;
  if(id===routes.notifications){if(!current)go('home',false);showOverlay(id);return}
  const profileOrder=['518:4895','518:4830','518:3476'];
  const profileDirection=profileOrder.includes(current)&&profileOrder.includes(id)?Math.sign(profileOrder.indexOf(id)-profileOrder.indexOf(current)):0;
  const communityRank=(route,tab)=>route===routes.qna?2:route===routes.community?(tab==='following'?1:0):-1;
  const communityFrom=communityRank(current,state.communityTab),communityTo=communityRank(id,new URLSearchParams(params).get('tab'));
  const communityDirection=communityFrom>=0&&communityTo>=0?Math.sign(communityTo-communityFrom):0;
  const cartCheckoutFade=(current===routes.cart&&id===routes.checkout)||(current===routes.checkout&&id===routes.cart);
  const orderCompleteExit=current===routes.orderComplete&&id!==routes.orderComplete;
  const cartEnter=id===routes.cart&&current!==id&&!!current,cartExit=current===routes.cart&&id!==current;
  const productEnter=id===routes.product&&current!==id,productExit=current===routes.product&&id!==current&&!cartEnter;
  const productId=productEnter?new URLSearchParams(params).get('product'):state.selectedProduct;
  const thumbnail=productEnter?findProductThumbnail(productId):null;
  const loginFade=(current===routes.login&&[routes.signup,routes.home].includes(id))||(current===routes.signup&&id===routes.home);
  const onboardingLogin=['631:1201','633:4646','633:4662'].includes(current)&&id===routes.login;
  const onboardingTransition=onboardingLogin||transition==='ONBOARDING_PUSH'||transition==='ONBOARDING_DISSOLVE';
  const composeEnter=id===routes.compose&&[routes.community,routes.qna].includes(current),composeExit=current===routes.compose&&[routes.community,routes.qna].includes(id);
  const rank=value=>value===routes.home?0:[routes.community,routes.qna].includes(value)?1:value===routes.projects?2:['518:3476','518:4830','518:4895'].includes(value)?3:-1;
  const from=rank(current),toRank=rank(id),direction=Math.sign(toRank-from);
  if(pagePush){pagePush();pagePush=null}
  let outgoing;
  if(((transition==='NAV_PUSH'&&from>=0&&toRank>=0&&direction)||composeEnter||composeExit||onboardingTransition||loginFade||profileDirection||communityDirection||cartEnter||cartExit||productEnter||productExit||cartCheckoutFade||orderCompleteExit)&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const rect=app.getBoundingClientRect(),layer=document.createElement('div'),copy=frame.cloneNode(true);
    layer.className='page-push-viewport';layer.inert=true;layer.setAttribute('aria-hidden','true');
    Object.assign(layer.style,{left:rect.left+'px',width:rect.width+'px'});
    copy.removeAttribute('id');copy.classList.add('page-push-copy');
    for(const node of copy.querySelectorAll('[id]'))node.removeAttribute('id');
    copy.style.top=-scrollY+'px';layer.append(copy);document.body.append(layer);outgoing=layer;
  }
  const commit=()=>{
    const previousTabIndicator=readTabIndicator();
    if(push&&current)historyStack.push({id:location.hash.slice(1).replace('-',':'),y:scrollY});
    closeOverlay(false);current=id;delete frame.dataset.commerce;delete frame.dataset.productId;delete frame.dataset.projectId;
    if(id===routes.product){const selected=new URLSearchParams(params).get('product');if(selected!==null)state.selectedProduct=CATALOGUE[selected]?selected:'cable-cardigan';save();}
    if(id===routes.counter||id===routes.projectView){const selected=new URLSearchParams(params).get('project');state.selectedProject=state.projectData[selected]?selected:state.selectedProject||'cable';}
    if(id===routes.post){const postId=new URLSearchParams(params).get('post');state.selectedPost=postId&&postEntry(postId)?postId:'518:3567';}
    if(id===routes.community){const tab=new URLSearchParams(params).get('tab');state.communityTab=tab==='following'?'following':'recommended';}
    if(id===routes.searchResults)readSearchParams(params);
    frame.style.height=S[id].height+'px';frame.innerHTML=S[id].html;document.title=S[id].name.trim()+' · Komoa';
    history.replaceState(null,'','#'+id.replace(':','-')+(id===routes.product?'?product='+encodeURIComponent(state.selectedProduct):id===routes.searchResults?'?'+searchParams(state.searchRequest):id===routes.post?'?post='+encodeURIComponent(state.selectedPost):id===routes.community?'?tab='+state.communityTab:[routes.counter,routes.projectView].includes(id)?'?project='+encodeURIComponent(state.selectedProject):''));
    wire(frame,id);wireProductSwipe(frame);mountTabIndicator(previousTabIndicator);fitCommerceFrame();mountHeader();mountNavigation();mountFloatingAction();mountCarousel();updateCartBadges();scale();scrollTo(0,restoreY);
  };
  commit();
  if(outgoing){
    const timing={duration:300,easing:'cubic-bezier(0.22,1,0.36,1)'},incoming=frame.firstElementChild;
    if(cartCheckoutFade){
      const fadeTiming={duration:300,easing:'ease-in-out'},animations=[outgoing.animate([{opacity:1},{opacity:0}],fadeTiming),incoming.animate([{opacity:0},{opacity:1}],fadeTiming)];
      if(id===routes.checkout){
        const rows=[...incoming.querySelectorAll('.commerce-order-row')];
        rows.forEach((row,index)=>animations.push(row.animate([{opacity:0},{opacity:1}],{duration:220,delay:120+index*70,easing:'ease-out',fill:'both'})));
      }
      const cleanup=()=>{animations.forEach(animation=>animation.cancel());outgoing.remove();if(pagePush===cleanup)pagePush=null};pagePush=cleanup;Promise.all(animations.map(animation=>animation.finished)).then(cleanup,()=>{});return;
    }
    if(orderCompleteExit){
      const animation=outgoing.animate([{translate:'0 0'},{translate:`0 ${innerHeight}px`}],{duration:350,easing:'cubic-bezier(0.4,0,1,1)'});
      app.style.overflow='clip';
      const cleanup=()=>{animation.cancel();outgoing.remove();app.style.removeProperty('overflow');if(pagePush===cleanup)pagePush=null};pagePush=cleanup;animation.finished.then(cleanup,()=>{});return;
    }
    if(cartEnter||cartExit||productEnter||productExit){
      animateCommerceRoute({outgoing,incoming,cartEnter,cartExit,productEnter,productExit,thumbnail,productId});return;
    }
    if(profileDirection||communityDirection){
      const tabDirection=profileDirection||communityDirection;
      const listSelector='.profile-project-list,.saved-products,[data-name="타임라인"],[data-node-id="518:3494"]';
      const oldList=outgoing.querySelector(listSelector),newList=incoming.querySelector(listSelector);
      outgoing.firstElementChild.style.visibility='hidden';
      const animations=[];
      if(oldList){oldList.style.visibility='visible';animations.push(oldList.animate([{translate:'0 0'},{translate:`${-tabDirection*430}px 0`}],timing))}
      if(newList)animations.push(newList.animate([{translate:`${tabDirection*430}px 0`},{translate:'0 0'}],timing));
      app.style.overflow='clip';const cleanup=()=>{animations.forEach(a=>a.cancel());outgoing.remove();app.style.removeProperty('overflow');if(pagePush===cleanup)pagePush=null};pagePush=cleanup;Promise.all(animations.map(a=>a.finished)).then(cleanup,()=>{});return;
    }
    if(loginFade){
      const fadeTiming={duration:300,easing:'ease-in-out'};
      const animations=[outgoing.animate([{opacity:1},{opacity:0}],fadeTiming)];
      const targets=[incoming,...document.querySelectorAll('#fixed-header,#fixed-navigation,.nav-bg')].filter(node=>!node.hidden);
      for(const target of targets)animations.push(target.animate([{opacity:0},{opacity:1}],fadeTiming));
      const cleanup=()=>{animations.forEach(animation=>animation.cancel());outgoing.remove();if(pagePush===cleanup)pagePush=null};pagePush=cleanup;Promise.all(animations.map(animation=>animation.finished)).then(cleanup,()=>{});return;
    }
    if(onboardingTransition){
      const dissolve=transition==='ONBOARDING_DISSOLVE',timing={duration:300,easing:dissolve?'ease-in-out':'ease-out'};
      const oldScreen=outgoing.querySelector('.onboarding-screen');
      if(onboardingLogin&&oldScreen){
        const photo=oldScreen.querySelector('.onboarding-photo');
        incoming.querySelector('.login-photo').after(photo);
        oldScreen.style.background='transparent';
        const animations=[photo.animate([{opacity:1},{opacity:0}],{duration:300,easing:'ease-in-out'}),outgoing.animate([{opacity:1},{opacity:0}],{duration:150,easing:'ease-out',fill:'forwards'})];
        for(const element of incoming.querySelectorAll('.login-sheet,.login-inner'))animations.push(element.animate([{translate:'0 592px'},{translate:'0 0'}],{duration:300,easing:'ease-out'}));
        app.style.overflow='clip';
        const cleanup=()=>{animations.forEach(animation=>animation.cancel());photo.remove();outgoing.remove();app.style.removeProperty('overflow');if(pagePush===cleanup)pagePush=null};pagePush=cleanup;Promise.all(animations.map(animation=>animation.finished)).then(cleanup,()=>{});return;
      }
      if(!dissolve&&oldScreen&&incoming.matches('.onboarding-screen')){
        // Keep shared controls and panel stationary; fade the photo and push only copy.
        oldScreen.style.background='transparent';
        const animations=[oldScreen.querySelector('.onboarding-photo').animate([{opacity:1},{opacity:0}],timing)];
        const previousDots=[...oldScreen.querySelectorAll('.onboarding-dots span')];
        incoming.querySelectorAll('.onboarding-dots span').forEach((dot,index)=>{const previous=previousDots[index];if(previous)animations.push(dot.animate([{width:getComputedStyle(previous).width,backgroundColor:getComputedStyle(previous).backgroundColor},{width:getComputedStyle(dot).width,backgroundColor:getComputedStyle(dot).backgroundColor}],{duration:300,easing:'ease'}))});
        for(const child of oldScreen.children)if(!child.matches('.onboarding-photo,.onboarding-copy,.onboarding-skip'))child.remove();
        // The outgoing photo must not cover the incoming fixed controls or white panel.
        oldScreen.querySelector('.onboarding-photo').style.clipPath='inset(0 0 313px 0)';
        animations.push(oldScreen.querySelector('.onboarding-copy').animate([{translate:'0 0'},{translate:'-430px 0'}],timing));
        animations.push(incoming.querySelector('.onboarding-copy').animate([{translate:'430px 0'},{translate:'0 0'}],timing));
        app.style.overflow='clip';
        const cleanup=()=>{animations.forEach(animation=>animation.cancel());outgoing.remove();app.style.removeProperty('overflow');if(pagePush===cleanup)pagePush=null};pagePush=cleanup;Promise.all(animations.map(animation=>animation.finished)).then(cleanup,()=>{});return;
      }
      const exit=outgoing.animate(dissolve?[{opacity:1},{opacity:0}]:[{translate:'0 0'},{translate:'-100% 0'}],timing);
      const enter=dissolve?null:incoming.animate([{translate:'100% 0'},{translate:'0 0'}],timing);
      app.style.overflow='clip';
      const cleanup=()=>{exit.cancel();enter?.cancel();outgoing.remove();app.style.removeProperty('overflow');if(pagePush===cleanup)pagePush=null};pagePush=cleanup;exit.finished.then(cleanup,()=>{});return;
    }
    if(composeEnter||composeExit){
      const target=composeEnter?incoming:outgoing.firstElementChild;
      if(composeEnter){app.style.zIndex='2';app.style.background='#fff'}
      app.style.overflow='clip';
      const distance=innerHeight/Math.min(1,innerWidth/430)+scrollY;
      const animation=target.animate(composeEnter?[{translate:`0 ${distance}px`},{translate:'0 0'}]:[{translate:'0 0'},{translate:`0 ${distance}px`}],timing);
      const cleanup=()=>{animation.cancel();outgoing.remove();app.style.removeProperty('overflow');app.style.removeProperty('z-index');app.style.removeProperty('background');if(pagePush===cleanup)pagePush=null};
      pagePush=cleanup;animation.finished.then(cleanup,()=>{});return;
    }
    const exit=outgoing.firstElementChild.animate([{translate:'0px'},{translate:`${-direction*outgoing.clientWidth}px`}],timing);
    const enter=incoming.animate([{transform:`translateX(${direction*100}%)`},{transform:'translateX(0)'}],timing);
    app.style.overflow='clip';
    const cleanup=()=>{exit.cancel();enter.cancel();outgoing.remove();app.style.removeProperty('overflow');if(pagePush===cleanup)pagePush=null};
    pagePush=cleanup;Promise.all([exit.finished,enter.finished]).then(cleanup,()=>{});
  }
}
function back(){if(window.deferButtonNavigation?.(back))return;if(overlay)return closeOverlay();const last=historyStack.pop();go(last?.id||routes.home,false,null,.3,last?.y||0)}
window.go=go;window.figmaApp={go,get current(){return current},get state(){return state}};
function action(a){const[type,target,nav,transition,duration,direction,easing]=a;motionDirection=direction||'LEFT';motionEasing=easing||'EASE_IN_AND_OUT';if(type==='BACK')return back();if(type==='CLOSE')return closeOverlay();if(type==='NODE'){const id=aliases[target]||target;if(nav==='OVERLAY'||nav==='SWAP')showOverlay(id,transition,duration);else go(id,true,transition,duration)}}
function editText(node,key,placeholder=false){if(!node)return;node.classList.add('inline-edit');node.contentEditable='true';node.setAttribute('role','textbox');node.setAttribute('aria-label',node.textContent.trim());node.spellcheck=false;const original=node.textContent.trim();if(state.fields[key]!=null)node.textContent=state.fields[key];node.onfocus=()=>{if(placeholder&&node.textContent.trim()===original)node.textContent=''};node.onblur=()=>{state.fields[key]=(node.dataset.multiline?node.innerText:node.textContent).trim();save();if(!node.textContent.trim())node.textContent=original};node.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'&&!node.dataset.multiline){e.preventDefault();node.blur()}}}
function normalizeHandle(value){return String(value||'').replace(/[^a-zA-Z0-9_]/g,'')}
function wireHandleInput(input){const prefix=document.createElement('span');prefix.textContent='@';prefix.className='handle-prefix';prefix.setAttribute('aria-hidden','true');input.before(prefix);input.parentElement.classList.add('handle-field');input.value=normalizeHandle(input.value);input.placeholder='knittingdays';input.pattern='[A-Za-z0-9_]+';input.autocapitalize='none';input.spellcheck=false;input.oninput=()=>{input.value=normalizeHandle(input.value);state.fields.profileHandle=input.value;save()}}
function inputText(p,label,key,placeholder=false){if(!p)return;const input=document.createElement('input');input.className=p.className+' native-input';input.setAttribute('aria-label',label);input.value=state.fields[key]??(placeholder?'':p.textContent.trim());if(placeholder)input.placeholder=p.textContent.trim();input.oninput=()=>{state.fields[key]=input.value;save()};p.replaceWith(input);if(key==='profileHandle')wireHandleInput(input);return input}
function wire(root,id){
all('[data-node-id]',root).forEach(el=>{const reactions=links.get(el.dataset.nodeId);if(!reactions)return;const acts=reactions.filter(r=>r[0]==='ON_CLICK').flatMap(r=>r[1]);if(acts.length)interactive(el,()=>{save();acts.forEach(action)},el.textContent.trim()||el.dataset.name)});
if(id==='518:3576'){
const p=all('p',root).find(p=>p.textContent.includes('작품에 담긴 이야기를'));if(p)inputText(p,'제목','postTitle',true);
const body=all('p',root).find(p=>p.textContent.includes('사용한 재료, 만드는 과정'));if(body){editText(body,'postBody',true);body.dataset.multiline='true';body.closest('.f254').onclick=()=>body.focus()}
const upload=all('p',root).find(p=>p.textContent.trim()==='파일 선택');if(upload)mountAttachment(q('518:3582',root),()=>state.postAttachment||null,value=>{state.postAttachment=value;uploadedPhoto=value?.src||'';save();return true});
const type=all('p',root).find(p=>p.textContent.trim()==='완성 기록');if(type){const field=type.parentElement,select=document.createElement('select');select.className='native-select';select.setAttribute('aria-label','기록 유형');['완성 기록','진행 기록','뜨개 이야기'].forEach(t=>select.add(new Option(t,t)));select.onchange=()=>type.textContent=select.value;field.append(select)}
interactive(q('518:3608',root),()=>{if(!state.fields.postTitle?.trim()||!state.fields.postBody?.trim()){root.querySelector('input')?.focus();announce('제목과 내용을 입력해 주세요.');return}publishPost()},'게시글 올리기');
}
if(id==='518:3879'||id==='518:3995'){
const ps=all('p',root);for(const[needle,key,label]of[['뜨개하루','profileName','이름'],['@knitting_days','profileHandle','핸들'],['느리게, 오래 좋아하는','profileBio','소개']]){const p=ps.find(p=>p.textContent.includes(needle));if(p){if(key==='profileBio'){editText(p,key);p.dataset.multiline='true'}else inputText(p,label,key)}}
const avatar=root.querySelector('[data-name="프로필 사진"]');if(avatar)fileUpload(avatar,true);const cancel=ps.find(p=>p.textContent.trim()==='취소');if(cancel)interactive(cancel.parentElement,back);
}
if(['518:3476','518:4830','518:4895'].includes(id))all('p',root).forEach(p=>{const t=p.textContent.trim();if(t==='뜨개하루'&&state.fields.profileName)p.textContent=state.fields.profileName;if(t==='@knitting_days')p.textContent='@'+normalizeHandle(state.fields.profileHandle??'knittingdays');if(t.startsWith('느리게, 오래')&&state.fields.profileBio)p.textContent=state.fields.profileBio});
{const ownAvatar=root.querySelector('[data-name="프로필"] [data-name="사진"] img')||root.querySelector('[data-name="프로필 사진"] img');if(ownAvatar)ownAvatar.src=ownProfileAvatar();}
if(id==='518:3710'){[['518:3744','518:3750'],['518:3746','518:3760'],['518:3748','518:3765']].forEach(([tab,target])=>interactive(q(tab,root),()=>q(target,root)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'})));}
if(id==='518:3469'){const p=all('p',root).find(p=>p.textContent.includes('프로젝트 이어서 기록'));if(p)interactive(p,()=>go('counter'))}
all('[data-name]',root).filter(n=>/bookmark|heart/.test(n.dataset.name)).forEach(n=>{const key=n.dataset.nodeId,list=/heart/.test(n.dataset.name)?'liked':'saved';interactive(n,()=>{const a=state[list],at=a.indexOf(key);at<0?a.push(key):a.splice(at,1);n.setAttribute('aria-pressed',String(at<0));save();announce(at<0?'저장했습니다.':'취소했습니다.')},list==='liked'?'좋아요':'저장');n.setAttribute('aria-pressed',String(state[list].includes(key)))});
wirePosts(root,id);
wireCommerce(root,id);
wireSearch(root,id);
wireProjects(root,id);
wireProfile(root,id);
wireRefreshedScreens(root,id);
if(id===routes.notifications){wireNotificationPopup(root);state.readNotifications=['518:3473','518:3474','518:3475'];save();for(const nid of ['518:3473','518:3474','518:3475']){const row=q(nid,root),time=row.querySelector('[data-name="시간"] p');const refresh=()=>{time.textContent='2시간 전 · '+(state.readNotifications.includes(nid)?'읽음':'읽지 않음')};const read=()=>{if(!state.readNotifications.includes(nid)){state.readNotifications.push(nid);save();refresh();updateCartBadges()}};refresh();interactive(row,read,'알림 읽기');row.addEventListener('click',read,true)}updateCartBadges()}
}
function fileUpload(el,avatar){const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';input.className='file-control';input.setAttribute('aria-label',avatar?'프로필 사진 선택':'게시글 사진 선택');input.onchange=()=>{const file=input.files[0];if(!file)return;if(file.size>15*1024*1024){announce('15MB 이하의 사진을 선택해 주세요.');return}const reader=new FileReader();reader.onload=()=>{if(avatar){state.avatar=reader.result;const img=el.querySelector('img');if(img)img.src=reader.result;save()}else{uploadedPhoto=reader.result;announce(file.name+' 사진을 선택했습니다.')}};reader.readAsDataURL(file)};el.append(input)}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeOverlay();if(e.key==='Tab'&&overlay){const a=all('[tabindex="0"],input,select,[contenteditable]',overlay.el);if(!a.length)return;if(e.shiftKey&&document.activeElement===a[0]){e.preventDefault();a.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===a.at(-1)){e.preventDefault();a[0].focus()}}});
addEventListener('resize',()=>{fitCommerceFrame();scale()});addEventListener('popstate',()=>go(location.hash.slice(1).replace('-',':')||routes.home,false));
go(location.hash.slice(1).replace('-',':')||routes.intro,false);
document.fonts.ready.then(()=>{fitCommerceFrame();scale()});

function tabIndicatorGroup(){return [routes.community,routes.qna].includes(current)?'community':['518:3476','518:4830','518:4895'].includes(current)?'profile':null}
function readTabIndicator(){const indicator=frame.querySelector('.sliding-tab-indicator');if(!indicator)return null;const style=getComputedStyle(indicator);return {group:tabIndicatorGroup(),left:parseFloat(style.left),width:parseFloat(style.width)}}
function mountTabIndicator(previous){
  const group=tabIndicatorGroup(),tabs=frame.querySelector('[role="tablist"]');if(!group||!tabs)return;
  const active=tabs.querySelector('[aria-selected="true"]');if(!active)return;
  tabs.classList.add('sliding-tabs');const bounds=tabs.getBoundingClientRect(),rect=active.getBoundingClientRect(),ratio=bounds.width/tabs.offsetWidth,left=(rect.left-bounds.left)/ratio,width=rect.width/ratio;
  const indicator=document.createElement('div');indicator.className='sliding-tab-indicator';indicator.setAttribute('aria-hidden','true');indicator.style.left=left+'px';indicator.style.width=width+'px';tabs.append(indicator);
  if(previous?.group===group&&Math.abs(previous.left-left)>.5&&!matchMedia('(prefers-reduced-motion: reduce)').matches)indicator.animate([{left:previous.left+'px',width:previous.width+'px'},{left:left+'px',width:width+'px'}],{duration:300,easing:'cubic-bezier(0.22,1,0.36,1)'});
}

function searchOptionNode(root){return root.querySelector('[data-node-id="518:3378"],[data-node-id="518:3410"],[data-node-id="518:3454"]')}
function captureSearchOptions(previous){const node=searchOptionNode(previous.el),price=previous.el.querySelector('[data-node-id="518:3417"]'),priceSlot=previous.el.querySelector('[data-price-transition]');return {priceClone:price?.cloneNode(true),priceHeight:price?(priceSlot||price).getBoundingClientRect().height/Math.min(1,innerWidth/430):0,height:parseFloat(getComputedStyle(previous.el).height),optionHeight:node?node.getBoundingClientRect().height/Math.min(1,innerWidth/430):0,hasOptions:!!node}}
function animateSearchOptions(next,previous){
  if(!previous||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const targetHeight=parseFloat(next.el.style.height),option=searchOptionNode(next.el),content=next.el.querySelector('[data-name="검색 옵션"]').parentElement,gap=parseFloat(getComputedStyle(content).gap)||0,timing={duration:300,easing:'cubic-bezier(0.22,1,0.36,1)'};
  next.el.animate([{height:previous.height+'px'},{height:targetHeight+'px'}],timing);
  const slot=option||document.createElement('div');if(!option){content.querySelector('[data-name="검색 옵션"]').after(slot);slot.style.width='100%';slot.style.flexShrink='0'}
  const target=option?option.offsetHeight:0;slot.style.position='relative';slot.style.overflow='hidden';
  const price=next.el.querySelector('[data-node-id="518:3417"]');
  if(!!price!==!!previous.priceClone){
    const priceContent=price||previous.priceClone,priceSlot=document.createElement('div');
    priceSlot.dataset.priceTransition='';
    Object.assign(priceSlot.style,{overflow:'hidden',width:'100%',flexShrink:'0'});
    const priceHeight=price?price.offsetHeight:0;
    if(price)price.before(priceSlot);
    else{
      slot.after(priceSlot);priceContent.inert=true;priceContent.setAttribute('aria-hidden','true');
      for(const node of [priceContent,...priceContent.querySelectorAll('[data-node-id]')])node.removeAttribute('data-node-id');
    }
    priceSlot.append(priceContent);
    priceSlot.animate([{height:previous.priceHeight+'px',marginBottom:previous.priceClone?'0px':-gap+'px'},{height:priceHeight+'px',marginBottom:price?'0px':-gap+'px'}],timing).finished.then(()=>{
      if(price)priceSlot.replaceWith(price);else priceSlot.remove();
    },()=>{});
  }
  slot.animate([{height:previous.optionHeight+'px',marginBottom:previous.hasOptions?'0px':-gap+'px'},{height:target+'px',marginBottom:option?'0px':-gap+'px'}],timing).finished.then(()=>{if(!option)slot.remove();else{slot.style.removeProperty('overflow');slot.style.removeProperty('position')}},()=>{});
}

function wireNotificationPopup(root){
  const panel=root.firstElementChild;panel.classList.add('notification-panel');panel.tabIndex=-1;
  const heart=q('518:3473',root).querySelector('[data-name="알림 유형"]');heart.replaceChildren();const heartIcon=document.createElement('img');heartIcon.src='assets/figma-exact/5573b.svg';heartIcon.alt='';heartIcon.className='notification-heart';heart.append(heartIcon);
  interactive(panel.querySelector('[data-name="아이콘 / back"]'),()=>closeOverlay(),'뒤로가기');
  const handle=document.createElement('div');handle.className='notification-handle';handle.setAttribute('aria-hidden','true');handle.dataset.nodeId='605:1223';panel.append(handle);
  let gesture=null;
  panel.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY,drag:false};});
  panel.addEventListener('pointermove',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dy=e.clientY-gesture.y,dx=e.clientX-gesture.x;if(dy<-10&&Math.abs(dy)>Math.abs(dx)){if(!gesture.drag){panel.getAnimations().forEach(a=>a.cancel());panel.setPointerCapture(e.pointerId);gesture.drag=true}e.preventDefault();panel.style.transform=`translateY(${dy/Math.min(1,innerWidth/430)}px)`;}});
  const finish=(e,cancel=false)=>{if(!gesture||gesture.id!==e.pointerId)return;const g=gesture;gesture=null;if(panel.hasPointerCapture(e.pointerId))panel.releasePointerCapture(e.pointerId);if(!g.drag)return;
    if(!cancel&&e.clientY-g.y<-60){closeOverlay();return}
    const from=getComputedStyle(panel).transform;panel.style.removeProperty('transform');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)panel.animate([{transform:from},{transform:'translateY(0)'}],{duration:180,easing:'ease-out'});
  };
  panel.addEventListener('pointerup',e=>finish(e));panel.addEventListener('pointercancel',e=>finish(e,true));
}

function wireProductSwipe(root){
  for(const list of root.querySelectorAll('.autumn-product-scroll')){
  let drag=null,suppressUntil=0;
  list.addEventListener('dragstart',e=>e.preventDefault());
  list.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:list.scrollLeft,active:false}});
  list.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.active&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){drag=null;return}if(Math.abs(dx)>8){drag.active=true;list.setPointerCapture(e.pointerId);list.style.scrollSnapType='none';e.preventDefault();list.scrollLeft=drag.left-dx/Math.min(1,innerWidth/430)}});
  const finish=e=>{if(!drag||drag.id!==e.pointerId)return;if(drag.active)suppressUntil=Date.now()+400;drag=null;if(list.hasPointerCapture(e.pointerId))list.releasePointerCapture(e.pointerId);list.style.removeProperty('scroll-snap-type')};
  list.addEventListener('pointerup',finish);list.addEventListener('pointercancel',finish);
  list.addEventListener('click',e=>{if(Date.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
  }
}

function findProductThumbnail(id){
  const nodes=[...frame.querySelectorAll('[data-product-id]')].filter(n=>n!==frame&&n.dataset.productId===id);
  for(const node of nodes){const image=node.querySelector('img');if(!image)continue;const rect=image.getBoundingClientRect(),parent=image.parentElement.getBoundingClientRect();const left=Math.max(rect.left,parent.left),top=Math.max(rect.top,parent.top),right=Math.min(rect.right,parent.right),bottom=Math.min(rect.bottom,parent.bottom);if(right>left&&bottom>top&&top<innerHeight&&bottom>0)return {src:image.src,left,top,width:right-left,height:bottom-top}}
  return null;
}
function animateCommerceRoute({outgoing,incoming,cartEnter,cartExit,productEnter,productExit,thumbnail,productId}){
  const timing={duration:350,easing:'cubic-bezier(0.22,1,0.36,1)'},animations=[],temporary=[],hidden=[];
  const animate=(node,frames)=>{if(node)animations.push(node.animate(frames,timing))};
  if(cartEnter||cartExit){
    if(cartEnter){app.style.zIndex='2';animate(incoming,[{translate:`0 ${innerHeight/Math.min(1,innerWidth/430)}px`},{translate:'0 0'}])}
    else animate(outgoing,[{translate:'0 0'},{translate:`0 ${innerHeight}px`}]);
  }else{
    const detail=productEnter?frame:outgoing,photo=detail.querySelector('[data-node-id="518:3712"]'),card=detail.querySelector('[data-node-id="518:3715"]');
    const target=productEnter?photo?.getBoundingClientRect():findProductThumbnail(productId),source=productEnter?thumbnail:photo?.getBoundingClientRect();
    if(productEnter){app.style.zIndex='2';animate(incoming,[{opacity:0},{opacity:1}])}else animate(outgoing,[{opacity:1},{opacity:0}]);
    const distance=innerHeight/Math.min(1,innerWidth/430);
    const cardRect=card?.getBoundingClientRect();
    animate(card,productEnter?[{translate:`0 ${distance}px`},{translate:'0 0'}]:[{translate:'0 0'},{translate:`0 ${distance}px`}]);
    if(source&&target&&source.width&&target.width){
      const image=document.createElement('img');image.src=photo.querySelector('img').src;image.alt='';image.className='product-transition-image';
      Object.assign(image.style,{position:'fixed',left:target.left+'px',top:target.top+'px',width:target.width+'px',height:target.height+'px',objectFit:'cover',zIndex:'45',pointerEvents:'none',transformOrigin:'top left',maxWidth:'none'});document.body.append(image);temporary.push(image);
      // Keep a fixed aspect ratio throughout the zoom.
      const zoom=source.width/target.width;
      const transform=`translate(${source.left-target.left}px,${source.top-target.top}px) scale(${zoom})`;
      animate(image,[{transform},{transform:'translate(0,0) scale(1)'}]);photo.style.visibility='hidden';hidden.push(photo);
      if(card){
        const rect=cardRect,copy=card.cloneNode(true),scaleFactor=Math.min(1,innerWidth/430);
        copy.inert=true;copy.setAttribute('aria-hidden','true');copy.classList.add('product-transition-card');
        Object.assign(copy.style,{position:'fixed',left:rect.left+'px',top:rect.top+'px',width:card.offsetWidth+'px',margin:'0',zIndex:'46',transform:`scale(${scaleFactor})`,transformOrigin:'top left',pointerEvents:'none'});
        document.body.append(copy);temporary.push(copy);card.style.visibility='hidden';hidden.push(card);
        animate(copy,productEnter?[{translate:`0 ${innerHeight}px`},{translate:'0 0'}]:[{translate:'0 0'},{translate:`0 ${innerHeight}px`}]);
      }

    }
  }
  app.style.overflow='clip';
  const cleanup=()=>{animations.forEach(a=>a.cancel());temporary.forEach(n=>n.remove());hidden.forEach(n=>n.style.removeProperty('visibility'));outgoing.remove();app.style.removeProperty('z-index');app.style.removeProperty('overflow');if(pagePush===cleanup)pagePush=null};pagePush=cleanup;Promise.all(animations.map(a=>a.finished)).then(cleanup,()=>{});
}

