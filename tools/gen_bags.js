// One designed-bag render per origin, built on the sample bags in ref/ (also in Studio uploads/).
// Usage: node tools/gen_bags.js [key ...]   -> gen/<key>-*.png, then tools/cutout.py
const { run } = require('./studio');

const COMMON = `Keep the exact bag construction, proportions, material and camera angle of the attached reference photo, but it is now a finished retail specialty-coffee bag with printed packaging design.
Isolate it: plain flat pure white seamless background (#FFFFFF), no coffee beans, no props, no floor texture, only a very soft contact shadow directly under the bag. Whole bag in frame with margin on all sides, portrait framing, sharp studio product photography, soft even light.
All printed text must be spelled exactly as written, crisp and legible. No other words, no barcodes, no fake small print.`;

const BAGS = {
  ethiopia: { ref: 'coffee-ref-kraft-bag.jpg', prompt:
`Reference: a kraft paper coffee bag with a folded top and a round sticker.
Design printed on the front of the kraft bag in terracotta orange (#C4512E) and dark brown ink: a hand-drawn line illustration of Ethiopian highland coffee terraces and a coffee branch with cherries, small wordmark "EMBER & OAK" at the top, large bold condensed title "ETHIOPIA", below it in elegant italic serif "Gedeb Washed", and a small pill-shaped tag "LIGHT ROAST". The round sticker on the fold is terracotta with a small cream coffee bean icon.` },
  colombia: { ref: 'coffee-ref-matte-pouch.jpg', prompt:
`Reference: a matte stand-up block-bottom coffee pouch with a round one-way degassing valve.
Recolour the pouch to a deep matte forest green (#1F5A46), keep the valve. Front design: a cream (#EBDAB8) rectangular label with rounded corners in the middle of the front, printed in dark green ink with a delicate line illustration of Andean mountains and a geisha coffee flower, small wordmark "EMBER & OAK" at the top of the label, large bold condensed title "COLOMBIA", below it in elegant italic serif "Monteblanco Geisha", and a small pill-shaped tag "LIGHT ROAST".` },
  brazil: { ref: 'coffee-ref-matte-pouch.jpg', prompt:
`Reference: a matte black stand-up block-bottom coffee pouch with a round one-way degassing valve.
Keep the pouch matte black and the valve. Front design printed directly on the black in metallic warm gold (#E3B94F) foil: a fine line illustration of a bobolink bird perched on a coffee branch, small wordmark "EMBER & OAK" at the top, large bold condensed title "BRAZIL", below it in elegant italic serif "Yellow Bob-o-link", and a small pill-shaped outline tag "MEDIUM ROAST".` },
  elsalvador: { ref: 'coffee-ref-kraft-bag.jpg', prompt:
`Reference: a kraft paper coffee bag with a folded top and a round sticker.
Design printed on the front of the kraft bag in deep sky blue (#2F5E8C) ink: a hand-drawn line illustration of a volcano rising over coffee rows with a small sun, small wordmark "EMBER & OAK" at the top, large bold condensed title "EL SALVADOR", below it in elegant italic serif "Las Isabelas Natural", and a small pill-shaped tag "LIGHT ROAST". The round sticker on the fold is blue with a small cream coffee bean icon.` },
};

run(BAGS, { common: COMMON }).catch(e => { console.error(e); process.exit(1); });
