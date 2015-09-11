# Introduction

Unfinished project, but you can see a [demo at github pages](http://emnh.github.io/rts/).
SC2 files are retrieved from hiveworkshop.com (not mine) through a
[heroku CORS proxy](http://crossorigin.herokuapp.com/).
Works best in Firefox, also in Chrome, not in IE and not tested with Safari.
Only tested on Windows.

If the demo doesn't work for you, you can watch videos of it at YouTube:
 - [StarCraft 2 on WebGL](https://www.youtube.com/watch?v=PoPNrz2LUG0)
 - [Starcraft 2 on WebGL with colorful UV mapping](https://www.youtube.com/watch?v=EvhUteDp3o8)
 - [Banelings, banelings, banelings](https://www.youtube.com/watch?v=aqKsVelmeeI)

# Controls

 - Keyboard
  - Home to reset view
  - PgUp/PgDn to zoom in/out
  - Arrow keys to move around
  - Ctrl+arrow keys for camera arc ball rotation 
 - Mouse
   - Left click to select unit
   - Right click to (instantly, for now) move selected units
   - Left click on minimap to move camera

# Getting started:

    git clone https://github.com/emnh/rts rts
    cd rts
    git submodule update --init
    npm install
    ./compile.sh

Now you can open index.html from a web server serving the page.

# Resources
 - [Physijs](http://chandlerprall.github.io/Physijs/)
 - [Three.js](http://threejs.org/)
 - [Three.js model editor](http://threejs.org/editor/) Can import .obj and export to .json.
 - [Turbosquid 3D Models](http://www.turbosquid.com)

# TODO

## Code
 - Separate game logic from rendering
 - Remove old bounding box mesh, use BoundingBoxHelper instead
 - Fix box mesh to contain unit exactly

## Functionality
 - Fix minimap rectangle in Chrome
 - M3 loading
   - Take care of memory leaks.
 - Fix minimap rectangle to show real terrain, not plane
 - Constrain camera controls to stay on map
 - Pathfinding / A-star
 - Minimap
   - Add terrain
   - Units as colored squares with black border
   - Link minimap camera rotation to screen camera rotation?
 - Disable unit selection when mouse control for camera is enabled
 - Configurable (or at least listable) keyboard controls
 - Export/import terrain as JSON
 - Terraforming (like [Worldmonger](http://www.babylonjs.com/Scenes/Worldmonger/index.html))
 - Select more than unit with ctrl or shift
 - Move selected unit according to its move speed
  - Target
  - Waypoint queue
 - Attack another unit
  - Select target unit
 - Show actions specific to selected object
 - Cursor indicator when camera enabled?
 - 3D positioning of sounds
 - Unit selection rectangle
  - Update for units that move into selection
 - Deal with large jumps in game time
  - High delta makes velocity move units outside map

## Server needed
 - Multiplayer
  - Store game state on server
  - Synchronization
