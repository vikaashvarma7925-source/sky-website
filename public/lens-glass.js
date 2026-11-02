/* Local backdrop displacement maps only. No page capture or network access. */
(function(){'use strict';if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;var ns='http://www.w3.org/2000/svg';function el(tag,attrs,parent){var e=document.createElementNS(ns,tag);Object.keys(attrs).forEach(function(k){e.setAttribute(k,attrs[k]);});parent.appendChild(e);return e;}
var s=el('svg',{'width':'0','height':'0','aria-hidden':'true','focusable':'false','class':'lens-defs'},document.body),d=el('defs',{},s);
function map(id,w,h,scale){var c=document.createElement('canvas');c.width=w;c.height=h;var g=c.getContext('2d'),im=g.createImageData(w,h),a=im.data;
for(var y=0;y<h;y++)for(var x=0;x<w;x++){var nx=(x-w/2)/(w/2),ny=(y-h/2)/(h/2),edge=Math.max(Math.abs(nx),Math.abs(ny)),band=Math.pow(Math.max(0,(edge-.58)/.42),2),i=(y*w+x)*4;a[i]=128+nx*band*115;a[i+1]=128+ny*band*115;a[i+2]=128;a[i+3]=255;}g.putImageData(im,0,0);
var f=el('filter',{'id':id,'x':'0','y':'0','width':'100%','height':'100%','color-interpolation-filters':'sRGB'},d);el('feImage',{'href':c.toDataURL(),'x':'0','y':'0','width':'100%','height':'100%','preserveAspectRatio':'none','result':'map'},f);el('feDisplacementMap',{'in':'SourceGraphic','in2':'map','scale':String(scale),'xChannelSelector':'R','yChannelSelector':'G'},f);}
map('sky-lens',240,120,20);map('sky-card-lens',240,240,32);
/* At most one compact icon gets a live backdrop lens; never its card or text. */
if(matchMedia('(hover:none),(pointer:coarse),(max-width:900px)').matches&&'IntersectionObserver' in window){var visible=new Map(),active=null;var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting&&entry.intersectionRatio>=.5)visible.set(entry.target,entry.boundingClientRect.top);else visible.delete(entry.target);});var next=null;visible.forEach(function(top,node){if(!next||top<visible.get(next))next=node;});if(next!==active){if(active)active.classList.remove('bounded-live-lens');active=next;if(active)active.classList.add('bounded-live-lens');}},{threshold:[0,.5,1]});document.querySelectorAll('.tool-toggle-icon,.feature-icon,.mini-gem,.l-mini-icon,.l-doc').forEach(function(icon){observer.observe(icon);});}

})();
/* Cosmetic tap halo only. No biometric sensing, capture, storage or network. */
(function(){'use strict';var reduce=matchMedia('(prefers-reduced-motion:reduce)'),halo=null,start=null,animations=[];
function clear(){animations.forEach(function(a){a.cancel();});animations=[];if(halo){if(halo.matches(':popover-open'))halo.hidePopover();halo.hidden=true;}}
function show(x,y){if(reduce.matches)return;if(!halo){halo=document.createElement('span');halo.className='sky-tap-halo';halo.setAttribute('aria-hidden','true');if('showPopover' in halo)halo.setAttribute('popover','manual');halo.hidden=true;document.body.appendChild(halo);}clear();halo.style.left=x+'px';halo.style.top=y+'px';halo.hidden=false;if(halo.showPopover)halo.showPopover();animations=[halo.animate([{transform:'translate(-50%,-50%) scale(.16)',opacity:0},{offset:.16,transform:'translate(-50%,-50%) scale(.36)',opacity:1},{transform:'translate(-50%,-50%) scale(1)',opacity:0}],{duration:700,easing:'cubic-bezier(.16,.65,.3,1)'})];animations[0].onfinish=function(){if(halo.matches(':popover-open'))halo.hidePopover();halo.hidden=true;};}
document.addEventListener('pointerdown',function(e){if(!e.isPrimary)return;start={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now()};},{passive:true});
document.addEventListener('pointerup',function(e){var s=start;start=null;if(!s||s.id!==e.pointerId||performance.now()-s.t>650||Math.hypot(e.clientX-s.x,e.clientY-s.y)>12)return;show(e.clientX,e.clientY);},{passive:true});
document.addEventListener('pointercancel',function(){start=null;},{passive:true});
reduce.addEventListener('change',function(){if(reduce.matches)clear();});
document.addEventListener('visibilitychange',function(){if(document.hidden){start=null;clear();}});
})();
