var $=function(i){return document.getElementById(i)},MAXB=500*1024*1024,v=$('v'),url=null,dur=0,outUrl=null,busy=false;
function msg(t,err){var s=$('st');s.hidden=false;s.className='msg'+(err?' err':'');s.textContent=t}
function info(t,err){var s=$('fi');s.hidden=!t;s.className='msg'+(err?' err':'');s.textContent=t||''}
function clearOut(){if(outUrl){URL.revokeObjectURL(outUrl);outUrl=null}$('out').innerHTML='';$('st').hidden=true}
function fmt(t){return t.toFixed(2)}
function whenSeeked(cb){if(!v.seeking){cb();return}var done=false,f=function(){if(done)return;done=true;v.removeEventListener('seeked',f);cb()};v.addEventListener('seeked',f);setTimeout(f,4000)}
function seek(t){t=Math.max(0,Math.min(dur,t));clearOut();v.currentTime=t;$('tm').textContent=fmt(t);$('sl').value=dur?Math.round(t/dur*1000):0}
$('file').onchange=function(){var f=this.files[0];this.value='';if(!f)return;clearOut();info('');$('ctl').hidden=true;
 if(!/^video\//.test(f.type)&&!/\.(mp4|m4v|mov|webm)$/i.test(f.name)){info('This is not a video file.',1);return}
 if(f.size>MAXB){info('This video is bigger than 500 MB.',1);return}
 if(!f.size){info('This file is empty.',1);return}
 if(url){URL.revokeObjectURL(url);url=null}v.removeAttribute('src');url=URL.createObjectURL(f);$('fn').textContent=f.name;info('Opening the video...');
 var to=setTimeout(function(){info('The video did not open. Your browser may not support this video format (some iPhone or screen-recording files use a format that only some browsers play).',1)},15000);
 v.onerror=function(){clearTimeout(to);info('Your browser cannot play this video, so no frame can be taken. Try another browser or convert the video to MP4 (H.264) first.',1)};
 v.onloadeddata=function(){clearTimeout(to);dur=v.duration;if(!isFinite(dur)||dur<=0||!v.videoWidth){info('The length or size of this video could not be read.',1);return}
  info(f.name+' - '+v.videoWidth+' x '+v.videoHeight+' pixels, '+fmt(dur)+' s.');$('tt').textContent=fmt(dur);$('ctl').hidden=false;seek(0)};
 v.src=url;v.load()};
$('sl').oninput=function(){seek(dur*($('sl').value/1000))};
[['b1',-1],['b2',-0.1],['b3',0.1],['b4',1]].forEach(function(a){$(a[0]).onclick=function(){seek(v.currentTime+a[1])}});
['cr','fm'].forEach(function(k){$(k).onchange=clearOut});
function cropRect(w,h){var c=$('cr').value;if(c==='0')return [0,0,w,h];var r=c==='1'?1:(+c.split(':')[0])/(+c.split(':')[1]),cw=w,ch=Math.round(w/r);if(ch>h){ch=h;cw=Math.round(h*r)}return [Math.floor((w-cw)/2),Math.floor((h-ch)/2),cw,ch]}
function lock(b){['go','sl','b1','b2','b3','b4','cr','fm','file'].forEach(function(i){$(i).disabled=b})}
$('go').onclick=function(){if(busy)return;clearOut();busy=true;lock(true);msg('Saving the frame...');
 whenSeeked(function(){setTimeout(function(){try{
  var w=v.videoWidth,h=v.videoHeight;if(!w||!h||v.readyState<2)throw new Error('The picture of the video is not ready yet. Wait a second and try again.');
  var r=cropRect(w,h),cv=document.createElement('canvas');cv.width=r[2];cv.height=r[3];if(r[2]*r[3]>67108864)throw new Error('This frame is too big to save in this browser.');var cx=cv.getContext('2d');
  var jpg=$('fm').value==='jpg';if(jpg){cx.fillStyle='#fff';cx.fillRect(0,0,r[2],r[3])}
  cx.drawImage(v,r[0],r[1],r[2],r[3],0,0,r[2],r[3]);
  cv.toBlob(function(b){busy=false;lock(false);if(!b){msg('Could not make the picture. Try again or use a smaller video.',1);return}
   outUrl=URL.createObjectURL(b);var nm='frame-'+fmt(v.currentTime).replace('.','_')+'s.'+(jpg?'jpg':'png');var p=document.createElement('p');p.className='pt-o';var a=document.createElement('a');a.className='dl';a.href=outUrl;a.download=nm;a.textContent='Download '+nm+' ('+r[2]+' x '+r[3]+' pixels, '+Math.max(1,Math.round(b.size/1024))+' KB)';p.appendChild(a);$('out').appendChild(p);
   msg('Done. The frame at '+fmt(v.currentTime)+' s is ready. Download it, then open it and check it.')},jpg?'image/jpeg':'image/png',0.92)
 }catch(e){busy=false;lock(false);msg(e&&e.message?e.message:'Could not save the frame.',1)}},60)})};
