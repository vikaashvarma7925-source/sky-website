/* SKY mini tools core. No network, no storage. */
(function (root) {
  'use strict';
  var seg = typeof Intl !== 'undefined' && Intl.Segmenter;
  // ---------- Word & character counter ----------
  function countText(text) {
    var t = String(text || '');
    var words = 0, graphemes = 0;
    if (seg) {
      var ws = new Intl.Segmenter(undefined, { granularity: 'word' });
      for (var w of ws.segment(t)) if (w.isWordLike) words++;
      var gs = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      for (var g of gs.segment(t)) { graphemes++; }
    } else { words = (t.match(/\S+/g) || []).length; graphemes = Array.from(t).length; }
    var noSpace = 0;
    if (seg) { var gs2 = new Intl.Segmenter(undefined, { granularity: 'grapheme' }); for (var g2 of gs2.segment(t)) if (!/^\s+$/.test(g2.segment)) noSpace++; }
    else noSpace = Array.from(t.replace(/\s+/g, '')).length;
    var sentences = (t.match(/[^.!?\u0964\u0965]+[.!?\u0964\u0965]+|[^.!?\u0964\u0965\s][^.!?\u0964\u0965]*$/g) || []).filter(function (s) { return /\S/.test(s); }).length;
    var paragraphs = t.split(/\n\s*\n/).filter(function (p) { return /\S/.test(p); }).length;
    var lines = t === '' ? 0 : t.split(/\r\n|\r|\n/).length;
    return { words: words, characters: graphemes, charactersNoSpaces: noSpace, codePoints: Array.from(t).length, sentences: sentences, paragraphs: paragraphs, lines: lines };
  }
  // ---------- Duplicate line remover ----------
  function dedupe(text, o) {
    o = o || {};
    var lines = String(text || '').split(/\r\n|\r|\n/);
    var seen = new Set(), out = [], removed = 0, blank = 0;
    lines.forEach(function (line) {
      var work = o.trim ? line.trim() : line;
      if (o.removeBlank && work.trim() === '') { blank++; return; }
      var key = o.ignoreCase ? work.toLocaleLowerCase() : work;
      key = key.normalize('NFC');
      if (seen.has(key)) { removed++; return; }
      seen.add(key); out.push(work);
    });
    if (o.sort) out.sort(function (a, b) { return a.localeCompare(b); });
    return { text: out.join('\n'), kept: out.length, removedDuplicates: removed, removedBlank: blank, total: lines.length };
  }
  // ---------- Lucky draw ----------
  function randBelow(n) { // unbiased
    var lim = Math.floor(4294967296 / n) * n, a = new Uint32Array(1);
    do { crypto.getRandomValues(a); } while (a[0] >= lim);
    return a[0] % n;
  }
  function draw(names, count, o) {
    o = o || {};
    var list = String(names || '').split(/\r\n|\r|\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!o.keepDuplicates) { var s = new Set(), u = []; list.forEach(function (n) { var k = n.toLocaleLowerCase(); if (!s.has(k)) { s.add(k); u.push(n); } }); list = u; }
    if (!list.length) return { error: 'Add at least one name.' };
    count = Math.floor(Number(count) || 1);
    if (count < 1) return { error: 'Winners must be at least 1.' };
    if (count > list.length) return { error: 'You asked for ' + count + ' winners but there are only ' + list.length + ' names.' };
    var pool = list.slice(), winners = [];
    for (var i = 0; i < count; i++) { var k = randBelow(pool.length); winners.push(pool[k]); pool.splice(k, 1); }
    return { winners: winners, total: list.length };
  }
  // ---------- CSV to VCF ----------
  function parseCSV(text) {
    text = String(text || '').replace(/^\uFEFF/, '');
    var rows = [], row = [], f = '', q = false, i = 0;
    for (; i < text.length; i++) {
      var c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"' && f === '') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); f = ''; rows.push(row); row = []; }
      else f += c;
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    var res = rows.filter(function (r) { return r.some(function (x) { return x.trim() !== ''; }); });
    res.unterminated = q;
    return res;
  }
  function esc(v) { return String(v).replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
  function fold(line) { // RFC 6350/2426: fold at 75 octets, never inside a UTF-8 character
    var enc = new TextEncoder(), out = [], cur = '', curB = 0, limit = 75;
    for (var ch of line) { var b = enc.encode(ch).length; if (curB + b > limit) { out.push(cur); cur = ' '; curB = 1; limit = 75; } cur += ch; curB += b; }
    out.push(cur); return out.join('\r\n');
  }
  var COL = {
    first: /^(first\s*name|given\s*name|firstname|first)$/i, last: /^(last\s*name|family\s*name|surname|lastname|last)$/i,
    name: /^(name|full\s*name|contact\s*name|display\s*name)$/i, phone: /^(phone|mobile|mobile\s*(no|number)|phone\s*(no|number)|contact(\s*(no|number))?|number|tel|telephone|whatsapp)$/i,
    phone2: /^(phone\s*2|mobile\s*2|alternate\s*(phone|mobile|number)|other\s*phone)$/i, email: /^(e-?mail|email\s*(id|address))$/i, org: /^(company|organi[sz]ation|org)$/i
  };
  function detect(headers) {
    var m = {}; headers.forEach(function (h, i) { var t = h.trim(); Object.keys(COL).forEach(function (k) { if (m[k] == null && COL[k].test(t)) m[k] = i; }); }); return m;
  }
  function csvToVcf(text, mapOverride) {
    var rows = parseCSV(text);
    if (rows.unterminated) return { error: 'This file has a quote mark (") that is never closed, so the contacts cannot be read safely. Open the file, fix that row and try again.' };
    if (rows.length < 2) return { error: 'The file needs a header row and at least one contact.' };
    var headers = rows[0], map = Object.assign(detect(headers), mapOverride || {});
    if (map.name == null && map.first == null && map.last == null) return { error: 'Could not find a name column. Use a header like Name or First Name.', headers: headers };
    if (map.phone == null && map.email == null) return { error: 'Could not find a phone or email column. Use a header like Phone, Mobile or Email.', headers: headers };
    var cards = [], skipped = [];
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r], get = function (k) { return map[k] == null ? '' : (row[map[k]] || '').trim(); };
      var first = get('first'), last = get('last'), full = get('name') || [first, last].filter(Boolean).join(' ');
      var phones = [get('phone'), get('phone2')].filter(Boolean), email = get('email'), org = get('org');
      if (!full && !phones.length && !email) continue;
      if (!full) { skipped.push(r + 1); continue; }
      var L = ['BEGIN:VCARD', 'VERSION:3.0'];
      L.push('N:' + esc(last || (first ? '' : full)) + ';' + esc(first || (last ? '' : '')) + ';;;');
      if (!first && !last) L[2] = 'N:' + esc(full) + ';;;;';
      L.push('FN:' + esc(full));
      if (org) L.push('ORG:' + esc(org));
      phones.forEach(function (p) { L.push('TEL:' + esc(p)); });
      if (email) L.push('EMAIL;TYPE=INTERNET:' + esc(email));
      L.push('END:VCARD');
      cards.push(L.map(fold).join('\r\n'));
    }
    if (!cards.length) return { error: 'No valid contacts found.', skippedRows: skipped };
    return { vcf: cards.join('\r\n') + '\r\n', count: cards.length, skippedRows: skipped, mapping: map, headers: headers };
  }
  // ---------- Image converter ----------
  async function convertImage(file, type, quality) {
    var okIn = /^image\/(jpeg|png|webp)$/.test(file.type);
    if (!okIn) return { error: 'Use a JPG, PNG or WebP image. HEIC is not supported.' };
    if (file.size > 30 * 1024 * 1024) return { error: 'File is bigger than 30 MB.' };
    var bmp; try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) { return { error: 'This image could not be opened.' }; }
    if (bmp.width * bmp.height > 60e6) return { error: 'Image is too large (over 60 megapixels).' };
    var c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height; var g = c.getContext('2d');
    if (type === 'image/jpeg') { g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); }
    g.drawImage(bmp, 0, 0);
    var blob = await new Promise(function (r) { c.toBlob(r, type, quality); });
    if (!blob) return { error: 'The browser could not create this format.' };
    if (blob.type !== type) return { error: 'This browser cannot save ' + type.split('/')[1].toUpperCase() + '. Try Chrome, or choose JPG or PNG.' };
    return { blob: blob, width: bmp.width, height: bmp.height };
  }
  root.SkyMini = { countText: countText, dedupe: dedupe, draw: draw, randBelow: randBelow, parseCSV: parseCSV, csvToVcf: csvToVcf, convertImage: convertImage };
})(window);
