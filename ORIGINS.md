# Kalei Coffee: Coffee Origins

**Source:** https://www.kaleicoffee.com/collections/coffee-bags
**Checked:** 14 Sep 2026

## Countries

Kalei sources its coffee bags from **4 countries**. Each one is named directly in the product titles.

| Country | Coffees on the page |
|---|---|
| 🇪🇹 Ethiopia | Gedeb Washed · Chechele Natural Anaerobic · Tome Natural |
| 🇨🇴 Colombia | Finca Monteblanco Geisha · Finca Monteblanco Coconut Lemonade |
| 🇧🇷 Brazil | Yellow Bob-o-link · Grutta SW Decaf |
| 🇸🇻 El Salvador | Las Isabelas Natural |

### No country stated

- **Nueva Granada Specialty Robusta:** "Nueva Granada" was the colonial name for Colombia, so it is probably Colombian. This is **not confirmed** on the product page.
- **Kalei Suspendu:** a house coffee with no origin listed. It may be a blend.

### Not coffee beans

These items on the page are brewing products, not coffee: Apax Lab Mineral Concentrates, Ready-to-Brew UFO Filters, and UFO Drip Coffee Pouch.

## How the slider uses this

`index.html` in this folder has one slide per country, in this order. You pick a country with the flag buttons on the middle line.

| # | Flag | Featured coffee | Theme |
|---|---|---|---|
| 01 | Ethiopia | Gedeb Washed | Terracotta / cream |
| 02 | Colombia | Finca Monteblanco Geisha | Sage / green |
| 03 | Brazil | Yellow Bob-o-link | Espresso / gold (dark) |
| 04 | El Salvador | Las Isabelas Natural | Sky blue / cream |

### ⚠️ Placeholders to replace

Only the **country and coffee names** come from Kalei's site. These fields are placeholders I wrote:

- `desc`: the description paragraph
- `notes`: the flavor chips
- `profile`: the acidity, body and sweetness bars
- `roast`, `process`, `price`, `weight`
- `BRAND`: still set to "Ember & Oak"

Take the real values from each product page before this is used publicly.

### Editing

All content lives in the `ORIGINS` list near the top of the `<script>` in `index.html`:

```js
{ country:'Brazil', origin:'BRAZIL', region:'', title:'Yellow Bob-o-link',
  roast:'Medium Roast', process:'Natural', flag:'…css…',
  desc:'…', notes:[…], profile:{ Acidity:30, Body:80, Sweetness:75 },
  price:'$16', weight:'250 g',
  theme:{ stage, panel, ink, accent, bean, word },
  bag:{ body, label, labelInk },
  images:{ bag:'img/brazil-bag.png', bg:'' } }
```

- **Add a country:** add another entry to the list. A new flag appears on the middle line automatically.
- **Swap in a real bag photo:** set `images.bag` to a transparent PNG or WebP, about 0.68 wide to 1 tall.

## Bag renders (14 Sep 2026)

All four slides now use designed bags rendered by Gemini Studio, built on the two sample bags in `ref/`:

| Origin | Bag | Design |
|---|---|---|
| Ethiopia | Kraft roll-top | Terracotta highland terraces + coffee branch |
| Colombia | Matte pouch, forest green | Cream label, Andes + geisha flower |
| Brazil | Matte pouch, black | Gold foil bobolink on a coffee branch |
| El Salvador | Kraft roll-top | Blue volcano over coffee rows |

- `gen/`: raw renders straight from Gemini (white studio background).
- `img/<origin>-bag.png`: transparent cutouts the slider loads.
- `tools/gen_bags.js [origin …]`: queue renders on Gemini Studio (127.0.0.1:4321, Pro model). Prompts live in this file.
- `tools/cutout.py <gen file> <img file>`: remove the white background and contact shadow, then trim.
- `tools/shot.js out.png [w h slide wait]`: CDP screenshot of `index.html` at a true viewport size.
- `index.html.bak-svgbags`: the version with the vector bags.

⚠️ The bags print the placeholder brand **EMBER & OAK**. If the brand changes, re-render them.

## Background frames and beans (14 Sep 2026)

**Backgrounds (`img/<origin>-bg.jpg`, 1400×1400):** sunlight through coffee-farm foliage casting soft shadows on a wall in the slide's own colour. The centre stays calm for the bag.

| Origin | Shadows | Light |
|---|---|---|
| Ethiopia | Coffee branch with cherries | Low golden sun, upper left |
| Colombia | Banana-leaf shade trees | Cool morning haze, upper right |
| Brazil | Palm fronds | Gold light pool on dark espresso |
| El Salvador | Shade-tree leaves | Bright midday light, sun glow upper right |

- `tools/gen_bgs.js [origin …]`: queue the background renders.
- `tools/grade_bg.py <gen> <img> "#hex" [contrast]`: shifts the image so its median colour equals the slide's `theme.stage`, which keeps it in step with the panel. Ethiopia uses contrast 0.8, Colombia and El Salvador 0.85, Brazil 1.0.

**Beans (`img/beans-light-1..9.png`, `img/beans-medium-1..9.png`):** real bean sprites from two Gemini sheets. Light roast is used for Ethiopia, Colombia and El Salvador; medium roast for Brazil. Set per slide with `images.beans`. Beans with a parallax depth under 0.4 get a slight blur.

- `tools/gen_beans.js [light|medium]`: queue a 3×3 bean sheet.
- `tools/slice_beans.py <gen> img/beans-<roast>`: cut a sheet into sprites in reading order. If a sheet gives a different count, change `BEAN_SPRITES` in `index.html`.
- `tools/studio.js`: the shared Gemini Studio runner the three `gen_*` scripts use.

## Image pipeline and loading speed

The site loads **WebP only**, from `img/`. The PNG/JPG masters live in `art/`, which stays on this PC and out of git. Write new cutouts, graded backgrounds and bean sprites into `art/`, then run:

```
python tools/optimize.py
```

| Image | Size | Why |
|---|---|---|
| `<origin>-bag.webp` | native (~450×800) | phones show the bag about 300 css px tall at 3×, so it needs the full size |
| `<origin>-bg.webp` | 1400 px | desktop |
| `<origin>-bg-m.webp` | 800 px | phones; it's a soft photo, so the loss doesn't show |
| `beans-<roast>-N.webp` | 160 px max | the largest bean displays at 74 css px |

How the page loads:
- The first slide's bag and background are preloaded in `<head>`, and phones get the `-m` background.
- ⚠️ If you reorder `ORIGINS`, change those preload links too.
- Every other slide's images wait until the page has loaded, then fill in while the browser is idle (`hydrate()` in the script). Changing slides also loads that slide first, in case it's still waiting.
- On phones the bag and bean shadows use smaller blurs, which cost much less to animate.
- `index.html.bak-svgbeans`: the version before backgrounds and bean sprites.
- **Study the motion:** open `index.html?slow=5` to play the animations at ⅕ speed.
