# Rebecca Lin — portfolio

Static public portfolio. Edit `index.html`, `stylesheets/main.css`, and `js/main.js` directly. Only referenced public media belongs here.

Preview locally with `python3 -m http.server 8000`. GitHub Pages serves the repository root on the `master` branch.

## Studio notebook

`studio/index.html` holds entries in newest-first reading order. Add a figure at the top of `.desk-grid`. Choose `wide`, `narrow`, `small`, or `medium`; use `full` for paired images. Replace the placeholder div with an image with descriptive alt text, intrinsic width/height, and `loading="lazy"`. Images keep their original proportions. Captions, dates (use a `time` element), and links are optional. Wrap an image in an anchor for a linked entry. Current abstract placeholders are layout samples, not portfolio works.

Both pages load `stylesheets/shared.css` after their page-specific CSS. Use it for shared colors, type families, header/navigation, and page widths.

## Field Notes

`field-notes/index.html` restores the original dated-list template; `field-notes/tide/index.html` is the Tide fabrication tutorial. Edit these static pages directly. `stylesheets/blog.css` is copied from the original template, with public-site adaptations in `stylesheets/field-notes.css`.

The tutorial model uses self-hosted Three.js r169 and actual cutting profiles in `field-notes/tide/assets/parts.js`. `assembly.js` controls the continuous explosion slider, rotation, full acrylic height, and front-wall visibility. The photo derivatives omit EXIF. The plywood PDF includes the 6 October 2026 access revision. The acrylic PDF has three pages ordered front, middle, back. When the design changes, update the geometry, affected PDFs, and their previews together.
