/* SKY PDF Compress — rasterize pages via pdfjs 6.4.299 (Apache-2.0, render-only, no viewer sandbox), rebuild via pdf-lib (MIT). Honest tradeoff: output pages are images. */
import * as pdfjsLib from './vendor/pdf.min.mjs';
(function(){
'use strict';
if(document.body.getAttribute('data-tool')!=='pdfcompress')return;
function $(id){return document.getElementById(id);}
function say(el,msg,cls){el.textContent=msg;el.className='status'+(cls?' '+cls:'');}
var st=$('pcStatus'),file=null,outPdf=null;
pdfjsLib.GlobalWorkerOptions.workerSrc='vendor/pdf.worker.min.mjs';
$('pcFile').onchange=function(){var f=this.files[0];if(!f)return;
  file=f;$('pcGo').classList.remove('file-hidden');$('pcDl').classList.add('file-hidden');
  say(st,'Ready: '+f.name+' ('+Math.round(f.size/1024)+' KB) — tap Compress','ok');};

function pageToJpeg(doc,i,out){
  return doc.getPage(i).then(function(page){
    var base=page.getViewport({scale:1});
    var scale=Math.min(1.6,1300/Math.max(base.width,base.height));if(scale<0.7)scale=0.7;
    var vp=page.getViewport({scale:scale});
    var c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;
    var ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);
    return page.render({canvasContext:ctx,viewport:vp}).promise.then(function(){
      return new Promise(function(res,rej){
        c.toBlob(function(b){
          if(!b||!b.size){rej(new Error('empty image on page '+i));return;}
          b.arrayBuffer().then(function(ab){
            return out.embedJpg(ab).then(function(img){
              var pg=out.addPage([base.width,base.height]);
              pg.drawImage(img,{x:0,y:0,width:base.width,height:base.height});
              say(st,'Compressing page '+(i)+' of '+doc.numPages+' done','');
              res();
            }).catch(rej);
          }).catch(rej);
        },'image/jpeg',0.6);
      });
    });
  });
}

$('pcGo').onclick=function(){
  if(!file){say(st,'Choose a PDF first','err');return;}
  say(st,'Reading PDF…','');
  file.arrayBuffer().then(function(buf){
    return pdfjsLib.getDocument({data:buf}).promise;
  }).then(function(doc){
    var n=doc.numPages;
    if(n>30){say(st,'This PDF has '+n+' pages — keep it to 30 pages on phone','err');return null;}
    return PDFLib.PDFDocument.create().then(function(out){
      var chain=Promise.resolve();
      for(var i=1;i<=n;i++){(function(idx){chain=chain.then(function(){return pageToJpeg(doc,idx,out);});})(i);}
      return chain.then(function(){return out.save();});
    });
  }).then(function(bytes){
    if(!bytes)return;
    outPdf=new Blob([bytes],{type:'application/pdf'});
    var before=file.size,after=outPdf.size;
    if(after>=before){
      say(st,'Could not make it smaller ('+Math.round(before/1024)+' KB → '+Math.round(after/1024)+' KB). This PDF is likely text-based; compression works on photo-heavy PDFs.','err');
      $('pcDl').classList.add('file-hidden');
    }else{
      var pct=Math.round((1-after/before)*100);
      $('pcDl').classList.remove('file-hidden');
      say(st,'Smaller ✓ '+Math.round(before/1024)+' KB → '+Math.round(after/1024)+' KB (−'+pct+'%) — tap Download','ok');
    }
  }).catch(function(e){
    say(st,'Could not compress that PDF','err');
  });
};
$('pcDl').onclick=function(){if(!outPdf){say(st,'Compress first','err');return;}
  var a=document.createElement('a');a.href=URL.createObjectURL(outPdf);a.download='sky-smaller.pdf';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);};
})();
