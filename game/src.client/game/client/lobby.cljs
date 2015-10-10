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
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )

(def page-id (routing/get-page-selector :lobby))

(rum/defc
  user
  [name]
  [:li name])

(rum/defc 
  user-list < rum/reactive
  [state]
  [:ul 
   (for 
      [u (:user-list (rum/react state))]
      (rum/with-key (user u) u))])

(rum/defc
  message
  [msg]
  [:li msg])

(rum/defc
  message-list < rum/reactive
  [state]
  [:ul 
   (for 
      [msg (:message-list (rum/react state))]
      (rum/with-key (message msg) msg))])

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
  [:input {:type "text"
           :id "chat-input"
           :name "chat-input"
           :on-key-down (partial input-handler component)
           }]
  )

(rum/defc
  header < rum/static
  [h]
  [:div [:h1 { :class "page-header" } h]])

(rum/defc 
  lobby < rum/static 
  [component state]
  (let 
    [
     div-user-list (html
                     [:div { :class "col-md-3" }
                      [:h3 "Users" ]
                      (user-list state)])
     div-message-list (html
                        [:div { :class "col-md-9" } 
                         (message-list state)
                         (chat-input component)])
     div (html
           [:div { :class "col-md-9" }
            (header "Lobby Chat")
            div-message-list
            div-user-list])
     row [:div { :class "row" } div]
     content [:div { :class "container" } row]
     ]
    content))

(defn
  update-user-list
  [state message]
  (swap! state #(assoc-in % [:user-list] message)))

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
            (str (:user message) "> " (:message message))))))))

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
