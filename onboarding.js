'use strict';
// Figma page 518:3200: intro and onboarding flow, 430 × 932.
(() => {
  const screens=window.FIGMA_SCREENS,asset=name=>'assets/onboarding/'+name;
  screens['518:3908']={id:'518:3908',name:'인트로 - 수정',width:430,height:932,html:`<div class="intro-refreshed intro-photo" data-node-id="518:3908" data-name="인트로 - 수정">
    <img class="intro-photo-bg" src="${asset('6954e.png')}" alt=""><div class="intro-shade"></div>
    <div class="intro-brand" data-node-id="633:4690"><div class="intro-brand-logo" data-node-id="633:4686"><img src="assets/figma-exact/67d71.png" alt="Komoa"></div><p class="intro-club" data-node-id="518:3983">OUR LITTLE KNITTING CLUB</p></div>
    <div class="intro-copy" data-node-id="631:1380"><h1>한 코의 여유가<br>나만의 이야기가<br>되는 곳.</h1><p>천천히 만들어도 좋아요.<br>우리의 뜨개 시간은 계속 이어지니까요.</p></div>
    <div class="f499" data-node-id="518:3989" data-name="시작 슬라이더"></div><div class="f500" data-node-id="518:3990"></div><div class="f501" data-node-id="518:3991"><img src="${asset('92a99.svg')}" alt=""></div><p class="f502" data-node-id="518:3993">Komoa 시작하기</p><p class="intro-help">오른쪽으로 밀어 시작하기</p></div>`};
  const pages=[
    {id:'631:1201',title:'내 손으로 만들어가는 뜨개',body:'다양한 뜨개 도안과 실, 바늘을 탐색하고<br>마음에 드는 상품을 구매해 보세요.',photo:'ad387.png',top:'-17.98%',dots:'33cc8.svg',next:'6fc52.svg'},
    {id:'633:4646',title:'한 코 한 코 엮어가는 하루',body:'단수와 코수, 작은 메모가<br>어제의 손길을 기억해 줍니다.',photo:'41ea4.png',top:'-4.86%',dots:'51518.svg',next:'6ada1.svg'},
    {id:'633:4662',title:'각자의 실로 함께 뜨는 이야기',body:'서로의 뜨개를 공유하며<br>노하우를 배워가요.',photo:'0f39f.png',top:'-17.35%',dots:'3f74f.svg',next:'75c1f.svg'}
  ];
  pages.forEach((page,index)=>{screens[page.id]={id:page.id,name:'인트로 - 추가'+(index+1),width:430,height:932,html:`<div class="onboarding-screen" data-node-id="${page.id}"><div class="onboarding-photo"><img src="${asset(page.photo)}" style="top:${page.top}" alt=""></div><div class="onboarding-panel"></div><div class="onboarding-copy"><h1>${page.title}</h1><p>${page.body}</p></div><img class="onboarding-dots" src="${asset(page.dots)}" alt="소개 ${index+1} / 3"><button class="onboarding-next" aria-label="${index===2?'로그인으로 이동':'다음 소개'}" data-onboarding-next="${pages[index+1]?.id||'login'}"><img src="${asset(page.next)}" alt=""></button><button class="onboarding-skip" data-onboarding-skip>건너뛰기<img src="${asset('c7b5c.svg')}" alt=""></button></div>`}});
  const login=document.createElement('div');login.innerHTML=screens['610:1549'].html;
  const panel=login.firstElementChild;panel.classList.add('login-refreshed');panel.dataset.nodeId='632:1383';panel.dataset.name='로그인 - 수정';
  panel.insertAdjacentHTML('afterbegin',`<img class="login-photo" src="${asset('94ff0.png')}" alt=""><div class="login-sheet"></div>`);
  panel.querySelector('.login-logo').outerHTML='<div class="login-heading"><h1>로그인으로 시작하기</h1><p>아이디와 비밀번호를 입력하여 Komoa에 로그인</p></div>';
  panel.querySelector('.login-links img').src=asset('ba99f.svg');
  for(const [name,icon]of [['Google','0cbd6.svg'],['Apple','5f906.svg'],['LINE','a4e02.svg'],['Kakao','277c9.svg']]){const button=panel.querySelector('[data-social="'+name+'"]');button.setAttribute('aria-label',name+' 계정으로 로그인');button.innerHTML='<span><img src="'+(name==='Apple'?'assets/figma-exact/5256b.svg':name==='Kakao'?'assets/figma-exact/31c7b.svg':asset(icon))+'" alt=""></span>'}
  screens['632:1383']={id:'632:1383',name:'로그인 - 수정',width:430,height:932,html:login.innerHTML};
})();
function wireOnboarding(root,id){
  if(!['631:1201','633:4646','633:4662'].includes(id))return;
  const next=root.querySelector('[data-onboarding-next]');interactive(next,()=>go(next.dataset.onboardingNext,true,id==='633:4662'?null:'ONBOARDING_PUSH'),next.getAttribute('aria-label'));
  interactive(root.querySelector('[data-onboarding-skip]'),()=>go('login',true,'ONBOARDING_PUSH'),'건너뛰기');
}
