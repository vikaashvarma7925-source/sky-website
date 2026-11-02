var $=function(i){return document.getElementById(i)},MAXB=15*1024*1024,MAXPX=40e6,SHOW=900,MAXSIDE=2400;
var src=null,pts=[],drag=-1,url1=null,url2=null,busy=false,vw=0,vh=0,sc=1,sel=0,rgen=0;
function msg(id,t,err){var s=$(id);s.hidden=!t;s.className='msg'+(err?' err':'');s.textContent=t||''}
function revoke(){rgen++;[url1,url2].forEach(function(u){if(u)URL.revokeObjectURL(u)});url1=url2=null;$('dlp').hidden=$('dlj').hidden=true;$('res').hidden=true}
function dims(u){var v=new DataView(u.buffer,u.byteOffset,u.byteLength),n=u.length,i;
 if(n>24&&v.getUint32(0)===0x89504E47){return[v.getUint32(16),v.getUint32(20)]}
 if(n>30&&v.getUint32(0)===0x52494646&&v.getUint32(8)===0x57454250){var t=v.getUint32(12);
  if(t===0x56503820)return[v.getUint16(26,true)&0x3fff,v.getUint16(28,true)&0x3fff];
  if(t===0x5650384C){var b=v.getUint32(21,true);return[(b&0x3fff)+1,((b>>14)&0x3fff)+1]}
  if(t===0x56503858)return[(u[24]|u[25]<<8|u[26]<<16)+1,(u[27]|u[28]<<8|u[29]<<16)+1];return null}
 if(n>4&&u[0]===0xFF&&u[1]===0xD8){i=2;while(i+9<n){if(u[i]!==0xFF){i++;continue}var m=u[i+1];if(m===0xFF){i++;continue}if(m>=0xC0&&m<=0xCF&&m!==0xC4&&m!==0xC8&&m!==0xCC)return[v.getUint16(i+7),v.getUint16(i+5)];i+=2+v.getUint16(i+2)}}
 return null}
$('file').onchange=function(){var f=this.files[0];this.value='';if(!f)return;var my=++sel;revoke();msg('st0','');src=null;pts=[];drag=-1;$('ed').hidden=true;
 function badfile(t){src=null;pts=[];$('ed').hidden=true;msg('st0',t,1)}
 if(!/^image\/(jpeg|png|webp)$/.test(f.type)){badfile('This is not a JPG, PNG or WebP photo.');return}
 if(f.size>MAXB){badfile('This photo is bigger than 15 MB.');return}
 if(!window.createImageBitmap){msg('st0','This browser cannot open photos safely. Try a current Chrome, Edge, Firefox or Safari.',1);return}
 f.slice(0,2097152).arrayBuffer().then(function(ab){if(my!==sel)throw 'stale';var dm=dims(new Uint8Array(ab));if(!dm||!dm[0]||!dm[1])throw 'size';if(dm[0]*dm[1]>MAXPX)throw 'big';return createImageBitmap(f,{imageOrientation:'from-image'})}).then(function(b){if(my!==sel){b.close();return}
  var k=Math.min(1,MAXSIDE/Math.max(b.width,b.height)),w=Math.max(1,Math.round(b.width*k)),h=Math.max(1,Math.round(b.height*k));
  var c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(b,0,0,w,h);b.close();
  src=c;var m=Math.round(Math.min(w,h)*0.06);pts=[[m,m],[w-m,m],[w-m,h-m],[m,h-m]];
  sc=Math.min(1,SHOW/Math.max(w,h));vw=Math.round(w*sc);vh=Math.round(h*sc);var cv=$('cv');cv.width=vw;cv.height=vh;
  $('ed').hidden=false;msg('st','');draw()},function(e){if(e==='stale'||my!==sel)return;badfile(e==='big'?'This photo is over 40 megapixels. Make it smaller first. (Opening a very large photo can run out of memory on a phone.)':'Could not read the size of this photo, so it was not opened.',1)})};
function ord(){var cx=0,cy=0;pts.forEach(function(p){cx+=p[0];cy+=p[1]});cx/=4;cy/=4;
 var ix=[0,1,2,3].sort(function(a,b){return Math.atan2(pts[a][1]-cy,pts[a][0]-cx)-Math.atan2(pts[b][1]-cy,pts[b][0]-cx)});
 var s=0,bs=1e18;ix.forEach(function(k,j){var v=pts[k][0]+pts[k][1];if(v<bs){bs=v;s=j}});return[0,1,2,3].map(function(j){return ix[(s+j)%4]})}
function kk(){var r=$('cv').getBoundingClientRect();return r.width?$('cv').width/r.width:1}
function draw(){var cv=$('cv'),x=cv.getContext('2d'),K=kk(),R=22*K,O=ord(),lab=[];O.forEach(function(k,j){lab[k]=j+1});x.drawImage(src,0,0,vw,vh);
 x.lineWidth=3*K;x.strokeStyle='#ffd400';x.beginPath();O.forEach(function(k,i){var p=pts[k];x[i?'lineTo':'moveTo'](p[0]*sc,p[1]*sc)});x.closePath();x.stroke();
 pts.forEach(function(p,i){x.beginPath();x.arc(p[0]*sc,p[1]*sc,R,0,7);x.fillStyle='rgba(36,80,111,.85)';x.fill();x.lineWidth=3*K;x.strokeStyle='#fff';x.stroke();x.fillStyle='#fff';x.font='bold '+Math.round(18*K)+'px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(lab[i],p[0]*sc,p[1]*sc)})}
function pos(e){var cv=$('cv'),r=cv.getBoundingClientRect();return[(e.clientX-r.left)*cv.width/r.width/sc,(e.clientY-r.top)*cv.height/r.height/sc]}
$('cv').addEventListener('pointerdown',function(e){if(busy)return;var q=pos(e),best=-1,bd=1e9,r=$('cv').getBoundingClientRect(),lim=30*kk()/sc;
 pts.forEach(function(p,i){var d=Math.hypot(p[0]-q[0],p[1]-q[1]);if(d<bd){bd=d;best=i}});
 if(bd<=lim){drag=best;revoke();try{this.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()}});
$('cv').addEventListener('pointermove',function(e){if(drag<0)return;var q=pos(e);pts[drag]=[Math.max(0,Math.min(src.width,q[0])),Math.max(0,Math.min(src.height,q[1]))];draw();e.preventDefault()});
['pointerup','pointercancel'].forEach(function(n){$('cv').addEventListener(n,function(){drag=-1})});
$('fl').onchange=function(){revoke();$('thw').hidden=this.value!=='bw'};$('thw').hidden=true;
$('th').addEventListener('input',revoke);$('sh').onchange=revoke;
function cross(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])}
function convexOk(){var P0=pts;pts=ord().map(function(k){return P0[k]});var ok=cvx();pts=P0;return ok}
function cvx(){var s=0;for(var i=0;i<4;i++){var c=cross(pts[i],pts[(i+1)%4],pts[(i+2)%4]);if(Math.abs(c)<1)return false;var sg=c>0?1:-1;if(!s)s=sg;else if(s!==sg)return false}return true}
function d(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1])}
function warp(W,H){var P=pts,x0=P[0][0],y0=P[0][1],x1=P[1][0],y1=P[1][1],x2=P[2][0],y2=P[2][1],x3=P[3][0],y3=P[3][1];
 var dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3,den=dx1*dy2-dx2*dy1,g=(dx3*dy2-dx2*dy3)/den,h=(dx1*dy3-dx3*dy1)/den;
 var a=x1-x0+g*x1,b=x3-x0+h*x3,c=x0,dd=y1-y0+g*y1,e=y3-y0+h*y3,f=y0;
 var S=src.getContext('2d').getImageData(0,0,src.width,src.height),sd=S.data,sw=S.width,sh=S.height,o=new Uint8ClampedArray(W*H*4);
 for(var j=0;j<H;j++){var v=(j+.5)/H;for(var i=0;i<W;i++){var u=(i+.5)/W,w=g*u+h*v+1,X=(a*u+b*v+c)/w-.5,Y=(dd*u+e*v+f)/w-.5;
  X=X<0?0:X>sw-1?sw-1:X;Y=Y<0?0:Y>sh-1?sh-1:Y;var xi=X|0,yi=Y|0,fx=X-xi,fy=Y-yi,xj=xi+1<sw?xi+1:xi,yj=yi+1<sh?yi+1:yi,p=(yi*sw+xi)*4,q=(yi*sw+xj)*4,r=(yj*sw+xi)*4,s=(yj*sw+xj)*4,t=(j*W+i)*4;
  for(var k=0;k<3;k++)o[t+k]=(sd[p+k]*(1-fx)+sd[q+k]*fx)*(1-fy)+(sd[r+k]*(1-fx)+sd[s+k]*fx)*fy;o[t+3]=255}}
 return new ImageData(o,W,H)}
function boxblur(a,w,h,r){var t=new Float32Array(w*h),o=new Float32Array(w*h),i,j,s,n;
 for(j=0;j<h;j++){s=0;n=0;for(i=0;i<Math.min(r,w);i++){s+=a[j*w+i];n++}for(i=0;i<w;i++){if(i+r<w){s+=a[j*w+i+r];n++}if(i-r-1>=0){s-=a[j*w+i-r-1];n--}t[j*w+i]=s/n}}
 for(i=0;i<w;i++){s=0;n=0;for(j=0;j<Math.min(r,h);j++){s+=t[j*w+i];n++}for(j=0;j<h;j++){if(j+r<h){s+=t[(j+r)*w+i];n++}if(j-r-1>=0){s-=t[(j-r-1)*w+i];n--}o[j*w+i]=s/n}}return o}
function clean(img,bw,th){var W=img.width,H=img.height,dt=img.data,n=W*H,gray=new Float32Array(n),i;
 for(i=0;i<n;i++)gray[i]=.299*dt[i*4]+.587*dt[i*4+1]+.114*dt[i*4+2];
 var k=8,sw=Math.max(1,Math.ceil(W/k)),sh=Math.max(1,Math.ceil(H/k)),sm=new Float32Array(sw*sh),cnt=new Float32Array(sw*sh);
 for(var y=0;y<H;y++)for(var x=0;x<W;x++){var q=((y/k)|0)*sw+((x/k)|0);sm[q]+=gray[y*W+x];cnt[q]++}
 for(i=0;i<sm.length;i++)sm[i]/=cnt[i];
 var bg=boxblur(sm,sw,sh,Math.max(2,Math.round(Math.min(sw,sh)/10)));
 for(i=0;i<n;i++){var b=bg[(((i/W)|0)/k|0)*sw+(((i%W)/k)|0)];b=Math.max(b,40);var v=gray[i]/b*255;v=v>255?255:v;
  if(bw)v=v<th?0:255;else{v=255*Math.pow(v/255,1.6);v=v>255?255:v}
  dt[i*4]=dt[i*4+1]=dt[i*4+2]=v}}
function lock(b){['go','fl','th','sh','rot','file'].forEach(function(i){$(i).disabled=b})}
$('go').onclick=function(){if(busy||!src)return;if(!convexOk()){msg('st','The 4 dots must be the 4 corners of one four-sided shape (no dot inside, no crossing). Move the dots.',1);return}
 busy=true;lock(true);msg('st','Working...');revoke();var my=rgen;
 setTimeout(function(){try{
  var P0=pts;pts=ord().map(function(k){return P0[k]});var W=Math.round(Math.max(d(pts[0],pts[1]),d(pts[3],pts[2]))),H=Math.round(Math.max(d(pts[0],pts[3]),d(pts[1],pts[2])));
  var sp=$('sh').value;if(sp!=='a'){var M=Math.round(Math.max(d(pts[0],pts[3]),d(pts[1],pts[2]),d(pts[0],pts[1]),d(pts[3],pts[2])));if(sp==='p'){H=M;W=Math.round(M/Math.SQRT2)}else{W=M;H=Math.round(M/Math.SQRT2)}}
  var k=Math.min(1,MAXSIDE/Math.max(W,H));W=Math.max(8,Math.round(W*k));H=Math.max(8,Math.round(H*k));
  var img=warp(W,H);pts=P0;var m=$('fl').value;if(m!=='color')clean(img,m==='bw',+$('th').value);
  var o=$('out');o.width=W;o.height=H;o.getContext('2d').putImageData(img,0,0);
  o.toBlob(function(b){if(my!==rgen){fin();return}if(!b){msg('st','Could not make the picture.',1);fin();return}url1=URL.createObjectURL(b);var a=$('dlp');a.href=url1;a.download='scan.png';a.hidden=false;
   o.toBlob(function(b2){if(my!==rgen){fin();return}if(b2){url2=URL.createObjectURL(b2);var a2=$('dlj');a2.href=url2;a2.download='scan.jpg';a2.hidden=false}$('res').hidden=false;msg('st','Done. Result is '+W+' x '+H+' pixels. Check it below before you download.');fin()},'image/jpeg',.92)},'image/png')
 }catch(e){msg('st','Could not make the scan. Try a smaller photo.',1);fin()}},30);
 function fin(){busy=false;lock(false)}};

window.addEventListener('resize',function(){if(src)draw()});

$('rot').onclick=function(){if(!src)return;var w=src.width,h=src.height,c=document.createElement('canvas');c.width=h;c.height=w;var x=c.getContext('2d');x.translate(h,0);x.rotate(Math.PI/2);x.drawImage(src,0,0);
 pts=pts.map(function(p){return[h-p[1],p[0]]});src=c;sc=Math.min(1,SHOW/Math.max(c.width,c.height));vw=Math.round(c.width*sc);vh=Math.round(c.height*sc);$('cv').width=vw;$('cv').height=vh;revoke();msg('st','');draw()};
