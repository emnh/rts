# Introduction (Legacy version)

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

# Getting started with development environment
 - First

```bash
git clone https://github.com/emnh/rts rts
cd rts
git submodule update --init
npm install
./scripts/compile.sh
```

 - Then open 2 terminals and run the following:
```bash
cd game
./scripts/dev.sh
```
```bash
cd game
node js/figwheel.js
```
 - Server figwheel runs on port 3450
 - Node (with ClojureScript connected to figwheel on 3450) runs on port 3451
 - Now you can open [the dev page](http://localhost:3451)

# Building for production

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

# TODO

- Make scroll speed take into account time elapsed in order to scroll at same
  speed when game (requestAnimationFrame) lags
- Enforce limits on new-game and join-game, 1 per user
- Enforce unique nicknames inside game, make user type one
- Don't store multiple user copies (something wrong with query I suppose)

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
