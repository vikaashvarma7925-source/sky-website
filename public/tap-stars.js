/* Passive finger-following trail. Native scrolling and tool controls retain their events. */
(function(){'use strict';
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,last=0,active=[],drawing=false,lastX=0,lastY=0;
function blocked(target){return reduced||document.querySelector('dialog[open]')||(target.closest&&target.closest('a,button,input,textarea,select,label,canvas:not(#skyStars)'));}
function star(x,y,big){
 if(active.length>=12){var old=active.shift();old.remove();}
 var dot=document.createElement('i');dot.className='tap-star';dot.textContent=big?'✦':'•';dot.style.left=x+'px';dot.style.top=y+'px';dot.style.color=Math.random()>.5?'#bd79ff':'#ffe6a0';document.body.appendChild(dot);active.push(dot);
 var dx=(Math.random()-.5)*22,dy=-10-Math.random()*18;
 var motion=dot.animate([{opacity:.9,transform:'translate(-50%,-50%) scale(.45)'},{opacity:.8,transform:'translate(calc(-50% + '+dx*.5+'px),calc(-50% + '+dy*.5+'px)) scale(1.7)',offset:.28},{opacity:.7,transform:'translate(calc(-50% + '+dx*.7+'px),calc(-50% + '+dy*.7+'px)) scale(.95)',offset:.48},{opacity:.55,transform:'translate(calc(-50% + '+dx*.85+'px),calc(-50% + '+dy*.85+'px)) scale(1.35)',offset:.68},{opacity:0,transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px)) scale(1.65)'}],{duration:480,easing:'ease-out'});
 motion.onfinish=function(){dot.remove();var i=active.indexOf(dot);if(i>=0)active.splice(i,1);};
}
function begin(x,y,target){drawing=!blocked(target);lastX=x;lastY=y;if(drawing){star(x,y,true);last=performance.now();}}
function move(x,y){if(!drawing||performance.now()-last<75)return;var dx=x-lastX,dy=y-lastY;if(dx*dx+dy*dy<64)return;last=performance.now();lastX=x;lastY=y;star(x,y,true);}
document.addEventListener('touchstart',function(ev){if(ev.touches.length===1)begin(ev.touches[0].clientX,ev.touches[0].clientY,ev.target);else drawing=false;},{passive:true});
document.addEventListener('touchmove',function(ev){if(ev.touches.length===1)move(ev.touches[0].clientX,ev.touches[0].clientY);},{passive:true});
document.addEventListener('touchend',function(){drawing=false;},{passive:true});
document.addEventListener('touchcancel',function(){drawing=false;},{passive:true});
document.addEventListener('pointerdown',function(ev){if(ev.pointerType==='mouse')begin(ev.clientX,ev.clientY,ev.target);},{passive:true});
document.addEventListener('pointermove',function(ev){if(ev.pointerType==='mouse'&&ev.buttons===1)move(ev.clientX,ev.clientY);},{passive:true});
document.addEventListener('pointerup',function(ev){if(ev.pointerType==='mouse')drawing=false;},{passive:true});
})();
