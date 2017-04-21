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
   :sente {
           :request-timeout 10000
           :connection-timeout 10000}

   :dom {
         :controls-height 250}

   :units {
           :max-units (* 40 40)
           :count 40
           :m3count 20
           :speed 50
           :random-location true
           :air-altitude 40
           :animated true
           :collision-bounce 0.2}

   :terrain {
             :sea-level 0
             :min-elevation 0.0
             :max-elevation 256.0
             :water-elevation 50.0
             ; must be power of two, because of DataTexture
             ; XXX: power of two doesn't seem to be necessary anymore
             ; but anyhow, width should be divisible by x-faces
             :x-faces 256
             :y-faces 256
             :width 4096
             :height 4096}
             ;:width 4000
             ;:height 4000}

   :controls {
              :zoom-speed (/ 50 1000)
              :scroll-speed 10
              :rotate-speed 0.03
              ;:origin (new js/THREE.Vector3 330 300 0)
              ;:origin (new js/THREE.Vector3 -18 300 328)}})
              :origin (new js/THREE.Vector3 -1200 800 1200)}})



(defn get-terrain-width [config]
  (-> config :terrain :width))

(defn get-terrain-height [config]
  (-> config :terrain :height))
