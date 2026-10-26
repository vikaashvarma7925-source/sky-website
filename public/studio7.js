/* SKY OCR — Tesseract.js 7.0.0 (Apache-2.0). Engine/worker/wasm/lang load ONLY after explicit Start tap. Photo stays local. */
(function(){
'use strict';
if(document.body.getAttribute('data-tool')!=='ocr')return;
function $(id){return document.getElementById(id);}
var st=$('ocStatus'),img=null,worker=null,busy=false;
function say(msg,cls){st.textContent=msg;st.className='status'+(cls?' '+cls:'');}
function show(id){$(id).classList.remove('file-hidden');}
function hide(id){$(id).classList.add('file-hidden');}
$('ocFile').onchange=function(){var f=this.files[0];if(!f)return;
  if(!/^image\//.test(f.type)){say('That file is not an image','err');return;}
  var url=URL.createObjectURL(f);var im=new Image();
  im.onload=function(){img=im;var c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext('2d').drawImage(im,0,0);img.__cv=c;show('ocControls');hide('ocOut');hide('ocCopy');hide('ocDl');say('Photo ready ✓ '+im.naturalWidth+' × '+im.naturalHeight+' px — choose language and tap Start OCR','ok');};
  im.onerror=function(){say('Could not read that image','err');};im.src=url;};
$('ocCancel').onclick=function(){if(worker){say('Cancelling…','');worker.terminate().then(function(){worker=null;busy=false;hide('ocCancel');hide('ocProgRow');say('Cancelled. Tap Start OCR to try again.','err');});}};
$('ocGo').onclick=function(){
  if(!img){say('Choose a photo first','err');return;}
  if(busy){say('Already running — tap Cancel to stop','err');return;}
  busy=true;
  var lang=$('ocLang').value;
  var firstUse=!localStorage.getItem('sky-ocr-used');
  show('ocProgRow');show('ocCancel');hide('ocOut');hide('ocCopy');hide('ocDl');
  $('ocProg').value=0;$('ocProgOut').textContent='0%';
  say((firstUse?'First use: downloading OCR files (about '+(lang==='eng'?'6':lang==='hin'?'5':'7')+' MB), one time only. ':'')+'Starting…','');
  function loadScript(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=function(){rej(new Error('engine load failed'));};document.head.appendChild(s);});}
  (window.Tesseract?Promise.resolve():loadScript('vendor/tesseract.min.js'))
  .then(function(){
    return Tesseract.createWorker(lang,1,{
      logger:function(m){
        if(m.status==='recognizing text'){var p=Math.round(m.progress*100);$('ocProg').value=p;$('ocProgOut').textContent=p+'%';say('Reading text… '+p+'%','');}
        else if(m.status){say(m.status+'…','');}
      }
    });
  })
  .then(function(w){worker=w;return worker.recognize(img.__cv||img);})
  .then(function(res){
    var text=(res&&res.data&&res.data.text||'').trim();
    return worker.terminate().then(function(){
      worker=null;busy=false;hide('ocCancel');
      localStorage.setItem('sky-ocr-used','1');
      if(!text){say('No printed text found. Try a sharper, straighter photo.','err');hide('ocProgRow');return;}
      $('ocOut').value=text;show('ocOut');show('ocCopy');show('ocDl');
      say('Done ✓ found '+text.split(/\s+/).filter(Boolean).length+' words','ok');
    });
  })
  .catch(function(e){
    if(worker){worker.terminate();worker=null;}
    busy=false;hide('ocCancel');
    say('OCR failed'+(navigator.onLine===false?' — you seem offline, and first use needs a one-time download':'')+'. Please try again.','err');
  });
};
$('ocCopy').onclick=function(){var t=$('ocOut').value;if(!t){say('Nothing to copy','err');return;}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){say('Copied ✓','ok');},function(){say('Copy failed — select the text manually','err');});}
  else{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');say('Copied ✓','ok');}catch(e){say('Copy failed — select the text manually','err');}ta.remove();}};
$('ocDl').onclick=function(){var t=$('ocOut').value;if(!t){say('Nothing to download','err');return;}
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/plain'}));a.download='sky-text.txt';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);};
})();
