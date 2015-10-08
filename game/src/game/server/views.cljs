(ns ^:figwheel-always game.server.views
  (:require-macros [hiccups.core :as hiccups :refer [html]])
  (:require
    [cljs.nodejs :as nodejs]
    [hiccups.runtime :as hiccupsrt]
    [com.stuartsierra.component :as component]
    [game.server.config :as config]
    [game.server.security :as security]
    ))

(defonce beautify (-> (nodejs/require "js-beautify") .-html))

(defn base-template
  [body]
  (let
    [
     css
     [
      "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css"
      "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css"
      "http://fortawesome.github.io/Font-Awesome/assets/font-awesome/css/font-awesome.css"
      "http://lipis.github.io/bootstrap-social/assets/css/docs.css"
      "http://lipis.github.io/bootstrap-social/bootstrap-social.css"
      ]
     scripts
     [
      "./bundle-deps.js"
      ]
     head (concat
            (for [c css]
              [:link { :rel "stylesheet" :href c }])
            (for [script scripts]
              [:script {:type "text/javascript" :src script}]))
     page [:html [:head head] [:body body]]
     ]
  (beautify (str "<!DOCTYPE html>" (html page)))
  ))

(defn login-page
  [req res]
  (let
    [i [:i { :class "fa fa-facebook" }]
     sign "Sign in with Facebook"
     a
      [:a {
           :href "/auth/facebook"
           :class "btn btn-block btn-social btn-facebook"
           } i sign]
     div3 [:div { :class "col-sm-4 social-buttons" } a]
     div2 [:div { :class "row" } div3]
     h1 [:h1 "Login Page"]
     div [:div { :class "container" } h1 div2]
     body [:div { :class "jumbotron" } div]
     ]
    (. res (send (base-template body)))))
