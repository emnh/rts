(ns ^:figwheel-always game.client.controls
    (:require 
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [game.client.config :as config]
              [game.client.common :as common :refer [data]]
              [game.client.scene :as scene]
              [game.client.math :as math :refer [square sin cos pi atan2 sqrt]]
              [com.stuartsierra.component :as component]
              ))

(defn prevent-default
  [event]
  (.preventDefault event)
  false)

(defn
  scroll
  [delta state]
  (let
    [camera (:camera state)
     config (:config state)
     speed (get-in config [:controls :scroll-speed])
     speed (* speed (-> camera .-position .-y))
     speed (/ speed (-> (get-in config [:controls :origin]) .-y))
     _ (-> delta (.applyQuaternion (-> camera .-quaternion)))
     _ (-> delta .-y (set! 0))
     _ (-> delta .normalize)
     _ (-> delta (.multiplyScalar speed))
     ]
    (-> camera .-position (.add delta))
    )
  )

(defn arc-ball-rotation-left-right
  [state sign]
  (let
    [camera (:camera state)
     focus (scene/get-camera-focus camera 0 0)
     axis (-> camera .-position .clone)
     _ (-> axis (.sub focus))
     _ (-> axis .-y (set! 0))
     _ (-> axis .normalize)
     old (-> camera .-position .clone)
     config (:config state)
     rotate-speed (get-in config [:controls :rotate-speed])
     rotate-speed (* sign rotate-speed)
     ]
    (-> camera .-position (.applyAxisAngle axis rotate-speed))
    (-> camera .-position .-y (set! (-> old .-y)))
    (-> camera (.lookAt focus)))
  )

(defn arc-ball-rotation-up-down
  [state sign]
  (let
    [camera (:camera state)
     focus (scene/get-camera-focus camera 0 0)
     axis (-> camera .-position .clone)
     _ (-> axis (.sub focus))
     offset axis
     config (:config state)
     rotate-speed (get-in config [:controls :rotate-speed])
     rotate-speed (* sign rotate-speed)
     theta (atan2 (-> offset .-x) (-> offset .-z))
     xzlen (sqrt (+ (square (-> offset .-x)) (square (-> offset .-z))))
     min-polar-angle 0.1
     max-polar-angle (- (/ pi 2) (/ pi 16))
     phi (atan2 xzlen (-> offset .-y))
     phi (+ phi rotate-speed)
     phi (min max-polar-angle phi)
     phi (max min-polar-angle phi)
     radius (-> offset .length)
     x (* radius (sin phi) (sin theta))
     y (* radius (cos phi))
     z (* radius (sin phi) (cos theta))
     _ (-> offset (.set x y z))
     ]
    (-> camera .-position (.copy focus))
    (-> camera .-position (.add offset))
    (-> camera (.lookAt focus)))
  )

(defn
  rotate-left
  [state]
  (arc-ball-rotation-left-right state 1))

(defn
  rotate-right
  [state]
  (arc-ball-rotation-left-right state -1))

(defn
  rotate-up
  [state]
  (arc-ball-rotation-up-down state -1))

(defn
  rotate-down
  [state]
  (arc-ball-rotation-up-down state 1))

(defn
  scroll-left
  [state]
  (scroll (new js/THREE.Vector3 -1 0 0) state)
  )

(defn
  scroll-right
  [state]
  (scroll (new js/THREE.Vector3 1 0 0) state)
  )

(defn
  scroll-up
  [state]
  (scroll (new js/THREE.Vector3 0 1 0) state)
  )

(defn
  scroll-down
  [state]
  (scroll (new js/THREE.Vector3 0 -1 0) state)
  )

(defn zoom
  [camera delta]
  (let
    [
     te (-> camera .-matrix .-elements)
     x (aget te 8)
     y (aget te 9)
     z (aget te 10)
     zoom-offset (new js/THREE.Vector3 x y z)
     _ (-> zoom-offset (.multiplyScalar (* delta (-> camera .-position .-y))))
     ]
    (-> camera .-position (.addVectors (-> camera .-position) zoom-offset))
    )
  )

(defn
  zoom-in
  [state]
  (zoom (:camera state) (- (get-in (:config state) [:controls :zoom-speed])))
  )

(defn
  zoom-out
  [state]
  (zoom (:camera state) (get-in (:config state) [:controls :zoom-speed]))
  )

(defn
  reset-camera
  [state]
  (let
    [camera (:camera state)
     config (:config state)
     scene (:scene state)
     origin (get-in config [:controls :origin])
     ]
    (-> camera .-position (.copy origin))
    (-> camera (.lookAt (-> scene .-position)))
    )
  )

(def handled-keys
  {
   (-> js/KeyEvent .-DOM_VK_LEFT) scroll-left
   (-> js/KeyEvent .-DOM_VK_RIGHT) scroll-right
   (-> js/KeyEvent .-DOM_VK_UP) scroll-up
   (-> js/KeyEvent .-DOM_VK_DOWN) scroll-down
   (-> js/KeyEvent .-DOM_VK_PAGE_UP) zoom-in
   (-> js/KeyEvent .-DOM_VK_PAGE_DOWN) zoom-out
   (-> js/KeyEvent .-DOM_VK_HOME) reset-camera
   [:ctrl (-> js/KeyEvent .-DOM_VK_LEFT)] rotate-left
   [:ctrl (-> js/KeyEvent .-DOM_VK_RIGHT)] rotate-right
   [:ctrl (-> js/KeyEvent .-DOM_VK_UP)] rotate-up
   [:ctrl (-> js/KeyEvent .-DOM_VK_DOWN)] rotate-down
   }
  )

(defn scroll-handler
  [enabled keys-pressed state]
  (doseq
    [k (keys @keys-pressed)]
    (if-let
      [handler (get handled-keys k)]
      (handler state))
    )
  (if @enabled
    (js/requestAnimationFrame #(scroll-handler enabled keys-pressed state)))
  )

(defn
  handle-key
  [keys-pressed event active]
  (let
    [action (if active #(assoc %1 %2 true) dissoc)
     key-code (-> event .-keyCode)
     combination (if (-> event .-ctrlKey) [:ctrl key-code] key-code)]
    (if 
      (contains? handled-keys combination)
      (do
        (prevent-default event)
        (swap! keys-pressed #(action % combination))
        ; E.g. a sequence of left down, ctrl down, left up, left down, left up should stop action
        (if-not active (swap! keys-pressed #(action % key-code)))
        ; E.g. a sequence of ctrl+left down, ctrl up, left up should stop action
        (if-not active (swap! keys-pressed #(action % [:ctrl key-code])))
        false
        )
      true)))

(defn key-down
  [keys-pressed event]
  (handle-key keys-pressed event true))

(defn key-up
  [keys-pressed event]
  (handle-key keys-pressed event false))

(defn rebind
  [$element eventname handler]
  (-> $element
    (.unbind eventname)
    (.bind eventname handler)))

(defn
  init-controls
  [component element config camera scene]
  (let
    [$body ($ "body")
     $element ($ element)
     bindns "controls"
     contextevt (str "contextmenu." bindns)
     keydownevt (str "keydown." bindns)
     keyupevt (str "keyup." bindns)
     keys-pressed (atom {})
     state
     {
      :camera (data camera)
      :scene (data scene)
      :config config
      }
     interval-handler-enabled (atom true)
     interval-handler (partial scroll-handler interval-handler-enabled keys-pressed state)
     interval-handler-name "scroll-interval"
     ]
    (rebind $element contextevt prevent-default)
    (rebind $body keydownevt (partial key-down keys-pressed))
    (rebind $body keyupevt (partial key-up keys-pressed))
    (js/clearInterval (aget js/window interval-handler-name))
    (js/requestAnimationFrame interval-handler)
    ;(aset js/window interval-handler-name (js/setInterval interval-handler 10))
    (assoc component :old-interval-handler-enabled interval-handler-enabled)
    ))

(defrecord Controls
  [config renderer camera scene old-interval-handler-enabled]
  component/Lifecycle
  (start [component] 
    (let
      [element (scene/get-view-element renderer)
       ]
      (if old-interval-handler-enabled (reset! old-interval-handler-enabled false))
      (init-controls component element config camera scene)))
  (stop [component] component)
  )

(defn new-controls
  []
  (component/using
    (map->Controls {})
    [:renderer :config :camera :scene]
    ))
