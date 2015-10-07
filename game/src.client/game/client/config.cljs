(ns ^:figwheel-always game.client.config)

;const config = {
;  audio: {
;    sounds: false,
;    music: false
;  },
;  effects: {
;    explosionPool: 20,
;    missilePool: 2000,
;  },
;  units: {
;    maxUnits: 40 * 40,
;    count: 40,
;    m3count: 20,
;    speed: 50,
;    randomLocation: true,
;    airAltitude: 40,
;    animated: true,
;    collisionBounce: 0.2,
;  },
;  terrain: {
;    seaLevel: 0,
;    minElevation: 10,
;    maxElevation: 48,
;    xFaces: 200,
;    yFaces: 200,
;    width: 4000,
;    height: 4000,
;  },
;  camera: {
;    mouseControl: false,
;    X: 0,
;    Y: 0,
;    Z: 0,
;    rotationX: 0,
;    rotationY: 0,
;    rotationZ: 0,
;  },
;  debug: {
;    mouseX: 0,
;    mouseY: 0,
;  },
;  portrait: {
;    width: 60,
;    height: 60,
;  },
;};

(def config
  {
   :dom {
         :controls-height 250
         }
   :units {
           :max-units (* 40 40)
           :count 40
           :m3count 20
           :speed 50
           :random-location true
           :air-altitude 40
           :animated true
           :collision-bounce 0.2
           }
   :terrain {
             :sea-level 0
             :min-elevation 10
             :max-elevation 48
             :x-faces 200
             :y-faces 200
             :width 4000
             :height 4000
             }
   })

(defn get-terrain-width [config]
  (-> config :terrain :width))

(defn get-terrain-height [config]
  (-> config :terrain :height))
