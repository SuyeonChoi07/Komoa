'use strict';
(() => {
  const screens=window.FIGMA_SCREENS,home=document.createElement('div');home.innerHTML=screens['518:3609'].html;
  for(const [screenId,listId,moreId]of [['572:1946','518:3692','518:3690'],['572:2043','518:3703','518:3701']]){
    const source=document.createElement('div');source.innerHTML=screens[screenId].html;
    if(screenId==='572:2043'){
      const needle=source.querySelector('[data-node-id="572:2111"]');
      for(const node of [needle,...needle.querySelectorAll('[data-node-id]')])node.dataset.nodeId=node.dataset.nodeId.replace('572:2111','618:1461');
      needle.querySelector('[data-node-id$=";239:2454"]').textContent='[바늘] 대나무 줄바늘 5mm';
      needle.querySelector('[data-node-id$=";239:2455"]').textContent='5,000원';
      const image=needle.querySelector('[data-name="상품 이미지"] img');image.src='assets/figma-exact/f69d1.png';image.style.cssText='position:absolute;height:100%;width:165.22%;max-width:none;left:-5.92%;top:0';
    }
    const list=home.querySelector('[data-node-id="'+listId+'"]');
    list.classList.add('autumn-product-scroll');list.tabIndex=0;
    const titles=new Set([...list.querySelectorAll('[data-node-id$=";239:2454"]')].map(n=>n.textContent.trim()));
    for(const card of source.querySelectorAll('[data-name="검색결과"]')){const title=card.querySelector('[data-node-id$=";239:2454"]').textContent.trim();if(titles.has(title))continue;card.className='f296';list.append(card);titles.add(title)}
    home.querySelector('[data-node-id="'+moreId+'"]')?.remove();
    delete screens[screenId];
  }
  const banner=document.createElement('div');banner.className='home-promo-banner';banner.dataset.nodeId='612:1434';banner.innerHTML='<div class="promo-image"><img src="assets/figma-exact/ea94d.png" alt=""></div><div class="promo-copy"><p>3일간 만나는 뜨개</p><p>BEST 특가 상품</p></div>';
  home.querySelector('[data-node-id="518:3681"]').parentElement.before(banner);
  screens['518:3609'].html=home.innerHTML;screens['518:3609'].height=2187;
  const intro=document.createElement('div');intro.innerHTML=screens['518:3908'].html;const panel=intro.firstElementChild;panel.classList.add('intro-refreshed');panel.dataset.name='인트로 - 수정';panel.querySelector('[data-node-id="518:3909"]')?.remove();
  panel.querySelector('[data-node-id="518:3981"] img').src='assets/figma-exact/541bd.svg';
  const glow=document.createElement('div');glow.className='intro-glow';glow.innerHTML='<img src="assets/figma-exact/439c3.svg" alt="">';panel.insertBefore(glow,panel.firstChild);
  screens['518:3908'].html=intro.innerHTML;screens['518:3908'].name='인트로 - 수정';
  screens['610:1549']={id:'610:1549',name:'로그인',width:430,height:932,html:`<div class="login-screen" data-node-id="610:1549" data-name="로그인"><div class="login-inner"><div class="login-logo"><div><img src="assets/figma-exact/67d71.png" alt="Komoa"></div><p>OUR LITTLE KNITTING CLUB</p></div><div class="login-content"><form class="login-form"><label class="login-field"><img src="assets/figma-exact/98860.svg" alt=""><input aria-label="아이디" autocomplete="username" placeholder="아이디 입력" required></label><label class="login-field"><img src="assets/figma-exact/b22b2.svg" alt=""><input aria-label="비밀번호" type="password" autocomplete="current-password" placeholder="비밀번호 입력" required></label><button type="submit" class="login-submit">로그인</button><div class="login-links"><button type="button" data-auth="recover">아이디 / 비밀번호 찾기</button><img src="assets/figma-exact/f9404.svg" alt=""><button type="button" data-auth="signup">회원가입</button></div></form><div class="login-divider"><img src="assets/figma-exact/a299e.svg" alt=""><span>or</span></div><div class="social-section"><p>SNS 계정으로 간편하게 시작하기</p><div class="social-buttons">${[['Google','0cbd6.svg'],['Apple','5256b.svg'],['LINE','a4e02.svg'],['Kakao','31c7b.svg']].map(([name,icon])=>`<button type="button" data-social="${name}" class="social-button ${name.toLowerCase()}"><span><img src="assets/figma-exact/${icon}" alt=""></span>${name} 계정으로 로그인 하기</button>`).join('')}</div></div></div></div></div>`};
})();
function wireRefreshedScreens(root,id){
  wireOnboarding(root,id);
  if(id===routes.intro){
    const track=q('518:3989',root),handle=q('518:3990',root),arrow=q('518:3991',root);let start=null,dx=0;const label=q('518:3993',root);track.classList.add('intro-slide-track');track.append(handle,arrow,label);
    track.onclick=null;track.onkeydown=null;track.removeAttribute('role');track.removeAttribute('tabindex');
    for(const n of [handle,arrow,q('518:3993',root)])n.style.pointerEvents='none';
    track.setAttribute('role','slider');track.tabIndex=0;track.setAttribute('aria-label','오른쪽으로 밀어 Komoa 시작하기');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.setAttribute('aria-valuenow','0');track.style.touchAction='none';
    const move=value=>{dx=Math.max(0,Math.min(233,value));for(const n of [handle,arrow,label])n.style.translate=dx+'px 0';const t=dx/233;track.style.backgroundColor=`rgb(${219+36*t},${225+30*t},${205+50*t})`;track.setAttribute('aria-valuenow',String(Math.round(dx/233*100)))};
    track.onpointerdown=e=>{if(!e.isPrimary)return;start=e.clientX;track.setPointerCapture(e.pointerId)};
    track.onpointermove=e=>{if(start!==null)move((e.clientX-start)/Math.min(1,innerWidth/430))};
    track.onpointerup=()=>{start=null;if(dx>160)go('631:1201',true,'ONBOARDING_DISSOLVE');else move(0)};track.onpointercancel=()=>{start=null;move(0)};
    track.onkeydown=e=>{if(e.key==='ArrowRight')move(dx+30);if(['Enter',' '].includes(e.key)||dx>=233){e.preventDefault();go('631:1201',true,'ONBOARDING_DISSOLVE')}};
  }
  if(id===routes.login){
    const form=root.querySelector('form');form.noValidate=true;const fields=[...form.querySelectorAll('input')];wireRequiredFeedback(fields);form.onsubmit=e=>{e.preventDefault();if(validateRequiredFields(fields))go('home')};
    interactive(root.querySelector('[data-auth="signup"]'),()=>go('signup'),'회원가입');
    interactive(root.querySelector('[data-auth="recover"]'),()=>{announce('체험 화면에서는 계정 찾기를 제공하지 않습니다.');const message=document.createElement('p');message.className='auth-feedback';message.setAttribute('role','status');message.textContent='체험 화면에서는 계정 찾기를 제공하지 않습니다.';root.querySelector('.auth-feedback')?.remove();form.append(message)},'아이디 / 비밀번호 찾기');
    root.querySelectorAll('[data-social]').forEach(button=>interactive(button,()=>go('home'),button.getAttribute('aria-label')||button.textContent.trim()));
  }
  if(id===routes.signup){
    root.firstElementChild.classList.add('signup-refreshed');
    for(const name of ['이름','핸들']){const input=root.querySelector('[aria-label="'+name+'"]');input.required=true;input.maxLength=name==='이름'?30:40;input.autocomplete=name==='이름'?'nickname':'username';input.placeholder=name==='이름'?'뜨개하루':'@knitting_days';input.value=name==='핸들'?normalizeHandle(state.fields.profileHandle):state.fields.profileName??'';if(name==='핸들')input.placeholder='knittingdays'}
    wireRequiredFeedback([...root.querySelectorAll('input[required]')]);
    const bio=root.querySelector('[contenteditable="true"]');if(bio){bio.style.width='100%';bio.style.whiteSpace='pre-wrap'}
    interactive(q('518:4032',root),()=>{const name=root.querySelector('[aria-label="이름"]'),handle=root.querySelector('[aria-label="핸들"]');if(!validateRequiredFields([name,handle]))return;state.fields.profileName=name.value.trim();state.fields.profileHandle=handle.value.trim();if(bio)state.fields.profileBio=bio.innerText.trim();save();go('home')},'가입하고 시작하기');
  }
}

function wireRequiredFeedback(fields){
  fields.forEach(field=>field.addEventListener('input',()=>{if(field.value.trim()){field.removeAttribute('aria-invalid');field.parentElement.classList.remove('required-field-error')}}));
}
function validateRequiredFields(fields){
  const missing=fields.filter(field=>!field.value.trim());
  for(const field of fields){const invalid=missing.includes(field);field.parentElement.classList.toggle('required-field-error',invalid);if(invalid)field.setAttribute('aria-invalid','true');else field.removeAttribute('aria-invalid')}
  if(!missing.length)return true;
  for(const field of missing){const box=field.parentElement;box.getAnimations().forEach(a=>a.cancel());if(!matchMedia('(prefers-reduced-motion: reduce)').matches)box.animate([0,-7,7,-5,5,-2,0].map(x=>({translate:x+'px 0'})),{duration:360,easing:'ease-in-out'})}
  announce(missing.map(field=>field.getAttribute('aria-label')).join(', ')+' 항목을 입력해 주세요.');missing[0].focus({preventScroll:true});return false;
}
