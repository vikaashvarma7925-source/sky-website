(() => {
"use strict";

const $ = (id) => document.getElementById(id);
const logEl = $("log"), inputEl = $("input"), sendBtn = $("sendBtn"), form = $("chatForm");
const statusEl = $("status"), stopBtn = $("stopBtn");
const providerSel = $("provider"), provState = $("provState"), provList = $("provList");
const stage = $("stage"), statePill = $("statePill");

/* ---------- character view: her real reference photo only ----------
   Face animation is under development and intentionally not shown until it
   meets the identity quality bar. */

const STATE_LABEL = { idle: "Ready", thinking: "Thinking\u2026", speaking: "Speaking\u2026", listening: "Listening\u2026" };
function setState(s) {
  stage.dataset.state = s;
  statePill.textContent = STATE_LABEL[s] || s;
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
  b.className = "msg " + (role === "assistant" ? "aura" : "user");
  if (role === "user") b.textContent = text;
  else {
    const body = document.createElement("div");
    body.className = "md";
    b.appendChild(body);
    if (text) body.innerHTML = md(text);
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
    "Aap yeh chat voice mein bhi kar sakte ho - mic button se.");
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

/* ---------- explicit safe tools ---------- */
$("toolForm").addEventListener("submit", async (e) => {
  e.preventDefault();const btn=$("toolRun"),out=$("toolResult");btn.disabled=true;out.textContent="Checking...";
  try {
    if (!(await ensureSession())) throw Error("Security check could not finish. Reload and try again.");
    out.textContent="Running...";
    const r=await fetch("/api/aura/tool",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tool:$("toolSelect").value,input:$("toolInput").value})});
    const d=await r.json();if(!r.ok)throw Error(d.error||"Tool unavailable.");
    out.textContent=d.tool==="calculate"?"Result: "+d.result.value:`${d.result.words} words · ${d.result.characters} characters · ${d.result.lines} lines`;
  }catch(err){out.textContent=err.message;}finally{btn.disabled=false;}
});

/* ---------- speech out ---------- */
const synth = ("speechSynthesis" in window) ? window.speechSynthesis : null;
const ttsToggle = $("ttsToggle"), voiceSel = $("voiceSel"), rateCtl = $("rateCtl");
let voices = [], lastSpoken = "", speechWatch = null, speechRun = 0;

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
  const run = ++speechRun;
  let started = false;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = parseFloat(rateCtl.value) * ((opts && TONE_RATE[opts.tone]) || 1);
  u.pitch = (opts && TONE_PITCH[opts.tone]) || 1;
  if (voiceSel.value) {
    const v = voices.find((x) => x.voiceURI === voiceSel.value);
    if (v) u.voice = v;
  } else {
    const candidates=voices.filter((x)=>hasDev?/^hi([-_]|$)/i.test(x.lang):/^en([-_]|$)/i.test(x.lang));
    const v=candidates.find(x=>/Google.*(Hindi|हिन्दी)|Female|Zira|Swara/i.test(x.name))||candidates[0];
    if (v) u.voice = v;
  }
  u.onstart = () => { if(run!==speechRun)return;started=true;clearTimeout(speechWatch);setState("speaking"); };
  u.onend = () => { if(run!==speechRun)return;clearTimeout(speechWatch);setState("idle"); };
  u.onerror = () => { if(run!==speechRun)return;clearTimeout(speechWatch);setState("idle");setStatus("Voice did not work in this browser. Your text answer is available above.", "warn"); };
  speechWatch=setTimeout(()=>{if(run===speechRun&&!started){stopSpeak();setStatus("Voice did not start. Try a voice from the list or keep using text.","warn");}},5000);
  synth.speak(u);
}
function stopSpeak() {
  speechRun++;clearTimeout(speechWatch);
  if (synth) synth.cancel();
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
    rec.lang = $("inputLang").value;
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
    try { rec.start(); } catch (e) { rec=null;setState("idle");setStatus("Microphone could not start. Check site permissions or type instead.","warn"); }
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
  const userBubble = bubble("user", text);
  history.push({ role: "user", text });
  saveHistory();

  const ab = bubble("assistant", "");
  const ctrl = new AbortController();
  inFlight = ctrl;stopBtn.hidden=false;sendBtn.disabled=true;
  setStatus("One-time security check\u2026");
  const gateOk = await ensureSession();
  if (gateOk === false) setStatus("Security check could not run (ad-blocker?). Trying anyway\u2026", "warn");
  if(ctrl.signal.aborted){ab.remove();inFlight=null;stopBtn.hidden=true;autosize();setStatus("Stopped.");return;}
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
              ab._md.innerHTML = md(streamText(acc));
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
    const retry=document.createElement("button");retry.type="button";retry.className="retrybtn";retry.textContent="Retry";
    retry.onclick=()=>{if(inFlight)return;if(history[history.length-1]?.role!=="user"||history[history.length-1]?.text!==text){setStatus("Please send your question again.");return;}history.pop();saveHistory();ab.remove();userBubble.remove();inputEl.value=text;autosize();form.requestSubmit();};
    ab.appendChild(retry);
    setStatus(gotError, "warn");
    setState("idle");
    return;
  }
  const sp = ab._serverTone ? { tone: ab._serverTone, text: acc } : splitTone(acc);
  ab._md.innerHTML = md(sp.text);
  history.push({ role: "assistant", text: sp.text });
  saveHistory();
  if (gotError) setStatus(gotError, "warn");
  setState("idle");
  speak(sp.text, { tone: sp.tone });
});

function streamText(text) {
  // Do not expose the model's control prefix while it is still arriving.
  if (text.startsWith("[") && !text.includes("]") && text.length < 24) return "";
  return splitTone(text).text;
}

function splitTone(text) {
  const m = text.match(/^\[(\w[\w-]*)\]\s*/);
  const TONES = { neutral: 1, excited: 1, happy: 1, calm: 1, concerned: 1, thinking: 1, playful: 1, apologetic: 1 };
  if (m && TONES[m[1]]) return { tone: m[1], text: text.slice(m[0].length) };
  return { tone: null, text };
}

renderHistory();
loadProviders();
setState("idle");
})();
