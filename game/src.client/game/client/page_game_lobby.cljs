(ns ^:figwheel-always game.client.page-game-lobby
  (:require 
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [rum.core :as rum]
    [game.client.common :as common :refer [list-item]]
    [game.client.routing :as routing]
    [game.client.socket :as socket]
    [sablono.core :as sablono :refer-macros [html]]
    [clojure.string :as string :refer [join]]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(def page-id (routing/get-page-selector :game-lobby))

(defn
  input-handler
  [component event]
  (let
    [keyCode (-> event .-nativeEvent .-keyCode)]
    (if
      (= keyCode (-> js/KeyEvent .-DOM_VK_RETURN))
      (let
        [socket (get-in component [:socket :socket])]
        (-> socket (.emit "chat-message" (clj->js (-> ($ "#chat-input") .val))))
        (-> ($ "#chat-input") (.val ""))))))

(rum/defc
  chat-input < rum/static
  [component]
  [:input {:class "col-md-12"
           :type "text"
           :id "chat-input"
           :name "chat-input"
           :on-key-down (partial input-handler component)
           }]
  )

(rum/defc 
  user-list < rum/reactive
  [state]
  [:ul { :class "user-list" }
   (for 
      [[i u] (map-indexed vector (:user-list (rum/react state)))]
      (rum/with-key (list-item u) i))])

(rum/defc
  message-list < rum/reactive
  [state]
  [:ul { :class "message-list" }
   (for 
     [[i msg] (map-indexed vector (:message-list (rum/react state)))]
     (let
       [msg (str (:user msg) "> " (:message msg))]
       (rum/with-key (list-item msg) i)))])

(rum/defc
  game-lobby < rum/reactive
  [component state]
  (let
    [
     routing (:routing component)
     route-match (rum/react (:route-match routing))
     game-id 
      (if 
        (and route-match (= (:handler route-match) :game-lobby))
        (do
          (println "route-match" route-match)
          (get-in route-match [:route-params :id]))
        "")
     div-user-list (html
                     [:div { :class "col-md-3" }
                      [:h3 "Players" ]
                      (user-list state)])
     div-message-list (html
                        [:div { :class "col-md-9" } 
                         (message-list state)
                         (chat-input component)])
     div-game-lobby-chat (html
                           [:div { :class "col-md-12" }
                            [:div [:h1 
                                   { :class "page-header" }
                                   (str "Game Lobby Chat for " game-id)]]
                            div-message-list
                            div-user-list])
     row [:div { :class "row" } div-game-lobby-chat]
     content (html [:div { :class "container" } row])
     ]
    content))


(defn start
  [component]
  (let
    [state
     (or
       (:state component)
       (atom {}))]
    (rum/mount (game-lobby component state) (aget ($ page-id) 0))
    (routing/init-page ($ page-id))
    (->
      component
      (assoc :state state))))

(defn stop
  [component]
  component)

(defcom
  new-game-lobby
  [config socket routing]
  [state done]
  start
  stop)
