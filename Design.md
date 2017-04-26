# Design
 - Players should have a sense of progress over time that is not based on skill. Example concepts:
  - 1: Buildings, units or resources persist and accumulate in a single global game over time
  - 2: Allowing AI helper macros / scripts to allow knowledge to accumulate and automate boring tasks and micro
  - I choose approach 2 for this game, because 1 has problems with veteran players having unbeatable advantage towards newcomers.
 - Players are focused on macro decisions while delegating micro to AI scripts
  - Manual intervention for micro should be possible, but the hope is that AI scripts will make it unnecessary
 - Support scaling to reasonable number of players
   - Server processes ticks in interval of 1 seconds with linear interpolation for movement
   - Server sends visible game state to each client per interval (not possible to cheat fog of war)
   - Client sends a list of actions per interval and server validates and executes it
    - Collect crystals
    - Building construction list
    - Unit construction list
    - Movement target per unit (should we allow subsecond movement list, e.g. for kiting?)
    - Attack list with times and coordinates per unit (fire rate may be subsecond)
 - Units
  - Properties
   - Health (hit points)
   - Armor (subtracted from damage taken)
   - Mass (used for computing blowback on hit)
   - Move speed
   - Collision radius
   - Weapon
    - Attack damage
    - Attack period
    - Impact time
    - Area of effect
    - Number of shots (how to animate?)
  - Melee units are simply units with 0.0 range
  - Balance: All players have access to the same units
  - Unit specs can be customized for each factory
   - 3D model+texture should indicate some unit properties for recognition
    - Each model+texture has a spec range
    - Each model+texture has a set of tags like Armored, Mechanical, Insect
     - Rock, paper, scissor dynamics are essential for varied strategies
   - Price and build time will be computed based on specs, for example
     - Adding armor reduces movement speed
     - Adding DPS increases cost and build time
     - Adding health increases cost and build time
   - Upgrades do not affect already built units
   - Changing factory specs is possible, but incurs a cost and reconstruction time
   - Each unit can be fitted with different weapons
    - Affects attack animation
 - Scouting should be very important
  - Seeing a unit for the first time reveals its health, mass, collision radius
  - Seeing a unit move for the first time reveals its move speed
  - Seeing a unit fire for the first time reveals its weapon properties
  - Seeing a unit take damage for the first time reveals its armor
  - Seeing a unit factory reveals all unit properties
 - Air units cannot overlap, unlike some other RTS.
  - This is just to unify collision mechanics.
  - Air units can fly over (low) ground units however.

# Terrain Improvements
Combine the following:
 - http://madebyevan.com/webgl-water/
 - [three.js version of Evan's WebGL Water](https://github.com/dblsai/WebGL-Fluid)
 - http://codeflow.org/entries/2011/nov/10/webgl-gpu-landscaping-and-erosion/
 - https://threejs.org/examples/webgl_terrain_dynamic.html
 - [ShaderToy: Reaction Diffusion 2-pass](https://www.shadertoy.com/view/XsG3z1)
 - [Felix Palmer: Terrain LOD in WebGL](https://github.com/felixpalmer/lod-terrain)
 - [Charpie.fr: Terrain LOD in WebGL](http://charpie.fr/#home)
 - [Zephyros Anemos: Terrain LOD in WebGL](http://www.zephyrosanemos.com/windstorm/current/live-demo.html)
 - [Jeremy Bouny: Screenspace grid](http://jeremybouny.fr/experiments/screen_space_grid/)
 - [3D Liquid Particles](http://david.li/fluid/)

# Random thoughts about project structure and hot reloading

- The goal is fast hot reloading and iterative development.
- The problem is asynchronous loading of big textures and 3d objects, unpacking of compressed resources and compiling shaders.
- All application state is kept in a nested global state dictionary.
- View objects in the application state are somehow secondary citizens.
 These are for example DOM objects corresponding to a view,
 the actual image data for an image URL and array buffers containing generated 3d data.
 We don't want to display large view objects while debugging.
 We also don't want to do update comparisons with them so we need
 to check if the function that generated (owns) them or its dependencies changed when
 deciding whether to regenerate view objects.
 Thus the decision to rerun functions on code reload depends on changed functions
 as well as the application state.
 We can keep view objects in memory while reloading or put them in localStorage (google "requestquota demo"),
 as page reloads are sometimes necessary to clean up even with figwheel and mostly reloadable code.
- We should also load the page quickly and as synchronously as possible with just cubes for 3d models and with a simple noise texture shader,
  then replace models and textures as assets are loaded.
- We also want interactive shader recompilation ala shadertoy or glslsandbox for experimentation and for user customization.
- All functions should take a dictionary as input and return a dictionary as output.
We want to scan all functions to see whether their inputs and outputs match,
without having to specify dependencies other than in direct usage.
- Adding static verification and tools would be nice, but can we do it without leaving ClojureScript?
Perhaps schemas are enough.
