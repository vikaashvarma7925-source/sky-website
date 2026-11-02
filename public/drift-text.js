/* Scroll-scrubbed horizontal drift for three short headline words.
   Words stay fully on screen: each shifts only a few vw, alternating direction.
   Transform-only; one rAF per scroll frame; skipped offscreen, hidden, reduced motion. */
(()=>{'use strict';const section=document.querySelector('.sky-drift');if(!section)return;
const a=section.querySelector('.drift-line-a'),b=section.querySelector('.drift-line-b'),c=section.querySelector('.drift-line-c'),marquee=section.querySelector('.drift-marquee'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
let raf=0;const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
function draw(){raf=0;if(document.hidden||reduce.matches)return;const r=section.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
const p=clamp((innerHeight-r.top)/(innerHeight+r.height),0,1);
a.style.transform='translate3d('+(-6+p*12)+'vw,0,0)';
b.style.transform='translate3d('+(6-p*12)+'vw,0,0)';
if(c)c.style.transform='translate3d('+(-4+p*8)+'vw,0,0)';}
function clear(){a.style.transform='';b.style.transform='';if(c)c.style.transform='';}
function queue(){if(!raf&&!reduce.matches&&!document.hidden)raf=requestAnimationFrame(draw);}
addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else queue();});
reduce.addEventListener('change',()=>{if(reduce.matches)clear();else queue();});
if('IntersectionObserver' in window&&marquee)new IntersectionObserver(rows=>{for(const row of rows)marquee.classList.toggle('is-off',!row.isIntersecting);},{threshold:0}).observe(marquee);
queue();})();
