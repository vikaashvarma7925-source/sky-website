var $=function(i){return document.getElementById(i)},MX=6,ME=5;
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function inp(ph,ml,lab){var a=document.createElement('input');a.type='text';a.maxLength=ml;a.className='txt';a.placeholder=ph;a.setAttribute('aria-label',lab);a.addEventListener('input',render);return a}
function ta(ph,lab){var a=document.createElement('textarea');a.maxLength=600;a.placeholder=ph;a.style.minHeight='70px';a.setAttribute('aria-label',lab);a.addEventListener('input',render);return a}
function addBlock(host,max,kind){if(host.children.length>=max)return;var n=host.children.length+1,b=el('div','rs-in');
 if(kind==='x'){b.appendChild(inp('Job title',80,'Experience '+n+' title'));b.appendChild(inp('Company',80,'Experience '+n+' company'));b.appendChild(inp('Period, e.g. 2021-2024',30,'Experience '+n+' period'));b.appendChild(ta('What you did (one point per line)','Experience '+n+' details'))}
 else{b.appendChild(inp('Degree / course',80,'Education '+n+' degree'));b.appendChild(inp('School / college',80,'Education '+n+' institute'));b.appendChild(inp('Year',20,'Education '+n+' year'));b.appendChild(ta('Marks or notes (optional)','Education '+n+' notes'))}
 var x=el('button',null,'Remove');x.type='button';x.onclick=function(){b.remove();render();lim()};b.appendChild(x);host.appendChild(b);lim()}
function lim(){$('addx').disabled=$('ex').children.length>=MX;$('adde').disabled=$('ed').children.length>=ME}
function lines(s,n){return String(s).split(/\r\n|\r|\n/).map(function(x){return x.trim()}).filter(Boolean).slice(0,n)}
var ok=false;
function sec(sh,t){sh.appendChild(el('h2','rs-h',t))}
function render(){var sh=$('sheet'),st=$('st');sh.innerHTML='';var nm=$('nm').value.trim();
 if(!nm){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg err';st.textContent='Type your full name to see the preview.';return}
 var sk=lines($('sk').value,31);if(sk.length>30){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg err';st.textContent='Skills: maximum 30 lines. Remove some.';return}
 var tl=[].some.call($('ex').children,function(b){return lines(b.children[3].value,13).length>12});if(tl){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg err';st.textContent='Work experience: maximum 12 lines for each job. Remove some.';return}
 ok=true;$('pr').disabled=false;st.hidden=true;
 sh.appendChild(el('div','rs-n',nm));var c=[$('ph').value.trim(),$('em').value.trim(),$('ct').value.trim()].filter(Boolean).join('  |  ');if(c)sh.appendChild(el('div','rs-c',c));
 var sm=$('sm').value.trim();if(sm){sec(sh,'Summary');sh.appendChild(el('div','rs-pre',sm))}
 var xs=[].filter.call($('ex').children,function(b){return b.children[0].value.trim()||b.children[1].value.trim()||b.children[3].value.trim()});
 if(xs.length){sec(sh,'Work experience');xs.forEach(function(b){var k=b.children,e=el('div','rs-e'),r=el('div','rs-r');r.appendChild(el('b',null,[k[0].value.trim(),k[1].value.trim()].filter(Boolean).join(', ')));r.appendChild(el('span',null,k[2].value.trim()));e.appendChild(r);
  var ul=el('ul');lines(k[3].value,12).forEach(function(l){ul.appendChild(el('li',null,l))});if(ul.children.length)e.appendChild(ul);sh.appendChild(e)})}
 var es=[].filter.call($('ed').children,function(b){return b.children[0].value.trim()||b.children[1].value.trim()});
 if(es.length){sec(sh,'Education');es.forEach(function(b){var k=b.children,e=el('div','rs-e'),r=el('div','rs-r');r.appendChild(el('b',null,[k[0].value.trim(),k[1].value.trim()].filter(Boolean).join(', ')));r.appendChild(el('span',null,k[2].value.trim()));e.appendChild(r);if(k[3].value.trim())e.appendChild(el('div','rs-pre',k[3].value.trim()));sh.appendChild(e)})}
 if(sk.length){sec(sh,'Skills');sh.appendChild(el('div','rs-sk',sk.join('  \u2022  ')))}
 var lg=$('lg').value.trim();if(lg){sec(sh,'Languages');sh.appendChild(el('div','rs-lg',lg))}}
$('addx').onclick=function(){addBlock($('ex'),MX,'x');render()};$('adde').onclick=function(){addBlock($('ed'),ME,'e');render()};
$('pr').onclick=function(){if(ok)window.print()};
['nm','ph','em','ct','sm','sk','lg'].forEach(function(i){$(i).addEventListener('input',render)});
addBlock($('ex'),MX,'x');addBlock($('ed'),ME,'e');render();
