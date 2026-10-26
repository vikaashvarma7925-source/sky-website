/* Control Center-inspired short sheet settle. No replacement scroll engine. */
(function(){'use strict';if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var playing=new WeakMap();function run(el,frames,duration){var old=playing.get(el);if(old)old.cancel();var a=el.animate(frames,{duration:duration,easing:'ease-out'});playing.set(el,a);return a;}
document.addEventListener('click',function(ev){var el=ev.target.closest&&ev.target.closest('button,a,.tool-card,.guide-box,.feature-card');if(!el||el.disabled)return;run(el,[{scale:'1'},{scale:'.975',offset:.18},{scale:'1.018',offset:.52},{scale:'.998',offset:.8},{scale:'1'}],260);},{passive:true});
var dialog=document.getElementById('toolPicker');if(dialog){
new MutationObserver(function(){if(dialog.open)run(dialog,[{opacity:.35,translate:'0 34px',scale:'.965'},{opacity:1,translate:'0 -6px',scale:'1.008',offset:.58},{opacity:1,translate:'0 2px',scale:'.998',offset:.82},{opacity:1,translate:'0 0',scale:'1'}],330);}).observe(dialog,{attributes:true,attributeFilter:['open']});
var realClose=dialog.close.bind(dialog),closing=false;dialog.close=function(){if(!dialog.open||closing)return;closing=true;run(dialog,[{opacity:1,translate:'0 0',scale:'1'},{opacity:1,translate:'0 -3px',scale:'1.005',offset:.22},{opacity:0,translate:'0 24px',scale:'.975'}],150).finished.then(function(){realClose();closing=false;}).catch(function(){realClose();closing=false;});};
}
var nav=document.getElementById('nav');if(nav)new MutationObserver(function(){if(nav.classList.contains('open'))run(nav,[{opacity:.3,translate:'0 -18px'},{opacity:1,translate:'0 4px',offset:.65},{opacity:1,translate:'0 0'}],260);}).observe(nav,{attributes:true,attributeFilter:['class']});
document.querySelectorAll('.tool-card').forEach(function(card){var was=card.classList.contains('tool-open');new MutationObserver(function(){var open=card.classList.contains('tool-open');if(open&&!was){var body=card.querySelector('.tool-body');if(body)run(body,[{opacity:.3,translate:'0 12px'},{opacity:1,translate:'0 -3px',offset:.65},{opacity:1,translate:'0 0'}],260);}was=open;}).observe(card,{attributes:true,attributeFilter:['class']});});
})();
/* Drag only the toolbox header: sheet follows finger and springs back on release.
   List scrolling and the page's swipe engine are not intercepted. */
(function(){'use strict';var d=document.getElementById('toolPicker');if(!d||matchMedia('(prefers-reduced-motion: reduce)').matches)return;var head=d.querySelector('.picker-head'),start=null,y=0,pending=false;
head.addEventListener('touchstart',function(e){if(e.target.closest('button')||e.touches.length!==1)return;start=e.touches[0].clientY;y=0;d.getAnimations().forEach(function(a){a.cancel();});},{passive:true});
head.addEventListener('touchmove',function(e){if(start===null||e.touches.length!==1)return;y=Math.max(-28,Math.min(65,(e.touches[0].clientY-start)*.42));if(!pending){pending=true;requestAnimationFrame(function(){d.style.translate='0 '+y+'px';pending=false;});}},{passive:true});
function release(){if(start===null)return;start=null;var from=y;d.style.translate='';d.animate([{translate:'0 '+from+'px'},{translate:'0 '+(-from*.16)+'px',offset:.58},{translate:'0 '+(from*.045)+'px',offset:.82},{translate:'0 0'}],{duration:330,easing:'ease-out'});}
head.addEventListener('touchend',release,{passive:true});head.addEventListener('touchcancel',release,{passive:true});})();
