Unfinished project, but you can see it [here](http://alexis.lart.no/emh/rts.git/).

# Resources
 - [Physijs](http://chandlerprall.github.io/Physijs/)
 - [Three.js](http://threejs.org/)
 - [Three.js model editor](http://threejs.org/editor/) Can import .obj and export to .json.
 - [Turbosquid 3D Models](http://www.turbosquid.com)

# TODO

## Code
 - Refactor index.js to use gameState for all globals
 - Separate game logic from rendering
 - Progress indicator for loading

## Functionality
 - Scroll terrain with arrow buttons
 - Make aircraft fly a constant distance above ground
 - Export/import terrain as JSON
 - Terraforming (like [Worldmonger](http://www.babylonjs.com/Scenes/Worldmonger/index.html))
 - Select more than unit with ctrl or shift
 - Move selected unit according to its move speed
  - Target
  - Waypoint queue
 - Select rectangular area of units
  - Transparent rectangle to indicate selection
  - Raycasting / collision detection on area. Use box-intersect probably.
 - Attack another unit
  - Select target unit
  - Shot animation
 - Show actions specific to selected object
 - Cursor indicator when camera enabled?

## Server needed
 - Multiplayer
  - Store game state on server
  - Synchronization
