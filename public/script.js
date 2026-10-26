const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
$("#year").textContent = new Date().getFullYear();

const menuToggle = $("#menuToggle");
const nav = $("#nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
$$('#nav a').forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open"); menuToggle.setAttribute("aria-expanded","false");
}));

let currentMode = "chat";
function modeInfo() { return STR[currentLang].modes; }
const WELCOME = {
  chat: "I’m SKY. Ask me anything, any topic. Real AI answers with a free daily limit.",
  image: "Describe any image you want - SKY will draw it here. Free daily limit applies."
};
function setMode(mode) {
  const info = modeInfo();
  if (!info[mode]) return;
  currentMode = mode;
  const wt = document.getElementById("welcomeText");
  if (wt && !document.querySelector(".user-message") && WELCOME[mode]) wt.textContent = WELCOME[mode];
  $$(".mode-btn").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  $("#modeTitle").textContent = info[mode][0];
  $("#modeSubtitle").textContent = info[mode][1];
  $("#promptInput").placeholder = info[mode][2];
  const sugBox = $("#suggestions");
  if (sugBox) sugBox.innerHTML = info[mode][3].map(s => `<button type="button">${s}</button>`).join("");
  bindSuggestions();
}
$$(".mode-btn").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
$$("[data-mode]").filter(el => !el.classList.contains("mode-btn")).forEach(el => {
  el.addEventListener("click", () => setMode(el.dataset.mode));
});

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function addMessage(text, who="sky", isHTML=false) {
  const row = document.createElement("div");
  row.className = `message ${who === "user" ? "user-message" : "sky-message"}`;
  const safe = isHTML ? text : escapeHTML(text).replace(/\n/g,"<br>");
  row.innerHTML = `${who === "user" ? "" : '<div class="message-avatar">S</div>'}<div class="bubble">${who==="sky" ? "<b>SKY</b>" : "<b>You</b>"}<p>${safe}</p><span class="message-time">${who==="sky" ? "SKY" : "YOU"} · JUST NOW</span></div>${who === "user" ? '<div class="message-avatar">✦</div>' : ""}`;
  if (who === "sky") {
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "copy-btn";
    copyBtn.textContent = STR[currentLang].copy;
    copyBtn.addEventListener("click", async () => {
      let okCopy = false;
      try {
        await navigator.clipboard.writeText(text);
        okCopy = true;
      } catch (e) {
        try {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          ta.setSelectionRange(0, ta.value.length);
          okCopy = document.execCommand("copy");
          ta.remove();
        } catch (e2) { okCopy = false; }
      }
      copyBtn.textContent = okCopy ? STR[currentLang].copied : STR[currentLang].copyFail;
      window.setTimeout(() => { copyBtn.textContent = STR[currentLang].copy; }, 1500);
    });
    row.querySelector(".bubble").appendChild(copyBtn);
  }
  $("#messages").appendChild(row);
  trimMessageDom();
  $("#messages").scrollTop = $("#messages").scrollHeight;
}
let convo = [];
function addImageMessage(src) {
  const row = document.createElement("div");
  row.className = "message sky-message";
  row.innerHTML = '<div class="message-avatar">S</div><div class="bubble"><b>SKY</b><img class="sky-image" src="' + src + '" alt="AI generated image"><a class="img-download" href="' + src + '" download="sky-image.jpg">' + STR[currentLang].download + '</a><span class="message-time">SKY · JUST NOW</span></div>';
  $("#messages").appendChild(row);
  $("#messages").scrollTop = $("#messages").scrollHeight;
}
function showThinking(text) {
  const thinking = document.createElement("div");
  thinking.className = "message sky-message";
  thinking.innerHTML = '<div class="message-avatar">S</div><div class="bubble"><b>' + text + '</b></div>';
  $("#messages").appendChild(thinking);
  $("#messages").scrollTop = $("#messages").scrollHeight;
  return thinking;
}
let skySending = false;
function setSendingState(on) {
  skySending = on;
  const btn = $("#chatForm .send-button");
  if (btn) { btn.disabled = on; btn.style.opacity = on ? "0.45" : ""; }
}
function fetchWithTimeout(url, options, ms) {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), ms);
  return fetch(url, {...options, signal: ctrl.signal}).finally(() => window.clearTimeout(timer));
}
function trimMessageDom() {
  const box = $("#messages");
  while (box.children.length > 60) box.removeChild(box.firstChild);
}
$("#chatForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (skySending) return;
  const input = $("#promptInput");
  const prompt = input.value.trim();
  if (!prompt) return;
  addMessage(prompt, "user");
  trimMessageDom();
  $("#suggestions")?.remove();
  input.value = "";
  setSendingState(true);
  const myEpoch = chatEpoch;
  if (currentMode === "image") {
    const thinking = showThinking("SKY is creating your photo…");
    try {
      const res = await fetchWithTimeout("/api/image", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({prompt})}, 120000);
      const data = await res.json().catch(() => ({}));
      thinking.remove();
      if (myEpoch !== chatEpoch) { setSendingState(false); return; }
      if (data.image) addImageMessage(data.image);
      else addMessage(data.reply || "Could not create the photo. Please try again in a bit.");
    } catch (e) {
      thinking.remove();
      input.value = prompt;
      addMessage(e && e.name === "AbortError" ? "Creating the photo took too long. Please try again." : "Could not connect. Check your internet and try again.");
    }
    setSendingState(false);
    return;
  }
  const thinking = showThinking("SKY is thinking…");
  try {
    const res = await fetchWithTimeout("/api/chat", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({message: prompt, mode: currentMode, history: convo.slice(-10)})}, 60000);
    const data = await res.json().catch(() => ({}));
    thinking.remove();
    if (myEpoch !== chatEpoch) { setSendingState(false); return; }
    const reply = data.reply || "SKY could not answer right now. Please try again in a bit.";
    addMessage(reply);
    convo.push({role:"user", content:prompt}, {role:"assistant", content:reply});
    if (convo.length > 20) convo = convo.slice(-20);
  } catch (e) {
    thinking.remove();
    input.value = prompt;
    addMessage(e && e.name === "AbortError" ? "The reply took too long. Please try again." : "Could not connect. Check your internet and try again.");
  }
  setSendingState(false);
});
function bindSuggestions() {
  if (!$("#suggestions")) return;
  $$("#suggestions button").forEach(button => button.addEventListener("click", () => {
    $("#promptInput").value = button.textContent;
    $("#chatForm").requestSubmit();
  }));
}
bindSuggestions();
let chatEpoch = 0;
$("#clearChat").addEventListener("click", () => {
  chatEpoch++;
  convo = [];
  $("#messages").innerHTML = "";
  const welcome = document.createElement("div");
  welcome.className = "message sky-message";
  welcome.innerHTML = '<div class="message-avatar">S</div><div class="bubble"><b>Conversation cleared.</b><p>What would you like to explore next?</p><span class="message-time">SKY · NOW</span></div>';
  $("#messages").appendChild(welcome);
});

let recognition = null;
function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    $("#voiceStatus").textContent = "Speech recognition isn't supported in this browser. Try a recent version of Chrome.";
    return;
  }
  if (recognition) { recognition.stop(); recognition = null; }
  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  $("#voiceStatus").textContent = "Listening… speak now (microphone permission may be required).";
  $("#voiceButton").textContent = "●";
  recognition.onresult = event => {
    $("#promptInput").value = event.results[0][0].transcript;
    $("#voiceStatus").textContent = "Voice captured. Press send to submit your message.";
    $("#promptInput").focus();
  };
  recognition.onerror = event => {
    const status = $("#voiceStatus");
    if (event.error === "aborted") { status.textContent = "Voice input stopped. You can type your message instead."; return; }
    if (event.error === "no-speech") { status.textContent = "Could not hear anything. Try again, or type your message."; return; }
    if (event.error === "not-allowed" || event.error === "service-not-allowed") { status.textContent = "Microphone permission was not granted. You can type your message instead."; return; }
    if (event.error === "network") { status.textContent = "Voice service unreachable right now. You can type your message instead."; return; }
    status.textContent = "Voice input did not work this time. You can type your message instead.";
  };
  recognition.onend = () => { $("#voiceButton").textContent = "♩"; recognition = null; };
  recognition.start();
}
$("#voiceButton").addEventListener("click", startVoice);
$("#voiceCta").addEventListener("click", () => {
  document.querySelector("#assistant").scrollIntoView({behavior:"smooth", block:"start"});
  window.setTimeout(startVoice, 450);
});

/* ============ Hindi / English ============ */
const STR = {
  en: {
    copy: "Copy", copied: "Copied", copyFail: "Copy failed",
    download: "\u2b07 Download",
    modes: {
      chat: ["SKY Assistant", "Your ideas start here", "Ask SKY anything...", ["Help me plan a website", "Explain a complex topic simply", "Give me 5 creative ideas"]],
      research: ["Discussion Desk", "Talk through any topic", "What topic should we discuss?", ["Discuss renewable energy", "Compare 3 learning methods", "Questions to explore a topic"]],
      create: ["Creative Studio", "Make your next idea real", "What would you like to create?", ["Write a launch announcement", "Brainstorm app names", "Draft a story outline"]],
      automate: ["Planning Desk", "Turn tasks into simple steps", "Describe a task you want to plan...", ["Plan my study routine", "Break a big task into steps", "Plan a weekly workflow"]],
      image: ["Image Studio", "Describe it, SKY draws it", "Describe an image you want...", ["A golden crown on purple silk", "A cyberpunk auto-rickshaw at night", "A logo for a chai brand"]]
    },
    i18n: {
      "nav.cap": "Modes", "nav.studio": "AI Studio", "nav.photo": "Photo Tools", "nav.pdf": "PDF Tools", "nav.about": "About",
      "hero.eyebrow": "THE NEXT ERA OF INTELLIGENCE", "hero.h1a": "Your intelligence.", "hero.h1b": "Your empire.",
      "hero.text": "Meet SKY \u2014 chat with a real AI, create images from words, and use free photo, PDF and everyday tools. One powerful space.",
      "hero.enter": "Enter SKY Studio", "hero.explore": "Explore capabilities", "hero.trust": "Built for curious minds and bold ideas", "hero.scroll": "SCROLL TO DISCOVER",
      "about.kicker": "A NEW KIND OF WORKSPACE", "about.h2": "Powerful tools. <span>One universe.</span>",
      "about.p": "From a first question to your next big idea, SKY brings your workflow into one beautifully focused space.",
      "f1.h": "Chat", "f1.p": "Explore ideas, get explanations, and work through questions in a text conversation.", "f1.l": "Start a conversation",
      "f2.h": "Discuss", "f2.p": "Chat through a topic and get clear points, key questions, and next steps for your own research.", "f2.l": "Explore research",
      "f3.h": "Creative Studio", "f3.p": "Shape rough thoughts into content ideas, outlines, prompts, and polished first drafts.", "f3.l": "Make something",
      "f4.h": "Plan", "f4.p": "Chat through a repetitive task and get step-by-step ideas you can try yourself.", "f4.l": "Plan a workflow",
      "st.kicker": "YOUR COMMAND CENTER", "st.h2": "Welcome to <span>SKY Studio</span>", "st.live": "LIVE AI", "st.ws": "WORKSPACE",
      "st.chat": "Chat", "st.research": "Talk", "st.create": "Make", "st.image": "Image", "st.plan": "Plan", "ui.open": "Open",
      "st.guest": "Guest explorer", "st.free": "Free daily limit", "st.warn": "Never share your Aadhaar number, OTP, password or bank details in chat. Chat and image text goes to an AI service to create answers; the Photo and PDF tools run only on your device.",
      "vb.kicker": "SPEAK YOUR MIND", "vb.h2": "Ideas move at <span>the speed of voice.</span>",
      "vb.p": "Use your device\u2019s speech recognition where supported. Your browser may ask for microphone permission.", "vb.btn": "Try voice input",
      "cta.kicker": "YOUR NEXT CHAPTER STARTS HERE", "cta.h2": "Build something <span>extraordinary.</span>", "cta.p": "Step into your personal intelligence universe.",
      "nav.guide": "Guide", "gd.kicker": "GUIDES", "gd.h2": "Document guides. <span>The official way, simplified.</span>", "gd.note": "These guides only show you the way. Applications always happen on the official portal; this website does not issue any document. Fees and rules can change - this information was checked against official sources on 25 October 2026. Always re-check the current details on the relevant official site before applying.", "pt.kicker": "DEVICE-ONLY TOOLS", "pt.h2": "Photo tools. <span>Your files stay on your device.</span>",
      "pt.note": "Everything here runs inside your browser. No photo is uploaded to any server. For government forms, always check that form\u2019s exact size and format rules first.",
      "pt.c1num": "PHOTO / SIZE", "pt.c1h": "Compress to target KB", "pt.c1p": "Shrink a JPG/PNG photo to a target file size, like 50KB for online forms.",
      "pt.c1file": "Choose photo", "pt.c1kb": "Target KB", "pt.c1dim": "Max size (px)", "pt.c1go": "Compress",
      "pt.c2num": "PHOTO / ID", "pt.c2h": "Passport-size photo", "pt.c2p": "Crop any photo to a standard ID size. Check the exact size your form asks for.",
      "pt.c2file": "Choose photo", "pt.c2size": "Size", "pt.c2zoom": "Zoom", "pt.c2hint": "Drag the photo to position the face inside the frame.", "pt.c2go": "Download photo",
      "pd.kicker": "DEVICE-ONLY TOOLS", "pd.h2": "PDF tools. <span>Your files stay on your device.</span>",
      "pd.note": "PDFs are processed in your browser and never uploaded. Password removal works only on your own PDF when you know its password - it is not a cracker. The unlocked copy is image-based: its text is no longer selectable, and form fields, digital signatures and annotations are lost. Your original file stays unchanged.",
      "pd.c1num": "PDF / MERGE", "pd.c1h": "Merge PDFs", "pd.c1p": "Combine two or more PDF files into one, in the order you select them.",
      "pd.c1file": "Choose PDF files", "pd.c1go": "Merge & download",
      "pd.c2num": "PDF / UNLOCK", "pd.c2h": "Remove PDF password", "pd.c2p": "For your own PDF only. Enter the password you know; get an unlocked copy.",
      "pd.c2file": "Choose PDF", "pd.c2pass": "Password", "pd.c2go": "Unlock & download"
    }
  },
};
let currentLang = "en";
function applyLang() {
  const dict = STR[currentLang].i18n;
  $$("[data-i18n]").forEach(el => { if (dict[el.dataset.i18n]) el.textContent = dict[el.dataset.i18n]; });
  $$("[data-i18n-html]").forEach(el => { if (dict[el.dataset.i18nHtml]) el.innerHTML = dict[el.dataset.i18nHtml]; });
  const info = modeInfo();
  if (info[currentMode]) {
    $("#modeTitle").textContent = info[currentMode][0];
    $("#modeSubtitle").textContent = info[currentMode][1];
    $("#promptInput").placeholder = info[currentMode][2];
  }
  $("#voiceStatus").textContent = currentLang === "en"
    ? "SKY AI assistant \u00b7 Chat + image generation \u00b7 Free daily limits apply"
    : "SKY AI \u00b7 \u091a\u0948\u091f + \u0907\u092e\u0947\u091c \u00b7 \u0930\u094b\u091c\u093c \u0915\u0940 \u092e\u0941\u092b\u093c\u094d\u0924 \u0938\u0940\u092e\u093e \u0932\u093e\u0917\u0942";
  const sugBox = $("#suggestions");
  if (sugBox && info[currentMode]) {
    sugBox.innerHTML = info[currentMode][3].map(s => `<button type="button">${s}</button>`).join("");
    bindSuggestions();
  }
  document.documentElement.lang = currentLang === "hi" ? "hi" : "en";
}
applyLang();

/* ============ Shared file helpers ============ */
function readAsImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { img._blobUrl = url; resolve(img); }; // keep URL alive while img in use; caller revokes on replace/dispose
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
    img.src = url;
  });
}
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function fmtKB(bytes) { return (bytes / 1024).toFixed(1) + " KB"; }
function setOut(el, msg, ok) {
  el.textContent = msg;
  el.classList.toggle("ok", ok === true);
  el.classList.toggle("err", ok === false);
}

/* ============ Photo tool: compress to KB ============ */
let cmpLastUrl = null;
let cmpFileObj = null;
$("#cmpFile").addEventListener("change", event => {
  const f = event.target.files[0];
  if (f) cmpFileObj = f;
  const lbl = $("#cmpFileLabel");
  if (f && lbl) lbl.textContent = "Change: " + (f.name.length > 22 ? f.name.slice(0, 20) + "..." : f.name);
  event.target.value = ""; // same file dobara select karne par bhi change fire ho
});
$("#cmpGo").addEventListener("click", async () => {
  const out = $("#cmpOut");
  const file = cmpFileObj || $("#cmpFile").files[0];
  if (!file) { setOut(out, "Choose a photo first.", false); return; }
  const targetKB = Math.max(10, Math.min(2000, parseInt($("#cmpKB").value, 10) || 50));
  const maxDim = Math.max(200, Math.min(4000, parseInt($("#cmpDim").value, 10) || 1200));
  try {
    const img = await readAsImage(file);
    let w = Math.min(img.naturalWidth, maxDim);
    let h = Math.round(w * img.naturalHeight / img.naturalWidth);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let blob = null;
    outer:
    for (let scale = 1; scale >= 0.25; scale *= 0.85) {
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      for (let q = 0.9; q >= 0.3; q -= 0.1) {
        blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", q));
        if (blob && blob.size <= targetKB * 1024) break outer;
      }
    }
    if (!blob) { setOut(out, "Could not compress. Try a different photo.", false); return; }
    downloadBlob(blob, "sky-compressed.jpg");
    if (img._blobUrl) { try { URL.revokeObjectURL(img._blobUrl); } catch (_) {} }
    setOut(out, "Done: " + fmtKB(blob.size) + " (" + canvas.width + "x" + canvas.height + "). Original was " + fmtKB(file.size) + ". Download has started.", true);
  } catch (e) {
    setOut(out, "This file did not open as a photo. Try a JPG or PNG.", false);
  }
});

/* ============ Photo tool: passport crop ============ */
const ppState = { img: null, ox: 0, oy: 0 };
function ppBase() {
  const canvas = $("#ppCanvas");
  return Math.min(canvas.width / ppState.img.naturalWidth, canvas.height / ppState.img.naturalHeight);
}
function ppDraw() {
  const canvas = $("#ppCanvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!ppState.img) return;
  const zoom = parseInt($("#ppZoom").value, 10) / 100;
  const base = ppBase(); // contain: poori photo pehle dikhti hai, phir zoom se frame bharein
  const dw = ppState.img.naturalWidth * base * zoom;
  const dh = ppState.img.naturalHeight * base * zoom;
  ctx.drawImage(ppState.img, (canvas.width - dw) / 2 + ppState.ox, (canvas.height - dh) / 2 + ppState.oy, dw, dh);
}
$("#ppFile").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (ppState.img && ppState.img._blobUrl) { try { URL.revokeObjectURL(ppState.img._blobUrl); } catch (_) {} }
    ppState.img = await readAsImage(file);
    ppState.ox = 0; ppState.oy = 0;
    $("#ppZoom").value = 100;
    event.target.value = ""; // same file dobara select karne par bhi change fire ho
    ppDraw();
    const lbl = $("#ppFileLabel");
    if (lbl) lbl.textContent = "Change photo";
    setOut($("#ppOut"), "Photo loaded. Drag to place the face in the frame, adjust with zoom.", true);
  } catch (e) {
    setOut($("#ppOut"), "This file did not open as a photo.", false);
  }
});
$("#ppZoom").addEventListener("input", ppDraw);
$("#ppReset").addEventListener("click", () => {
  if (!ppState.img) return;
  ppState.ox = 0; ppState.oy = 0;
  $("#ppZoom").value = 100;
  ppDraw();
});
(function ppDrag() {
  const canvas = $("#ppCanvas");
  let dragging = false, sx = 0, sy = 0;
  canvas.addEventListener("pointerdown", e => { dragging = true; sx = e.clientX; sy = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", e => {
    if (!dragging) return;
    ppState.ox += e.clientX - sx; ppState.oy += e.clientY - sy;
    sx = e.clientX; sy = e.clientY;
    ppDraw();
  });
  canvas.addEventListener("pointerup", () => { dragging = false; });
})();
$("#ppGo").addEventListener("click", () => {
  const out = $("#ppOut");
  if (!ppState.img) { setOut(out, "Choose a photo first.", false); return; }
  const [pw, ph] = $("#ppPreset").value.split("x").map(Number);
  const src = $("#ppCanvas");
  const canvas = document.createElement("canvas");
  canvas.width = pw; canvas.height = ph;
  const ctx = canvas.getContext("2d");
  const zoom = parseInt($("#ppZoom").value, 10) / 100;
  const base = ppBase();
  const k = pw / src.width;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, pw, ph);
  const dw = ppState.img.naturalWidth * base * zoom * k;
  const dh = ppState.img.naturalHeight * base * zoom * k;
  ctx.drawImage(ppState.img, (pw - dw) / 2 + ppState.ox * k, (ph - dh) / 2 + ppState.oy * k, dw, dh);
  canvas.toBlob(blob => {
    if (!blob) { setOut(out, "Export failed.", false); return; }
    downloadBlob(blob, "passport-photo.jpg");
    setOut(out, "Done: " + pw + "x" + ph + " px, " + fmtKB(blob.size) + ". Do check your form's exact rules.", true);
  }, "image/jpeg", 0.92);
});

/* ============ PDF libs (lazy CDN load) ============ */
const PDFLIB_URL = "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js";
const PDFJS_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.min.js";
const PDFJS_WORKER_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js";
const SRI = {
  [PDFLIB_URL]: "sha384-weMABwrltA6jWR8DDe9Jp5blk+tZQh7ugpCsF3JwSA53WZM9/14PjS5LAJNHNjAI",
  [PDFJS_URL]: "sha384-OemFRmhjDZwhIKuUld0HJozkF2YErsgDaCL41trxGQZt4/WgnopJQqQl2DvDZ07Z"
};
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    if (SRI[src]) { s.integrity = SRI[src]; s.crossOrigin = "anonymous"; }
    s.onload = resolve; s.onerror = () => reject(new Error("cdn load failed: " + src));
    document.head.appendChild(s);
  });
}
async function ensurePdfLibs() {
  if (!window.PDFLib) await loadScript(PDFLIB_URL);
  if (!window.pdfjsLib) {
    await loadScript(PDFJS_URL);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
  }
}


/* ============ PDF tool: unlock with known password ============ */
$("#ulGo").addEventListener("click", async () => {
  const out = $("#ulOut");
  const file = $("#ulFile").files[0];
  const password = $("#ulPass").value;
  if (!file) { setOut(out, "Choose a PDF first.", false); return; }
  if (!password) { setOut(out, "Enter the PDF's password (the one you know).", false); return; }
  try {
    setOut(out, "Unlocking, this may take a moment...", undefined);
    await ensurePdfLibs();
    const data = await file.arrayBuffer();
    let pdf;
    try {
      pdf = await window.pdfjsLib.getDocument({ data, password }).promise;
    } catch (err) {
      if (err && err.name === "PasswordException") {
        setOut(out, "That password did not work. Enter the same password the PDF asks for when opening.", false);
      } else {
        setOut(out, "This PDF could not be opened.", false);
      }
      return;
    }
    const outDoc = await window.PDFLib.PDFDocument.create();
    for (let i = 1; i <= pdf.numPages; i++) {
      setOut(out, "Page " + i + "/" + pdf.numPages + "...", undefined);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const jpg = await outDoc.embedJpg(jpgDataUrl);
      const p = outDoc.addPage([viewport.width, viewport.height]);
      p.drawImage(jpg, { x: 0, y: 0, width: viewport.width, height: viewport.height });
    }
    const bytes = await outDoc.save();
    downloadBlob(new Blob([bytes], { type: "application/pdf" }), "unlocked.pdf");
    setOut(out, "Done: " + pdf.numPages + " pages, " + fmtKB(bytes.length) + ". Note: the new copy is image-based - text selection, form fields and digital signatures will not carry over. Your original file is unchanged.", true);
  } catch (e) {
    setOut(out, "Unlock failed. The file may be corrupt.", false);
  }
});
/* ============ Compact cards v2: feature-card style boxes ============ */
(function () {
  /* --- Tools: collapse each tool card into a feature-card style box --- */
  $$(".tool-card").forEach((card, i) => {
    const icon = card.querySelector(".feature-icon");
    const h3 = card.querySelector("h3");
    const p = card.querySelector("p");
    const num = card.querySelector(".card-number");
    if (!icon || !h3 || !p) return;
    const bodyId = "toolBody" + i;
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "tool-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", bodyId);
    const iconWrap = document.createElement("span");
    iconWrap.className = "tool-toggle-icon";
    iconWrap.textContent = icon.textContent;
    toggle.appendChild(iconWrap);
    if (num) {
      const k = document.createElement("span");
      k.className = "tool-toggle-num";
      if (num.getAttribute("data-i18n")) k.setAttribute("data-i18n", num.getAttribute("data-i18n"));
      k.textContent = num.textContent;
      toggle.appendChild(k);
    }
    const b = document.createElement("b");
    b.className = "tool-toggle-title";
    if (h3.getAttribute("data-i18n")) b.setAttribute("data-i18n", h3.getAttribute("data-i18n"));
    b.textContent = h3.textContent;
    toggle.appendChild(b);
    const small = document.createElement("small");
    small.className = "tool-toggle-sub";
    if (p.getAttribute("data-i18n")) small.setAttribute("data-i18n", p.getAttribute("data-i18n"));
    small.textContent = p.textContent;
    toggle.appendChild(small);
    const cta = document.createElement("span");
    cta.className = "tool-toggle-cta";
    const ctaT = document.createElement("span");
    ctaT.setAttribute("data-i18n", "ui.open");
    ctaT.textContent = "Open";
    const ctaA = document.createElement("span");
    ctaA.textContent = "\u2197";
    cta.append(ctaT, ctaA);
    toggle.appendChild(cta);
    const body = document.createElement("div");
    body.className = "tool-body";
    body.id = bodyId;
    [...card.children].forEach(ch => {
      if (ch === icon || ch === h3 || ch === p || ch === num) return;
      body.appendChild(ch);
    });
    icon.remove(); h3.remove(); p.remove(); if (num) num.remove();
    card.appendChild(toggle);
    card.appendChild(body);
    card.classList.add("tool-collapsed");
    toggle.addEventListener("click", () => {
      const open = card.classList.toggle("tool-open");
      card.classList.toggle("tool-collapsed", !open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  /* --- Guides: feature-card style boxes that open a full detail sheet --- */
  const section = document.getElementById("guide");
  if (!section) return;
  const cautions = section.querySelector(".guide-cautions");
  if (cautions && !cautions.id) cautions.id = "guide-cautions";
  const items = [
    { id: "guide-pan", icon: "\u{1FAAA}", num: "GUIDE / PAN", title: "PAN Card", sub: "Get your first PAN card" },
    { id: "guide-dl", icon: "\u{1F697}", num: "GUIDE / LICENCE", title: "Driving Licence", sub: "From learner's to full licence" },
    { id: "guide-voter", icon: "\u{1F5F3}\u{FE0F}", num: "GUIDE / VOTER", title: "Voter ID", sub: "Form 6, completely free" },
    { id: "guide-aadhaar", icon: "\u{1F194}", num: "GUIDE / AADHAAR", title: "Aadhaar", sub: "Free enrolment, any age" },
    { id: "guide-birth", icon: "\u{1F4C4}", num: "GUIDE / BIRTH", title: "Birth Certificate", sub: "Register within 21 days, free" },
    { id: "guide-ayushman", icon: "\u{1F3E5}", num: "GUIDE / HEALTH", title: "Ayushman Card", sub: "Rs 5 lakh cover - check eligibility" },
    { id: "guide-cautions", icon: "\u{26A0}\u{FE0F}", num: "GUIDE / SAFETY", title: "Safety Tips", sub: "Avoid fake websites" }
  ];
  const sources = {};
  items.forEach(it => {
    const node = document.getElementById(it.id);
    if (node) { node.classList.add("guide-source"); sources[it.id] = node; }
  });
  const grid = document.createElement("div");
  grid.className = "guide-grid";
  items.forEach(it => {
    if (!sources[it.id]) return;
    const card = document.createElement("article");
    card.className = "guide-box";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "guide-open";
    btn.setAttribute("data-guide-open", it.id);
    const ic = document.createElement("span"); ic.className = "guide-box-icon"; ic.setAttribute("aria-hidden", "true");
    const iconPaths = {
      "guide-pan": '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 16c0-3 6-3 6 0m3-6h5m-5 4h5"/>',
      "guide-dl": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M3 10h18m-9 4v7m-2-8-5 5m9-5 5 5"/>',
      "guide-voter": '<path d="M5 12H2v9h20v-9h-3M7 16h10M7 3h10v10H7z"/><path d="m9 7 2 2 4-4"/>',
      "guide-aadhaar": '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 16c0-3 6-3 6 0m3-6h5m-5 4h5"/>',
      "guide-birth": '<path d="M5 2h10l4 4v16H5zM15 2v5h4M8 11h8m-8 4h8m-8 4h5"/>',
      "guide-ayushman": '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
      "guide-cautions": '<path d="M12 3 2 21h20zM12 9v5m0 3v1"/>'
    };
    ic.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false">' + iconPaths[it.id] + '</svg>';
    const kn = document.createElement("span"); kn.className = "guide-box-num"; kn.textContent = it.num;
    const b = document.createElement("b"); b.textContent = it.title;
    const sm = document.createElement("small"); sm.textContent = it.sub;
    const cta = document.createElement("span"); cta.className = "guide-box-cta";
    const ct = document.createElement("span"); ct.textContent = "Open";
    const ca = document.createElement("span"); ca.textContent = "\u2197";
    cta.append(ct, ca);
    btn.append(ic, kn, b, sm, cta);
    const srcVideo = sources[it.id].querySelector(".guide-video a");
    if (srcVideo) {
      const v = document.createElement("a");
      v.className = "guide-box-video";
      v.href = srcVideo.href;
      v.target = "_blank";
      v.rel = "noopener";
      v.addEventListener("click", e => e.stopPropagation());
      v.innerHTML = "<span>\u25B6</span><span>Watch video</span>";
      card.appendChild(v);
    }
    card.prepend(btn);
    grid.appendChild(card);
  });
  const note = section.querySelector(".tool-note");
  if (note) note.after(grid); else section.appendChild(grid);
  const overlay = document.createElement("div");
  overlay.className = "guide-overlay";
  overlay.hidden = true;
  overlay.innerHTML = '<div class="guide-sheet" role="dialog" aria-modal="true"><div class="guide-sheet-top"><button type="button" class="guide-back">\u2190 Back</button><b class="guide-sheet-title"></b></div><div class="guide-sheet-body"></div></div>';
  document.body.appendChild(overlay);
  const sheetBody = overlay.querySelector(".guide-sheet-body");
  const sheetTitle = overlay.querySelector(".guide-sheet-title");
  const backBtn = overlay.querySelector(".guide-back");
  let openId = null, homePh = null, opener = null;
  function openGuide(id, viaHistory) {
    const node = sources[id];
    if (!node) return;
    if (openId) closeGuide(true);
    openId = id;
    opener = grid.querySelector('[data-guide-open="' + id + '"]');
    homePh = document.createComment("guide-home");
    node.before(homePh);
    node.classList.remove("guide-source");
    sheetBody.appendChild(node);
    const item = items.find(i => i.id === id);
    sheetTitle.textContent = item ? item.title : "Guide";
    // Prominent actions on top, built from THIS article's existing verified links
    const actions = document.createElement("div");
    actions.className = "guide-actions";
    const videoLink = node.querySelector(".guide-video a");
    if (videoLink) {
      const v = document.createElement("a");
      v.className = "guide-action guide-action-video";
      v.href = videoLink.href;
      v.target = "_blank";
      v.rel = "noopener";
      v.innerHTML = "<span>\u25B6</span><span>Watch video</span>";
      actions.appendChild(v);
      const vn = document.createElement("small");
      vn.className = "guide-action-note";
      const srcNote = node.querySelector(".guide-video small");
      vn.textContent = srcNote ? srcNote.textContent : "Confirm fees and rules on the official site; the video's information may differ.";
      actions.appendChild(vn);
    }
    node.querySelectorAll(".guide-links a").forEach(a => {
      const l = document.createElement("a");
      l.className = "guide-action";
      l.href = a.href;
      l.target = "_blank";
      l.rel = "noopener";
      l.innerHTML = "<span>" + a.textContent + "</span><span>\u2197</span>";
      actions.appendChild(l);
    });
    if (actions.children.length) sheetBody.insertBefore(actions, node);
    overlay.hidden = false;
    document.body.classList.add("guide-lock");
    if (!viaHistory) history.pushState({ skyGuide: id }, "", "#" + id);
    backBtn.focus({ preventScroll: true });
    overlay.scrollTop = 0;
    requestAnimationFrame(() => { if (openId) overlay.scrollTop = 0; });
    setTimeout(() => { if (openId) overlay.scrollTop = 0; }, 150);
  }
  function closeGuide(silent) {
    if (!openId) return;
    const node = sources[openId];
    const acts = sheetBody.querySelector(".guide-actions");
    if (acts) acts.remove();
    node.classList.add("guide-source");
    if (homePh) { homePh.before(node); homePh.remove(); homePh = null; }
    overlay.hidden = true;
    document.body.classList.remove("guide-lock");
    openId = null;
    if (!silent && opener) opener.focus();
  }
  grid.addEventListener("click", e => {
    const btn = e.target.closest("[data-guide-open]");
    if (btn) openGuide(btn.getAttribute("data-guide-open"), false);
  });
  backBtn.addEventListener("click", () => {
    const id = openId;
    if (history.state && history.state.skyGuide) { history.back(); return; }
    closeGuide(false);
    if (id && location.hash === "#" + id) history.replaceState(null, "", location.pathname + location.search);
  });
  document.addEventListener("keydown", e => {
    if (!openId) return;
    if (e.key === "Escape") { backBtn.click(); return; }
    if (e.key === "Tab") {
      const focusables = overlay.querySelectorAll("button, a[href]");
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener("popstate", () => {
    if (openId) { closeGuide(false); return; }
    const id = location.hash.slice(1);
    if (sources[id]) openGuide(id, true);
  });
  window.addEventListener("hashchange", () => {
    const id = location.hash.slice(1);
    if (openId && id !== openId) closeGuide(false);
    if (!openId && sources[id]) openGuide(id, true);
  });
  const startId = location.hash.slice(1);
  if (sources[startId]) openGuide(startId, true);
})();

/* v7: premium reveal-on-scroll (adds classes via JS so no-JS shows everything) */
(function () {
  const targets = document.querySelectorAll('.intro, .studio-shell, .voice-band, .feature-card, .guide-box, .final-cta, .section-kicker, .tool-search');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('visible'));
    return;
  }
  targets.forEach(el => {
    el.classList.add('reveal');
    const siblings = el.parentElement ? Array.from(el.parentElement.children).filter(s => s.classList && s.classList.contains('feature-card')) : [];
    const idx = siblings.length ? siblings.indexOf(el) : 0;
    if (idx > 0) el.style.transitionDelay = Math.min(idx % 4, 3) * 70 + 'ms';
  });
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  targets.forEach(el => io.observe(el));
})();
