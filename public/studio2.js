/* SKY Studio tools batch 2 — all device-only, no libraries */
(function(){
'use strict';
var tool=document.body.getAttribute('data-tool');
function $(id){return document.getElementById(id);}
function say(el,msg,cls){el.textContent=msg;el.className='status'+(cls?' '+cls:'');}
function dl(name,blob){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);}
function copyText(t,el){function ok(){say(el,'Copied ✓','ok');}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(ok,function(){say(el,'Copy failed — select the text and copy manually','err');});}else{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok();}catch(e){say(el,'Copy failed — select the text and copy manually','err');}ta.remove();}}

if(tool==='jsonfmt'){
  var inp=$('jfIn'),out=$('jfOut'),st=$('jfStatus');
  function run(mode){var raw=inp.value.trim();if(!raw){say(st,'Paste some JSON first','err');return;}
    try{var v=JSON.parse(raw);out.value=mode==='min'?JSON.stringify(v):JSON.stringify(v,null,2);say(st,'Valid JSON ✓ '+(mode==='min'?'minified':'formatted'),'ok');}
    catch(e){out.value='';say(st,'Invalid JSON: '+e.message,'err');}}
  $('jfFormat').onclick=function(){run('fmt');};
  $('jfMinify').onclick=function(){run('min');};
  $('jfClear').onclick=function(){inp.value='';out.value='';say(st,'','');};
  $('jfCopy').onclick=function(){if(out.value)copyText(out.value,st);else say(st,'Nothing to copy yet','err');};
  $('jfDl').onclick=function(){if(!out.value){say(st,'Format or minify first','err');return;}dl('sky-formatted.json',new Blob([out.value],{type:'application/json'}));say(st,'Downloaded ✓','ok');};
}

if(tool==='jsoncsv'){
  var inp=$('jcIn'),out=$('jcOut'),st=$('jcStatus');
  function esc(v){if(v===null||v===undefined)return '';var isStr=typeof v==='string';if(typeof v==='object')v=JSON.stringify(v);v=String(v);if(isStr&&/^[=+\-@\t\r]/.test(v))v="'"+v;return /[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
  $('jcGo').onclick=function(){var raw=inp.value.trim();if(!raw){say(st,'Paste a JSON list first','err');return;}
    var data;try{data=JSON.parse(raw);}catch(e){say(st,'Invalid JSON: '+e.message,'err');return;}
    if(!Array.isArray(data)){say(st,'Needs a JSON list, e.g. [{"a":1},{"a":2}]','err');return;}
    if(!data.length){say(st,'The list is empty','err');return;}
    var keys=[],i,k;for(i=0;i<data.length;i++){if(typeof data[i]==='object'&&data[i]!==null){for(k in data[i]){if(keys.indexOf(k)<0)keys.push(k);}}}
    if(!keys.length){say(st,'No object fields found in the list','err');return;}
    var lines=[keys.map(esc).join(',')];
    for(i=0;i<data.length;i++){lines.push(keys.map(function(k){return esc(data[i]?data[i][k]:'');}).join(','));}
    out.value=lines.join('\r\n');say(st,'Converted ✓ '+data.length+' rows, '+keys.length+' columns','ok');};
  $('jcClear').onclick=function(){inp.value='';out.value='';say(st,'','');};
  $('jcCopy').onclick=function(){if(out.value)copyText(out.value,st);else say(st,'Nothing to copy yet','err');};
  $('jcDl').onclick=function(){if(!out.value){say(st,'Convert first','err');return;}dl('sky-data.csv',new Blob([out.value],{type:'text/csv'}));say(st,'Downloaded ✓','ok');};
}

if(tool==='resize'){
  var file=$('rsFile'),st=$('rsStatus'),ctrl=$('rsControls'),img=new Image(),orig={w:0,h:0},blobUrl=null;
  file.onchange=function(){var f=file.files[0];if(!f)return;if(!/^image\//.test(f.type)){say(st,'That file is not an image','err');return;}
    if(blobUrl)URL.revokeObjectURL(blobUrl);blobUrl=URL.createObjectURL(f);
    img.onload=function(){orig.w=img.naturalWidth;orig.h=img.naturalHeight;$('rsW').value=orig.w;$('rsH').value=orig.h;ctrl.classList.remove('file-hidden');$('rsDl').classList.add('file-hidden');$('rsImg').classList.add('file-hidden');say(st,'Loaded ✓ '+orig.w+' × '+orig.h+' px','ok');};
    img.onerror=function(){say(st,'Could not read that image','err');};img.src=blobUrl;};
  var lock=$('rsLock');
  $('rsW').oninput=function(){if(lock.checked&&orig.w){$('rsH').value=Math.max(1,Math.round($('rsW').value*orig.h/orig.w));}};
  $('rsH').oninput=function(){if(lock.checked&&orig.h){$('rsW').value=Math.max(1,Math.round($('rsH').value*orig.w/orig.h));}};
  var outBlob=null;
  $('rsGo').onclick=function(){if(!orig.w){say(st,'Choose a photo first','err');return;}
    var w=parseInt($('rsW').value,10),h=parseInt($('rsH').value,10);
    if(!w||!h||w<1||h<1){say(st,'Enter a valid width and height','err');return;}
    if(w>12000||h>12000){say(st,'Too large — keep each side under 12000 px','err');return;}
    var fmt=$('rsFmt').value;var c=document.createElement('canvas');c.width=w;c.height=h;
    var ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,w,h);
    say(st,'Resizing…','');
    c.toBlob(function(b){if(!b){say(st,'Resize failed in this browser','err');return;}
      outBlob=b;var p=$('rsImg');if(p.src&&p.src.indexOf('blob:')===0)URL.revokeObjectURL(p.src);
      p.src=URL.createObjectURL(b);p.classList.remove('file-hidden');$('rsDl').classList.remove('file-hidden');
      say(st,'Resized ✓ '+w+' × '+h+' px, '+Math.round(b.size/1024)+' KB','ok');},fmt,fmt==='image/png'?undefined:0.9);};
  $('rsDl').onclick=function(){if(!outBlob){say(st,'Resize first','err');return;}
    var ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[$('rsFmt').value]||'img';dl('sky-resized.'+ext,outBlob);};
}

if(tool==='crop'){
  var file=$('crFile'),st=$('crStatus'),wrap=$('crWrap'),cv=$('crCanvas'),ctx=cv.getContext('2d');
  var img=new Image(),blobUrl=null,scale=1,sel=null,drag=null,cropped=null;
  var MAXW=340;
  function draw(){ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(img,0,0,cv.width,cv.height);
    if(sel){ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(0,0,cv.width,cv.height);
      ctx.clearRect(sel.x,sel.y,sel.w,sel.h);ctx.drawImage(img,sel.x*scale,sel.y*scale,sel.w*scale,sel.h*scale,sel.x,sel.y,sel.w,sel.h);
      ctx.strokeStyle='#f6c969';ctx.lineWidth=2;ctx.strokeRect(sel.x,sel.y,sel.w,sel.h);}}
  file.onchange=function(){var f=file.files[0];if(!f)return;if(!/^image\//.test(f.type)){say(st,'That file is not an image','err');return;}
    if(blobUrl)URL.revokeObjectURL(blobUrl);blobUrl=URL.createObjectURL(f);
    img.onload=function(){scale=img.naturalWidth/MAXW;var w=MAXW,h=Math.round(img.naturalHeight/scale);if(h>520){scale=img.naturalHeight/520;h=520;w=Math.round(img.naturalWidth/scale);}
      cv.width=w;cv.height=h;sel=null;cropped=null;$('crDl').classList.add('file-hidden');wrap.classList.remove('file-hidden');draw();say(st,'Loaded ✓ drag on the photo to draw a box','ok');};
    img.onerror=function(){say(st,'Could not read that image','err');};img.src=blobUrl;};
  function pos(e){var r=cv.getBoundingClientRect();var p=e.touches?e.touches[0]:e;return{x:(p.clientX-r.left)*(cv.width/r.width),y:(p.clientY-r.top)*(cv.height/r.height)};}
  function start(e){if(!img.naturalWidth)return;e.preventDefault();var p=pos(e);drag={x:p.x,y:p.y};sel={x:p.x,y:p.y,w:0,h:0};}
  function move(e){if(!drag)return;e.preventDefault();var p=pos(e);sel={x:Math.min(drag.x,p.x),y:Math.min(drag.y,p.y),w:Math.abs(p.x-drag.x),h:Math.abs(p.y-drag.y)};draw();}
  function end(){if(drag&&sel&&(sel.w<8||sel.h<8)){sel=null;draw();say(st,'Box too small — drag a bigger box','err');}else if(sel){say(st,'Selection ✓ '+Math.round(sel.w*scale)+' × '+Math.round(sel.h*scale)+' px — tap Crop','ok');}drag=null;}
  cv.addEventListener('pointerdown',start);cv.addEventListener('pointermove',move);cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',function(){drag=null;});
  $('crGo').onclick=function(){if(!sel){say(st,'Drag a box on the photo first','err');return;}
    var w=Math.round(sel.w*scale),h=Math.round(sel.h*scale);var c=document.createElement('canvas');c.width=w;c.height=h;
    c.getContext('2d').drawImage(img,sel.x*scale,sel.y*scale,sel.w*scale,sel.h*scale,0,0,w,h);
    c.toBlob(function(b){if(!b){say(st,'Crop failed in this browser','err');return;}cropped=b;$('crDl').classList.remove('file-hidden');say(st,'Cropped ✓ '+w+' × '+h+' px — tap Download','ok');},'image/png');};
  $('crReset').onclick=function(){file.value='';wrap.classList.add('file-hidden');sel=null;cropped=null;say(st,'','');file.click();};
  $('crDl').onclick=function(){if(!cropped){say(st,'Crop first','err');return;}dl('sky-crop.png',cropped);};
}
})();
