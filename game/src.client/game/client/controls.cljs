(ns ^:figwheel-always game.client.controls
    (:require 
              [cljs.pprint :as pprint]
              [jayq.core :as jayq :refer [$]]
              [game.client.config :as config]
              [game.client.common :as common :refer [data]]
              [game.client.scene :as scene]
              [com.stuartsierra.component :as component]
              ))

(defn prevent-default
  [event]
  (.preventDefault event)
  false)

(defn
  scroll-left
  [state]
  )

(defn
  scroll-right
  [state]
  )

(defn
  scroll-up
  [state]
  )

(defn
  scroll-down
  [state]
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

(def handled-keys
  {
   (-> js/KeyEvent .-DOM_VK_LEFT) scroll-left
   (-> js/KeyEvent .-DOM_VK_RIGHT) scroll-right
   (-> js/KeyEvent .-DOM_VK_UP) scroll-up
   (-> js/KeyEvent .-DOM_VK_DOWN) scroll-down
   (-> js/KeyEvent .-DOM_VK_PAGE_UP) zoom-in
   (-> js/KeyEvent .-DOM_VK_PAGE_DOWN) zoom-out
   }
  )

(defn scroll
  [keys-pressed state]
  ;(println "scroll" keys-pressed state)
  (doseq
    [k (keys @keys-pressed)]
    (if-let
      [handler (get handled-keys k)]
      (handler state))
    )
  )


(defn key-down
  [keys-pressed event]
  (if 
    (contains? handled-keys (-> event .-keyCode)) 
    (do
      (prevent-default event)
      (swap! keys-pressed #(assoc % (-> event .-keyCode) true))
      true
      )
    false)
  )

(defn key-up
  [keys-pressed event]
  (if 
    (contains? handled-keys (-> event .-keyCode)) 
    (do
      (prevent-default event)
      (swap! keys-pressed #(dissoc % (-> event .-keyCode)))
      true
      )
    false)
  )

(defn rebind
  [$element eventname handler]
  (-> $element
    (.unbind eventname)
    (.bind eventname handler)))

(defn
  init-controls
  [component element config camera]
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
      :config config
      }
     interval-handler (partial scroll keys-pressed state)
     interval-handler-name "scroll-interval"
     ]
    (rebind $element contextevt prevent-default)
    (rebind $body keydownevt (partial key-down keys-pressed))
    (rebind $body keyupevt (partial key-up keys-pressed))
    (js/clearInterval (aget js/window interval-handler-name))
    (aset js/window interval-handler-name (js/setInterval interval-handler 10))
    component
    ))

(defrecord Controls
  [config renderer camera]
  component/Lifecycle
  (start [component] 
    (let
      [element (scene/get-view-element renderer)
       ]
      (init-controls component element config camera))
    component)
  (stop [component] component)
  )

(defn new-controls
  []
  (component/using
    (map->Controls {})
    [:renderer :config :camera]
    ))
