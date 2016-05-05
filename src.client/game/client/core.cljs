(ns ^:figwheel-always game.client.core
  (:require
    [cljs.core.async :refer [<! put! chan]]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [game.client.common :as common :refer [new-jsobj new-lc]]
    [game.client.config :as config]
    [game.client.controls :as controls]
    [game.client.page-game :as page-game]
    [game.client.page-lobby :as page-lobby]
    [game.client.page-load-test :as page-load-test]
    [game.client.page-game-test :as page-game-test]
    [game.client.page-game-lobby :as page-game-lobby]
    [game.client.page-not-found :as page-not-found]
    [game.client.page-sente-test :as page-sente-test]
    [game.client.progress-manager :as progress-manager]
    [game.client.renderer :as renderer]
    [game.client.resources :as resources]
    [game.client.routing :as routing]
    [game.client.scene :as scene]
    [game.client.sente-setup :as sente-setup]
    [game.shared.state :as state
     :refer [s-add-component s-readd-component with-simple-cause]]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(enable-console-print!)

(println "Reloaded client core")

(defonce system (atom {}))

(defcom
  -new-page
  [routing]
  [page-kw page-component]
  (fn [component]
    (let
      [page-component (assoc page-component :$page (routing/get-page-$element page-kw))
       page-component
       (if
         (= page-kw (:handler @(:route-match routing)))
         (component/start (merge page-component component))
         page-component)]
      (assoc component :page-component page-component)))
  (fn [component]
    (let
      [page-component (assoc page-component :$page (routing/get-page-$element page-kw))
       page-component (component/stop (merge page-component component))]
      (assoc component :page-component page-component))))

(defn new-page
  [page-kw page-component]
  (->
    (-new-page)
    (assoc :page-kw page-kw)
    (assoc :page-component page-component)
    (component/using (component/dependencies page-component))))

(defonce ran (atom false))

(defn main
  []
  (let [old-ran @ran]
    (reset! ran true)
    (println "main" old-ran)
    (if old-ran
      (do
        ;(println "stopping system")
        (with-simple-cause #(swap! system component/stop-system))))
    ;(println "starting system")
    (with-simple-cause #(swap! system component/start-system))))

(defonce reloading (atom false))

(defn reload-page
  [page-kw]
  (if-not
    @reloading
    (do
      (println "reload-page")
      (reset! reloading true)
      (main)
      (reset! reloading false))))

(s-readd-component system :config config/config)

(s-add-component system :simplex (new-jsobj #(new js/SimplexNoise)))

(s-add-component system :routing-callback (new-lc reload-page))
(s-add-component system :routing (routing/new-router))
(s-add-component system :sente-setup (sente-setup/new-sente-setup))
(s-add-component system :progress-manager (progress-manager/new-progress-manager))
(s-add-component system :resources (resources/new-resources))

(s-add-component system :page-game-test
                 (new-page :game-test (page-game-test/new-game-test)))
(s-add-component system :page-load-test
                 (new-page :load-test (page-load-test/new-load-test)))
(s-add-component system :page-sente-test
                 (new-page :sente-test (page-sente-test/new-sente-test)))
(s-add-component system :page-game
                 (new-page :game (page-game/new-game)))
(s-add-component system :page-lobby
                 (new-page :lobby (page-lobby/new-lobby)))
(s-add-component system :page-game-lobby
                 (new-page :game-lobby (page-game-lobby/new-game-lobby)))
(s-add-component system :page-not-found
                 (new-page :not-found (page-not-found/new-page-not-found)))

(if @ran (main) (js/$ (main)))
