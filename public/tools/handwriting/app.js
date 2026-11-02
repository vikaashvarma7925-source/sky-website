var $=function(i){return document.getElementById(i)};
function upd(){$('mk').disabled=!$('t').value.trim()}
$('t').addEventListener('input',upd);upd();
$('mk').onclick=function(){var w=$('t').value.trim(),n=Number($('rows').value),rep=Number($('rep').value),sz=Number($('sz').value),sh=$('sheet');
var per=Math.floor(960/(sz*2)),cut=n>per;if(cut)n=per;sh.innerHTML='';sh.style.setProperty('--sz',sz+'px');
for(var i=0;i<n;i++){var r=document.createElement('div');r.className='hw-row';var g=document.createElement('div');g.className='hw-trace';
 for(var k=0;k<rep;k++){var sp=document.createElement('span');sp.textContent=w;g.appendChild(sp)}r.appendChild(g);sh.appendChild(r)}
var shown=0;if(rep){var sps=sh.querySelector('.hw-trace').children;for(var j=0;j<sps.length;j++)if(sps[j].offsetTop<5)shown++}var note=(rep&&shown<rep)?' Only '+shown+' of '+rep+' light copies fit on this screen width; the printed A4 page may fit more or fewer.':'';$('pr').disabled=false;$('st').hidden=false;$('st').className='msg';$('st').textContent='Sheet ready: '+n+' lines'+(cut?' (limited so it fits one A4 page at this letter size)':'')+'.'+note+' Check the preview, then print.'};
$('pr').onclick=function(){window.print()};
