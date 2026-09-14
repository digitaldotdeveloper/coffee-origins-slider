// Left-half background frames, one per origin: sunlight through that origin's
// farm foliage casting shadows on a wall in the slide's stage colour.
// Usage: node tools/gen_bgs.js [key ...]   -> gen/<key>-bg-*.png, then tools/grade_bg.py
const { run } = require('./studio');

const COMMON = `Square 1:1 image. Photographic, soft and atmospheric, slightly out of focus like a shallow depth-of-field studio backdrop.
The composition must stay calm and nearly empty in the centre: the leaf shadows fall mostly across the top and the outer edges, fading out toward the middle and the bottom. This is a background behind a product, so there is NO product, NO objects, NO plants in frame (only their shadows), NO floor line, NO horizon, NO text, NO logos, NO people.`;

const BGS = {
  ethiopia: { prompt:
`A smooth matte plaster wall painted warm sand-apricot (#EBCFA6), lit by low golden late-afternoon sun from the upper left. Across it fall soft dappled shadows of a coffee plant branch: long glossy pointed leaves and small clusters of round coffee cherries, the shadow edges slightly blurred. Warm, dry, highland light with a gentle glow.` },
  colombia: { prompt:
`A smooth matte plaster wall painted soft sage green (#B8CCB2), lit by cool hazy early-morning light from the upper right. Across it fall large soft shadows of broad banana leaves, the shade trees of a Colombian mountain coffee farm, with a few smaller coffee leaves between them. Faint mist in the air, very gentle contrast, fresh and cool.` },
  brazil: { prompt:
`A dark, moody matte wall in deep espresso brown, almost black (#1E1714). A single warm golden pool of light glows softly from the upper right, and within that light fall soft blurred shadows of tropical palm fronds. Very low-key and rich, the edges and the lower half fall off into darkness, a faint warm gold haze in the light. Luxurious, quiet.` },
  elsalvador: { prompt:
`A smooth matte plaster wall painted pale powder sky blue (#AFC6DA), lit by clear bright midday light from the upper left. Across it fall crisp but soft-edged shadows of small oval shade-tree leaves and a coffee branch, and in the upper right corner a soft round glow of sunlight. Airy, clean, calm.` },
};

run(BGS, { suffix: '-bg', common: COMMON }).catch(e => { console.error(e); process.exit(1); });
