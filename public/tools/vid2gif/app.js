var $=function(i){return document.getElementById(i)},MAXB=500*1024*1024,MAXF=120,MAXPX=16000000,MAXOUT=25*1024*1024,v=$('v'),url=null,dur=0,outUrl=null,busy=false,cancel=false;
function msg(t,err){var s=$('st');s.hidden=false;s.className='msg'+(err?' err':'');s.textContent=t}
function info(t,err){var s=$('fi');s.hidden=!t;s.className='msg'+(err?' err':'');s.textContent=t||''}
function clearOut(){if(outUrl){URL.revokeObjectURL(outUrl);outUrl=null}$('out').innerHTML='';$('st').hidden=true}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function seekTo(t){return new Promise(function(res,rej){var done=false,to=setTimeout(function(){if(!done){done=true;v.removeEventListener('seeked',f);rej(new Error('The video stopped answering while the frames were taken. Try a shorter part or a smaller video.'))}},8000);
 function f(){if(done)return;done=true;clearTimeout(to);v.removeEventListener('seeked',f);setTimeout(res,20)}v.addEventListener('seeked',f);v.currentTime=t})}
$('file').onchange=function(){var f=this.files[0];this.value='';if(!f||busy)return;clearOut();info('');$('ctl').hidden=true;
 if(!/^video\//.test(f.type)&&!/\.(mp4|m4v|mov|webm)$/i.test(f.name)){info('This is not a video file.',1);return}
 if(f.size>MAXB){info('This video is bigger than 500 MB.',1);return}
 if(!f.size){info('This file is empty.',1);return}
 if(url){URL.revokeObjectURL(url);url=null}v.removeAttribute('src');url=URL.createObjectURL(f);$('fn').textContent=f.name;info('Opening the video...');
 var to=setTimeout(function(){info('The video did not open. Your browser may not support this video format.',1)},15000);
 v.onerror=function(){clearTimeout(to);info('Your browser cannot play this video, so no GIF can be made. Try another browser or convert the video to MP4 (H.264) first.',1)};
 v.onloadeddata=function(){clearTimeout(to);dur=v.duration;if(!isFinite(dur)||dur<=0||!v.videoWidth){info('The length or size of this video could not be read.',1);return}
  info(f.name+' - '+v.videoWidth+' x '+v.videoHeight+' pixels, '+dur.toFixed(2)+' s.');$('ctl').hidden=false};
 v.src=url;v.load()};
function num(s){s=String(s).trim().replace(',','.');return /^\d+(\.\d{1,2})?$/.test(s)?parseFloat(s):null}
/* median-cut palette from 5-bit histogram (box stats are computed once per box) */
function buildPalette(hist){var N=0,i;for(i=0;i<32768;i++)if(hist[i])N++;
 var idx=new Int32Array(N);N=0;for(i=0;i<32768;i++)if(hist[i])idx[N++]=i;
 function mk(lo,hi){var mn=[31,31,31],mx=[0,0,0],tot=0;for(var j=lo;j<hi;j++){var b=idx[j],c=[(b>>10)&31,(b>>5)&31,b&31];for(var k=0;k<3;k++){if(c[k]<mn[k])mn[k]=c[k];if(c[k]>mx[k])mx[k]=c[k]}tot+=hist[b]}
  var span=0,kk=0;for(var k2=0;k2<3;k2++){var sp=mx[k2]-mn[k2];if(sp>span){span=sp;kk=k2}}
  return {lo:lo,hi:hi,tot:tot,kk:kk,sc:(hi-lo<2)?0:span*Math.sqrt(tot)}}
 var boxes=[mk(0,N)];
 while(boxes.length<256){var bi=-1,bs=0;for(i=0;i<boxes.length;i++)if(boxes[i].sc>bs){bs=boxes[i].sc;bi=i}
  if(bi<0)break;var bx=boxes[bi],sh=[10,5,0][bx.kk];
  idx.subarray(bx.lo,bx.hi).sort(function(a,b){return ((a>>sh)&31)-((b>>sh)&31)});
  var acc=0,cut=bx.lo+1;for(var j=bx.lo;j<bx.hi-1;j++){acc+=hist[idx[j]];cut=j+1;if(acc>=bx.tot/2)break}
  boxes.splice(bi,1,mk(bx.lo,cut),mk(cut,bx.hi))}
 var pal=new Uint8Array(768),lut=new Uint8Array(32768);
 boxes.forEach(function(bx,i){var r=0,g=0,b=0,n=0;for(var j=bx.lo;j<bx.hi;j++){var x=idx[j],w=hist[x];r+=((x>>10)&31)*w;g+=((x>>5)&31)*w;b+=(x&31)*w;n+=w;lut[x]=i}if(n){pal[i*3]=Math.round(r/n*255/31);pal[i*3+1]=Math.round(g/n*255/31);pal[i*3+2]=Math.round(b/n*255/31)}});
 var np=boxes.length;
 for(var x=0;x<32768;x++){if(hist[x])continue;var c0=((x>>10)&31)*255/31,c1=((x>>5)&31)*255/31,c2=(x&31)*255/31,best=0,bd=1e9;for(var p=0;p<np;p++){var dr=c0-pal[p*3],dg=c1-pal[p*3+1],db=c2-pal[p*3+2],d=dr*dr*2+dg*dg*4+db*db*3;if(d<bd){bd=d;best=p}}lut[x]=best}
 return {pal:pal,lut:lut}}
/* LZW with a typed-array dictionary and a growing byte buffer */
var LZK=new Int16Array(1<<20);
function lzw(pix){var buf=new Uint8Array(Math.max(1024,pix.length>>1)),bl=0,cur=0,sh=0,clear=256,eoi=257,next=258,size=9,used=[],sub=new Uint8Array(255),sl=0;
 function put(x){if(bl>=buf.length){var nb=new Uint8Array(buf.length*2);nb.set(buf);buf=nb}buf[bl++]=x}
 function flush(){put(sl);for(var i=0;i<sl;i++)put(sub[i]);sl=0}
 function emit(code){cur|=code<<sh;sh+=size;while(sh>=8){sub[sl++]=cur&255;cur>>=8;sh-=8;if(sl===255)flush()}}
 function reset(){for(var i=0;i<used.length;i++)LZK[used[i]]=0;used.length=0}
 emit(clear);var ib=pix[0];
 for(var i=1;i<pix.length;i++){var k=pix[i],key=(ib<<8)|k,c=LZK[key];
  if(c===0){emit(ib);if(next===4096){emit(clear);next=258;size=9;reset()}else{if(next>=(1<<size))size++;LZK[key]=next++;used.push(key)}ib=k}else ib=c}
 emit(ib);emit(eoi);if(sh>0)sub[sl++]=cur&255;if(sl)flush();put(0);reset();return buf.slice(0,bl)}
function encodeGif(frames,w,h,delay,P){var o=[];function b(x){o.push(x&255)}function s(x){b(x);b(x>>8)}
 'GIF89a'.split('').forEach(function(c){b(c.charCodeAt(0))});s(w);s(h);b(0xF7);b(0);b(0);for(var i=0;i<768;i++)b(P.pal[i]);
 b(0x21);b(0xFF);b(11);'NETSCAPE2.0'.split('').forEach(function(c){b(c.charCodeAt(0))});b(3);b(1);s(0);b(0);
 var parts=[new Uint8Array(o)];o=[];
 frames.forEach(function(f){o=[];b(0x21);b(0xF9);b(4);b(0x04);s(delay);b(0);b(0);b(0x2C);s(0);s(0);s(w);s(h);b(0);b(8);var head=new Uint8Array(o);var body=lzw(f);parts.push(head);parts.push(body)});
 parts.push(new Uint8Array([0x3B]));return new Blob(parts,{type:'image/gif'})}
$('cn').onclick=function(){cancel=true};
function setBusy(b){busy=b;$('go').disabled=b;$('file').disabled=b;$('cn').hidden=!b;['s0','ln','fp','wd'].forEach(function(i){$(i).disabled=b})}
['s0','ln','fp','wd'].forEach(function(i){$(i).addEventListener('input',clearOut)});
$('go').onclick=function(){if(busy)return;clearOut();
 var s0=num($('s0').value),ln=num($('ln').value),fps=+$('fp').value;
 if(s0===null){msg('Type the start time in seconds, for example 2 or 2.5.',1);return}
 if(ln===null||ln<0.5||ln>10){msg('The length must be from 0.5 to 10 seconds.',1);return}
 if(s0>=dur){msg('The start time is after the end of the video. The video is '+dur.toFixed(2)+' s long.',1);return}
 var shown=ln;if(s0+ln>dur+0.001){ln=Math.floor((dur-s0)*fps)/fps;if(ln<0.2){msg('There is not enough video after the start time. Choose an earlier start.',1);return}}
 var n=Math.max(1,Math.round(ln*fps));if(n>MAXF){msg('That is more than '+MAXF+' pictures. Use a shorter length or fewer pictures a second.',1);return}
 var W=Math.min(+$('wd').value,v.videoWidth),H=Math.max(1,Math.round(W*v.videoHeight/v.videoWidth));
 if(W*H*n>MAXPX){msg('This GIF is too heavy for a phone or an older computer ('+W+' x '+H+' pixels, '+n+' pictures). Use a smaller width, fewer pictures a second or a shorter length.',1);return}
 cancel=false;setBusy(true);var cv=document.createElement('canvas');cv.width=W;cv.height=H;var cx=cv.getContext('2d',{willReadFrequently:true}),raw=[],hist=new Uint32Array(32768);
 (async function(){try{
  for(var i=0;i<n;i++){if(cancel)throw {stopped:1};msg('Taking picture '+(i+1)+' of '+n+'...');var t=Math.min(dur-0.001,s0+i/fps);if(t<0)t=0;await seekTo(t);cx.drawImage(v,0,0,W,H);var d=cx.getImageData(0,0,W,H).data;var pk=new Uint16Array(W*H);for(var p=0,q2=0;q2<pk.length;q2++,p+=4)pk[q2]=((d[p]>>3)<<10)|((d[p+1]>>3)<<5)|(d[p+2]>>3);raw.push(pk);
   for(var p2=0;p2<pk.length;p2+=4)hist[pk[p2]]++}
  msg('Choosing colours...');await sleep(30);var P=buildPalette(hist),frames=[];
  for(var f=0;f<raw.length;f++){if(cancel)throw {stopped:1};var d2=raw[f],ix=new Uint8Array(W*H);for(var q=0;q<ix.length;q++)ix[q]=P.lut[d2[q]];frames.push(ix);raw[f]=null;if(f%8===7){msg('Building the GIF...');await sleep(0)}}
  var blob=encodeGif(frames,W,H,Math.round(100/fps),P);
  if(blob.size>MAXOUT)throw new Error('The GIF would be '+(blob.size/1048576).toFixed(1)+' MB, which is too big. Use a smaller width, fewer pictures a second or a shorter length.');
  outUrl=URL.createObjectURL(blob);var nm='video-'+s0.toString().replace('.','_')+'s.gif';var pe=document.createElement('p');pe.className='pt-o';var a=document.createElement('a');a.className='dl';a.href=outUrl;a.download=nm;a.textContent='Download '+nm+' ('+W+' x '+H+' pixels, '+n+' pictures, '+(blob.size>=1048576?(blob.size/1048576).toFixed(1)+' MB':Math.max(1,Math.round(blob.size/1024))+' KB')+')';pe.appendChild(a);$('out').appendChild(pe);
  var im=new Image();im.alt='GIF preview';im.src=outUrl;im.style.cssText='max-width:100%;border-radius:8px;display:block;margin:8px 0';$('out').appendChild(im);
  msg('Done. '+n+' pictures, '+ln.toFixed(2)+' s'+(ln<shown-0.01?' (the video ended before '+shown+' s, so the GIF is shorter)':'')+'. Download it, then open it and check it.');
 }catch(e){msg(e&&e.stopped?'Stopped. No GIF was made.':(e&&e.message?e.message:'Could not make the GIF.'),1)}finally{setBusy(false);raw=null}})()};
