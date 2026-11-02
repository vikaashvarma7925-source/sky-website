(() => {
"use strict";

const $ = (id) => document.getElementById(id);
const logEl = $("log"), inputEl = $("input"), sendBtn = $("sendBtn"), form = $("chatForm");
const statusEl = $("status"), stopBtn = $("stopBtn");
const providerSel = $("provider"), provState = $("provState"), provList = $("provList");
const stage = $("stage"), statePill = $("statePill");
const talkImg = $("talkImg");

/* ---------- lightweight talking view (preloaded stills, no continuous animation) ---------- */
const SETS = {
  neutral: { base: "talk/base.jpg", blink: "talk/blink.jpg", open1: "talk/open1.jpg", open2: "talk/open2.jpg", blinkOpen: "talk/blink_open2.jpg" },
  smile:   { base: "talk/smile.jpg", open1: "talk/smile_open1.jpg", open2: "talk/smile_open2.jpg" },
  concern: { base: "talk/concern.jpg", open1: "talk/concern_open1.jpg", open2: "talk/concern_open2.jpg" },
  think:   { base: "talk/think.jpg", open1: "talk/think_open1.jpg", open2: "talk/think_open2.jpg" },
};
const TONE_SET = { happy: "smile", excited: "smile", playful: "smile", concerned: "concern", apologetic: "concern", thinking: "think" };
for (const k in SETS.neutral) { const im = new Image(); im.src = SETS.neutral[k]; }
function preloadSet(name) { for (const k in SETS[name]) { const im = new Image(); im.src = SETS[name][k]; } }

let curSet = "neutral", talking = false, exprTimer = null;
function exprFor(tone) { return TONE_SET[tone] || "neutral"; }
function showExpr(name) {
  curSet = name;
  if (!talking) talkImg.src = SETS[name].base;
}
function showExprBrief(name, ms) {
  if (name === "neutral") return;
  preloadSet(name);
  clearTimeout(exprTimer);
  showExpr(name);
  exprTimer = setTimeout(() => showExpr("neutral"), ms || 3500);
}
function show(key, ms, back) {
  talkImg.src = (SETS[curSet][key]) || SETS.neutral[key] || SETS.neutral.base;
  if (ms) setTimeout(() => { if (!talking) talkImg.src = SETS[curSet].base; }, ms);
}
function scheduleBlink() {
  setTimeout(() => {
    if (!talking) show("blink", 180);
    scheduleBlink();
  }, 2500 + Math.random() * 3500);
}
let mouthTimer = null;
function setTalking(on) {
  if (on === talking) return;
  talking = on;
  if (on) {
    let flip = false;
    mouthTimer = setInterval(() => {
      const st = SETS[curSet];
      talkImg.src = flip ? st.open2 : st.open1;
      flip = !flip;
    }, 230);
  } else {
    clearInterval(mouthTimer); mouthTimer = null;
    talkImg.src = SETS[curSet].base;
  }
}
scheduleBlink();

const STATE_LABEL = { idle: "Ready", thinking: "Thinking\u2026", speaking: "Speaking\u2026", listening: "Listening\u2026" };
function setState(s) {
  stage.dataset.state = s;
  statePill.textContent = STATE_LABEL[s] || s;
  if (s === "thinking") { preloadSet("think"); showExpr("think"); }
  setTalking(s === "speaking");
}

/* ---------- helpers ---------- */
const HIST_KEY = "aura-history-v1";
let history = [];
try { history = JSON.parse(localStorage.getItem(HIST_KEY) || "[]"); } catch (e) { history = []; }

let statusTimer = null;
function setStatus(msg, kind) {
  if (!msg) { statusEl.hidden = true; statusEl.textContent = ""; return; }
  statusEl.hidden = false;
  statusEl.textContent = msg;
  statusEl.dataset.kind = kind || "info";
  clearTimeout(statusTimer);
  if (kind !== "warn") statusTimer = setTimeout(() => { statusEl.hidden = true; }, 9000);
}
function saveHistory() {
  try {
    localStorage.setItem(HIST_KEY, JSON.stringify(history.slice(-40)));
  } catch (e) { /* storage full */ }
}

function bubble(role, text, meta) {
  const b = document.createElement("div");
  b.className = "bubble " + role;
  if (role === "user") b.textContent = text;
  else {
    const body = document.createElement("div");
    body.className = "md";
    b.appendChild(body);
    if (text) body.innerHTML = md(text);
    if (meta) {
      const m = document.createElement("span");
      m.className = "meta";
      m.textContent = meta;
      b.appendChild(m);
    }
    b._md = body;
  }
  logEl.appendChild(b);
  logEl.scrollTop = logEl.scrollHeight;
  return b;
}
function esc(s) { return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
function md(t) {
  let h = esc(t);
  h = h.replace(/```([\s\S]*?)```/g, (m, c) => "<pre><code>" + c.trim() + "</code></pre>");
  h = h.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  h = h.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  h = h.replace(/\n/g, "<br>");
  return h;
}
function renderHistory() {
  logEl.innerHTML = "";
  if (!history.length) { greet(); return; }
  for (const m of history) {
    if (m.role === "user" || m.role === "assistant") bubble(m.role, m.text, m.meta || null);
  }
}
function greet() {
  bubble("assistant",
    "Namaste! Main **AURA** hoon - SKY Studio ki AI assistant.\n" +
    "Hindi ya English - jo bhi comfortable lage, poochhiye. SKY Studio ke tools, ideas, ya kuch bhi aur!\n" +
    "_Aap yeh chat voice mein bhi kar sakte ho - mic button se._");
}

/* ---------- providers ---------- */
let providerIds = [];
async function loadProviders() {
  let data = null;
  try {
    const r = await fetch("/api/aura/status", { headers: { "Accept": "application/json" } });
    data = await r.json();
  } catch (e) { data = null; }
  const pmap = (data && data.providers) || {};
  providerIds = Object.keys(pmap);
  providerSel.innerHTML = "";
  let firstConnected = null;
  for (const id of providerIds) {
    const p = pmap[id];
    const o = document.createElement("option");
    o.value = id;
    o.textContent = p.label + (p.connected ? "" : " (not connected)");
    if (!p.connected) o.disabled = true;
    if (p.connected && !firstConnected) firstConnected = id;
    providerSel.appendChild(o);
  }
  if (firstConnected) providerSel.value = firstConnected;
  const anyConnected = !!firstConnected;
  provState.textContent = anyConnected ? "connected" : "not connected";
  provState.className = "pill " + (anyConnected ? "ok" : "off");
  provList.innerHTML = providerIds.map((id) => {
    const p = pmap[id];
    return `<li><b>${esc(p.label)}</b> - ${p.connected ? "connected" : "not connected"}${p.model ? " &middot; " + esc(p.model) : ""}</li>`;
  }).join("") || "<li>No providers found.</li>";
}
providerSel.addEventListener("change", () => { stopSpeak(); setStatus("Switched to " + providerSel.selectedOptions[0].textContent); });


/* ---------- one-time session gate (Cloudflare Turnstile, no keys in page) ---------- */
let tsWidget = null, sessionPending = null;
function renderTs(done) {
  try {
    const opts = {
      sitekey: "0x4AAAAAAFma9HVVe7IMMcQC",
      appearance: "interaction-only",
      callback: async (token) => {
        try {
          const r = await fetch("/api/aura/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
          done(r.ok);
        } catch (e) { done(false); }
      },
      "error-callback": () => done(false),
      "expired-callback": () => { sessionPending = null; },
    };
    if (tsWidget === null) tsWidget = turnstile.render("#tslot", opts);
    else turnstile.reset(tsWidget);
  } catch (e) { done(false); }
}
function ensureSession(force) {
  if (sessionPending && !force) return sessionPending;
  sessionPending = new Promise((resolve) => {
    let settled = false;
    const done = (ok) => { if (!settled) { settled = true; resolve(ok); } };
    setTimeout(() => done(false), 20000); // never hang the send forever
    let waited = 0;
    const t = setInterval(() => {
      if (window.turnstile) { clearInterval(t); renderTs(done); }
      else if ((waited += 200) > 4000) { clearInterval(t); done(false); }
    }, 200);
  });
  return sessionPending;
}

/* ---------- speech out ---------- */
const synth = ("speechSynthesis" in window) ? window.speechSynthesis : null;
const ttsToggle = $("ttsToggle"), voiceSel = $("voiceSel"), rateCtl = $("rateCtl");
let voices = [], lastSpoken = "";

function loadVoices() {
  if (!synth) return;
  voices = synth.getVoices();
  const keep = voiceSel.value;
  voiceSel.innerHTML = '<option value="">Auto voice</option>';
  for (const v of voices) {
    const o = document.createElement("option");
    o.value = v.voiceURI;
    o.textContent = `${v.name} (${v.lang})`;
    voiceSel.appendChild(o);
  }
  if (keep) voiceSel.value = keep;
}
if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }

const TONE_RATE = { happy: 1.05, playful: 1.05, calm: 0.95, concerned: 0.9, thinking: 0.92, apologetic: 0.92 };
const TONE_PITCH = { happy: 1.15, playful: 1.2, calm: 1.0, concerned: 0.9, thinking: 0.95, apologetic: 0.9 };

function speak(text, opts) {
  if (!synth || !ttsToggle.checked) return;
  stopSpeak();
  lastSpoken = text;
  const hasDev = /[\u0900-\u097F]/.test(text);
  const u = new SpeechSynthesisUtterance(text);
  u.rate = parseFloat(rateCtl.value) * ((opts && TONE_RATE[opts.tone]) || 1);
  u.pitch = (opts && TONE_PITCH[opts.tone]) || 1;
  if (voiceSel.value) {
    const v = voices.find((x) => x.voiceURI === voiceSel.value);
    if (v) u.voice = v;
  } else {
    const v = voices.find((x) => hasDev ? /^hi([-_]|$)/i.test(x.lang) : /^en([-_]|$)/i.test(x.lang));
    if (v) u.voice = v;
  }
  u.onstart = () => setState("speaking");
  u.onend = () => setState("idle");
  u.onerror = () => setState("idle");
  synth.speak(u);
}
function stopSpeak() {
  if (synth) synth.cancel();
  setTalking(false);
  if (stage.dataset.state === "speaking") setState("idle");
}
$("stopSpeak").addEventListener("click", stopSpeak);
ttsToggle.addEventListener("change", () => { if (!ttsToggle.checked) stopSpeak(); });

/* ---------- speech in (Chrome/Edge, free Web Speech API) ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const micBtn = $("micBtn");
let rec = null;
if (SR) {
  micBtn.hidden = false;
  micBtn.addEventListener("click", () => {
    if (rec) { rec.stop(); return; }
    rec = new SR();
    rec.lang = /[\u0900-\u097F]/.test(inputEl.value) ? "hi-IN" : "en-IN";
    rec.interimResults = true;
    setState("listening");
    rec.onresult = (e) => {
      let t = "";
      for (const r of e.results) t += r[0].transcript;
      inputEl.value = t;
      autosize();
    };
    rec.onend = () => { rec = null; setState("idle"); };
    rec.onerror = () => { rec = null; setState("idle"); setStatus("Mic did not work in this browser. Typing works everywhere.", "warn"); };
    rec.start();
  });
}

/* ---------- chat ---------- */
let inFlight = null;
stopBtn.addEventListener("click", () => { if (inFlight) inFlight.abort(); });

function autosize() {
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + "px";
  sendBtn.disabled = !inputEl.value.trim();
}
inputEl.addEventListener("input", autosize);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
});

$("clearBtn").addEventListener("click", () => {
  history = [];
  saveHistory();
  stopSpeak();
  renderHistory();
  setStatus("This browser\u2019s history cleared.");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text || inFlight) return;
  inputEl.value = ""; autosize();
  stopSpeak();
  bubble("user", text);
  history.push({ role: "user", text });
  saveHistory();

  const ab = bubble("assistant", "");
  setStatus("One-time security check\u2026");
  const gateOk = await ensureSession();
  if (gateOk === false) setStatus("Security check could not run (ad-blocker?). Trying anyway\u2026", "warn");
  const ctrl = new AbortController();
  inFlight = ctrl;
  stopBtn.hidden = false;
  sendBtn.disabled = true;
  setState("thinking");
  setStatus("");
  let acc = "", gotError = null, model = "";

  try {
    const messages = history.slice(-19).map((m) => ({ role: m.role, content: m.text }));
    const r = await fetch("/api/aura/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        messages: messages,
        provider: providerSel.value || "cloudflare",
        stream: true,
      }),
    });
    model = r.headers.get("X-AURA-Model") || "";
    const ctype = r.headers.get("Content-Type") || "";
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      gotError = d.error || ("Error " + r.status);
      if (r.status === 403) { sessionPending = null; ensureSession(true); }
    } else if (ctype.includes("text/event-stream")) {
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          if (payload === "[DONE]") continue;
          try {
            const d = JSON.parse(payload);
            if (d.error) { gotError = d.error || "Stream error"; continue; }
            if (d.response || d.delta) {
              acc += (d.response || d.delta);
              ab._md.innerHTML = md(acc);
              logEl.scrollTop = logEl.scrollHeight;
            }
          } catch (err) { /* partial chunk */ }
        }
      }
    } else {
      const d = await r.json();
      if (d.error) gotError = d.error || "Something went wrong";
      else { acc = d.reply || ""; if (d.emotion) ab._serverTone = d.emotion; if (d.model && !model) model = d.model; }
    }
  } catch (err) {
    if (err.name !== "AbortError") gotError = "Network problem - check your connection.";
  }

  inFlight = null;
  stopBtn.hidden = true;
  sendBtn.disabled = false;

  if (ctrl.signal.aborted && !acc) {
    ab.remove();
    setStatus("Stopped.");
    setState("idle");
    return;
  }
  if (gotError && !acc) {
    ab._md.innerHTML = md(gotError);
    ab.classList.add("error");
    setStatus(gotError, "warn");
    setState("idle");
    return;
  }
  const sp = ab._serverTone ? { tone: ab._serverTone, text: acc } : splitTone(acc);
  ab._md.innerHTML = md(sp.text);
  const meta = model || "AURA";
  const m = document.createElement("span");
  m.className = "meta";
  m.textContent = sp.tone ? meta + " \u00B7 " + sp.tone + " (reply tone)" : meta;
  ab.appendChild(m);
  history.push({ role: "assistant", text: sp.text, meta: m.textContent });
  saveHistory();
  if (gotError) setStatus(gotError, "warn");
  if (sp.tone) showExprBrief(exprFor(sp.tone));
  if (!ttsToggle.checked) setState("idle");
  speak(sp.text, { tone: sp.tone });
});

function splitTone(text) {
  const m = text.match(/^\[(\w[\w-]*)\]\s*/);
  const TONES = { happy: 1, calm: 1, concerned: 1, thinking: 1, playful: 1, apologetic: 1 };
  if (m && TONES[m[1]]) return { tone: m[1], text: text.slice(m[0].length) };
  return { tone: null, text };
}

renderHistory();
loadProviders();
setState("idle");
})();
