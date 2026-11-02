var t=document.getElementById('t'),s=document.getElementById('s');
function up(){var c=SkyMini.countText(t.value),L=[['Words',c.words],['Characters',c.characters],['Characters without spaces',c.charactersNoSpaces],['Sentences',c.sentences],['Paragraphs',c.paragraphs],['Lines',c.lines]];
s.innerHTML='';L.forEach(function(x){var d=document.createElement('div'),b=document.createElement('b');b.textContent=x[1];d.appendChild(b);d.appendChild(document.createTextNode(x[0]));s.appendChild(d)})}
t.addEventListener('input',up);up();
