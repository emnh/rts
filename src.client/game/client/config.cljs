(ns ^:figwheel-always game.client.config)

(def config
  {
   :sente
    {
      :request-timeout 10000
      :connection-timeout 10000}
   :dom
    {
      :controls-height 250}
   :units
    {
      ; if max-units-base is 8, then max-units is 2^(8*2) = 64k
      :max-units-base 7
      :count 40
      :m3count 20
      :speed 50
      :random-location true
      :air-altitude 40
      :animated true
      :collision-bounce 0.2}
   :graphics
   {
     :texture-resolution 256}
   :physics
    {
      :collision-res-x 256
      :collision-res-y 256}
   :terrain
    {
     :sea-level 0
     :min-elevation 0.0
     :max-elevation 256.0
     :water-threshold 0.4
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
   :controls
    {
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
