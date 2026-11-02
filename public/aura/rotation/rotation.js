/* AURA prerecorded rotation component. Independent of unchanged voice engine. */
(()=>{'use strict';const $=x=>document.getElementById(x),v=$('rotationVideo'),face=$('face'),seek=$('rotationSeek'),status=$('rotationStatus'),toggle=$('faceToggle');let active=false,startX=null,startTime=0;
function pause(){v.pause();}
function photo(){pause();active=false;v.hidden=true;face.hidden=false;status.textContent='Original photo close-up. Separate framing from the supplied turntable.';}
function front(){pause();if(toggle.checked)toggle.click();active=true;v.hidden=false;face.hidden=true;if(v.readyState){v.currentTime=0;seek.value=0;}status.textContent='Supplied video front view. Rotation paused.';}
$('showRotation').onclick=async()=>{if(toggle.checked)toggle.click();active=true;face.hidden=true;v.hidden=false;if(v.readyState===0){status.textContent='Loading 945 KB supplied rotation...';$('showRotation').disabled=true;try{const r=await fetch('../rotation/rotation-intact.mp4');if(!r.ok)throw Error('Video unavailable');const blob=await r.blob();v.src=URL.createObjectURL(blob);v.load();}catch{photo();status.textContent='Rotation could not load. Original photo retained.';}finally{$('showRotation').disabled=false;}}else status.textContent='Rotation ready. Play or drag the slider.';};
v.addEventListener('loadedmetadata',()=>{for(const id of ['rotatePlay','rotatePause','rotateReset','rotationSeek'])$(id).disabled=false;seek.max=Math.max(0,v.duration-.05);status.textContent='Rotation ready. Play, scrub, or swipe left/right.';});
v.addEventListener('error',()=>{photo();status.textContent='Rotation could not load. Original front view retained.';});
v.addEventListener('play',()=>status.textContent='Playing supplied prerecorded rotation. Voice stays separate.');
v.addEventListener('ended',()=>status.textContent='Rotation ended. Reset or scrub to inspect a view.');
v.addEventListener('timeupdate',()=>{if(!v.seeking&&!seek.matches(':active'))seek.value=v.currentTime;});
$('rotatePlay').onclick=async()=>{if(!active){active=true;face.hidden=true;v.hidden=false;}try{await v.play();}catch{status.textContent='Playback did not start. Tap Play again or use the slider.';}};
$('rotatePause').onclick=()=>{pause();status.textContent='Rotation paused.';};$('rotateReset').onclick=()=>{pause();v.currentTime=0;seek.value=0;status.textContent='Rotation reset to start.';};$('showFront').onclick=front;$('showPhoto').onclick=photo;
seek.oninput=()=>{const t=Number(seek.value);pause();v.currentTime=t;status.textContent='Manual prerecorded view: '+t.toFixed(1)+' / '+v.duration.toFixed(1)+' seconds.';};
$('rotationView').addEventListener('pointerdown',e=>{if(!active||!v.duration)return;pause();startX=e.clientX;startTime=v.currentTime;});
$('rotationView').addEventListener('pointermove',e=>{if(startX===null)return;const dx=e.clientX-startX;if(Math.abs(dx)<5)return;v.currentTime=Math.max(0,Math.min(v.duration-.05,startTime+dx/250*v.duration));seek.value=v.currentTime;});
window.addEventListener('pointerup',()=>startX=null);window.addEventListener('pointercancel',()=>startX=null);
toggle.addEventListener('change',()=>{if(toggle.checked)photo();});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',pause);
})();
