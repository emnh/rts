Nothing to see here, move along please.

Unfinished project. Testing.

# Resources
 - [Physijs](http://chandlerprall.github.io/Physijs/)
 - [Three.js](http://threejs.org/)

# TODO

## Code
 - Fix eslint warnings and errors
 - Refactor index.js to use gameState for all globals
 - Use PlaneBufferGeometry

## Functionality
 - Export/import terrain as JSON
 - Terraforming (like [Worldmonger](http://www.babylonjs.com/Scenes/Worldmonger/index.html))
 - Select more than unit with ctrl or shift
 - Move selected unit according to its move speed
  - Need to trace a path in terrain, or adjust velocity to gradient for each
    step
  - Waypoint queue
 - Select rectangular area of units
  - Transparent rectangle to indicate selection
  - Raycasting / collision detection on area. Use box-intersect probably.
 - Attack another unit
  - Select target unit
  - Shot animation
 - Health bars
 - Show actions specific to selected object
 - Cursor indicator when camera enabled?

## Server needed
 - Multiplayer
  - Store game state on server
  - Synchronization
