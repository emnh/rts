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
      "csscache/bootstrap.min.css"
      "csscache/bootstrap-theme.min.css"
      "csscache/font-awesome.css"
      "csscache/docs.css"
      "csscache/bootstrap-social.css"
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
  [baseurl req res]
  (let
    [
     a-fb
      [:a {
           :href (str baseurl "auth/facebook")
           :class "btn btn-block btn-social btn-facebook"
           }
       [:i { :class "fa fa-facebook" }]
       "Sign in with Facebook"]
     a-twitter
      [:a {
           :href (str baseurl "auth/twitter")
           :class "btn btn-block btn-social btn-twitter"
           }
       [:i { :class "fa fa-twitter" }]
       "Sign in with Twitter"]
     a-google
     [:a {
           :href (str baseurl "auth/google")
           :class "btn btn-block btn-social btn-google"
           }
       [:i { :class "fa fa-google" }]
       "Sign in with Google"]
     a-github
     [:a {
           :href (str baseurl "auth/github")
           :class "btn btn-block btn-social btn-github"
           }
       [:i { :class "fa fa-github" }]
       "Sign in with GitHub"]
     div3 [:div { :class "col-sm-4 social-buttons" }
           a-fb
           a-twitter
           a-google
           a-github]
     div2 [:div { :class "row" } div3]
     h1 [:h1 "Login Page"]
     div [:div { :class "container" } h1 div2]
     body [:div { :class "jumbotron" } div]
     ]
    (. res (send (base-template body)))))
