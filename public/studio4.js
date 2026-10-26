/* SKY Studio tools batch 4 — device-only; pdf-lib MIT vendored for rotate */
(function(){
'use strict';
var tool=document.body.getAttribute('data-tool');
function $(id){return document.getElementById(id);}
function say(el,msg,cls){el.textContent=msg;el.className='status'+(cls?' '+cls:'');}
function dl(name,blob){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);}
function loadImg(file,cb){var url=URL.createObjectURL(file);var img=new Image();img.onload=function(){cb(img);};img.onerror=function(){cb(null);};img.src=url;}

if(tool==='convert'){
  var st=$('cvStatus'),img=null,outBlob=null;
  $('cvFile').onchange=function(){var f=this.files[0];if(!f)return;if(!/^image\//.test(f.type)){say(st,'That file is not an image','err');return;}
    loadImg(f,function(im){if(!im){say(st,'Could not read that image','err');return;}img=im;$('cvControls').classList.remove('file-hidden');$('cvDl').classList.add('file-hidden');say(st,'Loaded ✓ '+im.naturalWidth+' × '+im.naturalHeight+' px — choose a format','ok');});};
  $('cvGo').onclick=function(){if(!img){say(st,'Choose a photo first','err');return;}
    var fmt=$('cvFmt').value;var c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;var ctx=c.getContext('2d');
    if(fmt==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);}
    ctx.drawImage(img,0,0);
    say(st,'Converting…','');
    c.toBlob(function(b){if(!b){say(st,'Conversion failed in this browser','err');return;}outBlob=b;$('cvDl').classList.remove('file-hidden');say(st,'Converted ✓ '+Math.round(b.size/1024)+' KB — tap Download','ok');},fmt,fmt==='image/png'?undefined:0.92);};
  $('cvDl').onclick=function(){if(!outBlob){say(st,'Convert first','err');return;}
    var ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[$('cvFmt').value];dl('sky-image.'+ext,outBlob);};
}

if(tool==='blur'){
  var st=$('blStatus'),img=null,outBlob=null;
  $('blFile').onchange=function(){var f=this.files[0];if(!f)return;if(!/^image\//.test(f.type)){say(st,'That file is not an image','err');return;}
    loadImg(f,function(im){if(!im){say(st,'Could not read that image','err');return;}img=im;$('blControls').classList.remove('file-hidden');$('blDl').classList.add('file-hidden');$('blImg').classList.add('file-hidden');say(st,'Loaded ✓ choose effect and strength','ok');});};
  $('blGo').onclick=function(){if(!img){say(st,'Choose a photo first','err');return;}
    var mode=$('blMode').value,amt=+$('blAmt').value;
    var w=img.naturalWidth,h=img.naturalHeight;
    if(Math.max(w,h)>4000){var s=4000/Math.max(w,h);w=Math.round(w*s);h=Math.round(h*s);}
    var c=document.createElement('canvas');c.width=w;c.height=h;var ctx=c.getContext('2d');
    if(mode==='blur'){var px=amt*6;ctx.filter='blur('+px+'px)';ctx.drawImage(img,0,0,w,h);ctx.filter='none';
      /* second pass sharpens edges inward so no unblurred border leaks */
      ctx.drawImage(c, -px, -px, w+px*2, h+px*2);}
    else{var blocks=amt*8;var sw=Math.max(1,Math.round(w/blocks)),sh=Math.max(1,Math.round(h/blocks));
      var t=document.createElement('canvas');t.width=sw;t.height=sh;var tc=t.getContext('2d');tc.drawImage(img,0,0,sw,sh);
      ctx.imageSmoothingEnabled=false;ctx.drawImage(t,0,0,sw,sh,0,0,w,h);}
    say(st,'Applying…','');
    c.toBlob(function(b){if(!b){say(st,'Failed in this browser','err');return;}outBlob=b;
      var p=$('blImg');if(p.src&&p.src.indexOf('blob:')===0)URL.revokeObjectURL(p.src);p.src=URL.createObjectURL(b);p.classList.remove('file-hidden');$('blDl').classList.remove('file-hidden');
      say(st,'Done ✓ '+(mode==='blur'?'blurred':'pixelated')+' — tap Download','ok');},'image/png');};
  $('blDl').onclick=function(){if(!outBlob){say(st,'Apply the effect first','err');return;}dl('sky-edited.png',outBlob);};
}

if(tool==='meta'){
  var st=$('mtStatus'),file=null,outBlob=null;
  function readExif(buf){var v=new DataView(buf);var info=[];
    if(v.getUint16(0)!==0xFFD8)return {jpeg:false,info:info};
    var off=2;while(off+4<v.byteLength){if(v.getUint8(off)!==0xFF)break;var marker=v.getUint8(off+1);var len=v.getUint16(off+2);
      if(marker===0xE1){var seg=new Uint8Array(buf,off+4,Math.min(len-2,60));var head=String.fromCharCode.apply(null,seg.slice(0,6));
        if(head.indexOf('Exif')===0){info.push('EXIF data found (camera, time, possibly GPS location)');}
        if(head.indexOf('http')===0||String.fromCharCode.apply(null,seg.slice(0,14)).indexOf('xmp')>=0){info.push('XMP data found');}}
      if(marker===0xE0){var seg2=new Uint8Array(buf,off+4,5);if(String.fromCharCode.apply(null,seg2)==='JFIF')info.push('JFIF header (basic)');}
      if(marker===0xED){info.push('IPTC/Photoshop data found');}
      if(marker===0xDA)break;off+=2+len;}
    return {jpeg:true,info:info};}
  $('mtFile').onchange=function(){var f=this.files[0];if(!f)return;if(!/^image\//.test(f.type)){say(st,'That file is not an image','err');return;}
    file=f;var box=$('mtInfo');box.classList.add('file-hidden');box.textContent='';
    f.arrayBuffer().then(function(buf){var r=readExif(buf);
      if(r.jpeg){box.classList.remove('file-hidden');box.textContent=r.info.length?('Hidden info in this photo: '+r.info.join(' · ')):'No EXIF block detected in this JPEG header.';}
      else{box.classList.remove('file-hidden');box.textContent='Not a JPEG — PNG/WebP carry little hidden data; cleaning still re-encodes fresh.';}
      $('mtGo').classList.remove('file-hidden');$('mtDl').classList.add('file-hidden');say(st,'Loaded ✓ tap Clean photo','ok');});};
  $('mtGo').onclick=function(){if(!file){say(st,'Choose a photo first','err');return;}
    loadImg(file,function(img){if(!img){say(st,'Could not read that image','err');return;}
      var c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);
      say(st,'Cleaning…','');
      c.toBlob(function(b){if(!b){say(st,'Failed in this browser','err');return;}outBlob=b;
        b.arrayBuffer().then(function(buf){var r=readExif(buf);
          $('mtDl').classList.remove('file-hidden');
          say(st,r.info.length?'Re-encoded, but some data may remain — check before sharing':'Clean ✓ no EXIF block in the new file ('+Math.round(b.size/1024)+' KB) — tap Download',r.info.length?'err':'ok');});},'image/jpeg',0.92);});};
  $('mtDl').onclick=function(){if(!outBlob){say(st,'Clean the photo first','err');return;}dl('sky-clean.jpg',outBlob);};
}

if(tool==='pdfrotate'){
  var st=$('prStatus'),pdfBytes=null,pageCount=0,outPdf=null;
  $('prFile').onchange=function(){var f=this.files[0];if(!f)return;
    say(st,'Reading PDF…','');
    f.arrayBuffer().then(function(buf){pdfBytes=buf;return PDFLib.PDFDocument.load(buf);}).then(function(doc){pageCount=doc.getPageCount();$('prControls').classList.remove('file-hidden');$('prDl').classList.add('file-hidden');say(st,'Loaded ✓ '+pageCount+' pages — choose the turn','ok');}).catch(function(){say(st,'Could not read that PDF (encrypted or damaged?)','err');});};
  $('prGo').onclick=function(){if(!pdfBytes){say(st,'Choose a PDF first','err');return;}
    var angle=+$('prAngle').value;say(st,'Rotating…','');
    PDFLib.PDFDocument.load(pdfBytes.slice(0)).then(function(doc){
      doc.getPages().forEach(function(p){var cur=p.getRotation().angle;p.setRotation(PDFLib.degrees((cur+angle)%360));});
      return doc.save();}).then(function(bytes){outPdf=new Blob([bytes],{type:'application/pdf'});$('prDl').classList.remove('file-hidden');say(st,'Rotated ✓ '+pageCount+' page(s) by '+angle+'° — tap Download','ok');}).catch(function(){say(st,'Rotation failed','err');});};
  $('prDl').onclick=function(){if(!outPdf){say(st,'Rotate first','err');return;}dl('sky-rotated.pdf',outPdf);};
}
})();
