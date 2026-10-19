'use strict';
const POST_CATALOGUE={};
{
  const source=document.createElement('div');source.innerHTML=window.FIGMA_SCREENS['518:3549'].html+window.FIGMA_SCREENS['572:2390'].html;
  for(const card of source.querySelectorAll('[data-name="게시글 timeline"]')){
    const texts=card.querySelector('[data-name="게시글 텍스트"]').querySelectorAll('p'),user=card.querySelector('[data-name="유저정보"]');
    POST_CATALOGUE[card.dataset.nodeId]={id:card.dataset.nodeId,title:texts[0].textContent,body:texts[1].textContent,author:user.children[0].textContent,time:user.children[1].textContent,photo:card.querySelector('[data-node-id$=";258:1519"]'),avatar:card.querySelector('[data-name="유저"] img'),template:card};
  }
}
function postEntry(id){return state.posts.find(post=>post.id===id)||POST_CATALOGUE[id]}
function savedPosts(){return state.saved.filter(key=>key.startsWith('post:')).map(key=>postEntry(key.slice(5))).filter(Boolean)}
function openPost(id){go('post?post='+encodeURIComponent(id))}
function postCounts(entry){
  return {likes:(state.postLikeCounts?.[entry.id]||0)+Number(state.liked.includes('post:'+entry.id)),comments:state.comments?.[entry.id]?.length||0};
}
function postTimestamp(entry){
  if(entry.createdAt&&Number.isFinite(Date.parse(entry.createdAt)))return Date.parse(entry.createdAt);
  const match=entry.time.match(/(\d+)\s*(분|시간|일)/),age=match?Number(match[1])*({'분':60000,'시간':3600000,'일':86400000}[match[2]]):entry.time.includes('어제')?86400000:0;
  return state.demoPostEpoch-age;
}
function sortCommunity(root){
  const list=root.querySelector('[data-name="타임라인"]'),cards=[...list.children];
  cards.sort((a,b)=>{const left=postEntry(a.dataset.postId||a.dataset.nodeId),right=postEntry(b.dataset.postId||b.dataset.nodeId);if(current===routes.community&&state.communityTab==='recommended'){const l=postCounts(left),r=postCounts(right),score=r.likes+r.comments-l.likes-l.comments;if(score)return score}return postTimestamp(right)-postTimestamp(left)});
  list.append(...cards);
}
function wireCommunityTabs(root,id){
  const tabs=root.querySelector('[data-name="상세 정보 탭"]');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','커뮤니티 게시글');
  [...tabs.children].forEach((tab,index)=>{const active=id===routes.qna?index===2:index===(state.communityTab==='following'?1:0);tab.classList.add('community-tab');tab.classList.toggle('community-tab-active',active);interactive(tab,()=>go(index===2?'qna':'community?tab='+(index===1?'following':'recommended')),['추천','팔로잉','QnA'][index]);tab.setAttribute('role','tab');tab.setAttribute('aria-selected',String(active))});
  interactive(root.querySelector('[data-name="글쓰기"]'),()=>{state.composeCommunity=id===routes.qna?'qna':'community';go('compose')},'새 게시글 작성');
  if(id===routes.qna){
    interactive(root.querySelector('[data-name="아이콘 / bell"]').parentElement,()=>go('notifications'),'알림');interactive(root.querySelector('[data-name="아이콘 / bag"]').parentElement,()=>go('cart'),'장바구니');
    for(const [name,route]of [['탭 / 홈','home'],['탭 / 탐색','community'],['탭 / 프로젝트','projects'],['탭 / MY','my']])interactive(root.querySelector('[data-name="'+name+'"]'),()=>go(route),name.slice(4));
  }
  sortCommunity(root);
}
function initPostsState(){
  state.posts=Array.isArray(state.posts)?state.posts:[];
  if(state.post&&!state.posts.some(post=>post.id==='own')){state.posts.push({id:'own',...state.post,author:state.fields.profileName||'뜨개하루',avatar:ownProfileAvatar(),time:'내 게시글'});delete state.post}
  state.liked=Array.isArray(state.liked)?state.liked:[];
  state.liked=[...new Set(state.liked.map(key=>{const match=String(key).match(/^I(518:356[789]|518:357[01]);.*258:1621$/);return match?'post:'+match[1]:key==='I518:3547;264:1564;258:1621'||key==='I518:5132;258:1643;258:1621'?'post:518:3567':key}))];
  state.demoPostEpoch??=Date.now();seedPostComments();seedPostLikes();save();
}
function publishPost(){
  const entry={category:state.composeCommunity==='qna'?'qna':'community',id:'user-'+crypto.randomUUID(),title:state.fields.postTitle.trim(),body:state.fields.postBody.trim(),image:uploadedPhoto,author:state.fields.profileName||'뜨개하루',avatar:ownProfileAvatar(),createdAt:new Date().toISOString(),time:'방금 전'};
  state.posts.unshift(entry);seedPostComments();seedPostLikes();
  try{localStorage.setItem('komoa-figma-v2',JSON.stringify(state))}catch{state.posts.shift();announce('저장 공간이 부족합니다. 사진 크기를 줄인 후 다시 시도해 주세요.');return}
  delete state.fields.postTitle;delete state.fields.postBody;uploadedPhoto='';delete state.postAttachment;save();go(entry.category==='qna'?'qna':'community?tab=following');announce('게시글을 올렸습니다.');
}
function ownPostProfile(entry){return state.posts.some(post=>post.id===entry.id)?{...entry,author:state.fields.profileName||entry.author,avatar:ownProfileAvatar(entry.avatar)}:entry}
function createPostCard(entry){
  entry=ownPostProfile(entry);
  const card=cloneCommerceRow(POST_CATALOGUE['518:3567'].template,entry.id);delete card.dataset.productId;card.dataset.postId=entry.id;
  const texts=card.querySelector('[data-name="게시글 텍스트"]').querySelectorAll('p');texts[0].textContent=entry.title;texts[1].textContent=entry.body;texts[1].classList.add('post-preview');
  const user=card.querySelector('[data-name="유저정보"]');user.children[0].textContent=entry.author;user.children[1].textContent=entry.time;card.querySelector('[data-name="유저"] img').src=entry.avatar;
  const photo=card.querySelector('.f207');if(entry.image){photo.querySelector('img').src=entry.image;photo.classList.add('user-post-photo')}else photo.remove();
  card.querySelector('[data-name="message-circle"]').parentElement.querySelector('p').textContent='0';return card;
}
function wirePostLike(root,id){
  const icon=root.querySelector('[data-name="아이콘 / heart"]');if(!icon)return;
  const button=icon.parentElement,count=button.querySelector('p'),entry=postEntry(id),base=state.postLikeCounts?.[id]||0;
  icon.onclick=null;icon.onkeydown=null;icon.removeAttribute('role');icon.removeAttribute('tabindex');icon.removeAttribute('aria-label');icon.removeAttribute('aria-pressed');
  icon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  button.classList.add('post-like');button.dataset.likedPost=id;
  const refresh=()=>{const selected=state.liked.includes('post:'+id);count.textContent=base+Number(selected);button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',entry.title+(selected?' 좋아요 취소':' 좋아요')+', '+count.textContent+'개')};
  interactive(button,()=>{const key='post:'+id,index=state.liked.indexOf(key);if(index<0)state.liked.push(key);else state.liked.splice(index,1);save();refresh();if(current===routes.community&&state.communityTab==='recommended')sortCommunity(frame);announce(index<0?'좋아요를 눌렀습니다.':'좋아요를 취소했습니다.')});refresh();
  const comments=root.querySelector('[data-name="message-circle"]');if(comments)comments.parentElement.querySelector('p').textContent=postCounts(entry).comments;
}
function wirePostSave(button,id){
  if(!button)return;const entry=postEntry(id);button.classList.add('product-save','post-save');button.dataset.savedPost=id;
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  const refresh=node=>{const selected=state.saved.includes('post:'+id);node.setAttribute('aria-pressed',String(selected));node.setAttribute('aria-label',entry.title+(selected?' 보관함에서 해제':' 보관함에 저장'))};
  interactive(button,()=>{const key='post:'+id,index=state.saved.indexOf(key);if(index<0)state.saved.push(key);else state.saved.splice(index,1);save();all('[data-saved-post]').filter(n=>n.dataset.savedPost===id).forEach(refresh);announce(index<0?'게시글을 보관함에 저장했습니다.':'게시글을 보관함에서 해제했습니다.');if(current===routes.my){const y=scrollY;go('my',false);scrollTo(0,y)}});refresh(button);
}
function appendSavedPosts(grid){
  for(const entry of savedPosts()){
    const card=entry.template?cloneCommerceRow(entry.template,entry.id):createPostCard(entry);delete card.dataset.productId;card.dataset.postId=entry.id;card.classList.add('saved-post-card');
    interactive(card,()=>openPost(entry.id),entry.title+' 게시글 보기');wirePostSave(card.querySelector('[data-name*="bookmark"]'),entry.id);wirePostLike(card,entry.id);wirePostMenu(card,entry.id);grid.append(card);
  }
}
function wirePosts(root,id){
  // Unify the old screen-specific bookmark keys with stable post identities.
  let migrated=false;
  state.saved=state.saved.map(key=>{const match=key.match(/^I(518:356[789]|518:357[01]);258:1525$/);const postId=match?.[1]||(key==='I518:5132;258:1525'||key==='I518:3547;264:1566'?'518:3567':null);if(postId){migrated=true;return 'post:'+postId}return key});if(migrated){state.saved=[...new Set(state.saved)];save()}
  if(id===routes.community||id===routes.qna){const list=root.querySelector('[data-name="타임라인"]');for(const entry of [...state.posts].reverse().filter(p=>id===routes.qna?p.category==='qna':p.category!=='qna'))list.prepend(createPostCard(entry));}
  if(id==='518:4895'){
    const list=root.querySelector('[data-name="타임라인"]');list.replaceChildren();
    for(const entry of [...state.posts].sort((a,b)=>postTimestamp(b)-postTimestamp(a)))list.append(createPostCard(entry));
    if(!state.posts.length){const empty=document.createElement('p');empty.className='profile-empty';empty.textContent='아직 작성한 게시글이 없습니다.';list.append(empty)}
  }
  if(id===routes.community||id===routes.qna||id==='518:4895'){
    all('[data-name="게시글 timeline"]',root).forEach(card=>{const postId=card.dataset.postId||(POST_CATALOGUE[card.dataset.nodeId]?card.dataset.nodeId:'518:3567');interactive(card,()=>openPost(postId),postEntry(postId).title+' 게시글 보기');wirePostSave(card.querySelector('[data-name*="bookmark"]'),postId);wirePostLike(card,postId);wirePostMenu(card,postId)});
  }
  if(id===routes.community||id===routes.qna)wireCommunityTabs(root,id);
  if(id!==routes.post)return;
  const entry=ownPostProfile(postEntry(state.selectedPost)||POST_CATALOGUE['518:3567']);
  setNodeText(root,'I518:3547;264:1554',entry.author);setNodeText(root,'I518:3547;264:1555',entry.time);setNodeText(root,'I518:3547;264:1559',entry.title);
  if(entry.id!=='518:3567')setNodeText(root,'I518:3547;264:1560',entry.body);
  else {const template=document.createElement('div');template.innerHTML=S[routes.post].html;setNodeText(root,'I518:3547;264:1560',q('I518:3547;264:1560',template).textContent)}
  const photo=q('I518:3547;264:1557',root);
  if(entry.image){photo.querySelector('img').src=entry.image;photo.classList.add('user-post-photo')}
  else if(entry.photo){photo.innerHTML=entry.photo.innerHTML;photo.classList.add('post-detail-photo')}
  else photo.remove();
  if(entry.avatar)q('I518:3547;264:1552',root).querySelector('img').src=typeof entry.avatar==='string'?entry.avatar:entry.avatar.getAttribute('src');
  renderPostComments(root,entry);
  wirePostMenu(root,entry.id);
  wirePostSave(root.querySelector('[data-name*="bookmark"]'),entry.id);wirePostLike(root,entry.id);q('I518:3547;264:1560',root).classList.add('post-body');
}

function wirePostMenu(root,id){
  const trigger=root.querySelector('[data-name="more-horizontal"]');if(!trigger)return;
  trigger.setAttribute('aria-haspopup','dialog');interactive(trigger,()=>{
    document.querySelector('.post-options-backdrop')?.remove();const entry=postEntry(id);if(!entry)return;
    const own=state.posts.some(post=>post.id===id),backdrop=document.createElement('div'),menu=document.createElement('div');backdrop.className='post-options-backdrop';menu.className='post-options';menu.setAttribute('role','dialog');menu.setAttribute('aria-modal','true');menu.setAttribute('aria-label','게시글 옵션');backdrop.append(menu);document.body.append(backdrop);
    const close=()=>{backdrop.remove();trigger.setAttribute('aria-expanded','false');trigger.focus()};backdrop.onclick=e=>{if(e.target===backdrop)close()};
    const add=(label,fn)=>{const button=document.createElement('button');button.type='button';button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+(label==='게시글 삭제'?'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>':'<path d="M12 16V3m-4 4 4-4 4 4M5 13v8h14v-8"/>')+'</svg>';const text=document.createElement('span');text.textContent=label;button.append(text);button.onclick=fn;menu.append(button)};
    if(own)add('게시글 삭제',()=>{state.posts=state.posts.filter(post=>post.id!==id);if(state.comments)delete state.comments[id];state.saved=state.saved.filter(key=>key!=='post:'+id);state.liked=state.liked.filter(key=>key!=='post:'+id);save();backdrop.remove();if(current===routes.post)go('518:4895');else go(location.hash.slice(1).replace('-',':'),false);announce('게시글을 삭제했습니다.')});
    add('공유하기',async()=>{const data={title:entry.title,text:entry.title+'\n'+entry.body};if(!own)data.url=location.origin+location.pathname+'#518-3544?post='+encodeURIComponent(id);try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.text+(data.url?'\n'+data.url:''));announce('공유할 내용을 복사했습니다.')}close()}catch(error){if(error.name==='AbortError')return;const input=document.createElement('textarea');input.value=data.text+(data.url?'\n'+data.url:'');input.setAttribute('aria-label','공유할 내용');menu.append(input);input.focus();input.select();announce('공유할 내용을 복사해 주세요.')}});
    trigger.setAttribute('aria-expanded','true');const position=()=>{const rect=trigger.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(innerWidth-menu.offsetWidth-8,rect.right-menu.offsetWidth))+'px';menu.style.top=(rect.bottom+8+menu.offsetHeight>innerHeight?Math.max(8,rect.top-menu.offsetHeight-8):rect.bottom+8)+'px'};position();menu.onkeydown=e=>{if(e.key==='Escape'){e.stopPropagation();close()}if(e.key==='Tab'){const buttons=[...menu.querySelectorAll('button,textarea')],index=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(index+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus()}};menu.firstElementChild.focus({preventScroll:true});
  },'게시글 더보기');
}

function renderPostComments(root,entry){
  const source=document.createElement('div');source.innerHTML=S['594:1175'].html;
  const section=source.querySelector('[data-name="댓글란"]');section.classList.add('post-comments');section.setAttribute('aria-label','댓글');
  const template=q('594:1241',section).cloneNode(true),samples=[q('594:1241',section),q('594:1244',section)];
  samples.forEach(row=>row.remove());
  const editor=q('594:1236',section),placeholder=q('594:1237',section),input=document.createElement('textarea');input.className='comment-input';input.rows=1;input.placeholder=placeholder.textContent;input.setAttribute('aria-label','댓글 입력');placeholder.replaceWith(input);
  const button=q('594:1238',section);root.firstElementChild.append(section);
  const append=comment=>{const row=cloneCommerceRow(template,comment.id);delete row.dataset.productId;row.classList.add('comment-row');const texts=row.querySelectorAll('p');texts[0].textContent=comment.author+' · '+new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(comment.createdAt));texts[1].textContent=comment.body;section.append(row)};
  for(const comment of state.comments?.[entry.id]||[])append(comment);
  const submit=()=>{const body=input.value.trim();if(!body){input.focus();return}const comment={id:'comment-'+crypto.randomUUID(),author:state.fields.profileName||'뜨개하루',body,createdAt:new Date().toISOString()};state.comments??={};const list=state.comments[entry.id]??=[];list.push(comment);try{localStorage.setItem('komoa-figma-v2',JSON.stringify(state))}catch{list.pop();announce('댓글을 저장할 공간이 부족합니다.');return}append(comment);input.value='';root.querySelector('[data-name="message-circle"]').parentElement.querySelector('p').textContent=postCounts(entry).comments;fitCommerceFrame();scale();announce('댓글을 등록했습니다.');input.focus()};
  input.maxLength=2000;input.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();submit()}};editor.onclick=()=>input.focus();interactive(button,submit,'댓글 등록');
  interactive(root.querySelector('[data-name="message-circle"]').parentElement,()=>{input.focus();editor.scrollIntoView({block:'center'})},'댓글 보기 및 작성');
}

function seedPostComments(){
  state.comments??={};state.seededCommentPosts??={};
  const messages=['색감이 정말 잘 어울려요. 완성한 모습도 기대됩니다!','한 코씩 정성스럽게 만드신 모습이 멋져요.','작업 이야기를 나눠 주셔서 감사합니다. 저도 도전해 보고 싶어요.','사진을 보니 뜨개를 시작하고 싶어지네요.','차근차근 완성해 가는 과정이 인상적이에요.'];
  for(const id of [...Object.keys(POST_CATALOGUE),...state.posts.map(post=>post.id)]){
    if(state.seededCommentPosts[id])continue;
    const list=state.comments[id]??=[];const count=Math.floor(Math.random()*4);
    for(let i=0;i<count;i++)list.push({id:'sample-comment-'+crypto.randomUUID(),author:'익명의 털실 '+(i+1),body:messages[Math.floor(Math.random()*messages.length)],createdAt:new Date(Date.now()-(count-i)*900000).toISOString(),sample:true});
    state.seededCommentPosts[id]=true;
  }
}

function seedPostLikes(){
  state.postLikeCounts??={};
  for(const id of [...Object.keys(POST_CATALOGUE),...state.posts.map(post=>post.id)]){
    if(Number.isInteger(state.postLikeCounts[id]))continue;
    state.postLikeCounts[id]=Math.floor(Math.random()*(state.liked.includes('post:'+id)?30:31));
  }
}
