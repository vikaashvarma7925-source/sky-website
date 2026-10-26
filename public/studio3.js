/* SKY Studio tools batch 3 — device-only; QR (qrcode-generator MIT), barcode (JsBarcode MIT), PDF (pdf-lib MIT), all vendored locally */
(function(){
'use strict';
var tool=document.body.getAttribute('data-tool');
function $(id){return document.getElementById(id);}
function say(el,msg,cls){el.textContent=msg;el.className='status'+(cls?' '+cls:'');}
function dl(name,blob){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);}

if(tool==='qr'){
  var st=$('qrStatus'),cv=$('qrCanvas'),outPng=null;
  $('qrGo').onclick=function(){var t=$('qrIn').value.trim();if(!t){say(st,'Type or paste something first','err');return;}
    if(t.length>500){say(st,'Too long for one QR code — keep it under 500 characters','err');return;}
    try{var q=qrcode(0,'M');q.addData(t);q.make();var n=q.getModuleCount();var cell=6,pad=4;var size=(n+pad*2)*cell;
      cv.width=size;cv.height=size;var ctx=cv.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);ctx.fillStyle='#000';
      for(var r=0;r<n;r++)for(var c=0;c<n;c++)if(q.isDark(r,c))ctx.fillRect((c+pad)*cell,(r+pad)*cell,cell,cell);
      cv.classList.remove('file-hidden');
      cv.toBlob(function(b){outPng=b;$('qrDl').classList.remove('file-hidden');say(st,'QR code ready ✓ '+n+'x'+n+' modules — test it with your camera','ok');},'image/png');
    }catch(e){say(st,'Could not make a QR code from that text','err');}};
  $('qrClear').onclick=function(){$('qrIn').value='';cv.classList.add('file-hidden');$('qrDl').classList.add('file-hidden');say(st,'','');};
  $('qrDl').onclick=function(){if(!outPng){say(st,'Make a QR code first','err');return;}dl('sky-qr.png',outPng);};
}

if(tool==='barcode'){
  var st=$('bcStatus');
  $('bcGo').onclick=function(){var t=$('bcIn').value.trim();if(!t){say(st,'Type your code text first','err');return;}
    var fmt=$('bcFmt').value;
    try{JsBarcode('#bcSvg',t,{format:fmt,lineColor:'#000',background:'#fff',width:2,height:80,displayValue:true,fontSize:16,margin:10});
      $('bcBox').classList.remove('file-hidden');$('bcDl').classList.remove('file-hidden');say(st,'Barcode ready ✓','ok');
    }catch(e){say(st,fmt==='EAN13'?'EAN-13 needs exactly 12 or 13 digits':'That text does not fit this barcode format','err');}};
  $('bcClear').onclick=function(){$('bcIn').value='';$('bcBox').classList.add('file-hidden');$('bcDl').classList.add('file-hidden');say(st,'','');};
  $('bcDl').onclick=function(){var svg=$('bcSvg');if($('bcBox').classList.contains('file-hidden')){say(st,'Make a barcode first','err');return;}
    var xml=new XMLSerializer().serializeToString(svg);var img=new Image();
    img.onload=function(){var c=document.createElement('canvas');c.width=img.width*2;c.height=img.height*2;var ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);
      c.toBlob(function(b){dl('sky-barcode.png',b);},'image/png');};
    img.onerror=function(){say(st,'Download failed in this browser','err');};
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml);};
}

if(tool==='pdfsplit'){
  var st=$('psStatus'),pdfBytes=null,pageCount=0,outPdf=null;
  $('psFile').onchange=function(){var f=this.files[0];if(!f)return;
    say(st,'Reading PDF…','');
    f.arrayBuffer().then(function(buf){pdfBytes=buf;return PDFLib.PDFDocument.load(buf);}).then(function(doc){pageCount=doc.getPageCount();$('psControls').classList.remove('file-hidden');$('psDl').classList.add('file-hidden');say(st,'Loaded ✓ '+pageCount+' pages — type the pages to keep','ok');}).catch(function(){say(st,'Could not read that PDF (encrypted or damaged?)','err');});};
  function parseRange(s,max){var out=[];s.split(',').forEach(function(part){part=part.trim();var m=part.match(/^(\d+)(?:-(\d+))?$/);if(!m)throw 0;var a=+m[1],b=m[2]?+m[2]:a;if(a<1||b>max||a>b)throw 0;for(var i=a;i<=b;i++)if(out.indexOf(i-1)<0)out.push(i-1);});return out;}
  $('psGo').onclick=function(){if(!pdfBytes){say(st,'Choose a PDF first','err');return;}
    var pages;try{pages=parseRange($('psRange').value,pageCount);}catch(e){say(st,'Page range not valid — use numbers 1 to '+pageCount+', like 1-3,5','err');return;}
    say(st,'Extracting…','');
    PDFLib.PDFDocument.load(pdfBytes.slice(0)).then(function(src){return PDFLib.PDFDocument.create().then(function(dst){return dst.copyPages(src,pages).then(function(copied){copied.forEach(function(p){dst.addPage(p);});return dst.save();});});}).then(function(bytes){outPdf=new Blob([bytes],{type:'application/pdf'});$('psDl').classList.remove('file-hidden');say(st,'Extracted ✓ '+pages.length+' page(s), '+Math.round(outPdf.size/1024)+' KB — tap Download','ok');}).catch(function(){say(st,'Extraction failed','err');});};
  $('psDl').onclick=function(){if(!outPdf){say(st,'Extract pages first','err');return;}dl('sky-pages.pdf',outPdf);};
}

if(tool==='img2pdf'){
  var st=$('ipStatus'),files=[],outPdf=null;
  $('ipFile').onchange=function(){files=Array.prototype.slice.call(this.files).filter(function(f){return /^image\/(jpeg|png)$/.test(f.type);});
    if(!files.length){say(st,'Pick JPG or PNG photos','err');return;}
    $('ipGo').classList.remove('file-hidden');$('ipDl').classList.add('file-hidden');say(st,files.length+' photo(s) ready — tap Make PDF','ok');};
  $('ipGo').onclick=function(){if(!files.length){say(st,'Choose photos first','err');return;}
    say(st,'Building PDF…','');
    PDFLib.PDFDocument.create().then(function(doc){
      var chain=Promise.resolve();
      files.forEach(function(f){chain=chain.then(function(){return f.arrayBuffer().then(function(buf){
        var embed=/png$/.test(f.type)?doc.embedPng(buf):doc.embedJpg(buf);
        return embed.then(function(img){var page=doc.addPage([img.width,img.height]);page.drawImage(img,{x:0,y:0,width:img.width,height:img.height});});});});});
      return chain.then(function(){return doc.save();});
    }).then(function(bytes){outPdf=new Blob([bytes],{type:'application/pdf'});$('ipDl').classList.remove('file-hidden');say(st,'PDF ready ✓ '+files.length+' page(s), '+Math.round(outPdf.size/1024)+' KB — tap Download','ok');}).catch(function(){say(st,'Could not build the PDF from those photos','err');});};
  $('ipDl').onclick=function(){if(!outPdf){say(st,'Make the PDF first','err');return;}dl('sky-photos.pdf',outPdf);};
}
})();
