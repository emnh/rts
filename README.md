# Introduction

Unfinished project, but you can see a [demo at github
pages](http://emnh.github.io/rts/) and another [demo displaying only free
3D models, not from SC2](http://alexis.lart.no/emh/snapshots/rts-free.git/).

SC2 files are retrieved from
[viewer.hiveworkshop.com](http://viewer.hiveworkshop.com/?q=Assets/units/zerg/baneling/baneling.m3)
(not mine) through a [heroku CORS proxy](http://crossorigin.herokuapp.com/).
Works best in Firefox, also in Chrome, not in IE and not tested with Safari.
Only tested on Windows.

If the demo doesn't work for you, you can watch videos of it at YouTube:
 - [StarCraft 2 on WebGL](https://www.youtube.com/watch?v=PoPNrz2LUG0)
 - [Starcraft 2 on WebGL with colorful UV mapping](https://www.youtube.com/watch?v=EvhUteDp3o8)
 - [Banelings, banelings, banelings](https://www.youtube.com/watch?v=aqKsVelmeeI)

See also [mdx-m3-viewer](https://github.com/flowtsohg/mdx-m3-viewer).
All credits to flowtsohg for decoding the M3 format in JavaScript.

# Getting started

    git clone https://github.com/emnh/rts rts
    cd rts
    git submodule update --init
    npm install
    ./compile.sh

Now you can open index.html from a web server serving the page.

# Getting started with next generation (currently alpha)

 - First of all follow steps under "Getting started"
 - Then open 2 terminals and run the following:

      cd game; lein figwheel
      cd game; npm install; node figwheel.js

 - Server figwheel runs on port 3450
 - Node (with ClojureScript connected to figwheel on 3450) runs on port 3451
 - Now you can open [the dev page](http://localhost:3451)
 - See [README.md for ng](../master/game/README.md)

# Resources
 - [Three.js](http://threejs.org/)
 - [Three.js model editor](http://threejs.org/editor/) Can import .obj and export to .json.
 - [OpenGameArt](http://opengameart.org/)
 - [Turbosquid 3D Models](http://www.turbosquid.com)

# TODO

## Code
 - Get rid of navigationPlane
 - Modularize index.js
 - Keep game logic separate from rendering
  - Separate 3D meshes from game logic
  - What to do about TWEENS / pause?
 - Remove old bounding box mesh, use BoundingBoxHelper instead
 - Fix box mesh to contain unit exactly
 - Use BufferGeometry for bgeo in m3 loader
 - Figure out why m3 unit portraits render empty (currently replaced by a box)

## Functionality
 - Scale units for unit portrait according to bbox, e.g. HQ size is overfull
 - Add game timer
 - Check for obstacles when moving unit, save bbox structure from last simulation step
 - Better selection indication, ring
 - Make missiles follow ground, or arc, at least not go through it
 - Make funky lighting optional via menu
 - Constrain camera controls to stay on map
 - Minimap
   - Add terrain
   - Link minimap camera rotation to screen camera rotation?
   - Fix minimap camera rectangle to show real terrain, not plane?
 - Configurable keyboard controls
 - Map editor
   - Export/import terrain as JSON
   - Terraforming (like [Worldmonger](http://www.babylonjs.com/Scenes/Worldmonger/index.html))
 - Move selected unit according to its move speed
  - Pathfinding / A-star
  - Waypoint queue
 - Attack another unit
  - Select target unit
 - Show actions specific to selected object
 - Select more than one unit with ctrl or shift
 - Remove dead units from selection
 - Show selected units' portraits
  - Show health on portraits
  - Non-demo: Select only own team units

## Low-priority
 - 3D positioning of sounds
 - Disable unit selection when mouse control for camera is enabled
 - Cursor indicator when camera enabled?

## Server needed
 - Multiplayer
  - Store game state on server
  - Synchronization
