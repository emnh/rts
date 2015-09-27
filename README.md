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

# Resources
 - [Three.js](http://threejs.org/)
 - [Three.js model editor](http://threejs.org/editor/) Can import .obj and export to .json.
 - [OpenGameArt](http://opengameart.org/)
 - [Turbosquid 3D Models](http://www.turbosquid.com)

# TODO

## Code
 - Separate game logic from rendering
 - Remove old bounding box mesh, use BoundingBoxHelper instead
 - Fix box mesh to contain unit exactly

## Functionality
 - Make funky lighting optional via menu
 - Constrain camera controls to stay on map
 - Pathfinding / A-star
 - Minimap
   - Add terrain
   - Link minimap camera rotation to screen camera rotation?
   - Fix minimap camera rectangle to show real terrain, not plane?
 - Configurable keyboard controls
 - Map editor
   - Export/import terrain as JSON
   - Terraforming (like [Worldmonger](http://www.babylonjs.com/Scenes/Worldmonger/index.html))
 - Move selected unit according to its move speed
  - Target
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
