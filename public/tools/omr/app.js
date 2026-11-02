var $=function(i){return document.getElementById(i)};
$('mk').onclick=function(){var n=Number($('q').value),o=Number($('o').value),sh=$('sheet');sh.innerHTML='';
var t=$('title').value.trim();
if(t||$('hd').checked){var h=document.createElement('div');h.className='omr-head';
 if(t){var e=document.createElement('div');e.className='omr-title';e.textContent=t;h.appendChild(e)}
 if($('hd').checked){['Name','Roll no.','Date'].forEach(function(l){var f=document.createElement('div');f.className='omr-field';f.textContent=l+':';h.appendChild(f)})}
 sh.appendChild(h)}
var per=25,cols=Math.ceil(n/per),grid=document.createElement('div');grid.className='omr-grid';grid.style.setProperty('--cols',cols);
for(var c=0;c<cols;c++){var col=document.createElement('div');col.className='omr-col';
 for(var i=c*per+1;i<=Math.min(n,(c+1)*per);i++){var r=document.createElement('div');r.className='omr-q';var num=document.createElement('span');num.className='omr-n';num.textContent=i;r.appendChild(num);
  for(var k=0;k<o;k++){var b=document.createElement('span');b.className='omr-b';b.textContent=String.fromCharCode(65+k);r.appendChild(b)}
  col.appendChild(r)}
 grid.appendChild(col)}
sh.appendChild(grid);$('pr').disabled=false;$('st').hidden=false;$('st').className='msg';$('st').textContent='Sheet ready: '+n+' questions, '+o+' options. Check the preview, then print.'};
$('pr').onclick=function(){window.print()};
