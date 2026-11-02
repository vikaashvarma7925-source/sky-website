import { TOOL_REGISTRY, runTool } from "./aura-tools.js";
var SEC_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self'; style-src-attr 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self' blob:; worker-src 'self' blob:; frame-src 'self' https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains"
};
var AURA_PERMISSIONS = "camera=(), geolocation=(), microphone=(self)";

function wrap(resp, path) {
  var r = new Response(resp.body, resp);
  for (var k of Object.keys(SEC_HEADERS)) r.headers.set(k, SEC_HEADERS[k]);
  if (path && path.indexOf("/aura/") === 0) r.headers.set("Permissions-Policy", AURA_PERMISSIONS);
  return r;
}
function plain(status, text, allow) {
  return wrap(new Response(text, { status, headers: Object.assign({ "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }, allow ? { Allow: allow } : {}) }));
}
function json(status, obj) {
  return wrap(new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } }));
}
function cleanPath(raw) {
  let p = raw;
  if (/%(2e|2f|5c|00|25)/i.test(p) || p.indexOf("\\") >= 0 || p.indexOf("\0") >= 0) return null;
  try { p = decodeURIComponent(p); } catch (e) { return null; }
  if (p.charAt(0) !== "/" || p.indexOf("//") >= 0) return null;
  const segs = p.split("/");
  for (let i = 1; i < segs.length; i++) {
    const s = segs[i];
    if (s === ".." || s === "." || s.charAt(0) === "." || s.charAt(0) === "_") return null;
  }
  if (/\.(map|md|sh|toml|jsonc?|env|bak|orig|txt\.gz)$/i.test(p) && p !== "/robots.txt") return null;
  return p;
}

/* ---------- AURA provider router ----------
   Each adapter reports its real connection state. A provider is "connected"
   only when its server-side secret exists. No demo or fake responses. */
var AURA_SYSTEM = "You are AURA, the friendly AI assistant inside SKY Studio, a free tools website. Reply in the same language the visitor uses (Hindi or English). Keep answers short, clear, warm and honest. Start every reply with exactly one tone token chosen from [neutral] [happy] [excited] [concerned] [thinking], then the reply text. The tone describes YOUR reply, never a diagnosis of the visitor. Respond to what they actually say; if their intent or mood is unclear, ask gently rather than assuming. Use [neutral] when unsure. Example: [happy] Bahut accha! You can chat, draft, explain code and suggest plans. The page also has explicit Calculator and Text analysis tools that the visitor can run separately. You cannot invoke tools yourself, browse the web, read local files, or take external actions. Never pretend you did something. If you do not know, say so.";

var PROVIDERS = {
  cloudflare: { label: "Cloudflare Workers AI", model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast" },
  groq:       { label: "Groq",                  model: "llama-3.1-8b-instant",  secret: "GROQ_API_KEY" },
  gemini:     { label: "Google Gemini",         model: "gemini-2.0-flash",      secret: "GEMINI_API_KEY" },
  openrouter: { label: "OpenRouter (free)",     model: "meta-llama/llama-3.1-8b-instruct:free", secret: "OPENROUTER_API_KEY" },
  mistral:    { label: "Mistral",               model: "mistral-small-latest",  secret: "MISTRAL_API_KEY" }
};

function providerStatus(env) {
  var out = {};
  for (var id of Object.keys(PROVIDERS)) {
    var p = PROVIDERS[id];
    var connected = id === "cloudflare" ? !!env.AI : !!env[p.secret];
    out[id] = { label: p.label, model: p.model, connected: connected };
  }
  return out;
}

/* naive per-IP rate limiter: best-effort, per isolate */
var BUCKETS = {};
function rateOk(ip) {
  var now = Date.now(), b = BUCKETS[ip];
  if (!b || now - b.start > 60000) { BUCKETS[ip] = { start: now, count: 1 }; return true; }
  b.count++;
  return b.count <= 20;
}

function withTimeout(promise, ms, onTimeout) {
  return Promise.race([promise, new Promise(function (_, rej) { setTimeout(function () { rej(new Error(onTimeout)); }, ms); })]);
}

async function callOpenAICompatible(url, key, model, messages) {
  var r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
    body: JSON.stringify({ model: model, messages: messages, max_tokens: 600, temperature: 0.7 })
  });
  if (!r.ok) throw new Error("provider_http_" + r.status);
  var j = await r.json();
  var t = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  if (!t) throw new Error("provider_empty");
  return t;
}

async function callGemini(key, model, messages) {
  var contents = messages.filter(function (m) { return m.role !== "system"; }).map(function (m) {
    return { role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] };
  });
  var sys = messages.find(function (m) { return m.role === "system"; });
  var body = { contents: contents };
  if (sys) body.systemInstruction = { parts: [{ text: sys.content }] };
  var r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error("provider_http_" + r.status);
  var j = await r.json();
  var t = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts[0] && j.candidates[0].content.parts[0].text;
  if (!t) throw new Error("provider_empty");
  return t;
}

function splitTone(t) {
  var m = /^\s*\[(neutral|happy|concerned|thinking|excited)\]\s*/i.exec(t);
  if (m) return { emo: m[1].toLowerCase(), text: t.slice(m[0].length) };
  return { emo: null, text: t };
}

async function auraChat(request, env) {
  if (request.method !== "POST") return json(405, { error: "Method not allowed" });
  var ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!rateOk(ip)) return json(429, { error: "Too many messages. Please wait a minute and try again." });

  var body;
  try { body = await request.json(); } catch (e) { return json(400, { error: "Invalid request." }); }
  if (!body || !Array.isArray(body.messages)) return json(400, { error: "Invalid request." });

  var msgs = body.messages.slice(-20);
  var total = 0;
  for (var m of msgs) {
    if (!m || typeof m.content !== "string" || (m.role !== "user" && m.role !== "assistant")) return json(400, { error: "Invalid request." });
    if (m.content.length > 2000) return json(400, { error: "Message too long (max 2000 characters)." });
    total += m.content.length;
  }
  if (msgs.length === 0 || msgs[msgs.length - 1].role !== "user") return json(400, { error: "Invalid request." });
  if (total > 16000) return json(400, { error: "Conversation too long. Please clear history and start fresh." });

  var pid = typeof body.provider === "string" ? body.provider : "cloudflare";
  var p = PROVIDERS[pid];
  if (!p) return json(400, { error: "Unknown provider." });

  var full = [{ role: "system", content: AURA_SYSTEM }].concat(msgs);
  var reply, usedModel = p.model;
  try {
    if (pid === "cloudflare") {
      if (!env.AI) return json(503, { error: "This AI provider is not connected yet." });
      var wantStream = body.stream === true;
      var models = [p.model, "@cf/meta/llama-3.2-3b-instruct"];
      var lastErr = null;
      for (var mi = 0; mi < models.length; mi++) {
        try {
          if (wantStream) {
            var s = await withTimeout(env.AI.run(models[mi], { messages: full, max_tokens: 600, stream: true }), 30000, "ai_timeout");
            return wrap(new Response(s, {
              status: 200,
              headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", "X-AURA-Model": models[mi] }
            }), "/aura/");
          }
          var out = await withTimeout(env.AI.run(models[mi], { messages: full, max_tokens: 600 }), 30000, "ai_timeout");
          reply = out && out.response;
          if (reply) { usedModel = models[mi]; break; }
        } catch (e3) {
          lastErr = e3;
          if (!wantStream && mi === models.length - 1) throw e3;
        }
      }
      if (wantStream) throw lastErr || new Error("provider_empty");
      if (!reply) throw new Error("provider_empty");
    } else {
      var key = env[p.secret];
      if (!key) return json(503, { error: p.label + " is not connected yet. The site owner has not added its key." });
      if (pid === "gemini") reply = await withTimeout(callGemini(key, p.model, full), 30000, "ai_timeout");
      else if (pid === "groq") reply = await withTimeout(callOpenAICompatible("https://api.groq.com/openai/v1/chat/completions", key, p.model, full), 30000, "ai_timeout");
      else if (pid === "openrouter") reply = await withTimeout(callOpenAICompatible("https://openrouter.ai/api/v1/chat/completions", key, p.model, full), 30000, "ai_timeout");
      else reply = await withTimeout(callOpenAICompatible("https://api.mistral.ai/v1/chat/completions", key, p.model, full), 30000, "ai_timeout");
    }
  } catch (e) {
    var msg = "AURA could not get an answer right now. Please try again in a moment.";
    if (e && e.message === "ai_timeout") msg = "AURA took too long to answer. Please try again.";
    else if (e && /^provider_http_429/.test(e.message)) msg = "The free AI limit was reached. Please try again in a little while.";
    else if (e && /^provider_http_5/.test(e.message)) msg = "The AI provider is temporarily unavailable. Please try again.";
    return json(502, { error: msg });
  }
  var tone = splitTone(reply);
  return json(200, { reply: tone.text, provider: pid, model: usedModel, emotion: tone.emo });
}

/* ---------- AURA session gate: Turnstile -> HMAC cookie ----------
   Active only when both TURNSTILE_SECRET_KEY and RATE_HMAC_KEY exist on the
   worker. No secrets in the page; the sitekey is public by design. */
async function hmacHex(key, msg) {
  var enc = new TextEncoder();
  var k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  var sig = await crypto.subtle.sign("HMAC", k, enc.encode(msg));
  var out = "";
  for (var b of new Uint8Array(sig)) out += b.toString(16).padStart(2, "0");
  return out;
}
function gateOn(env) { return !!(env.TURNSTILE_SECRET_KEY && env.RATE_HMAC_KEY); }
async function sessionOk(request, env) {
  if (!gateOn(env)) return true;
  var c = request.headers.get("Cookie") || "";
  var m = c.match(/aura_session=([0-9]+)\.([0-9a-f]{64})/);
  if (!m) return false;
  var exp = parseInt(m[1], 10);
  if (!exp || Date.now() > exp) return false;
  var expect = await hmacHex(env.RATE_HMAC_KEY, "aura." + m[1]);
  var a = m[2], diff = 0;
  if (a.length !== expect.length) return false;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ expect.charCodeAt(i);
  return diff === 0;
}
async function auraSession(request, env) {
  if (request.method !== "POST") return json(405, { error: "Method not allowed" });
  if (!gateOn(env)) return json(503, { error: "Security check is not configured." });
  var body;
  try { body = await request.json(); } catch (e) { return json(400, { error: "Invalid request." }); }
  var token = body && typeof body.token === "string" ? body.token : "";
  if (!token || token.length > 4096) return json(400, { error: "Missing check token." });
  var form = new URLSearchParams();
  form.set("secret", env.TURNSTILE_SECRET_KEY);
  form.set("response", token);
  form.set("remoteip", request.headers.get("CF-Connecting-IP") || "");
  var vr = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  var vj = await vr.json().catch(function () { return {}; });
  if (!vj.success) return json(403, { error: "Security check failed. Please reload the page." });
  var exp = Date.now() + 12 * 3600 * 1000;
  var sig = await hmacHex(env.RATE_HMAC_KEY, "aura." + exp);
  var r = json(200, { ok: true });
  r.headers.append("Set-Cookie", "aura_session=" + exp + "." + sig + "; HttpOnly; Secure; SameSite=Strict; Path=/api/aura; Max-Age=43200");
  return r;
}

var public_default = {
  async fetch(request, env) {
    var url = new URL(request.url);
    var cp = cleanPath(url.pathname);
    if (cp === null) return plain(404, "Not found");

    if (cp === "/api/aura/tools" && request.method === "GET") return json(200, { tools: TOOL_REGISTRY, autonomous: false });
    if (cp === "/api/aura/tool") {
      if (request.method !== "POST") return json(405, { error: "Method not allowed" });
      if (!(await sessionOk(request, env))) return json(403, { error: "Security check needed." });
      if (!rateOk(request.headers.get("CF-Connecting-IP") || "unknown")) return json(429, { error: "Please wait a minute." });
      try {
        const body = await request.json();
        return json(200, { tool: body.tool, result: runTool(body.tool, body.input), effect: "none" });
      } catch (e) { return json(400, { error: "Tool could not run: " + (e.message || "invalid input") }); }
    }
    if (cp === "/api/aura/chat") {
      if (!(await sessionOk(request, env))) return json(403, { error: "One-time security check needed. Please reload the page once." });
      return auraChat(request, env);
    }
    if (cp === "/api/aura/session") return auraSession(request, env);
    if (cp === "/api/aura/status") {
      if (request.method !== "GET" && request.method !== "HEAD") return json(405, { error: "Method not allowed" });
      return json(200, { providers: providerStatus(env) });
    }

    if (request.method !== "GET" && request.method !== "HEAD") return plain(405, "Method not allowed", "GET, HEAD");
    if (/^\/(api|admin)(\/|$)/i.test(cp)) return plain(404, "Not found");
    url.pathname = cp;
    return wrap(await env.ASSETS.fetch(new Request(url.toString(), request)), cp);
  }
};
export { public_default as default };
