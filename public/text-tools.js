/* SKY text & password tools - all processing on-device, no network. */
(function () {
  var tool = document.body.getAttribute('data-tool');
  function $(id) { return document.getElementById(id); }
  function show(el, msg) { el.textContent = msg; }
  function copyText(text, statusEl) {
    function done(ok) { show(statusEl, ok ? 'Copied to clipboard.' : 'Copy failed - long-press the text to copy it.'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(); });
    } else fallback();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); done(ok);
    }
  }

  if (tool === 'password') {
    var len = $('pwLen'), lenOut = $('pwLenOut'), out = $('pwOut'), status = $('pwStatus');
    function randBelow(max) {
      var limit = Math.floor(4294967296 / max) * max, x;
      do { x = crypto.getRandomValues(new Uint32Array(1))[0]; } while (x >= limit);
      return x % max;
    }
    function gen() {
      var lower = 'abcdefghjkmnpqrstuvwxyz', upper = 'ABCDEFGHJKMNPQRSTUVWXYZ', nums = '23456789', syms = '!@#$%&*?';
      var chars = lower, must = [lower];
      if ($('pwUpper').checked) { chars += upper; must.push(upper); }
      if ($('pwNums').checked) { chars += nums; must.push(nums); }
      if ($('pwSyms').checked) { chars += syms; must.push(syms); }
      var n = parseInt(len.value, 10);
      var pw = [];
      for (var i = 0; i < must.length && i < n; i++) pw.push(must[i][randBelow(must[i].length)]);
      for (var j = pw.length; j < n; j++) pw.push(chars[randBelow(chars.length)]);
      for (var k = pw.length - 1; k > 0; k--) { var r = randBelow(k + 1); var t = pw[k]; pw[k] = pw[r]; pw[r] = t; }
      out.textContent = pw.join('');
      show(status, 'New password ready. Tap it to copy.');
    }
    len.addEventListener('input', function () { lenOut.textContent = len.value; });
    $('pwGen').addEventListener('click', gen);
    out.addEventListener('click', function () { if (out.textContent.trim()) copyText(out.textContent, status); });
    gen();
  }

  if (tool === 'counter') {
    var ta = $('wcText');
    function count() {
      var t = ta.value;
      var words = (t.trim().match(/\S+/g) || []).length;
      var chars = t.length;
      var noSpace = t.replace(/\s/g, '').length;
      var sents = (t.match(/[^.!?\n]+[.!?]+/g) || (t.trim() ? [t] : [])).length;
      $('wcWords').textContent = words;
      $('wcChars').textContent = chars;
      $('wcNoSpace').textContent = noSpace;
      $('wcSents').textContent = sents;
    }
    ta.addEventListener('input', count);
    $('wcCopy').addEventListener('click', function () { if (ta.value) copyText(ta.value, $('wcStatus')); });
    $('wcClear').addEventListener('click', function () { ta.value = ''; count(); $('wcStatus').textContent = ''; });
    count();
  }

  if (tool === 'case') {
    var inp = $('ccText'), outp = $('ccOut');
    function set(v) { outp.textContent = v; show($('ccStatus'), 'Tap the result to copy.'); }
    $('ccUpper').addEventListener('click', function () { set(inp.value.toUpperCase()); });
    $('ccLower').addEventListener('click', function () { set(inp.value.toLowerCase()); });
    $('ccTitle').addEventListener('click', function () { set(inp.value.toLowerCase().replace(/(^|\s|[("'])([a-z])/g, function (m, p, c) { return p + c.toUpperCase(); })); });
    $('ccSent').addEventListener('click', function () { set(inp.value.toLowerCase().replace(/(^\s*[a-z]|[.!?]\s+[a-z])/g, function (m) { return m.toUpperCase(); })); });
    outp.addEventListener('click', function () { if (outp.textContent.trim()) copyText(outp.textContent, $('ccStatus')); });
  }

  if (tool === 'encoder') {
    function b64encode(s) {
      var bytes = new TextEncoder().encode(s), bin = '';
      bytes.forEach(function (b) { bin += String.fromCharCode(b); });
      return btoa(bin);
    }
    function b64decode(s) {
      var bin = atob(s), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new TextDecoder().decode(bytes);
    }
    function run(inputId, outId, statusId, fn) {
      var v = $(inputId).value;
      if (!v) { show($(statusId), 'Type or paste something first.'); return; }
      try { $(outId).textContent = fn(v); show($(statusId), 'Tap the result to copy.'); }
      catch (e) { show($(statusId), 'That input is not valid for this action.'); }
    }
    $('b64Enc').addEventListener('click', function () { run('b64Text', 'b64Out', 'b64Status', b64encode); });
    $('b64Dec').addEventListener('click', function () { run('b64Text', 'b64Out', 'b64Status', b64decode); });
    $('b64Out').addEventListener('click', function () { if ($('b64Out').textContent.trim()) copyText($('b64Out').textContent, $('b64Status')); });
    $('urlEnc').addEventListener('click', function () { run('urlText', 'urlOut', 'urlStatus', encodeURIComponent); });
    $('urlDec').addEventListener('click', function () { run('urlText', 'urlOut', 'urlStatus', decodeURIComponent); });
    $('urlOut').addEventListener('click', function () { if ($('urlOut').textContent.trim()) copyText($('urlOut').textContent, $('urlStatus')); });
    $('uuidGen').addEventListener('click', function () {
      var u = (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      }));
      $('uuidOut').textContent = u; show($('uuidStatus'), 'Tap the UUID to copy.');
    });
    $('uuidOut').addEventListener('click', function () { if ($('uuidOut').textContent.trim()) copyText($('uuidOut').textContent, $('uuidStatus')); });
  }
})();
