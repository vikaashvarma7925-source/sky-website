var $=function(i){return document.getElementById(i)},LIMIT=60000;
var mfiles=[],obuf=null,oents=[],url=null,busy=false,worker=null,timer=null;
function msg(t,err){var s=$('st');s.hidden=false;s.className='msg'+(err?' err':'');s.textContent=t}
function reset(){$('dl').hidden=true;if(url){URL.revokeObjectURL(url);url=null}}
function finish(){busy=false;clearTimeout(timer);if(worker){worker.terminate();worker=null}draw()}
function arm(){clearTimeout(timer);timer=setTimeout(function(){msg('This is taking too long, so it was stopped. The ZIP may be damaged or too complex.',1);finish()},LIMIT)}
var ERR={notzip:'This does not look like a ZIP file.',zip64:'This ZIP is too big or uses a format this tool does not support.',multidisk:'Split ZIP files are not supported.',manyentries:'This ZIP has more than 500 files. This tool does not open it.',damaged:'This ZIP looks damaged or cut short, so it was not opened.',encrypted:'This ZIP has a password. ZIPs with a password are not supported here.',overlap:'This ZIP is built in an unusual way that can hide very large files, so it was not opened.',totalbig:'The files in this ZIP are too big in total (limit 300 MB when opening, 100 MB when making).',mismatch:'This file did not match the size or checksum stored in the ZIP, so it was not offered. The ZIP may be damaged.',refused:'This item cannot be taken out by this tool.',checkfail:'The ZIP did not pass the check, so it was not offered. Try again.',fail:'Something went wrong. The file may be damaged or too complex.',nosupport:'This browser could not start the ZIP step.'};
function btn(t,lab,fn,dis){var b=document.createElement('button');b.type='button';b.textContent=t;b.setAttribute('aria-label',lab);b.disabled=!!dis;b.onclick=fn;return b}
function draw(){var l=$('mlist');l.innerHTML='';
 mfiles.forEach(function(f,i){var r=document.createElement('div');r.className='ip-row';var n=document.createElement('span');n.textContent=(i+1)+'. '+f.name;r.appendChild(n);
  r.appendChild(btn('Remove','Remove '+f.name,function(){mfiles.splice(i,1);reset();draw()},busy));l.appendChild(r)});
 $('mgo').disabled=busy||!mfiles.length;$('mfile').disabled=busy;$('ofile').disabled=busy;
 var o=$('olist');o.innerHTML='';
 oents.forEach(function(en){if(en.isdir)return;var r=document.createElement('div');r.className='ip-row';var n=document.createElement('span');
  var sz=en.us>=1048576?(en.us/1048576).toFixed(1)+' MB':Math.ceil(en.us/1024)+' KB';
  n.textContent=en.name+' ('+sz+')'+(en.unsafe?' - unsafe path, will be saved as just "'+en.save+'"':'')+(en.link?' - link, not supported':'')+(en.special?' - special item, not supported':'')+(en.unsupported?' - compression not supported':'')+(en.toobig?' - too big (over 100 MB)':'');r.appendChild(n);
  var ok=!(en.link||en.special||en.unsupported||en.toobig);
  r.appendChild(btn('Get file','Get '+en.name,function(){get(en)},busy||!ok));o.appendChild(r)})}
function run(msgs,after){if(busy)return;reset();busy=true;draw();
 try{worker=new Worker('worker.js')}catch(e){msg(ERR.nosupport,1);finish();return}
 arm();worker.onerror=function(){msg(ERR.fail,1);finish()};worker.onmessage=function(ev){var r=ev.data;if(r.code&&ERR[r.code]){msg(ERR[r.code],1);finish();return}after(r)};
 worker.postMessage(msgs.m,msgs.t||[])}
function link(buf,name,type,text){url=URL.createObjectURL(new Blob([buf],{type:type}));var a=$('dl');a.href=url;a.download=name;a.textContent='Download '+name;a.hidden=false;msg(text)}
$('mfile').onchange=function(){reset();$('st').hidden=true;var bad=[],t=mfiles.reduce(function(a,f){return a+f.size},0);
 [].slice.call(this.files).forEach(function(f){if(f.size>30*1048576)bad.push(f.name+' (bigger than 30 MB)');else if(mfiles.length>=50)bad.push(f.name+' (limit 50 files)');else if(t+f.size>100*1048576)bad.push(f.name+' (100 MB total limit)');else{mfiles.push(f);t+=f.size}});
 this.value='';draw();if(bad.length)msg('Not added: '+bad.join('; ')+'.',1)};
$('mgo').onclick=function(){if(!mfiles.length)return;msg('Making ZIP...');run({m:{op:'make',files:mfiles.slice()}},function(r){
 if(r.code==='madeok'){link(r.out,'files.zip','application/zip','Done. '+r.n+' file'+(r.n===1?'':'s')+' in the ZIP, checked. Download it, then open it once to check.')}else msg(ERR.fail,1);finish()})};
$('ofile').onchange=function(){reset();$('st').hidden=true;oents=[];obuf=null;var f=this.files[0];this.value='';if(!f){draw();return}
 if(f.size>100*1048576){msg('File is bigger than 100 MB.',1);draw();return}
 f.arrayBuffer().then(function(ab){obuf=ab;msg('Reading ZIP...');run({m:{op:'list',bytes:ab.slice(0)}},function(r){
  if(r.code==='listok'){oents=r.ents;var n=oents.filter(function(e){return!e.isdir}).length;msg(n?n+' file'+(n===1?'':'s')+' inside. Press Get file for the ones you need.':'This ZIP has no files inside.',!n)}else{msg(ERR.fail,1)}finish()})},function(){msg('Could not read the file.',1)})};
function get(en){if(!obuf)return;msg('Checking '+en.name+'...');run({m:{op:'get',bytes:obuf.slice(0),i:en.i,save:en.save}},function(r){
 if(r.code==='getok'){link(r.out,r.name,'application/octet-stream','Checked against the ZIP size and checksum. Press Download to save '+r.name+'.')}else msg(ERR.fail,1);finish()})}
draw();
