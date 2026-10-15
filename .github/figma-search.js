'use strict';

const SEARCH_SCOPES={'통합검색':'518:3340','도안':'518:3365','실':'518:3397','바늘':'518:3441'};
const cleanQuery=value=>String(value??'').normalize('NFKC').trim().replace(/\s+/g,' ').slice(0,120);
const searchText=value=>cleanQuery(value).toLocaleLowerCase('ko-KR').replace(/\s/g,'');
function searchParams(request){
  const params=new URLSearchParams({q:request.query,scope:request.scope});
  for(const [key,value]of Object.entries(request.filters||{}))if(value&&value!=='전체')params.set(key,value);
  return params.toString();
}
function readSearchParams(value){
  const params=new URLSearchParams(value),filters={};
  for(const key of ['category','difficulty','needle','gauge','min','max'])if(params.has(key))filters[key]=params.get(key);
  state.searchRequest={query:cleanQuery(params.get('q')),scope:SEARCH_SCOPES[params.get('scope')]?params.get('scope'):'통합검색',filters};
  state.fields.search=state.searchRequest.query;save();
}
function submitSearch(query,scope='통합검색',filters={}){
  const request={query:cleanQuery(query),scope,filters};
  if(request.query){const recent=Array.isArray(state.recentSearches)?state.recentSearches:[];state.recentSearches=[request.query,...recent.filter(q=>typeof q==='string'&&searchText(q)!==searchText(request.query))].slice(0,5)}
  save();go('searchResults?'+searchParams(request));
}
function productSearchData(product){
  const category=product.name.includes('가디건')?'가디건':/백|가방/.test(product.name)?'가방':product.type;
  const known=product.id==='cable-cardigan'?{difficulty:'중급',needle:'대바늘',gauge:'20코 28단',material:'메리노 울'}:product.id==='bamboo-needles'?{needle:'대바늘',material:'대나무'}:{};
  return {category,...known};
}
function matchingProducts(request){
  const terms=cleanQuery(request.query).split(' ').filter(Boolean).map(searchText);
  return Object.values(CATALOGUE).filter(product=>{
    if(request.scope!=='통합검색'&&product.type!==request.scope)return false;
    const data=productSearchData(product),haystack=searchText([product.title,product.maker,...Object.values(data)].join(' '));
    if(!terms.every(term=>haystack.includes(term)))return false;
    return Object.entries(request.filters).every(([key,value])=>{
      if(!value||value==='전체')return true;
      if(key==='min'||key==='max'){const price=Number(value);return Number.isFinite(price)&&(key==='min'?product.price>=price:product.price<=price)}
      return searchText(data[key]||'')===searchText(value);
    });
  });
}
function openSearchOptions(){const request=state.searchRequest;showOverlay(SEARCH_SCOPES[current===routes.searchResults?request.scope:'통합검색'])}
function wireSearchBar(root,buttonId,textId){
  const button=q(buttonId,root);button.type='button';interactive(button,openSearchOptions,'검색창 열기');button.setAttribute('aria-haspopup','dialog');
}
function wireSearchOverlay(root,id){
  const scope=Object.keys(SEARCH_SCOPES).find(key=>SEARCH_SCOPES[key]===id);
  state.searchDraft??={};const filters=state.searchDraft[scope]??={};
  const placeholder=all('p',root).find(p=>p.textContent==='작품 이름, 재료, 브랜드');
  const input=inputText(placeholder,'검색어','search',true);input.type='search';input.maxLength=120;input.enterKeyHint='search';
  const submit=()=>submitSearch(input.value,scope,{...filters});input.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'&&!e.isComposing){e.preventDefault();submit()}};
  const options={카테고리:['category',scope==='실'?['실']:['가디건','니트','가방','모자']],난이도:['difficulty',['초급','중급','고급']],'바늘 유형':['needle',['대바늘','코바늘']],게이지:['gauge',['20코 28단','22코 30단']]};
  all('[data-name="유형"]',root).forEach(group=>{
    const label=group.querySelector('p')?.textContent,config=options[label];if(!config)return;
    const [key,values]=config,p=all('p',group).find(p=>p.textContent==='전체'),select=document.createElement('select');
    select.className='native-select';select.setAttribute('aria-label',label);for(const text of ['전체',...values])select.add(new Option(text,text));select.value=filters[key]||'전체';p.textContent=select.value;select.onchange=()=>{p.textContent=select.value;filters[key]=select.value;save()};p.parentElement.append(select);
  });
  if(scope==='실'){
    const range=q('518:3421',root),summary=q('518:3420',root);range.replaceChildren();range.classList.add('dual-price-range');
    const limit=50000;let low=Math.max(0,Math.min(limit,Number(filters.min??5000))),high=Math.max(low,Math.min(limit,Number(filters.max===''?limit:(filters.max??30000))));
    const track=document.createElement('div');track.className='price-range-track';range.append(track);
    const inputs=[],prices=[];summary.replaceChildren();summary.classList.add('editable-prices');
    for(const [i,label]of ['최소 가격 직접 입력','최대 가격 직접 입력'].entries()){if(i)summary.append(document.createTextNode(' ~ '));const field=document.createElement('input');field.type='text';field.inputMode='numeric';field.setAttribute('aria-label',label);field.className='price-direct-input';field.onfocus=()=>{field.value=String(i?high:low);field.select()};field.onblur=()=>{const value=Number(field.value.replaceAll(',',''));if(field.value.trim()&&Number.isFinite(value)&&value>=0){const amount=Math.min(limit,Math.round(value/100)*100);if(i)high=Math.max(low,amount);else low=Math.min(high,amount)}refresh()};field.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();field.blur()}};summary.append(field,document.createTextNode('원'));prices.push(field)}
    const refresh=()=>{filters.min=String(low);filters.max=high===limit?'':String(high);summary.style.lineHeight='20px';prices.forEach((field,i)=>{field.value=(i?high:low).toLocaleString('ko-KR');field.style.width=Math.max(4,field.value.length)+'ch'});track.style.background=`linear-gradient(to right,#d0d7bf ${low/limit*100}%,#899c55 ${low/limit*100}%,#899c55 ${high/limit*100}%,#d0d7bf ${high/limit*100}%)`;inputs.forEach((input,i)=>{input.value=i?high:low;input.setAttribute('aria-valuetext',Number(input.value).toLocaleString('ko-KR')+'원')});save()};
    for(const [i,label]of ['최소 가격','최대 가격'].entries()){const input=document.createElement('input');input.type='range';input.min=0;input.max=limit;input.step=100;input.setAttribute('aria-label',label);input.oninput=()=>{if(i)high=Math.max(low,Number(input.value));else low=Math.min(high,Number(input.value));refresh()};input.onkeydown=e=>e.stopPropagation();range.append(input);inputs.push(input)}refresh();
  }
  all('p',root).forEach(p=>{if(p.textContent==='검색하기')interactive(p.parentElement,submit,'검색하기');if(p.textContent==='초기화')interactive(p.parentElement,()=>{state.fields.search='';state.searchDraft={};save();showOverlay(id)},'초기화')});
}
function renderSearchResults(root){
  const request=state.searchRequest,products=matchingProducts(request),list=q('518:3808',root);
  setNodeText(root,'518:3785',request.query?'“'+request.query+'” 검색 결과':request.scope==='통합검색'?'전체 검색 결과':request.scope+' 검색 결과');
  setNodeText(root,'518:3807','검색 결과 '+products.length+'개');
  q('518:3785',root).classList.add('search-heading');q('518:3782',root).classList.add('search-content');
  const templates=document.createElement('div');templates.innerHTML=S[routes.home].html+S[routes.searchResults].html;
  list.replaceChildren();list.classList.add('search-product-list');
  for(const product of products){
    const sourceId=Object.keys(PRODUCT_NODES).find(id=>PRODUCT_NODES[id]===product.id),source=q(sourceId,templates),card=cloneCommerceRow(source,product.id);card.className='f361 search-product-card';
    productImage(card.querySelector('img'),product);card.querySelector('[data-source-node-id$=";239:2454"]').textContent=product.title;card.querySelector('[data-source-node-id$=";239:2455"]').textContent=won(product.price);
    interactive(card,()=>openProduct(product.id),product.name+' 상세보기');wireProductSave(card.querySelector('[data-name*="bookmark"]'),product.id);
    const add=card.querySelector('[data-name="버튼 / + 장바구니 담기"]');interactive(add,()=>addToCart(product.id,add),product.name+' 장바구니 담기');list.append(card);
  }
  if(!products.length){list.remove();q('518:3806',root).style.gap='0';const empty=document.createElement('p');empty.className='search-empty';empty.textContent='검색 결과가 없습니다';empty.setAttribute('role','status');q('518:3782',root).append(empty);root.firstElementChild.dataset.name='검색 결과 - 없음'}
  const recent=q('518:3803',root),chips=document.createElement('div');chips.className='search-recent-chips';recent.replaceChildren();const label=document.createElement('p');label.className='f358';label.textContent='최근 검색어';recent.append(label,chips);
  for(const query of state.recentSearches||[]){const button=document.createElement('button');button.type='button';button.className='f359';button.textContent=query;button.onclick=()=>submitSearch(query);chips.append(button)}
  recent.hidden=!chips.children.length;
  interactive(root.querySelector('[data-name="탭 / 홈"]'),()=>go('home'),'홈');
  state.searchDraft={[request.scope]:{...request.filters}};
  wireSearchBar(root,'518:3788','518:3792');announce('검색 결과 '+products.length+'개입니다.');
}
function wireSearch(root,id){
  if(Object.values(SEARCH_SCOPES).includes(id))wireSearchOverlay(root,id);
  if(id===routes.home)wireSearchBar(root,'518:3614','518:3618');
  if(id===routes.searchResults)renderSearchResults(root);
}
