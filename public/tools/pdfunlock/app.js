var $=function(i){return document.getElementById(i)},url=null,busy=false,worker=null,timer=null,LIMIT=45000;
function msg(t,err){var s=$('st');s.hidden=false;s.className='msg'+(err?' err':'');s.textContent=t}
function reset(){$('dl').hidden=true;if(url){URL.revokeObjectURL(url);url=null}}
function finish(){busy=false;$('go').disabled=false;$('pw').disabled=false;$('file').disabled=false;$('pw').value='';clearTimeout(timer);if(worker){worker.terminate();worker=null}}
$('file').onchange=function(){reset();$('st').hidden=true;var f=this.files[0];$('fn').textContent=f?f.name:'Choose a PDF file'};
$('pw').oninput=function(){reset();$('st').hidden=true};
var TXT={nopw:'This PDF opens without a password, or the file is damaged, so there is nothing this tool can unlock. (Editing or printing limits are not removed by this tool.)',
 damaged:'This PDF looks damaged or cut short, so it was not unlocked. An unlocked copy could be missing pages or pictures. Try to get a fresh copy of the file.',
 unreadable:'Could not read or unlock this PDF. It may be damaged or use a lock type this tool does not support.',
 wrongpw:'Wrong password.',checkfail:'The unlocked copy did not pass the check, so it was not offered. Try another copy of the file.'};
$('go').onclick=function(){
 if(busy)return;reset();var f=$('file').files[0],pw=$('pw').value;
 if(!f){msg('Choose a PDF file first.',1);return}
 if(f.size>30*1024*1024){msg('File is bigger than 30 MB.',1);return}
 if(!pw){msg('Type the password of this PDF.',1);return}
 busy=true;$('go').disabled=true;$('pw').disabled=true;$('file').disabled=true;msg('Working...');
 f.arrayBuffer().then(function(b){var u=new Uint8Array(b);
  if(String.fromCharCode.apply(null,u.subarray(0,1024)).indexOf('%PDF-')<0){msg('This does not look like a PDF file.',1);finish();return}
  try{worker=new Worker('worker.js')}catch(e){msg('This browser could not start the unlock step.',1);finish();return}
  timer=setTimeout(function(){msg('This is taking too long, so it was stopped. The file may be damaged or too complex. Nothing was changed.',1);finish()},LIMIT);
  worker.onerror=function(){msg('The unlock step failed. The file may be damaged or too complex.',1);finish()};
  worker.onmessage=function(ev){var r=ev.data;
   if(r.code==='ok'){var name=f.name.replace(/\.pdf$/i,'')+'-unlocked.pdf';
    url=URL.createObjectURL(new Blob([r.out],{type:'application/pdf'}));var a=$('dl');a.href=url;a.download=name;a.hidden=false;
    msg('Done. '+r.n+' page'+(r.n===1?'':'s')+' in the unlocked copy. Download it, then open it once to check it before you delete the original.'+(r.rebuilt?' The pages were copied into a new file, so bookmarks, form fields and links may not be kept.':''))}
   else msg(TXT[r.code]||TXT.unreadable,1);
   finish()};
  worker.postMessage({bytes:u,pw:pw},[u.buffer]);
 }).catch(function(){msg('Could not read the file.',1);finish()})
};
