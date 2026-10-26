/* SKY money tools + homepage tool finder. All math on-device. */
(function(){
'use strict';
var tool=document.body.getAttribute('data-tool');
function $(id){return document.getElementById(id);}
function inr(n){return '₹'+n.toLocaleString('en-IN',{maximumFractionDigits:2,minimumFractionDigits:0});}
if(tool==='gst'){
  function calc(mode){
    var amt=parseFloat($('gstAmt').value), rate;
    if($('gstRate').value==='custom'){rate=parseFloat($('gstCustom').value); if(!(rate>=0)){$('gstOut').value='Type your custom GST rate %.';return;}}
    else{rate=parseFloat($('gstRate').value);}
    if(!(amt>0)){$('gstOut').value='Type an amount first.';return;}
    var base,gst,total;
    if(mode==='add'){base=amt;gst=amt*rate/100;total=amt+gst;}
    else{total=amt;base=amt/(1+rate/100);gst=total-base;}
    $('gstOut').value='Base amount: '+inr(base)+'\nGST @ '+rate+'%: '+inr(gst)+'\nFinal price: '+inr(total);
  }
  $('gstRate').onchange=function(){var c=this.value==='custom';$('gstCustomRow').classList.toggle('file-hidden',!c);$('gstOut').value='';};
  $('gstAdd').onclick=function(){calc('add');};
  $('gstRem').onclick=function(){calc('rem');};
}
if(tool==='emi'){
  $('emiGo').onclick=function(){
    var P=parseFloat($('emiP').value), annual=parseFloat($('emiR').value), years=parseFloat($('emiY').value);
    if(!(P>0)||isNaN(annual)||annual<0||!(years>0)){$('emiOut').value='Fill all three: loan amount, interest rate and years.';return;}
    var n=Math.round(years*12); if(n<1)n=1;
    var r=annual/1200, emi;
    if(r===0){emi=P/n;}else{var f=Math.pow(1+r,n); emi=P*r*f/(f-1);}
    var total=emi*n, interest=total-P;
    $('emiOut').value='EMI per month: '+inr(Math.round(emi))+'\nTotal interest: '+inr(Math.round(interest))+'\nTotal payment: '+inr(Math.round(total))+'\n('+n+' monthly payments)';
  };
}
/* Homepage tool finder (runs only where the search box exists) */
var box=$('toolSearch');
if(box){
  var cards=[].slice.call(document.querySelectorAll('.tool-card'));
  var sections=[].slice.call(document.querySelectorAll('.tools-section')).filter(function(s){return s.querySelector('.tools-grid');});
  var msg=$('toolSearchMsg');
  var aliases={tasveer:'photo image',tasvir:'photo image',chhota:'resize compress size',chota:'resize compress size',jodna:'merge join pdf',jodo:'merge join pdf',likha:'text ocr word case',likhai:'text ocr word',paisa:'money gst emi loan',paise:'money gst emi loan',karz:'emi loan',karza:'emi loan',byaj:'emi interest loan',tax:'gst'};
  function apply(){
    var q=box.value.trim().toLowerCase(), shown=0;
    var terms=q?[q]:[];
    if(q&&aliases[q]){terms=terms.concat(aliases[q].split(' '));}
    cards.forEach(function(c){
      var hay=c.textContent.toLowerCase();
      var ok=!q||terms.some(function(t){return hay.indexOf(t)>=0;});
      c.style.display=ok?'':'none'; if(ok)shown++;
    });
    sections.forEach(function(s){
      var any=[].slice.call(s.querySelectorAll('.tool-card')).some(function(c){return c.style.display!=='none';});
      s.style.display=any?'':'none';
    });
    if(!q){msg.textContent='';}
    else if(shown===0){msg.textContent='No tool matches "'+box.value.trim()+'". Try: photo, pdf, qr, money, text.';}
    else{msg.textContent=shown+' tool'+(shown>1?'s':'')+' found. Scroll down.';}
  }
  box.addEventListener('input',apply);
}
})();
