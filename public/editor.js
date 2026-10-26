(()=>{const $=id=>document.getElementById(id);const canvas=$('canvas'),ctx=canvas.getContext('2d');let img=null,base=null,items=[],history=[],selected=null,drag=null,coverStart=null;const status=m=>$('status').textContent=m;
function cloneCanvas(c){const n=document.createElement('canvas');n.width=c.width;n.height=c.height;n.getContext('2d').drawImage(c,0,0);return n}
function snapshot(){if(!img)return;history.push({items:items.map(x=>({...x})),base:base?cloneCanvas(base):null});if(history.length>30)history.shift()}
function draw(){if(!img)return;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(base,0,0);for(const t of items){ctx.font=`${t.weight||'normal'} ${t.size}px "${t.font}"`;ctx.textBaseline='top';ctx.fillStyle=t.color;ctx.fillText(t.text,t.x,t.y);if(selected===t){const w=ctx.measureText(t.text).width;ctx.strokeStyle='#f6c969';ctx.lineWidth=Math.max(1,canvas.width/700);ctx.setLineDash([5,4]);ctx.strokeRect(t.x-3,t.y-3,w+6,t.size+8);ctx.setLineDash([])}}}
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
$('imageFile').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('image/')){status('Please choose an image file.');return}const reader=new FileReader();reader.onload=()=>{const im=new Image();im.onload=()=>{const max=2400,scale=Math.min(1,max/Math.max(im.width,im.height));canvas.width=Math.round(im.width*scale);canvas.height=Math.round(im.height*scale);base=document.createElement('canvas');base.width=canvas.width;base.height=canvas.height;base.getContext('2d').drawImage(im,0,0,canvas.width,canvas.height);img=im;items=[];selected=null;history=[];canvas.hidden=false;$('emptyHint').hidden=true;clearRegions();$('imageDimensions').textContent=`${canvas.width} × ${canvas.height}`;draw();status('Image loaded. Finding text on your device...');try{$('findText').click();}catch(_){}};im.src=reader.result};reader.readAsDataURL(f)});
$('fontSize').addEventListener('input',()=>{$('sizeValue').textContent=$('fontSize').value;if(selected){selected.size=Number($('fontSize').value);draw()}});$('coverOpacity').addEventListener('input',()=>{$('opacityValue').textContent=$('coverOpacity').value});
$('addText').addEventListener('click',()=>{if(!img){status('Upload an image first.');return}const text=$('newText').value.trim();if(!text){status('Type the text you want to add first.');return}snapshot();selected={text,font:$('fontFamily').value,weight:$('boldText')&&$('boldText').checked?'bold':'normal',size:Number($('fontSize').value),color:$('textColor').value,x:Math.max(0,canvas.width*.1),y:Math.max(0,canvas.height*.45)};items.push(selected);draw();status('Text added. Tap the image or drag the text to position it.')});
let pendingTap=null; // tap-to-move is armed on pointerdown but only applied on a clean pointerup, so a touch that turns into a page scroll never moves the text
canvas.addEventListener('pointerdown',e=>{if(!img)return;const p=point(e);if($('toolMode').value==='cover'){coverStart=p;canvas.setPointerCapture(e.pointerId);return}for(let i=items.length-1;i>=0;i--){const t=items[i];ctx.font=`${t.weight||'normal'} ${t.size}px "${t.font}"`;if(p.x>=t.x-5&&p.x<=t.x+ctx.measureText(t.text).width+5&&p.y>=t.y-5&&p.y<=t.y+t.size+8){selected=t;drag={t,dx:p.x-t.x,dy:p.y-t.y};canvas.setPointerCapture(e.pointerId);draw();return}}if(selected){pendingTap={id:e.pointerId,cx:e.clientX,cy:e.clientY,x:p.x,y:p.y}}});
canvas.addEventListener('pointermove',e=>{if(pendingTap&&Math.hypot(e.clientX-pendingTap.cx,e.clientY-pendingTap.cy)>12)pendingTap=null;if(!drag||!img)return;const p=point(e);drag.t.x=Math.max(0,Math.min(canvas.width-5,p.x-drag.dx));drag.t.y=Math.max(0,Math.min(canvas.height-5,p.y-drag.dy));draw()});canvas.addEventListener('pointercancel',()=>{pendingTap=null;drag=null;coverStart=null});
canvas.addEventListener('pointerup',e=>{if(pendingTap&&pendingTap.id===e.pointerId&&img&&selected){snapshot();selected.x=Math.max(0,pendingTap.x);selected.y=Math.max(0,pendingTap.y);draw();status('Text moved.')}pendingTap=null;if(coverStart&&img){const end=point(e),x=Math.min(coverStart.x,end.x),y=Math.min(coverStart.y,end.y),w=Math.abs(end.x-coverStart.x),h=Math.abs(end.y-coverStart.y);if(w>3&&h>3){snapshot();const c=base.getContext('2d');c.globalAlpha=Number($('coverOpacity').value)/100;c.fillStyle=$('coverColor').value;c.fillRect(x,y,w,h);c.globalAlpha=1;draw();status('Area covered with selected solid colour.')}}coverStart=null;drag=null});
$('undo').addEventListener('click',()=>{const h=history.pop();if(!h){status('Nothing to undo yet.');return}items=h.items;selected=null;if(h.base)base=h.base;draw();status('Last change undone.')});$('clearText').addEventListener('click',()=>{if(!items.length){status('No added text to remove.');return}snapshot();items=[];selected=null;draw();status('Added text removed. Cover patches remain until reset.')});$('download').addEventListener('click',()=>{if(!img){status('Upload an image first.');return}let applied=false;if(selectedRegion){const nv=$('quickText').value.trim();if(nv&&nv!==selectedRegion.text){applied=applyReplace();}}selected=null;draw();const a=document.createElement('a');const n=new Date(),p=v=>String(v).padStart(2,'0');a.download='sky-edited-image-'+p(n.getHours())+p(n.getMinutes())+p(n.getSeconds())+'.png';a.href=canvas.toDataURL('image/png');a.click();status(applied?'Change applied. PNG saved to your device.':'PNG saved to your device.')});
/* ---- 3. Tap-to-edit existing text: on-device OCR (tesseract.js 5.1.1, Apache-2.0) ---- */
let ocrWorker=null, ocrBusy=false, selectedRegion=null, regionBg='#ffffff';
function clearRegions(){selectedRegion=null;const o=$('regionOverlay');if(o)o.innerHTML='';$('replaceGo').classList.add('ed-hidden');$('regionCancel').classList.add('ed-hidden');const q=$('quickEdit');if(q)q.classList.add('ed-hidden');}
async function loadTess(){if(window.Tesseract)return window.Tesseract;await new Promise((res,rej)=>{const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';sc.onload=res;sc.onerror=()=>rej(new Error('Text-reading library failed to load. Check your internet and try again.'));document.head.appendChild(sc);});return window.Tesseract;}
function extractLines(data){
  const words=(data&&data.words)||[];
  if(!words.length){
    if(data&&Array.isArray(data.lines)&&data.lines.length)return data.lines.map(l=>({text:(l.text||'').trim(),bbox:l.bbox})).filter(l=>l.text&&l.bbox);
    return [];
  }
  // group words into lines by vertical centre, then split each line into tight word
  // clusters wherever a large horizontal gap separates words (label vs value rows)
  const lines=[];
  for(const w of words){const t=(w.text||'').trim();if(!t||!w.bbox)continue;const b=w.bbox,cy=(b.y0+b.y1)/2,h=b.y1-b.y0;
    let L=lines.find(l=>Math.abs(l.cy-cy)<h*0.9);
    if(!L){L={cy,items:[]};lines.push(L);}
    L.items.push({t,x0:b.x0,x1:b.x1,y0:b.y0,y1:b.y1,h});}
  const out=[];
  for(const l of lines){
    const its=l.items.sort((a,b)=>a.x0-b.x0);
    const mh=its.map(i=>i.h).sort((a,b)=>a-b)[its.length>>1]||10;
    const gapMax=Math.max(14,mh*1.1);
    let cur=null;
    for(const it of its){
      if(cur&&it.x0-cur.x1>gapMax){out.push(cur);cur=null;}
      if(!cur)cur={text:it.t,x0:it.x0,x1:it.x1,y0:it.y0,y1:it.y1};
      else{cur.text+=' '+it.t;cur.x1=it.x1;cur.y0=Math.min(cur.y0,it.y0);cur.y1=Math.max(cur.y1,it.y1);}
    }
    if(cur)out.push(cur);
  }
  return out.map(c=>({text:c.text.trim(),bbox:{x0:c.x0,y0:c.y0,x1:c.x1,y1:c.y1}})).filter(c=>c.text);
}
function drawRegions(lines){
  const o=$('regionOverlay');o.innerHTML='';
  const sx=canvas.clientWidth/canvas.width,sy=canvas.clientHeight/canvas.height,ox=canvas.offsetLeft,oy=canvas.offsetTop;
  for(const ln of lines){const b=ln.bbox,d=document.createElement('button');d.type='button';d.className='region-box';d.title='Tap to replace: '+ln.text;
    d.style.left=(ox+b.x0*sx-4)+'px';d.style.top=(oy+b.y0*sy-4)+'px';d.style.width=((b.x1-b.x0)*sx+8)+'px';d.style.height=((b.y1-b.y0)*sy+8)+'px';
    d.addEventListener('click',()=>selectRegion(ln,d));o.appendChild(d);}
}
function lumP(p){return 0.299*p[0]+0.587*p[1]+0.114*p[2];}
function medPx(arr){if(!arr.length)return[255,255,255];const ch=i=>{const v=arr.map(p=>p[i]).sort((a,b)=>a-b);return v[v.length>>1];};return[ch(0),ch(1),ch(2)];}
function sampleRegion(b){
  const pad=Math.max(4,Math.round((b.y1-b.y0)*0.4));
  const x0=Math.max(0,b.x0-pad),y0=Math.max(0,b.y0-pad),x1=Math.min(canvas.width,b.x1+pad),y1=Math.min(canvas.height,b.y1+pad);
  const d=ctx.getImageData(x0,y0,x1-x0,y1-y0).data,W=x1-x0,H=y1-y0,ix0=b.x0-x0,iy0=b.y0-y0,ix1=b.x1-x0,iy1=b.y1-y0,ring=[],inner=[];
  for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2){const i=(y*W+x)*4,p=[d[i],d[i+1],d[i+2]];if(x<ix0||x>ix1||y<iy0||y>iy1)ring.push(p);else inner.push(p);}
  const bg=medPx(ring),bgL=lumP(bg);
  inner.sort((p,q)=>Math.abs(lumP(q)-bgL)-Math.abs(lumP(p)-bgL));
  const top=inner.slice(0,Math.max(8,inner.length>>3));
  const fg=top.length?top.reduce((a,p)=>[a[0]+p[0],a[1]+p[1],a[2]+p[2]],[0,0,0]).map(v=>Math.round(v/top.length)):[0,0,0];
  const fill=inner.length? inner.filter(p=>Math.abs(lumP(p)-bgL)>60).length/inner.length : 0;
  const hex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('');
  return{bg:hex(bg),fg:hex(fg),fill};
}
function hex2rgb(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
// The on-device reader cannot recognize the rupee sign: it returns amounts as
// "900.00" (symbol dropped) or "%1,000.00" (symbol misread). For amount-shaped
// text, find a leading glyph cluster in the pixels so Replace can keep the
// original symbol instead of erasing it.
function detectPrefix(b,bg,text){
  if(!/^[^\w\s]?[\d,]+(\.\d{1,2})?$/.test((text||'').trim()))return null;
  const W=b.x1-b.x0,H=b.y1-b.y0;
  if(W<24||H<8)return null;
  const d=base.getContext('2d').getImageData(b.x0,b.y0,W,H).data;
  const bgL=lumP(hex2rgb(bg));
  const cols=new Array(W).fill(0);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(Math.abs(lumP([d[i],d[i+1],d[i+2]])-bgL)>60)cols[x]++;}
  const clusters=[];let cur=null;
  for(let x=0;x<W;x++){
    if(cols[x]>0){if(!cur)cur={s:x,e:x};else if(x-cur.e<=2)cur.e=x;else{clusters.push(cur);cur={s:x,e:x};}}
  }
  if(cur)clusters.push(cur);
  if(clusters.length<2)return null;
  const c1=clusters[0],c2=clusters[1];
  const w1=c1.e-c1.s+1,gap=c2.s-c1.e-1;
  if(w1<=Math.round(H*1.3)&&gap>=Math.max(3,Math.round(H*0.18)))return{textStart:b.x0+c2.s};
  return null;
}
function selectRegion(ln,el){
  selectedRegion=ln;document.querySelectorAll('.region-box').forEach(b=>b.classList.remove('sel'));el.classList.add('sel');
  const s=sampleRegion(ln.bbox);regionBg=s.bg;
  ln.prefix=detectPrefix(ln.bbox,s.bg,ln.text);
  $('newText').value=ln.text;$('textColor').value=s.fg;
  // weight: fill ratio cannot separate bold from regular at small sizes, so default
  // to normal; Bold stays available under More options
  if($('boldText'))$('boldText').checked = false;
  // match original visual size: solve font size so detected text width equals its pixel width
  const weight='normal', rw=Math.max(8, ln.bbox.x1-ln.bbox.x0), bh=Math.max(8, ln.bbox.y1-ln.bbox.y0);
  ctx.font=`${weight} 10px "${$('fontFamily').value}"`;
  const w10=ctx.measureText(ln.text).width||10;
  // width match, but never larger than the detected line height allows
  const size=Math.max(10,Math.min(120,Math.round(rw/w10*10),Math.round(bh*1.25)));
  $('fontSize').value=size;$('sizeValue').textContent=size;
  $('replaceGo').classList.remove('ed-hidden');$('regionCancel').classList.remove('ed-hidden');
  const q=$('quickEdit');if(q){q.classList.remove('ed-hidden');$('quickText').value=ln.text;$('quickText').focus();}
  status('Type the new words, then tap "Replace text".');
}
$('findText').addEventListener('click',async()=>{
  if(!img){status('Upload an image first.');return;}
  if(ocrBusy)return;
  ocrBusy=true;clearRegions();
  $('findText').classList.add('ed-hidden');$('ocrCancel').classList.remove('ed-hidden');
  try{
    status('Loading text reader (one-time download)...');
    const T=await loadTess();
    ocrWorker=await T.createWorker(['eng','hin'],1,{logger:m=>{if(m.status==='recognizing text')status('Reading text... '+Math.round(m.progress*100)+'%');}});
    const res=await ocrWorker.recognize(canvas);
    const lines=extractLines(res&&res.data);
    if(!lines.length){status('No text found. Try a clearer image, or use the cover tool manually.');}
    else{drawRegions(lines);status(lines.length+' text line(s) found. Tap a gold box to replace that line.');}
  }catch(e){status(e&&e.message?e.message:'Text reading failed. Try again.');}
  finally{
    if(ocrWorker){try{await ocrWorker.terminate();}catch(_){}ocrWorker=null;}
    ocrBusy=false;$('ocrCancel').classList.add('ed-hidden');$('findText').classList.remove('ed-hidden');
  }
});
$('ocrCancel').addEventListener('click',async()=>{if(ocrWorker){try{await ocrWorker.terminate();}catch(_){}ocrWorker=null;}ocrBusy=false;status('Cancelled.');$('ocrCancel').classList.add('ed-hidden');$('findText').classList.remove('ed-hidden');});
$('regionCancel').addEventListener('click',()=>{clearRegions();status('Cancelled. Tap another gold box, or save your image.');});
$('quickReplace').addEventListener('click',()=>{const v=$('quickText').value.trim();if(!v){status('Type the new words first.');return}$('newText').value=v;$('replaceGo').click();});
let lastFit='';
function applyReplace(){
  if(!selectedRegion||!img)return false;
  const qe=$('quickEdit');
  const raw=(qe&&!qe.classList.contains('ed-hidden'))?$('quickText').value:$('newText').value;
  let text=raw.trim();
  if(!text)return false;
  snapshot();
  const b=selectedRegion.bbox,pad=Math.max(2,Math.round((b.y1-b.y0)*0.15));
  const pfx=selectedRegion.prefix;
  // keep the original currency symbol: patch and measure only the number area
  const patchX=pfx?Math.max(0,pfx.textStart-pad):b.x0-pad;
  const patchW=(pfx?(b.x1-pfx.textStart):(b.x1-b.x0))+2*pad;
  const drawX=pfx?Math.max(0,pfx.textStart):Math.max(0,b.x0-pad);
  if(pfx)text=text.replace(/^[^\w\s]/,'');
  if(!text)return false;
  const weight=$('boldText')&&$('boldText').checked?'bold':'normal';
  let size=Number($('fontSize').value);lastFit='';
  const rw=(pfx?(b.x1-pfx.textStart):(b.x1-b.x0))+2*pad;
  ctx.font=`${weight} ${size}px "${$('fontFamily').value}"`;
  const tw=ctx.measureText(text).width;
  if(tw>rw){const shrunk=Math.max(10,Math.floor(size*rw/tw));if(shrunk<size){lastFit=' Replacement is longer than the original, so its size was reduced to fit the line - adjust the size control or shorten the text.';size=shrunk;}}
  const c=base.getContext('2d');c.globalAlpha=1;c.fillStyle=regionBg;c.fillRect(patchX,b.y0-pad,patchW,(b.y1-b.y0)+2*pad);
  selected={text,font:$('fontFamily').value,weight,size,color:$('textColor').value,x:drawX,y:Math.max(0,b.y0-pad+Math.round((b.y1-b.y0)*0.05))};
  items.push(selected);clearRegions();draw();
  if(pfx)lastFit=' Kept the currency symbol from your original image.'+lastFit;
  return true;
}
$('replaceGo').addEventListener('click',()=>{
  if(!selectedRegion||!img){status('Tap a gold box on the image first.');return;}
  if(applyReplace())status('Text replaced. Drag it to fine-tune, or Undo to revert.'+lastFit);
  else status('Type the replacement text first.');
});
$('resetImage').addEventListener('click',()=>{if(!img)return;const w=img.width,h=img.height,scale=Math.min(1,2400/Math.max(w,h));base=document.createElement('canvas');base.width=Math.round(w*scale);base.height=Math.round(h*scale);base.getContext('2d').drawImage(img,0,0,base.width,base.height);canvas.width=base.width;canvas.height=base.height;items=[];selected=null;history=[];clearRegions();draw();status('Image reset to original.')});})();
