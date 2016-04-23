# Getting started
 - First of all follow steps under "Getting started" in the main [README.md](../../master/README.md).
 - Then open 2 terminals and run the following:
```bash
cd game
./scripts/dev.sh
```
```bash
cd game
npm install
# for some reason the github repo is not pulled
npm install 'missingdays/three.js-node#master'
node figwheel.js
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

# TODO

- Make scroll speed take into account time elapsed in order to scroll at same
  speed when game (requestAnimationFrame) lags
- Enforce limits on new-game and join-game, 1 per user
- Enforce unique nicknames inside game, make user type one
- Don't store multiple user copies (something wrong with query I suppose)

## Component cleanup
 - Pure functions first! The point is to be reusable.
 - Add a prefix to allow multiple components or nest systems (which is recommended against).
 - Pages: What to do? Lifecycle implementation with start-page and stop-page?
   But this requires keeping the system and calling on it, plus dependencies are not really needed.
   Perhaps register with router component. Yes. start-page and stop-page must
   be called from routing component.

