var $=function(i){return document.getElementById(i)};
function upd(){$('mk').disabled=!$('t').value.trim()}$('t').addEventListener('input',upd);upd();
$('mk').onclick=function(){var lines=$('t').value.split(/\r\n|\r|\n/).map(function(s){return s.trim()}).filter(Boolean),L=$('lay').value.split('x'),c=Number(L[0]),r=Number(L[1]),total=c*r,sh=$('sheet');
sh.innerHTML='';sh.style.setProperty('--c',c);sh.style.setProperty('--r',r);
var items=[],note='';
if(lines.length===1&&$('rep').checked){for(var i=0;i<total;i++)items.push(lines[0])}
else{items=lines.slice(0,total);if(lines.length>total)note=' Only the first '+total+' lines fit on one sheet; '+(lines.length-total)+' lines were left out.'}
items.forEach(function(x){var d=document.createElement('div');d.className='lb-cell';var s=document.createElement('span');s.textContent=x;d.appendChild(s);sh.appendChild(d)});
for(var j=items.length;j<total;j++){var e=document.createElement('div');e.className='lb-cell lb-empty';sh.appendChild(e)}
$('pr').disabled=false;$('st').hidden=false;$('st').className='msg';$('st').textContent='Sheet ready: '+items.length+' labels on a '+c+' x '+r+' grid.'+note+' Check the preview, then print.'};
$('pr').onclick=function(){window.print()};
