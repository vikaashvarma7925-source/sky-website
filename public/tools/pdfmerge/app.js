var $=function(i){return document.getElementById(i)},MAXN=20,MAXB=30*1024*1024,MAXT=60*1024*1024,LIMIT=60000;
var files=[],url=null,busy=false,worker=null,timer=null;
function msg(t,err){var s=$('st');s.hidden=false;s.className='msg'+(err?' err':'');s.textContent=t}
function reset(){$('dl').hidden=true;if(url){URL.revokeObjectURL(url);url=null}}
function finish(){busy=false;clearTimeout(timer);if(worker){worker.terminate();worker=null}drawList()}
function total(){return files.reduce(function(a,f){return a+f.size},0)}
function drawList(){var l=$('list');l.innerHTML='';
 files.forEach(function(f,i){var r=document.createElement('div');r.className='ip-row';var n=document.createElement('span');n.textContent=(i+1)+'. '+f.name;r.appendChild(n);
  [['Up',-1],['Down',1]].forEach(function(a){var b=document.createElement('button');b.type='button';b.textContent=a[0];b.setAttribute('aria-label',a[0]+' '+f.name);b.disabled=busy||(a[1]<0?i===0:i===files.length-1);b.onclick=function(){var j=i+a[1],t=files[i];files[i]=files[j];files[j]=t;reset();drawList()};r.appendChild(b)});
  var x=document.createElement('button');x.type='button';x.textContent='Remove';x.setAttribute('aria-label','Remove '+f.name);x.disabled=busy;x.onclick=function(){files.splice(i,1);reset();drawList()};r.appendChild(x);l.appendChild(r)});
 $('go').disabled=busy||files.length<2;$('file').disabled=busy}
$('file').onchange=function(){reset();$('st').hidden=true;var add=[].slice.call(this.files),bad=[];
 add.forEach(function(f){if(!/\.pdf$/i.test(f.name)&&f.type!=='application/pdf')bad.push(f.name+' (not a PDF)');else if(f.size>MAXB)bad.push(f.name+' (bigger than 30 MB)');else if(files.length>=MAXN)bad.push(f.name+' (limit 20 files)');else if(total()+f.size>MAXT)bad.push(f.name+' (60 MB total limit)');else files.push(f)});
 this.value='';drawList();if(bad.length)msg('Not added: '+bad.join('; ')+'.',1);else if(files.length<2)msg('Add at least 2 PDF files to merge.')};
var ERR={locked:function(r){return r.name+' has a password. Unlock it first with PDF unlock.'},damaged:function(r){return r.name+' looks damaged or cut short. Get a fresh copy of it.'},unreadable:function(r){return 'Could not read '+r.name+'. It may be damaged.'},empty:function(r){return r.name+' has no pages.'},
 pages:function(){return 'The merged file would have more than 500 pages. Merge fewer files.'},checkfail:function(){return 'The merged file did not pass the check, so it was not offered. Try again.'},fail:function(){return 'Could not merge these files.'}};
$('go').onclick=function(){if(busy||files.length<2)return;reset();busy=true;drawList();msg('Reading files...');
 Promise.all(files.map(function(f){return f.arrayBuffer()})).then(function(bufs){
  var head=bufs.map(function(b){return String.fromCharCode.apply(null,new Uint8Array(b,0,Math.min(1024,b.byteLength)))});
  for(var i=0;i<head.length;i++)if(head[i].indexOf('%PDF-')<0)throw new Error(files[i].name+' does not look like a PDF file.');
  try{worker=new Worker('worker.js')}catch(e){throw new Error('This browser could not start the merge step.')}
  msg('Merging...');
  timer=setTimeout(function(){msg('This is taking too long, so it was stopped. Try fewer or smaller files.',1);finish()},LIMIT);
  worker.onerror=function(){msg('The merge step failed. The files may be damaged or too complex.',1);finish()};
  worker.onmessage=function(ev){var r=ev.data;
   if(r.code==='ok'){url=URL.createObjectURL(new Blob([r.out],{type:'application/pdf'}));var a=$('dl');a.href=url;a.download='merged.pdf';a.hidden=false;msg('Done. '+r.files+' files, '+r.n+' page'+(r.n===1?'':'s')+' in total. Download it, then open it once and check every page.')}
   else msg((ERR[r.code]||ERR.fail)(r),1);finish()};
  worker.postMessage({bufs:bufs,names:files.map(function(f){return f.name})},bufs);
 }).catch(function(e){msg(e&&e.message?e.message:'Something went wrong.',1);finish()})};
drawList();
