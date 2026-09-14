// Tiny Gemini Studio runner shared by gen_bags.js and gen_bgs.js.
// run(JOBS, { suffix }) queues every job (or only the keys named on the command
// line), waits for them, and downloads each image to gen/<key><suffix>-<ts>.png.
const fs = require('fs'), path = require('path');
const STUDIO = 'C:/Users/it/Desktop/Gemini Prompt Sender/dashboard';
const BASE = 'http://127.0.0.1:4321';
const TOK = require(STUDIO + '/tokens.json').find(t => t.name === 'my script').token;
const OUT = path.join(__dirname, '..', 'gen');

const api = async (p, body) => {
  const r = await fetch(BASE + p, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
  if (!r.ok) throw new Error(p + ' ' + r.status + ' ' + await r.text());
  return r.json();
};

async function run(JOBS, { suffix = '', common = '' } = {}) {
  fs.mkdirSync(OUT, { recursive: true });
  const args = process.argv.slice(2);
  const keys = args.length ? args : Object.keys(JOBS);
  const want = {};
  for (const k of keys) {
    const j = JOBS[k];
    if (!j) throw new Error('unknown key ' + k);
    const res = await api('/api/generate', { prompt: j.prompt + '\n' + common, mode: 'image', model: 'Pro', runs: 1, attach: j.ref ? [{ kind: 'up', file: j.ref }] : [] });
    console.log('queued', k, res.queued.join(','));
    res.queued.forEach(id => want[id] = k);
  }
  const done = new Set();
  while (done.size < Object.keys(want).length) {
    await new Promise(r => setTimeout(r, 15000));
    const s = await api('/api/state');
    for (const j of s.jobs) {
      if (!want[j.id] || done.has(j.id) || !['done', 'error', 'failed', 'cancelled'].includes(j.status)) continue;
      done.add(j.id);
      if (!j.images || !j.images.length) { console.log('FAILED', want[j.id], j.status, j.error, (j.responseText || '').slice(0, 200)); continue; }
      for (const [n, libId] of j.images.entries()) {
        const rel = s.library.find(e => e.id === libId).file;
        const buf = Buffer.from(await (await fetch(BASE + '/images/' + rel, { headers: { Authorization: 'Bearer ' + TOK } })).arrayBuffer());
        const f = path.join(OUT, `${want[j.id]}${suffix}-${Date.now()}-${n}${path.extname(rel) || '.png'}`);
        fs.writeFileSync(f, buf);
        console.log('saved', want[j.id], f, buf.length);
      }
    }
  }
}

module.exports = { run };
