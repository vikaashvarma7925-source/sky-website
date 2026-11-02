var $=function(i){return document.getElementById(i)},MAXN=30,MAXB=15*1024*1024,MAXSIDE=3508,MAXPX=60e6,LIMIT=30000;
var files=[],url=null,busy=false,worker=null,timer=null;
function msg(t,err){var s=$('st');s.hidden=false;s.className='msg'+(err?' err':'');s.textContent=t}
function reset(){$('dl').hidden=true;if(url){URL.revokeObjectURL(url);url=null}}
function finish(){busy=false;$('pg').disabled=false;clearTimeout(timer);if(worker){worker.terminate();worker=null}drawList()}
function drawList(){var l=$('list');l.innerHTML='';
 files.forEach(function(f,i){var r=document.createElement('div');r.className='ip-row';var n=document.createElement('span');n.textContent=(i+1)+'. '+f.name;r.appendChild(n);
  [['Up',-1],['Down',1]].forEach(function(a){var b=document.createElement('button');b.type='button';b.textContent=a[0];b.setAttribute('aria-label',a[0]+' '+f.name);b.disabled=busy||(a[1]<0?i===0:i===files.length-1);b.onclick=function(){var j=i+a[1],t=files[i];files[i]=files[j];files[j]=t;reset();drawList()};r.appendChild(b)});
  var x=document.createElement('button');x.type='button';x.textContent='Remove';x.setAttribute('aria-label','Remove '+f.name);x.disabled=busy;x.onclick=function(){files.splice(i,1);reset();drawList()};r.appendChild(x);l.appendChild(r)});
 $('go').disabled=busy||!files.length;$('file').disabled=busy}
$('file').onchange=function(){reset();$('st').hidden=true;var add=[].slice.call(this.files),bad=[];
 add.forEach(function(f){if(!/^image\/(jpeg|png|webp)$/.test(f.type))bad.push(f.name+' (not JPG, PNG or WebP)');else if(f.size>MAXB)bad.push(f.name+' (bigger than 15 MB)');else if(files.length>=MAXN)bad.push(f.name+' (limit 30 photos)');else files.push(f)});
 this.value='';drawList();if(bad.length)msg('Not added: '+bad.join('; ')+'.',1)};
var ERR={nosupport:function(){return 'This browser cannot prepare photos safely. Try a current Chrome, Edge, Firefox or Safari.'},nosize:function(r){return 'Could not read the size of '+r.name+'. It may be damaged or not a real photo.'},toobig:function(r){return r.name+' is too large (over 60 megapixels). Make it smaller first.'},unreadable:function(r){return 'Could not read '+r.name+'. It may be damaged.'},checkfail:function(){return 'The PDF did not pass the check, so it was not offered. Try again with fewer photos.'},fail:function(){return 'Could not make the PDF. Try fewer or smaller photos.'}};
function arm(txt){clearTimeout(timer);timer=setTimeout(function(){msg('This is taking too long, so it was stopped. '+txt+' Try fewer or smaller photos.',1);finish()},LIMIT)}
$('pg').onchange=function(){reset()};
$('go').onclick=function(){if(busy||!files.length)return;reset();busy=true;$('pg').disabled=true;drawList();msg('Working...');
 try{worker=new Worker('worker.js')}catch(e){msg('This browser could not start the PDF step.',1);finish();return}
 arm('');worker.onerror=function(){msg('The PDF step failed. Try fewer or smaller photos.',1);finish()};
 worker.onmessage=function(ev){var r=ev.data;
  if(r.code==='progress'){msg('Preparing photo '+r.i+' of '+r.n+'...');arm('One photo took too long.');return}
  if(r.code==='making'){msg('Making PDF...');arm('');return}
  if(r.code==='ok'){url=URL.createObjectURL(new Blob([r.out],{type:'application/pdf'}));var a=$('dl');a.href=url;a.download='photos.pdf';a.hidden=false;msg('Done. '+r.n+' page'+(r.n===1?'':'s')+'. Download it, then open it once and check every page.')}
  else msg((ERR[r.code]||ERR.fail)(r),1);finish()};
 worker.postMessage({files:files.slice(),mode:$('pg').value})};
drawList();
