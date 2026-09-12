# Broken glass video

[Open the live demo](https://tkmoney.github.io/broken_glass/).

A looping video viewed through an SVG displacement filter and glass overlay,
with dark Tweakpane controls. No PixiJS, canvas, build tool, or JavaScript
preprocessor is required.

## GitHub Pages

The root `index.html` is the complete demo. It uses relative asset URLs and the
vendored Tweakpane 4.0.5 module, so the page does not depend on a CDN.

The workflow in `.github/workflows/pages.yml` publishes pushes to `main` to
GitHub Pages. In the repository's **Settings > Pages**, the source is
**GitHub Actions**. The build has `contents: read`; only the deployment job has
`pages: write` and `id-token: write`. The workflow collects the static page,
styles, scripts, `assets/`, `vendor/`, and `codepen/` into its Pages artifact.

## CodePen

1. Paste `codepen/index.html` into the HTML panel.
2. Paste `codepen/style.css` into the CSS panel.
3. Paste `codepen/script.js` into the JavaScript panel.

Leave all preprocessors set to **None**. No external script settings are needed:
the JavaScript dynamically imports the pinned Tweakpane 4.0.5 CDN module.
The four asset URLs already point to this repository's public GitHub Pages
site, including the displacement map used by cross-origin `fetch`.
No uploads or additional hosting are needed while this Pages site is available.
The CodePen HTML is a panel fragment, not a separate standalone demo.

The root demo and CodePen panels share the same behavior. If changing it, update
both copies; keep the root asset URLs relative and the CodePen URLs absolute.
There is deliberately no preview-generation helper that could overwrite the
root page with the HTML fragment.

## Local preview

From the repository root:

```powershell
python -m http.server 8767 --bind 127.0.0.1
```

Open `http://127.0.0.1:8767/`. Use HTTP, not `file://`, because the displacement
map is fetched and Tweakpane is imported as a module.

## Behavior

- The extracted frame-zero poster appears with the glass effect before playback.
  There is no autoplay.
- Play is a separate, unfiltered button and disappears during playback.
- Playback loops with audio; sound begins only after a user clicks Play.
- Dark Tweakpane controls adjust the effect, displacement, glass opacity, playback
  speed, mute, volume, play/pause, and reset to the first frame.
- The video fills the viewport height and preserves its 1280 x 720 aspect ratio.
  Narrow windows crop the sides symmetrically without horizontal scrolling;
  wider windows reveal the black background at the sides.
- The SVG map and glass overlay resize with the full video rectangle. The filter
  uses sRGB channels and a displacement scale measured in CSS pixels.

Large SVG video filters can be expensive. Lower the displacement or disable the
effect to compare performance in your target browser. Major cracks are derived
from the supplied image; faint fracture boundaries and shard tilt in the
displacement map are approximations.

## Files and attribution

| Path | Purpose |
| --- | --- |
| `index.html`, `style.css`, `script.js` | Standalone Pages demo |
| `codepen/` | HTML, CSS, and JavaScript panels ready to paste |
| `assets/tv.mp4` | Original user-supplied 1280 x 720 video |
| `assets/first-frame.jpg` | Frame-zero poster extracted from that video |
| `assets/glass.png` | Original user-supplied glass texture |
| `assets/glass-displacement-rg.png` | Generated red/green displacement map |
| `vendor/tweakpane.min.js` | Tweakpane 4.0.5 ES module |
| `vendor/TWEAKPANE-LICENSE.txt` | Tweakpane's MIT license |

Tweakpane is copyright cocopon and is MIT-licensed; its license and minified
header are preserved. That license applies to Tweakpane, not to the supplied
video, images, or their derivatives. No media license is granted by this README.
