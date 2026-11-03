# juandagarc.com

The portfolio of Juan David García (Juandagarc), Full Stack & AI Engineer: a scroll-driven walk through a 3D glass
gallery, built with Three.js. Live at **[juandagarc.com](https://juandagarc.com)**.

## What's inside

- A scroll tour whose camera glides from room to room: the glass name, about me, the journey, then the work.
- Each project on a glass laptop with a real screenshot of the site, opening as you get close; a sheet with the
  stack, a link to the site and, where it's public, to the code.
- *Rompe el cristal*, a parkour minigame starring a 3D-scanned classical statue, rigged and skinned in the browser:
  run, slide, crouch, wall-jump and shoot the glass bricks.
- A contact form that sends straight to my inbox (through [FormSubmit](https://formsubmit.co)).
- Spanish and English, sound on demand (Chopin), and a lighter mode for phones and reduced motion.

## Stack

Three.js 0.170 as ES modules from jsDelivr through an import map, vanilla JavaScript, custom GLSL glass shaders and
WebAudio. No framework and no build step: what's in this repo is what's served.

```
index.html        the page: styles, markup, import map
js/main.js        renderer, scene, quality tiers, frame loop
js/tour.js        scroll → camera path
js/world.js       layout of the rooms and showcases
js/ui.js          panels, project sheet, contact form, language
js/game.js        the minigame
js/statue.js      turns the statue scan into a skinned, animated character
js/materials.js   glass and metal shaders
js/rooms/         one module per room
assets/           screenshots, sculpture scans, music
```

## Run locally

Serve the folder over HTTP (ES modules and `fetch` don't work from `file://`):

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Static on Vercel: `vercel.json` skips the install and build steps, so every push to `main` goes live as is.

## Credits

Sculptures: 3D scans of casts in the Royal Cast Collection, SMK – National Gallery of Denmark (CC0). Head of David:
"Head Of Michelangelo's David, Optimised" by nebulousflynn1, Zenodo, CC BY 4.0, from an SMK scan. Music: Frédéric
Chopin, Ballade No. 1 in G minor, Op. 23, performed by Frank Lévy for Musopen (CC BY 4.0).

The previous version of this site (Next.js) is kept on the `legacy-nextjs` branch.
