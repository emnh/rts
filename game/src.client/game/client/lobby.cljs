(ns ^:figwheel-always game.client.lobby
  (:require 
    [cljs.pprint :as pprint]
    [com.stuartsierra.component :as component]
    [jayq.core :as jayq :refer [$]]
    [promesa.core :as p]
    [cats.core :as m]
    [rum.core :as rum]
    [game.client.routing :as routing]
    [game.client.socket :as socket]
    [sablono.core :as sablono :refer-macros [html]]
    [clojure.string :as string :refer [join]]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(def page-id (routing/get-page-selector :lobby))

(rum/defc
  list-item
  [name]
  [:li name])

(rum/defc 
  game-list < rum/reactive
  [state]
  (let
    [game-list (:game-list (rum/react state))]
    (if
      game-list
      [:select { :size 20 }
       (for 
         [gameid (keys game-list)]
         (let
           [g (get game-list gameid)]
           [:option
             { :value (:id g) }
             (str (:name g) ": " (join "," (vals (:display-names g))))
             ]))]
      [:div "No active games"])))

(rum/defc 
  user-list < rum/reactive
  [state]
  [:ul 
   (for 
      [[i u] (map-indexed vector (:user-list (rum/react state)))]
      (rum/with-key (list-item u) i))])

(rum/defc
  message-list < rum/reactive
  [state]
  [:ul 
   (for 
     [[i msg] (map-indexed vector (:message-list (rum/react state)))]
     (let
       [msg (str (:user msg) "> " (:message msg))]
       (rum/with-key (list-item msg) i)))])

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

(defn new-game-handler
  [component event]
  (let
    [socket (get-in component [:socket :socket])]
    (-> socket (.emit "new-game"))))

(rum/defc
  new-game < rum/static
  [component]
  [:input 
   {:type "button" 
    :value "New Game"
    :on-click (partial new-game-handler component)
    }])

(defn join-game-handler
  [event]
  )

(rum/defc
  join-game < rum/static
  [component]
  [:input 
   {:type "button" 
    :value "Join Game"
    :on-click (partial join-game-handler component)}])

(rum/defc
  header < rum/static
  [h]
  [:div [:h1 { :class "page-header" } h]])

(rum/defc 
  lobby < rum/static 
  [component state]
  (let 
    ; calling html on each list item as workaround
    ; see https://github.com/r0man/sablono/issues/57
    [
     div-user-list (html
                     [:div { :class "col-md-3" }
                      [:h3 "Users" ]
                      (user-list state)])
     div-message-list (html
                        [:div { :class "col-md-9" } 
                         (message-list state)
                         (chat-input component)])
     div-game-buttons (html
                        [:div 
                         (new-game component)
                         (join-game component)])
     div-game-list (html
                     [:div { :class "col-md-12" }
                      (header "Games")
                      (game-list state)
                      div-game-buttons
                      ])
     div-lobby-chat (html
           [:div { :class "col-md-12" }
            (header "Lobby Chat")
            div-message-list
            div-user-list])
     row1 [:div { :class "row" } div-game-list]
     row2 [:div { :class "row" } div-lobby-chat]
     content (html [:div { :class "container" } row1 row2])
     ]
    content))

(defn
  update-user-list
  [state message]
  (swap! state #(assoc-in % [:user-list] message)))

(defn
  update-game-list
  [state message]
  (swap! state #(assoc-in % [:game-list] message)))

(defn
  update-message-list
  [state message]
  (swap! 
    state 
    (fn [state]
      (update-in 
        state 
        [:message-list]
        (fn
          [mlist]
          (conj 
            (subvec mlist (max 0 (- (count mlist) 20)))
            message))))))

(defn start
  [component]
  (let
    [state 
      (or
        (:state component)
        (atom {
               :user-list []
               :message-list []
               }))
     done (:done component)
     socket (:socket component)
     ]
    (if-not 
      done 
      (do
        (socket/on socket "user-list" (partial update-user-list state))
        (socket/on socket "game-list" (partial update-game-list state))
        (socket/on socket "chat-message" (partial update-message-list state))))
    (rum/mount (lobby component state) (aget ($ page-id) 0))
    (->
      component
      (assoc :state state)
      (assoc :done true)
      )))

(defn stop [component] component)

(defcom 
  new-lobby
  [config socket]
  [state done]
  start
  stop)
