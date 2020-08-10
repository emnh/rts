# Introduction (Legacy version)

My blog about the project [is here](https://emnh.github.io/rts-blog/).

Unfinished project.
You can see a [demo displaying only free 3D models, not from SC2](http://emh.lart.no/publish/rts-free.git/).
The SC2 demo is not working because SC2 file host is not hosting them anymore,
but the live code is still up at [github pages](http://emnh.github.io/rts/).
If you want to play with the version as seen in demos you should check out the git "legacy" branch.
The legacy version is written in JavaScript, while the new version is primarily in ClojureScript.

SC2 files were retrieved from
[viewer.hiveworkshop.com](http://viewer.hiveworkshop.com/?q=Assets/units/zerg/baneling/baneling.m3)
(not mine) through a [heroku CORS proxy](http://crossorigin.herokuapp.com/).

If the demo doesn't work for you, you can watch videos of it at YouTube:
 - [StarCraft 2 on WebGL](https://www.youtube.com/watch?v=PoPNrz2LUG0)
 - [Starcraft 2 on WebGL with colorful UV mapping](https://www.youtube.com/watch?v=EvhUteDp3o8)
 - [Banelings, banelings, banelings](https://www.youtube.com/watch?v=aqKsVelmeeI)

See also [mdx-m3-viewer](https://github.com/flowtsohg/mdx-m3-viewer).
All credits to flowtsohg for decoding the M3 format in JavaScript.

# Getting started with development environment
 - First

```bash
git clone https://github.com/emnh/rts rts
cd rts
git submodule update --init
npm install
./scripts/compile.sh
cp -a home.rts ~/.rts
sed 's/(def standalone false)/(def standalone true)/' -i src.client/game/client/core.cljs
```

The folder home.rts contains the session-secret for the server and API keys to
use social logins. They are all set to "HIDDEN" in home.rts. You will want to
customize these for testing social logins or running a production server.

You will need a mongodb instance running on the default port (27017).

## Alternative 1: Using shadow-devtools build system

 - Open 2 terminals and run the following:
```bash
./scripts/shadow-dev.sh
```
```bash
node node/server.js
```

 - Now you can open [the dev page](http://localhost:3451/index.html#game-test)

I switched to [shadow-devtools](https://github.com/thheller/shadow-devtools)
because the author, Thomas Heller, approached me personally if I wanted to use it.
The advantage is that it compiles in parallel and thus is faster than figwheel if you have a system with enough RAM.
The setup also needs a lot less configuration than figwheel, having good defaults.

## Alternative 2 (deprecated): Using figwheel build system
 - Open 2 terminals and run the following:
```bash
./scripts/dev.sh
```
```bash
node js/figwheel.js
```

You will need to change index.html to comment in the figwheel stuff.

 - Server figwheel runs on port 3450
 - Node (with ClojureScript connected to figwheel on 3450) runs on port 3451
 - Now you can open [the dev page](http://localhost:3451/index.html#game-test)

# Building for production

TODO: This section is not up to date for shadow-devtools.

```bash
lein cljsbuild once prod
lein cljsbuild once prod-client
./scripts/docker-build.sh
./scripts/docker-run.sh
```

Instead of using docker you can just run js/prod.js.

# Source folder layout
 - [src.shared/game/shared](src.shared/game/shared): Code shared between server and client.
 - [src/game/server](src/game/server): Server code.
 - [src.client/game/client](src.client/game/client): Client code.
 - [src.dev/game/server](src.dev/game/server): Small server load wrapper for dev environment.
 - [src.dev.client/game/client](src.dev.client/game/client): Small client load wrapper for dev environment.

# Web page layout
Not everything is linked up yet, so overview is here:
 - /: Redirect to /login.
 - /login: Login with auth providers.
 - /logout: Log out.
 - /#lobby: Game lobby for creating/joining games.
 - /#game: Client game testing.

# Resources
 - [Three.js](http://threejs.org/)
 - [Three.js model editor](http://threejs.org/editor/) Can import .obj and export to .json.
 - [OpenGameArt](http://opengameart.org/)
 - [Turbosquid 3D Models](http://www.turbosquid.com)
 - [Hum3D](https://hum3d.com/) - the largest source for vehicle 3D models

# TODO

- Bug fix:
   speed when game (requestAnimationFrame) lags
 - Fix selection for alternative method 1 and 2 (use group position instead of mesh)
 - Enforce limits on new-game and join-game, 1 per user
 - Enforce unique nicknames inside game, make user type one
- Improvements:
 - Make health bars the same size even if screen boxes change size when rotating view.
 - Register callbacks with on-render instead of direct
 - Add :start and :stop parameters to defcom2 macro instead of positional, expecting more parameters soon.
 - Reuse main renderer for health bars.
 - Performance: Use quads for health bars instead of points.
- Features:
 - Tri-planar texture mapping for terrain
 - Fix shadows
 - Fog of war
 - FPS hero mode
 - Movement
 - Networking with peer.js
 - Construction
 - Attacking
 - Collisions
 - Minimap controls (click to view area)
 - Health bar occlusion / Z-order
 - Cache minimap terrain and water
 - Reduce MathBox shader compilations (20!)
 - Fix magic stars size
 - Weapons
 - Hide MathBox from minimap
 - Refactor unit spawning and synchronize unit UI elements
 - Fix explosion scaling (voxels do not hit ground anymore)

## Component cleanup
 - Pure functions first! The point is to be composable and reusable.
 - Add a prefix to allow multiple components or nest systems (which is recommended against).
 - Pages: What to do? Lifecycle implementation with start-page and stop-page?
   But this requires keeping the system and calling on it, plus dependencies are not really needed.
   Perhaps register with router component. Yes. start-page and stop-page must
   be called from routing component.
 - Would be nice to have these features:
  - Dependencies specified only once at point of usage (can be taken care of via macro)
  - Array of component. Can use name prefix/suffix.
  - Promise based dependency resolution. Hard. May cause terrible error messages.
  - Differentiate between changing page (stop page1; start page2) and reload (stop page; start page).

## Authentication
 - Remove authentication for everything except lobby and multiplayer
