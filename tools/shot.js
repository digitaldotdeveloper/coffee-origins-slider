// Screenshot the slider through CDP at true viewport sizes.
// node tools/shot.js out.png [width height slideIndex waitSec]
// Uses its own Chrome profile and closes only that browser (Gemini Studio's Chrome keeps running).
const { spawn } = require('child_process'), fs = require('fs'), path = require('path'), os = require('os');
const [out = 'shot.png', W = '1600', H = '900', SLIDE = '0', WAIT = '4'] = process.argv.slice(2);
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
const PORT = 9347, PROFILE = path.join(os.tmpdir(), 'coffee-slider-cdp');
const url = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/') + '?cb=' + Date.now();
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const ch = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 40 && !targets; i++) { await sleep(250); try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); } catch {} }
  const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let n = 0; const pending = {};
  ws.onmessage = e => { const m = JSON.parse(e.data); if (pending[m.id]) { pending[m.id](m.result || m.error); delete pending[m.id]; } };
  const send = (method, params = {}) => new Promise(r => { pending[++n] = r; ws.send(JSON.stringify({ id: n, method, params })); });
  const mobile = +W < 700;
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: +W, height: +H, deviceScaleFactor: 1, mobile });
  await send('Page.navigate', { url });
  await sleep(2500);
  if (+SLIDE) { await send('Runtime.evaluate', { expression: `originSlider.go(${+SLIDE})` }); }
  await sleep(+WAIT * 1000);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('saved', out);
  await send('Browser.close').catch(() => {});
  ws.close(); ch.kill();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
