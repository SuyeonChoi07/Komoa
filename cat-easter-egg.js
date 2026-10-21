'use strict';
(() => {
  let taps=0,active=null;
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function playCat(){
    if(active)return;
    const viewport=document.createElement('div'),canvas=document.createElement('canvas'),video=document.createElement('video');
    viewport.className='cat-easter-egg';viewport.setAttribute('aria-hidden','true');
    Object.assign(viewport.style,{position:'fixed',top:'0',left:'50%',transform:'translateX(-50%)',width:'min(430px,100vw)',height:'100dvh',overflow:'hidden',pointerEvents:'none',zIndex:'60'});
    Object.assign(canvas.style,{position:'absolute',left:'0',top:'0',width:'min(260px,65vw)',height:'auto',visibility:'hidden'});
    video.src='assets/oiia-cat.mp4';video.playsInline=true;video.setAttribute('playsinline','');video.preload='auto';
    Object.assign(video.style,{position:'absolute',width:'1px',height:'1px',opacity:'0',pointerEvents:'none'});
    viewport.append(canvas,video);document.body.append(viewport);active=viewport;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});let callback=null,raf=null,closing=false,started=false,offscreen='translate(0,0)';
    const place=()=>{const width=viewport.clientWidth,height=viewport.clientHeight,w=Math.min(260,width*.65,height*video.videoWidth/video.videoHeight),h=w*video.videoHeight/video.videoWidth;const x=Math.random()*Math.max(0,width-w),y=Math.random()*Math.max(0,height-h);Object.assign(canvas.style,{width:w+'px',left:x+'px',top:y+'px'});const edges=[{distance:x,move:`translate(${-x-w-1}px,0)`},{distance:width-x-w,move:`translate(${width-x+1}px,0)`},{distance:y,move:`translate(0,${-y-h-1}px)`},{distance:height-y-h,move:`translate(0,${height-y+1}px)`}];offscreen=edges.sort((a,b)=>a.distance-b.distance)[0].move};
    const cleanup=()=>{if(callback!==null&&video.cancelVideoFrameCallback)video.cancelVideoFrameCallback(callback);if(raf!==null)cancelAnimationFrame(raf);video.pause();video.removeAttribute('src');video.load();viewport.remove();if(active===viewport)active=null};
    const close=()=>{if(closing)return;closing=true;video.pause();if(reduced()){cleanup();return}const motion=canvas.animate([{transform:'translate(0,0)'},{transform:offscreen}],{duration:350,easing:'ease-in',fill:'forwards'});motion.finished.then(cleanup,cleanup)};
    const render=()=>{
      if(closing)return;
      if(video.readyState>=2){
        if(!canvas.width||canvas.width===300){canvas.width=480;canvas.height=Math.round(480*video.videoHeight/video.videoWidth)}
        ctx.drawImage(video,0,0,canvas.width,canvas.height);
        const frame=ctx.getImageData(0,0,canvas.width,canvas.height),d=frame.data;
        for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2],dominance=g-Math.max(r,b);if(g>65&&dominance>22){const key=Math.min(1,(dominance-22)/65);d[i+3]=Math.round(255*(1-key));d[i+1]=Math.min(g,Math.max(r,b)+20)}}
        ctx.putImageData(frame,0,0);
        if(!started){started=true;place();canvas.style.visibility='visible';canvas.style.transform='translate(0,0)';if(!reduced())canvas.animate([{transform:offscreen},{transform:'translate(0,0)'}],{duration:350,easing:'ease-out'})}
      }
      if(video.requestVideoFrameCallback)callback=video.requestVideoFrameCallback(render);else raf=requestAnimationFrame(render);
    };
    video.addEventListener('ended',close,{once:true});video.addEventListener('error',cleanup,{once:true});
    // Start from the fifth user activation so mobile browsers permit inline audio/video playback.
    video.play().then(render).catch(cleanup);
  }
  function tap(){if(active)return;taps++;if(taps===5){taps=0;playCat()}}
  const selector='#fixed-header [data-name="logo"]';
  document.addEventListener('click',e=>{if(e.target.closest(selector))tap()});
  document.addEventListener('keydown',e=>{if(e.target.matches(selector)&&['Enter',' '].includes(e.key)&&!e.repeat){e.preventDefault();tap()}});
  const enhance=()=>{const logo=document.querySelector(selector);if(logo){logo.tabIndex=0;logo.setAttribute('role','button');logo.setAttribute('aria-label','Komoa 로고')}};
  new MutationObserver(enhance).observe(document.getElementById('fixed-header'),{childList:true});enhance();
})();
