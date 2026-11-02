var $=function(i){return document.getElementById(i)},MAXB=30*1024*1024,LIMIT=90000;
var buf=null,pages=0,fname='',urls=[],busy=false,worker=null,timer=null;
function msg(t,err){var s=$('st');s.hidden=false;s.className='msg'+(err?' err':'');s.textContent=t}
function info(t,err){var s=$('fi');s.hidden=!t;s.className='msg'+(err?' err':'');s.textContent=t||''}
function clearOut(){urls.forEach(function(u){URL.revokeObjectURL(u)});urls=[];$('out').innerHTML='';$('st').hidden=true}
function baseName(){var b=fname.replace(/\.pdf$/i,'').replace(/[^A-Za-z0-9._-]+/g,'_').replace(/^[._-]+|[._-]+$/g,'').slice(0,40);return b||'file'}
function addLink(bytes,name,label){var u=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));urls.push(u);var p=document.createElement('p');p.className='pt-o';var a=document.createElement('a');a.className='dl';a.href=u;a.download=name;a.textContent=label;p.appendChild(a);$('out').appendChild(p)}
function setBusy(b){busy=b;$('go').disabled=b||!buf;$('file').disabled=b;$('rg').disabled=b;document.querySelectorAll('input[name=md]').forEach(function(r){r.disabled=b})}
function stop(){clearTimeout(timer);if(worker){worker.terminate();worker=null}setBusy(false)}
var ERR={locked:'This PDF has a password. Unlock it first with PDF unlock.',damaged:'This PDF looks damaged or cut short. Get a fresh copy of it.',unreadable:'Could not read this PDF. It may be damaged.',empty:'This PDF has no pages.',pages:'This PDF has more than 500 pages. It is too big for this tool.',checkfail:'The new file did not pass the check, so it was not offered. Try again.',fail:'Could not finish. The file may be damaged or too complex.'};
function ask(m,tr,cb,ecb){try{worker=new Worker('worker.js')}catch(e){(ecb||function(t){msg(t,1)})('This browser could not start the PDF step.');setBusy(false);return}
 var E=ecb||function(t){msg(t,1)};
 timer=setTimeout(function(){E('This is taking too long, so it was stopped. Try a smaller file.');stop()},LIMIT);
 worker.onerror=function(){E('The PDF step failed. The file may be damaged or too complex.');stop()};
 worker.onmessage=function(ev){var r=ev.data;if(r.code==='info'||r.code==='ok'){cb(r)}else{E(r.code==='bad'?r.msg:(ERR[r.code]||ERR.fail))}stop()};
 worker.postMessage(m,tr)}
$('file').onchange=function(){var f=this.files[0];this.value='';if(!f)return;clearOut();info('');buf=null;pages=0;$('go').disabled=true;onReset();
 if(!/\.pdf$/i.test(f.name)&&f.type!=='application/pdf'){info('This is not a PDF file.',1);return}
 if(f.size>MAXB){info('This file is bigger than 30 MB.',1);return}
 if(f.size<8){info('This file is empty.',1);return}
 f.arrayBuffer().then(function(b){var h=String.fromCharCode.apply(null,new Uint8Array(b,0,Math.min(1024,b.byteLength)));if(h.indexOf('%PDF-')<0){info('This does not look like a PDF file.',1);return}
  fname=f.name;$('fn').textContent=f.name;setBusy(true);info('Reading the file...');
  ask({op:'info',bytes:b.slice(0)},[],function(r){buf=b;pages=r.n;info(f.name+' - '+pages+' page'+(pages===1?'':'s')+'.');setBusy(false);onLoaded()},function(t){fname='';$('fn').textContent='Choose a PDF file';info(t,1)})
 },function(){info('Could not read this file.',1)})};
function parseRanges(s,n,allowDup){s=s.trim();if(!s)return {err:'Type the pages, for example 1-3, 5.'};var parts=s.split(','),out=[],seen={};
 for(var i=0;i<parts.length;i++){var t=parts[i].trim();var m=/^(\d+)(?:\s*-\s*(\d+))?$/.exec(t);if(!m)return {err:'"'+t+'" is not a page or a range. Use numbers like 1-3, 5.'};
  var a=parseInt(m[1],10),b=m[2]?parseInt(m[2],10):a;if(a<1||b<1||a>n||b>n)return {err:'Page '+(a>n||a<1?a:b)+' does not exist. This file has '+n+' page'+(n===1?'':'s')+'.'};if(b<a)return {err:'"'+t+'" goes backwards. Write it as '+b+'-'+a+'.'};out.push([a,b])}
 return {ranges:out}}
function expand(r){var o=[];r.forEach(function(x){for(var p=x[0];p<=x[1];p++)o.push(p-1)});return o}
var MAXF=30;
function md(){return document.querySelector('input[name=md]:checked').value}
function layout(){var m=md();$('rg').hidden=$('rgl').hidden=(m==='each');$('rgl').textContent=m==='one'?'Pages to keep (for example 1-3, 5, 8-10)':'Parts, separated by commas (for example 1-3, 4-6, 7). Each part becomes one file.';
 $('rh').textContent=m==='each'?(pages>MAXF?'This file has '+pages+' pages. This option works up to '+MAXF+' pages, so use "One file for each part" instead.':''):(pages?'This file has '+pages+' page'+(pages===1?'':'s')+'. A part like 4-6 means pages 4 to 6. Pages are used in the order you type them.':'')}
function onLoaded(){layout();$('go').disabled=false}
function onReset(){layout()}
document.querySelectorAll('input[name=md]').forEach(function(r){r.onchange=function(){clearOut();layout()}});
$('rg').addEventListener('input',clearOut);
$('go').onclick=function(){if(busy||!buf)return;clearOut();var m=md(),jobs=[];
 if(m==='each'){if(pages>MAXF){msg('This file has '+pages+' pages. This option works up to '+MAXF+' pages. Use "One file for each part" instead.',1);return}for(var i=0;i<pages;i++)jobs.push([i])}
 else{var r=parseRanges($('rg').value,pages);if(r.err){msg(r.err,1);return}
  if(m==='one'){jobs.push(expand(r.ranges))}else{if(r.ranges.length>MAXF){msg('Too many parts. The most is '+MAXF+' files at one time.',1);return}r.ranges.forEach(function(x){jobs.push(expand([x]))})}}
 if(jobs.length>MAXF){msg('Too many files. The most is '+MAXF+' at one time.',1);return}
 setBusy(true);msg('Working...');var b=baseName();
 ask({op:'run',bytes:buf.slice(0),jobs:jobs},[],function(r){
  r.files.forEach(function(f,i){var j=jobs[i],lab=j.length===1?'page '+(j[0]+1):'pages '+(j[0]+1)+'-'+(j[j.length-1]+1);var contiguous=j.every(function(p,k){return k===0||p===j[k-1]+1});if(!contiguous&&j.length>1)lab='as you typed';
   var nm=m==='one'?b+'-pages.pdf':(m==='each'?b+'-page-'+(j[0]+1)+'.pdf':b+'-part-'+(i+1)+'.pdf');addLink(f.out,nm,'Download '+nm+' ('+(j.length>1&&lab==='as you typed'?j.length+' pages, as you typed':lab)+')')});
  msg('Done. '+r.files.length+' file'+(r.files.length===1?'':'s')+' made. Download '+(r.files.length===1?'it':'them')+', then open and check the pages.')})};
layout();