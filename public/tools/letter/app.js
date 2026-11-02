var store={},prevTp='leave';
var $=function(i){return document.getElementById(i)},ok=false,edited=false,BL='____________';
var T={
 leave:{en:{n:'Leave application',s:'Application for leave',a:'Leave from (date)',b:'Leave to (date)',c:'Reason',ea:'e.g. 12 November 2026',eb:'e.g. 14 November 2026',ec:'e.g. a family function',t:'I respectfully state that I need leave from {a} to {b} because of {c}. I request you to kindly grant me leave for this period.\n\nI will be thankful to you.'},
        hi:{n:'Leave application (Hindi)',s:'अवकाश के लिए प्रार्थना पत्र',a:'Leave from (date)',b:'Leave to (date)',c:'Reason (in Hindi)',ea:'e.g. 12 नवंबर 2026',eb:'e.g. 14 नवंबर 2026',ec:'e.g. पारिवारिक कार्यक्रम',t:'सविनय निवेदन है कि मुझे {c} के कारण {a} से {b} तक अवकाश की आवश्यकता है। कृपया मुझे इस अवधि के लिए अवकाश प्रदान करने की कृपा करें।\n\nमैं आपका आभारी {रहूँगा|रहूँगी}।'}},
 job:{en:{n:'Job application',s:'Application for the post of {a}',a:'Post you are applying for',b:'Your qualification',c:'Your experience (short)',ea:'e.g. Sales Executive',eb:'e.g. 12th pass',ec:'e.g. 2 years in a mobile shop',t:'I am writing to apply for the post of {a} in your organisation. My qualification is {b}. My experience: {c}.\n\nI request you to consider my application and give me a chance to meet you. I will work with honesty and full effort.'},
      hi:{n:'Job application (Hindi)',s:'{a} पद के लिए आवेदन',a:'Post you are applying for (in Hindi)',b:'Your qualification (in Hindi)',c:'Your experience (in Hindi, short)',ea:'e.g. सेल्समैन',eb:'e.g. बारहवीं पास',ec:'e.g. मोबाइल दुकान में 2 साल का काम',t:'सविनय निवेदन है कि मैं आपके संस्थान में {a} पद के लिए आवेदन करना {चाहता|चाहती} हूँ। मेरी योग्यता {b} है। मेरा अनुभव: {c}।\n\nकृपया मेरे आवेदन पर विचार करें और मुझे मिलने का अवसर दें। मैं ईमानदारी और पूरी मेहनत से कार्य {करूँगा|करूँगी}।'}},
 complaint:{en:{n:'Complaint letter',s:'Complaint about {a}',a:'What the complaint is about',b:'Date it happened',c:'What you want done',ea:'e.g. street light not working near my house',eb:'e.g. 20 October 2026',ec:'e.g. repair it as soon as possible',t:'I want to bring to your notice a problem: {a}. It happened on {b}. I request you to look into this matter and {c}.\n\nI will be thankful for your quick action.'},
      hi:{n:'Complaint letter (Hindi)',s:'{a} के संबंध में शिकायत',a:'What the complaint is about (in Hindi)',b:'Date it happened',c:'What you want done (in Hindi)',ea:'e.g. घर के पास की स्ट्रीट लाइट खराब है',eb:'e.g. 20 अक्टूबर 2026',ec:'e.g. उसे जल्दी ठीक करवाएँ',t:'मैं आपका ध्यान इस समस्या की ओर दिलाना {चाहता|चाहती} हूँ: {a}। यह {b} को हुई। कृपया इस विषय पर ध्यान दें और {c}।\n\nआपकी शीघ्र कार्यवाही के लिए मैं आभारी {रहूँगा|रहूँगी}।'}},
 fee:{en:{n:'Fee request (time or concession)',s:'Request about school or course fee',a:'Student name',b:'Class or course',c:'What you request and why',ea:'e.g. Rahul Verma',eb:'e.g. Class 10',ec:'e.g. Please allow us to pay the fee in two parts because of money difficulty at home',t:'I am writing about the fee of {a}, who studies in {b}. {c}.\n\nI request you to kindly consider this request. I will be thankful to you.'},
      hi:{n:'Fee request (Hindi)',s:'शुल्क के संबंध में निवेदन',a:'Student name (in Hindi)',b:'Class or course (in Hindi)',c:'What you request and why (in Hindi)',ea:'e.g. राहुल वर्मा',eb:'e.g. कक्षा 10',ec:'e.g. घर की आर्थिक स्थिति के कारण शुल्क दो किस्तों में जमा करने की अनुमति दें',t:'सविनय निवेदन है कि {a}, जो {b} में अध्ययनरत है, के शुल्क के संबंध में मेरा निवेदन है। {c}।\n\nकृपया इस निवेदन पर विचार करें। मैं आपका आभारी {रहूँगा|रहूँगी}।'}},
 plain:{en:{n:'Blank letter (write your own text)',s:'',a:'',b:'',c:'',t:''},hi:{n:'Blank letter (write your own text)',s:'',a:'',b:'',c:'',t:''}}};
var W={en:{to:'To,',sub:'Subject: ',sal:'Respected Sir/Madam,',cl:'Yours faithfully,',dt:'Date: ',pl:'Place: '},hi:{to:'सेवा में,',sub:'विषय: ',sal:'महोदय/महोदया,',cl:'भवदीय,',dt:'दिनांक: ',pl:'स्थान: '}};
var order=['leave','job','complaint','fee','plain'];
function lang(){return document.querySelector('input[name=lg]:checked').value}
function cur(){return T[$('tp').value][lang()]}
function gen(s){var g=$('gn').value;return s.replace(/\{([^{}|]+)\|([^{}|]+)\}/g,function(m,x,y){return g==='m'?x:g==='f'?y:x+'/'+y})}
function fv(k){return $(k).value.trim().replace(/[\s.,;:!\u0964]+$/,'')||BL}
function fill(s){return gen(s).replace(/\{([abc])\}/g,function(m,k){return fv('f'+k)})}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function labels(){var c=cur();[['la','a'],['lb','b'],['lc','c']].forEach(function(p){var l=$(p[0]),i=$('f'+p[1]);l.textContent=c[p[1]];l.hidden=i.hidden=!c[p[1]];i.placeholder=c['e'+p[1]]||''});$('gnw').hidden=lang()!=='hi'}
function opts(){var s=$('tp'),v=s.value;s.innerHTML='';order.forEach(function(k){var o=document.createElement('option');o.value=k;o.textContent=T[k][lang()].n;s.appendChild(o)});if(v)s.value=v}
function note(t){var n=$('nt');n.hidden=!t;n.textContent=t||''}
function reset(){var c=cur();$('bd').value=fill(c.t);$('sj').value=fill(c.s);edited=false;note('')}
function swapFields(){var t=$('tp').value;if(t===prevTp)return;store[prevTp]=['fa','fb','fc'].map(function(k){return $(k).value});var n=store[t]||['','',''];['fa','fb','fc'].forEach(function(k,i){$(k).value=n[i]});prevTp=t}
var S={},pk='leave|en';
function key(){return $('tp').value+'|'+lang()}
function change(){swapFields();labels();var k=key();
 if(k!==pk){S[pk]={bd:$('bd').value,sj:$('sj').value,ed:edited};var o=S[k];
  if(o&&o.ed){$('bd').value=o.bd;$('sj').value=o.sj;edited=true;note('Your edited text for this letter type and language was restored. Your edited text for the previous one is kept and comes back when you switch back. Press "Reset text" to rebuild this one from the boxes (replaces its edits).')}
  else{reset();if(S[pk]&&S[pk].ed)note('Your edited text for the previous letter type or language is kept and comes back when you switch back.')}
  pk=k}
 else if(edited)note('Gender choice changes only text made from the boxes. Your edited text was kept; edit the wording yourself or press "Reset text" (replaces your changes).');
 else reset();
 render()}
function render(){var sh=$('sheet'),st=$('st'),w=W[lang()];sh.innerHTML='';
 var nm=$('nm').value.trim(),bd=$('bd').value.trim(),to=$('to').value.trim();
 if(!nm||!bd||!to){ok=false;$('pr').disabled=true;st.hidden=false;st.className='msg err';st.textContent='Fill "To", the letter text and your name to see the letter.';return}
 var blanks=($('bd').value+$('sj').value).indexOf(BL)>=0;
 ok=true;$('pr').disabled=false;if(blanks){st.hidden=false;st.className='msg';st.textContent='Some blanks (____) are still in the letter. Fill the boxes above, or you can write on the printed paper by hand.'}else st.hidden=true;
 var ad=$('ad').value.trim(),dt=$('dt').value.trim(),pl=$('pl').value.trim();
 if(ad||dt){sh.appendChild(el('p','lt-r',(ad?ad+'\n':'')+(dt?w.dt+dt:'')))}
 sh.appendChild(el('p',null,w.to+'\n'+to));
 var sj=$('sj').value.trim();if(sj)sh.appendChild(el('p','lt-s',w.sub+sj));
 sh.appendChild(el('p',null,w.sal));sh.appendChild(el('p',null,bd));
 var sg=el('p','lt-sig',w.cl+'\n\n'+nm+(pl?'\n'+w.pl+pl:''));sh.appendChild(sg)}
function auto(){if(!edited){var c=cur();$('bd').value=fill(c.t);$('sj').value=fill(c.s)}else note('You changed the letter text yourself, so these boxes do not change it any more. Press "Reset text" to fill the text from the boxes again (this replaces your changes).');render()}
$('tp').onchange=change;$('gn').onchange=change;
document.querySelectorAll('input[name=lg]').forEach(function(r){r.onchange=function(){opts();change()}});
['fa','fb','fc'].forEach(function(k){$(k).addEventListener('input',auto)});
$('bd').addEventListener('input',function(){edited=true;render()});$('sj').addEventListener('input',function(){edited=true;render()});
['to','nm','ad','dt','pl'].forEach(function(k){$(k).addEventListener('input',render)});
$('rs').onclick=function(){reset();render()};
$('pr').onclick=function(){if(ok)window.print()};
opts();$('tp').value='leave';reset();labels();render();
