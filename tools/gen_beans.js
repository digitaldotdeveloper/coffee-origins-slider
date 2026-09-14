// Bean sprite sheets: nine separate roasted beans per roast level, sliced by tools/slice_beans.py.
// Usage: node tools/gen_beans.js [light|medium]   -> gen/<key>-beans-*.png
const { run } = require('./studio');

const COMMON = `A sprite sheet of exactly 9 individual whole roasted coffee beans laid out in a loose 3 by 3 grid, every bean well separated by wide white space, no bean touching another or the image edge.
Each bean is seen from a different angle: flat face with the S-shaped centre crease, rounded back, side profile, three-quarter view, tilted, one slightly cracked open along the crease. Natural, slightly irregular real bean shapes and sizes.
Macro studio product photography, every bean in sharp focus, soft even light, pure flat white background (#FFFFFF), no shadows under the beans, no other objects, no text.`;

const BEANS = {
  light: { prompt: `Light roast specialty coffee beans: even cinnamon to light chestnut brown, dry matte surface with a faint satin sheen, the pale centre crease clearly visible, no oil.` },
  medium: { prompt: `Medium roast coffee beans: rich chocolate chestnut brown, a soft satin surface with only the faintest sheen, the centre crease visible, no oily shine.` },
};

run(BEANS, { suffix: '-beans', common: COMMON }).catch(e => { console.error(e); process.exit(1); });
