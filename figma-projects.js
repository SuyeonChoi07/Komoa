'use strict';
const projectToday=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date()).replaceAll('-','.');
const projectPercent=p=>p.completed?100:p.totalRows>0?Math.min(100,Math.max(0,Math.round(p.rows/p.totalRows*100))):0;
function initProjectsState(){
  if(state.projectData){migrateVestPhoto();return;}
  const template=document.createElement('div');template.innerHTML=S['518:3202'].html;
  const photo=id=>template.querySelector('[data-node-id="'+id+'"] img')?.getAttribute('src')||'';
  const seeds=[['cable','나의 첫 케이블 가디건',42,120,86,256,'518:3208',''],['net','매일 들고 싶은 네트백',28,60,0,0,'518:3229',''],['beanie','가을을 기다리는 비니',16,64,0,0,'518:3230',''],['scarf','노을빛 스트라이프 머플러',0,0,0,0,'518:3248','2026.08.28'],['vest','숲을 닮은 니트 베스트',0,0,0,0,'518:3249','2026.08.20'],['gloves','꽃무늬 손모아 장갑',0,0,0,0,'518:3250','2026.08.01']];
  state.projectData=Object.fromEntries(seeds.map(([id,name,rows,totalRows,stitches,totalStitches,nodeId,end])=>[id,{id,name,rows,totalRows,stitches,totalStitches,attachment:{src:photo(nodeId),name:name+'.png'},start:id==='cable'?'2026.09.03':'',end,completed:!!end,note:'',logs:[]}]));
  const p=state.projectData.cable;p.rows=Number(state.counters['518:3255:0']??42);p.stitches=Number(state.counters['518:3255:1']??86);p.name=state.fields['518:3260']||p.name;p.note=state.fields['518:3300']||'몸판 케이블 무늬 진행 중. 8단마다 무늬 교차하기.';
  p.logs=[{date:'2026.09.17',text:'몸판 42단까지 떴어요. 실의 장력이 조금씩 일정해지고 있어요.'},{date:'2026.09.13',text:'몸판 30단까지 떴어요. 목 라인이 완성되었어요.'},{date:'2026.09.10',text:'몸판 12단까지 떴어요. 케이블 무늬를 시작해요.'}];state.selectedProject='cable';state.activeProject='cable';migrateVestPhoto();save();
}
function migrateVestPhoto(){if(state.vestPhotoVersion===1)return;const p=state.projectData.vest;if(p)p.attachment={src:'assets/figma-exact/24-green-knit-vest.png',name:'24-green-knit-vest.png'};state.vestPhotoVersion=1;save()}
function persistProject(){try{localStorage.setItem('komoa-figma-v2',JSON.stringify(state));return true}catch{announce('저장 공간이 부족합니다. 사진 크기를 줄여 주세요.');return false}}
function openProject(id,record=false){state.selectedProject=id;go((record?'counter':'projectView')+'?project='+encodeURIComponent(id))}
function projectImage(node,p){const img=node?.querySelector('img');if(img){img.hidden=!p.attachment?.src;if(p.attachment?.src){img.src=p.attachment.src;img.alt=p.name;if(p.id==='vest')img.classList.add('vest-project-photo')}}}
function updateProjectBar(bar,p){const percent=projectPercent(p);bar.setAttribute('role','progressbar');bar.setAttribute('aria-label',p.name+' 진행도');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax','100');bar.setAttribute('aria-valuenow',percent);bar.firstElementChild.style.width=percent+'%'}
function renderProjects(root){
  const p=state.projectData[state.activeProject]||state.projectData.cable;
  setText('518:3210',p.name,root);setText('518:3213',`${p.rows} / ${p.totalRows}단 · ${p.stitches}코`,root);setText('518:3214',projectPercent(p)+'%',root);updateProjectBar(q('518:3215',root),p);projectImage(q('518:3208',root),p);
  setText('518:3223',p.logs[0]?.date||'',root);setText('518:3224',p.logs[0]?.text||'아직 작업 기록이 없습니다.',root);
  interactive(q('518:3218',root),()=>openProject(p.id),'상세 보기');interactive(q('518:3219',root),()=>openProject(p.id,true),'이어서 기록하기');
  const list=q('518:3225',root),template=q('518:3229',root).cloneNode(true);all('[data-name="진행중 프로젝트"]',list).forEach(n=>n.remove());
  for(const project of Object.values(state.projectData).filter(v=>v.id!==p.id&&!v.completed)){
    const row=cloneCommerceRow(template,project.id);delete row.dataset.productId;row.dataset.projectId=project.id;row.querySelector('.f34').textContent=project.name;row.querySelector('.f36').textContent=projectPercent(project)+'%';row.querySelector('.f39').textContent=`${project.rows} / ${project.totalRows}단`;updateProjectBar(row.querySelector('[data-name="진행바"]'),project);projectImage(row,project);interactive(row,()=>openProject(project.id),project.name+' 프로젝트 보기');list.append(row);
  }
  const completed=q('518:3247',root),cardTemplate=q('518:3248',root).cloneNode(true);completed.replaceChildren();
  for(const project of Object.values(state.projectData).filter(v=>v.completed)){
    const card=cloneCommerceRow(cardTemplate,project.id);delete card.dataset.productId;card.dataset.projectId=project.id;card.querySelector('.f53').textContent=project.name;card.querySelector('.f56').textContent='완성 · '+project.end;projectImage(card,project);interactive(card,()=>openProject(project.id),project.name+' 프로젝트 보기');completed.append(card);
  }
  interactive(q('518:3253',root),()=>{delete state.newProjectDraft;go('newProject')},'새 프로젝트 만들기');
}
function mountAttachment(host,getValue,setValue){
  if(!host)return;host.classList.add('attachment-host');let busy=false;
  const render=()=>{
    const value=getValue();host.innerHTML=S[value?.src?'580:5935':'580:5983'].html;
    const widget=host.firstElementChild;widget.classList.add('attachment-widget');
    const row=widget.querySelector('[data-name="파일선택"]'),button=row.firstElementChild;row.lastElementChild.textContent=value?.name||'선택된 파일 없음';row.lastElementChild.classList.add('attachment-filename');
    const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';input.className='file-control';input.setAttribute('aria-label','사진 선택');button.append(input);
    input.onchange=async()=>{const file=input.files[0];if(!file||busy)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024){announce('15MB 이하의 JPG·PNG·WebP 사진을 선택해 주세요.');input.value='';return}busy=true;input.disabled=true;
      try{const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>resolve(reader.result);reader.readAsDataURL(file)});const image=new Image();image.src=src;await image.decode();
        // Resize large camera photos so several projects fit in browser storage.
        const ratio=Math.min(1,1600/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);const compressed=canvas.toDataURL('image/webp',.85);
        if(setValue({src:compressed,name:file.name})!==false){render();announce(file.name+' 사진을 첨부했습니다.');}
      }catch{announce('사진을 읽을 수 없습니다. 다른 파일을 선택해 주세요.')}finally{busy=false;input.disabled=false;input.value=''}
    };
    if(value?.src){widget.querySelector('[data-node-id="580:5922"] img').src=value.src;widget.querySelector('[data-node-id="580:5922"] img').alt=value.name;interactive(widget.querySelector('[data-node-id="580:5916"]'),()=>{if(setValue(null)!==false){render();announce('사진을 삭제했습니다.')}},'첨부 사진 삭제')}
    fitCommerceFrame();scale();
  };render();
}
function projectEditor(textNode,icon,label,getValue,commit,multiline=false,placeholder=''){
  let input=null;const refresh=()=>{textNode.textContent=getValue()||placeholder;textNode.classList.add('project-edit-text');icon.setAttribute('aria-label',label+' 수정')};
  const finish=()=>{if(!input)return;const value=input.value.trim();if(commit(value)===false)return;input.replaceWith(textNode);input=null;refresh();fitCommerceFrame();scale()};
  interactive(icon,()=>{if(input){finish();return}input=document.createElement(multiline?'textarea':'input');input.className=textNode.className+' project-input';input.setAttribute('aria-label',label);input.value=getValue()||'';input.placeholder=placeholder;if(multiline){input.rows=3;input.oninput=()=>{input.style.height='auto';input.style.height=input.scrollHeight+'px';fitCommerceFrame();scale()}}else input.maxLength=100;
    input.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'&&(!multiline||e.ctrlKey)){e.preventDefault();finish()}};textNode.replaceWith(input);icon.setAttribute('aria-label',label+' 저장');input.focus();fitCommerceFrame();scale();},label+' 수정');refresh();return finish;
}
function renderProjectEditor(root,id){
  const isNew=id===routes.newProject,isView=id===routes.projectView;
  const p=isNew?(state.newProjectDraft??={id:'project-'+crypto.randomUUID(),name:'',rows:0,totalRows:0,stitches:0,totalStitches:0,note:'',logs:[],start:projectToday(),attachment:null}):state.projectData[state.selectedProject];
  root.dataset.projectId=p.id;const finishes=[],name=root.querySelector('[data-name="프로젝트 명"]');
  if(isView)name.querySelector('p').textContent=p.name;
  else finishes.push(projectEditor(name.querySelector('p'),name.querySelector('[data-name="edit"]'),'프로젝트 이름',()=>p.name,value=>{if(!value){announce('프로젝트 이름을 입력해 주세요.');return false}p.name=value;persistProject()},false,'프로젝트 이름'));
  const recordId=isNew?'518:3327':isView?'660:4950':'518:3281',recordIcon=isNew?'518:3328':isView?'660:4947':'518:3282',noteId=isNew?'518:3337':isView?'660:4919':'518:3300',noteIcon=isNew?'518:3334':isView?'660:4918':'518:3297';
  const recordArea=q(recordId,root).closest('[data-name="최근기록"]');
  all('[data-name="상세정보"]',recordArea).filter(n=>!n.contains(q(recordId,root))).forEach(n=>n.remove());
  const logList=document.createElement('div');logList.className='project-log-list';recordArea.append(logList);
  const renderLogs=()=>{logList.replaceChildren();for(const log of p.logs){const row=document.createElement('div');row.className='f114';const date=document.createElement('p'),text=document.createElement('p');date.className='f115';text.className='f116 project-record-text';date.textContent=log.date;text.textContent=log.text;row.append(date,text);logList.append(row)}};renderLogs();
  const date=q(recordId,root).closest('[data-name="상세정보"]').querySelector('p');date.textContent=projectToday();
  if(isView){q(recordIcon,root)?.remove();q(noteIcon,root)?.remove();q(recordId,root).closest('[data-name="상세정보"]').remove();q(noteId,root).textContent=p.note||'저장된 작업 메모가 없습니다.';if(!p.logs.length){const empty=document.createElement('p');empty.textContent='저장된 작업 기록이 없습니다.';logList.append(empty)}}else{
  finishes.push(projectEditor(q(recordId,root),q(recordIcon,root),'작업 기록',()=>p.logDraft||'',value=>{if(!value)return;p.logs.unshift({id:crypto.randomUUID(),date:projectToday(),text:value,rows:p.rows,stitches:p.stitches});p.logDraft='';persistProject();renderLogs()},true,'오늘 어디까지 떴나요? 다음에 기억할 내용을 적어 주세요.'));
  finishes.push(projectEditor(q(noteId,root),q(noteIcon,root),'작업 메모',()=>p.note,value=>{p.note=value;persistProject()},true,'작업하면서 잊지 말아야 할 것을 적어 보세요.'));
  }
  const attachment=root.querySelector('[data-name="첨부함 - 전"]');if(attachment)mountAttachment(attachment,()=>p.attachment,value=>{const old=p.attachment;p.attachment=value;if(!persistProject()){p.attachment=old;return false}return true});
  if(!isView){
    const arc=q(isNew?'518:3313':'518:3265',root);arc.innerHTML='<svg class="project-arc" viewBox="0 0 378 206" role="progressbar" aria-label="제작 진행도" aria-valuemin="0" aria-valuemax="100"><path d="M42 198 A147 147 0 0 1 336 198" fill="none" stroke="#f3f5ec" stroke-width="10" stroke-linecap="round"/><path class="project-arc-value" d="M42 198 A147 147 0 0 1 336 198" fill="none" stroke="#899c55" stroke-width="10" stroke-linecap="round" pathLength="100"/></svg>';
    const refresh=()=>{const percent=projectPercent(p);setText(isNew?'518:3316':'518:3269',percent+'%',root);setText(isNew?'518:3317':'518:3270',p.completed?'완성':'진행 중',root);setText(isNew?'518:3318':'518:3271',(p.start||projectToday())+'~',root);arc.querySelector('svg').setAttribute('aria-valuenow',percent);const fill=arc.querySelector('.project-arc-value');fill.style.strokeDasharray=percent+' 100';fill.style.opacity=percent===0?'0':'1'};
    (isNew?['518:3320','518:3321']:['518:3273','518:3274']).forEach((cid,index)=>{const key=index?'stitches':'rows',total=index?'totalStitches':'totalRows',unit=index?'코':'단',number=q('I'+cid+';272:2871',root),target=q('I'+cid+';272:2872',root);const update=()=>{number.textContent=p[key];target.textContent='/ '+p[total]+unit;refresh()};
      for(const [suffix,delta]of [['275:1693',-1],['275:1696',1]])interactive(q('I'+cid+';'+suffix,root),()=>{p[key]=Math.max(0,Math.min(9999,p[key]+delta));persistProject();update()},(index?'코수':'단수')+(delta<0?' 줄이기':' 늘리기'));
      const numeric=(node,field,label)=>interactive(node,()=>{if(node.querySelector('input'))return;const input=document.createElement('input');input.type='number';input.min='0';input.max='9999';input.className='project-number';input.setAttribute('aria-label',label);input.value=p[field];node.replaceChildren(input);const commit=()=>{const value=Number(input.value);if(Number.isInteger(value)&&value>=0&&value<=9999){p[field]=value;persistProject()}update()};input.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();input.blur()}};input.onclick=e=>e.stopPropagation();input.onblur=commit;input.focus();input.select()},label+' 수정');numeric(number,key,index?'현재 코수':'현재 단수');numeric(target,total,index?'목표 코수':'목표 단수');update();
    });refresh();
  }else{
    projectImage(q('658:4859',root),p);setText('658:4864',`${p.rows} / ${p.totalRows}단 · ${p.stitches}코`,root);setText('658:4865',projectPercent(p)+'%',root);updateProjectBar(q('658:4866',root),p);
    setText('660:4901',p.completed?'완성':'진행 중',root);setText('660:4902',(p.start||'시작일 미등록')+'  ~',root);setText('660:4903',p.end||'완료일 설정',root);
    interactive(q('660:4903',root),()=>{const node=q('660:4903',root);if(node.querySelector('input'))return;const input=document.createElement('input');input.type='date';input.setAttribute('aria-label','완료일');input.value=p.end?.replaceAll('.','-')||'';node.replaceChildren(input);input.onchange=()=>{p.end=input.value.replaceAll('-','.');p.completed=!!p.end;persistProject();setText('660:4901',p.completed?'완성':'진행 중',root)};input.onclick=e=>e.stopPropagation();input.focus()},'완료일 수정');
  }
  const button=q(isNew?'518:3339':isView?'660:4921':'518:3302',root);button.classList.add('project-save-button');
  interactive(button,()=>{finishes.forEach(fn=>fn());if(!p.name){announce('프로젝트 이름을 입력해 주세요.');name.querySelector('[role="button"]').click();return}if(isNew){state.projectData[p.id]=p;state.activeProject=p.id;state.selectedProject=p.id;delete state.newProjectDraft}if(persistProject()){announce('프로젝트를 저장했습니다.');go('projects')}},'프로젝트 저장하기');
  const backButton=root.querySelector('[data-name="아이콘 / back"]');interactive(backButton,back,'뒤로');
}
function fitProjectsFrame(){
  if(!current)return;
  const contentId=current===routes.newProject?'518:3304':current===routes.counter?'518:3256':current===routes.projectView?'660:4881':current===routes.projects?'518:3203':current===routes.compose?'518:3577':null;
  const content=contentId&&q(contentId,frame);if(content){let bottom=content.offsetTop+content.scrollHeight;if(current===routes.compose){const button=q('518:3608',frame);button.style.top=(bottom+20)+'px';bottom+=20+button.offsetHeight}frame.style.height=Math.max(932,bottom+120)+'px'}
}
function wireProjects(root,id){
  if(id===routes.projects)renderProjects(root);
  if([routes.newProject,routes.counter,routes.projectView].includes(id))renderProjectEditor(root,id);
  if(id===routes.compose){uploadedPhoto=state.postAttachment?.src||'';root.classList.add('borderless-compose')}
  if(id===routes.editProfile)root.classList.add('borderless-profile');
}
function wireProfile(root,id){
  all('[data-name="탭 / MY"]',root).forEach(tab=>interactive(tab,()=>go('518:4895'),'MY'));
  if(!['518:3476','518:4830','518:4895'].includes(id))return;
  root.firstElementChild.classList.add('profile-screen');
  const tabs=root.querySelector('[data-name="활동 요약"]');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','프로필 목록');
  const projects=Object.values(state.projectData);
  for(const [name,count,destination]of [['게시물',state.posts.length,'518:4895'],['프로젝트',projects.length,'518:4830'],['보관함',savedProducts().length+savedPosts().length,'518:3476']]){
    const tab=root.querySelector('[data-name="활동 요약"] [data-name="'+name+'"]');tab.querySelector('p').textContent=count;interactive(tab,()=>go(destination),name);tab.classList.add('community-tab');tab.classList.toggle('community-tab-active',id===destination);tab.setAttribute('role','tab');tab.setAttribute('aria-selected',String(id===destination));
  }
  if(id==='518:4830'){
    const list=q('518:5051',root),template=q('518:5055',root).cloneNode(true);list.replaceChildren();list.classList.add('profile-project-list');
    for(const project of projects){
      const row=cloneCommerceRow(template,project.id);delete row.dataset.productId;row.dataset.projectId=project.id;
      row.querySelector('.f34').textContent=project.name;row.querySelector('.f36').textContent=projectPercent(project)+'%';
      row.querySelector('[data-name="진행정보"] p').textContent=project.completed?'완성':'진행 중';
      row.querySelector('.f39').textContent=project.completed?'완성 · '+project.end:`${project.rows} / ${project.totalRows}단`;
      updateProjectBar(row.querySelector('[data-name="진행바"]'),project);projectImage(row,project);interactive(row,()=>openProject(project.id),project.name+' 프로젝트 보기');list.append(row);
    }
    if(!projects.length){const empty=document.createElement('p');empty.className='profile-empty';empty.textContent='아직 등록한 프로젝트가 없습니다.';list.append(empty)}
  }
}
function fitProfileFrame(){
  if(!['518:3476','518:4830','518:4895'].includes(current))return;
  const content=frame.querySelector('[data-name="posts"]');content.style.height='auto';
  frame.style.height=Math.max(932,innerHeight/Math.min(1,innerWidth/430),content.offsetTop+content.scrollHeight+120)+'px';
}
