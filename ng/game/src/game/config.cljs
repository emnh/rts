(ns ^:figwheel-always game.config)

;const config = {
;  audio: {
;    sounds: false,
;    music: false
;  },
;  dom: {
;    controlsHeight: 250,
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
   :units {
           :maxUnits (* 40 40)
           :count 40
           :m3count 20
           :speed 50
           :randomLocation true
           :airAltitude 40
           :animated true
           :collisionBounce 0.2
           }
   :terrain {
             :seaLevel 0
             :minElevation 10
             :maxElevation 48
             :xFaces 200
             :yFaces 200
             :width 4000
             :height 4000
             }
   })

(defn getTerrainWidth []
  (-> config :terrain :width))

(defn getTerrainHeight []
  (-> config :terrain :height))
