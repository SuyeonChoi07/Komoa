'use strict';

// One catalogue feeds the existing Figma card, detail, cart and checkout layouts.
const PRODUCT_NODES={
  '618:1461':'bamboo-needles-5mm',
  '518:3682':'cable-cardigan','570:1882':'rust-cardigan','570:1883':'pink-cardigan',
  '518:3693':'lace-bag','518:3694':'sage-knit-bag','572:2022':'autumn-beanie','572:2023':'soso-oatmeal-pattern',
  '518:3704':'oatmeal-yarn','518:3705':'bamboo-needles','572:2111':'sage-knit-bag',
  '518:3682':'cable-cardigan','518:3683':'sage-cardigan',
  '518:3693':'lace-bag','518:3694':'sage-knit-bag',
  '518:3704':'oatmeal-yarn','518:3705':'bamboo-needles',
  '518:3809':'cable-cardigan','518:3810':'rust-cardigan','518:3811':'pink-cardigan'
};
const CATALOGUE=Object.create(null);
for(const screenId of ['518:3609','518:3781',]){
  const template=document.createElement('div');template.innerHTML=window.FIGMA_SCREENS[screenId].html;
  for(const card of template.querySelectorAll('[data-name="검색결과"]')){
    const id=PRODUCT_NODES[card.dataset.nodeId];if(!id||CATALOGUE[id])continue;
    const title=card.querySelector('[data-node-id$=";239:2454"]').textContent.trim().replace(/\]\s*/,'] ');
    CATALOGUE[id]={id,title,name:title.replace(/^\[[^\]]+\]\s*/,''),type:title.match(/^\[([^\]]+)\]/)[1],price:Number(card.querySelector('[data-node-id$=";239:2455"]').textContent.replace(/\D/g,'')),image:card.querySelector('img').getAttribute('src'),maker:id==='cable-cardigan'?'소소니트':'Komoa'};
  }
}
const PRODUCT_COPY={
  'bamboo-needles-5mm':'5mm 대나무 줄바늘이에요. 도안에 안내된 바늘 규격을 확인해 주세요.',
  'autumn-beanie':'가을빛 골지 비니 도안입니다.',
  'soso-oatmeal-pattern':'소소 시리즈의 도안입니다.',
  'cable-cardigan':'포근한 케이블 무늬와 여유로운 실루엣의 가디건이에요. 몸판부터 소매까지 차근차근 뜨는 과정을 담았습니다.',
  'sage-cardigan':'차분한 세이지 색감의 데일리 가디건 도안이에요. 일상에서 오래 함께할 나만의 가디건을 만들어 보세요.',
  'lace-bag':'레이스 무늬가 돋보이는 그물백 도안이에요. 가볍게 들기 좋은 나만의 가방을 만들어 보세요.',
  'sage-knit-bag':'세이지 색감과 뜨개 질감이 어우러진 니트백 도안이에요. 매일 들고 싶은 가방을 직접 만들어 보세요.',
  'rust-cardigan':'따뜻한 러스트 모카 색감의 가디건 도안이에요. 가을에 어울리는 나만의 뜨개 작품을 만들어 보세요.',
  'pink-cardigan':'부드러운 분홍빛과 골지 무늬가 어우러진 가디건 도안이에요. 한 코씩 나만의 가디건을 완성해 보세요.',
  'oatmeal-yarn':'오트밀 색상의 메리노 울 실이에요. 한 볼의 중량은 50g이며, 작품에 필요한 수량을 장바구니에서 조절할 수 있어요.',
  'bamboo-needles':'뜨개 작업에 사용하는 4mm 대나무 줄바늘이에요. 사용하실 도안에 안내된 바늘 규격을 확인해 주세요.'
};
const won=value=>value.toLocaleString('ko-KR')+'원';
function normalizeCart(value){const cart={};if(!value||Array.isArray(value)||typeof value!=='object')return cart;for(const [id,qty]of Object.entries(value)){if(CATALOGUE[id]&&Number.isSafeInteger(qty)&&qty>0)cart[id]=Math.min(qty,999)}return cart}
function initCommerceState(){
  // The old [1,1] array contained demo products, not identifiable user selections.
  state.cart=state.commerceVersion===3?normalizeCart(state.cart):{};
  if(state.commerceVersion!==3)delete state.lastOrder;
  state.commerceVersion=3;
  if(!CATALOGUE[state.selectedProduct])state.selectedProduct='cable-cardigan';
  state.saved=Array.isArray(state.saved)?[...new Set(state.saved.map(key=>{if(typeof key!=='string')return null;const node=Object.keys(PRODUCT_NODES).find(id=>key.startsWith('I'+id+';'));return node?'product:'+PRODUCT_NODES[node]:key}).filter(Boolean))]:[];
  save();
}
function cartItems(){return Object.entries(state.cart).filter(([id,quantity])=>CATALOGUE[id]&&quantity>0).map(([id,quantity])=>({...CATALOGUE[id],quantity}))}
function orderTotals(items=cartItems()){
  const subtotal=items.reduce((sum,p)=>sum+p.price*p.quantity,0);
  const shipping=items.some(p=>p.type!=='도안')&&subtotal<50000?3000:0;
  return {subtotal,shipping,total:subtotal+shipping};
}
function addToCart(id,control){
  const product=CATALOGUE[id];if(!product||control?.getAttribute('aria-disabled')==='true')return;
  state.cart[id]=Math.min(999,(state.cart[id]||0)+1);save();updateCartBadges();showCartToast();
  if(control){control.setAttribute('aria-disabled','true');control.classList.add('commerce-disabled');setTimeout(()=>{control.setAttribute('aria-disabled','false');control.classList.remove('commerce-disabled')},1200)}
}
function openProduct(id){if(CATALOGUE[id])return go('product?product='+encodeURIComponent(id),true,'SLIDE_IN',.3)}
function productImage(img,product){if(img){img.src=product.image;img.alt=product.name}}
function setNodeText(root,id,value){const el=q(id,root);if(el)el.textContent=value}
function setControlEnabled(el,enabled,callback,label){interactive(el,enabled?callback:()=>{},label);el.setAttribute('aria-disabled',String(!enabled));el.classList.toggle('commerce-disabled',!enabled)}
function renderProduct(root){
  const product=CATALOGUE[state.selectedProduct]||CATALOGUE['cable-cardigan'];root.dataset.productId=product.id;
  productImage(q('518:3712',root).querySelector('img'),product);
  setNodeText(root,'518:3717',product.title);setNodeText(root,'518:3719',product.maker);setNodeText(root,'518:3720',won(product.price));
  setNodeText(root,'518:3714','1/1');setNodeText(root,'518:3768',PRODUCT_COPY[product.id]);
  document.title=product.name+' · Komoa';
  // Unspecified measurements are not copied from the cable cardigan to another product.
  if(product.id!=='cable-cardigan'){
    let summary=[['도안 참고','사이즈'],['도안 참고','난이도'],['도안 참고','필요한 실의 양']];
    let details=[['게이지','도안 참고'],['바늘','도안 참고'],['사용한 실','도안 참고']];
    if(product.type==='실'){summary=[['50g','중량'],['메리노 울','실 종류'],['오트밀','색상']];details=[['실 종류','메리노 울'],['중량','50g / 볼'],['색상','오트밀']];}
    if(product.type==='바늘'){summary=[['4mm','규격'],['대나무','소재'],['줄바늘','유형']];details=[['바늘 유형','줄바늘'],['규격','4mm'],['소재','대나무']];}
    [['518:3726','518:3727'],['518:3733','518:3734'],['518:3740','518:3741']].forEach(([value,label],i)=>{setNodeText(root,value,summary[i][0]);setNodeText(root,label,summary[i][1])});
    [['518:3752','518:3753'],['518:3755','518:3756'],['518:3758','518:3759']].forEach(([label,value],i)=>{setNodeText(root,label,details[i][0]);setNodeText(root,value,details[i][1])});
  }
  if(product.type!=='도안'){setNodeText(root,'518:3745','상품 정보');setNodeText(root,'518:3747','함께 볼 상품');setNodeText(root,'518:3749','상품 이야기');setNodeText(root,'518:3761','함께 볼 상품');setNodeText(root,'518:3766','상품 이야기')}
  const related=product.type==='도안'?['oatmeal-yarn','bamboo-needles']:product.type==='실'?['bamboo-needles','cable-cardigan']:['oatmeal-yarn','cable-cardigan'];
  ['518:3762','518:3763'].forEach((nodeId,i)=>{
    const p=CATALOGUE[related[i]],row=q(nodeId,root);row.dataset.productId=p.id;
    productImage(row.querySelector('img'),p);row.querySelector('img').classList.add('commerce-related-image');
    setNodeText(root,'I'+nodeId+';239:2210',p.maker);setNodeText(root,'I'+nodeId+';239:2211',p.title);setNodeText(root,'I'+nodeId+';239:2212',won(p.price));
    interactive(row,()=>openProduct(p.id),p.name+' 상세보기');const plus=row.querySelector('[data-name="Plus"]');interactive(plus,()=>addToCart(p.id,plus),p.name+' 장바구니 담기');
  });
  const add=q('518:3779',root);interactive(add,()=>addToCart(product.id,add),'담기');
  const buy=q('518:3780',root);setNodeText(root,'I518:3780;239:1987',product.type==='도안'?'도안 구매하기':'구매하기');interactive(buy,()=>{addToCart(product.id);go('cart')},product.type==='도안'?'도안 구매하기':'구매하기');
  wireProductSave(q('518:3774',root),product.id);
}
function cloneCommerceRow(template,key){
  const row=template.cloneNode(true);row.removeAttribute('aria-label');row.removeAttribute('role');row.removeAttribute('tabindex');
  // Repeated data instances must not duplicate the reference frame's node IDs.
  for(const n of [row,...row.querySelectorAll('[data-node-id]')]){if(n.dataset.nodeId){n.dataset.sourceNodeId=n.dataset.nodeId;delete n.dataset.nodeId}}
  row.dataset.productId=key;return row;
}
function emptyCartMessage(){const p=document.createElement('p');p.className='commerce-empty';p.textContent='장바구니가 비어 있어요.';return p}
function renderCart(root){
  const items=cartItems(),totals=orderTotals(items),list=q('518:3820',root),original=q('518:3822',root).cloneNode(true);
  all('[data-name="구매상품"]',list).forEach(n=>n.remove());
  if(!items.length)list.append(emptyCartMessage());
  for(const product of items){
    const row=cloneCommerceRow(original,product.id);row.classList.add('commerce-cart-row');
    productImage(row.querySelector('img'),product);
    const field=suffix=>row.querySelector('[data-source-node-id$="'+suffix+'"]');
    field(';239:2281').textContent=product.maker;field(';239:2282').textContent=product.title;field(';239:2282').classList.add('commerce-item-title');field(';239:2283').textContent=won(product.price);
    const qty=row.querySelector('[data-name="수량 조절"]');qty.querySelector('p').textContent=product.quantity;
    for(const [name,delta]of [['수량 줄이기',-1],['수량 늘리기',1]]){
      const button=qty.querySelector('[data-name="'+name+'"]');setControlEnabled(button,delta<0||product.quantity<999,()=>{
        const next=(state.cart[product.id]||0)+delta;if(next<=0)delete state.cart[product.id];else state.cart[product.id]=Math.min(999,next);save();const y=scrollY;go('cart',false);scrollTo(0,y);
        const target=all('[data-product-id]',frame).find(n=>n.dataset.productId===product.id)?.querySelector('[data-name="'+name+'"]');target?.focus({preventScroll:true});
      },product.name+' '+name);
    }
    list.append(row);
  }
  setNodeText(root,'518:3830',won(totals.subtotal));setNodeText(root,'518:3833',won(totals.shipping));setNodeText(root,'518:3836',won(totals.total));setNodeText(root,'I518:3839;239:1987',won(totals.total)+' · 주문 확인');
  setControlEnabled(q('518:3839',root),items.length>0,()=>go('checkout'),'주문 확인');
  q('518:3817',root).classList.add('commerce-cart-content');root.dataset.commerce='cart';
}
function renderCheckout(root){
  const items=cartItems(),totals=orderTotals(items),list=q('518:3848',root),template=q('518:3849',root).cloneNode(true);list.replaceChildren();
  if(!items.length)list.append(emptyCartMessage());
  for(const product of items){const row=cloneCommerceRow(template,product.id);row.classList.add('commerce-order-row');const texts=row.querySelectorAll('p');texts[0].textContent=product.title+' × '+product.quantity;texts[1].textContent=won(product.price*product.quantity);list.append(row)}
  setNodeText(root,'518:3858',won(totals.subtotal));setNodeText(root,'518:3861',won(totals.shipping));setNodeText(root,'518:3864',won(totals.total));
  q('518:3845',root).classList.add('commerce-order-amount');
  setControlEnabled(q('518:3865',root),items.length>0,()=>{
    const selected=cartItems();if(!selected.length)return;
    state.lastOrder={items:selected.map(p=>({...p})),...orderTotals(selected),createdAt:new Date().toISOString()};state.cart={};save();go('orderComplete');
  },'주문 완료하기');root.dataset.commerce='checkout';
}
function renderOrderComplete(root){
  const order=state.lastOrder;all('p',root).forEach(p=>{if(p.textContent.includes('21,300원'))p.textContent=won(order?.total||0);if(!order&&p.textContent.trim()==='결제 완료')p.textContent='완료된 주문이 없어요.'});
}
function fitCommerceFrame(){
  fitProjectsFrame();
  if(current===routes.home){const content=q('518:3610',frame);frame.style.height=Math.max(932,content.offsetTop+content.offsetHeight+130)+'px'}
  if([].includes(current)){const content=frame.firstElementChild.firstElementChild;frame.style.height=Math.max(932,content.offsetTop+content.offsetHeight+120)+'px'}
  fitProfileFrame();
  if(current===routes.community||current===routes.qna){const content=q(current===routes.qna?'572:2391':'518:3550',frame);frame.style.height=Math.max(932,content.offsetTop+content.offsetHeight+120)+'px';}
  if(current===routes.post){const post=q('518:3547',frame),inner=post.parentElement,comments=frame.querySelector('.post-comments');let bottom=inner.offsetTop+inner.offsetHeight;if(comments){comments.style.top=(bottom+20)+'px';bottom+=20+comments.offsetHeight}frame.style.height=Math.max(932,bottom+120)+'px';}
  if(current===routes.searchResults){const content=q('518:3782',frame);frame.style.height=Math.max(932,content.offsetTop+content.offsetHeight+120)+'px';}
  if(current===routes.cart){const content=q('518:3817',frame);frame.style.height=Math.max(932,content.offsetHeight+30)+'px';}
  if(current===routes.checkout){const content=q('518:3841',frame),button=q('518:3865',frame);button.style.top=(content.offsetTop+content.offsetHeight+20)+'px';frame.style.height=Math.max(932,button.offsetTop+button.offsetHeight+30)+'px';}
  if(current===routes.product){const card=q('518:3715',frame),inner=q('518:3711',frame);frame.style.height=Math.max(1282,card.offsetTop+card.offsetHeight)+'px';inner.style.height=frame.style.height;}
}
function wireCommerce(root,id){
  for(const card of all('[data-name="검색결과"]',root)){
    const productId=PRODUCT_NODES[card.dataset.nodeId],product=CATALOGUE[productId];if(!product)continue;card.dataset.productId=productId;
    interactive(card,()=>openProduct(productId),product.name+' 상세보기');
    wireProductSave(card.querySelector('[data-name*="bookmark"]'),productId);
    const label=all('p',card).find(p=>p.textContent.includes('장바구니 담기'));if(label){const button=label.parentElement;interactive(button,()=>addToCart(productId,button),product.name+' 장바구니 담기');}
  }
  if(['518:3476','518:4830','518:4895'].includes(id)){
    all('[data-name="활동 요약"] [data-name="보관함"]',root).forEach(tab=>{tab.querySelector('p').textContent=savedProducts().length+savedPosts().length;interactive(tab,()=>go('my'),'보관함')});
    if(id===routes.my)renderSavedProducts(root);
  }
  if(id===routes.product)renderProduct(root);
  if(id===routes.cart)renderCart(root);
  if(id===routes.checkout)renderCheckout(root);
  if(id===routes.orderComplete)renderOrderComplete(root);
}

function savedProducts(){return state.saved.filter(key=>key.startsWith('product:')).map(key=>CATALOGUE[key.slice(8)]).filter(Boolean)}
function wireProductSave(button,id){
  if(!button)return;
  if(button.parentElement?.dataset.name==='저장아이콘')button=button.parentElement;
  button.classList.add('product-save');button.dataset.savedProduct=id;
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  const refresh=()=>{const selected=state.saved.includes('product:'+id);button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',CATALOGUE[id].name+(selected?' 보관함에서 해제':' 보관함에 저장'))};
  interactive(button,()=>{const key='product:'+id,i=state.saved.indexOf(key);if(i<0)state.saved.push(key);else state.saved.splice(i,1);save();all('[data-saved-product]').filter(n=>n.dataset.savedProduct===id).forEach(n=>{n.setAttribute('aria-pressed',String(i<0));n.setAttribute('aria-label',CATALOGUE[id].name+(i<0?' 보관함에서 해제':' 보관함에 저장'))});announce(i<0?'보관함에 저장했습니다.':'보관함에서 해제했습니다.');if(current===routes.my){const y=scrollY;go('my',false);scrollTo(0,y)} });refresh();
}
function renderSavedProducts(root){
  const products=savedProducts(),empty=q('518:3494',root);if(!products.length&&!savedPosts().length)return;
  const grid=document.createElement('div');grid.className='saved-products';grid.setAttribute('aria-label','저장한 제품');
  const source=document.createElement('div');source.innerHTML=S[routes.home].html;
  for(const product of products){const sourceId=Object.keys(PRODUCT_NODES).find(id=>PRODUCT_NODES[id]===product.id),template=q(sourceId,source)||source.querySelector('[data-name="검색결과"]'),card=cloneCommerceRow(template,product.id);card.classList.add('saved-product-card');
    productImage(card.querySelector('img'),product);card.querySelector('[data-source-node-id$=";239:2454"]').textContent=product.title;card.querySelector('[data-source-node-id$=";239:2455"]').textContent=won(product.price);
    interactive(card,()=>openProduct(product.id),product.name+' 상세보기');wireProductSave(card.querySelector('[data-name*="bookmark"]'),product.id);
    const label=all('p',card).find(p=>p.textContent.includes('장바구니 담기'));if(label)interactive(label.parentElement,()=>addToCart(product.id,label.parentElement),product.name+' 장바구니 담기');grid.append(card);
  }appendSavedPosts(grid);empty.replaceWith(grid);q('518:3478',root).style.height='auto';
}
