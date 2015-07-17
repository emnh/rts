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
 - Minimap
   - Make it possible to click on minimap to change screen location
    - Show (accurate) rectangle on minimap
   - Add terrain
   - Units as colored squares with black border
   - Link minimap camera to screen camera?
 - Disable unit selection when mouse control for camera is enabled
 - Configurable (or at least listable) keyboard controls
 - Export/import terrain as JSON
 - Terraforming (like [Worldmonger](http://www.babylonjs.com/Scenes/Worldmonger/index.html))
 - Select more than unit with ctrl or shift
 - Move selected unit according to its move speed
  - Target
  - Waypoint queue
 - Select rectangular area of units by screen rectangle, not terrain
  - Add opaque border around selection area
 - Attack another unit
  - Select target unit
  - Shot animation
 - Show actions specific to selected object
 - Cursor indicator when camera enabled?

## Server needed
 - Multiplayer
  - Store game state on server
  - Synchronization
