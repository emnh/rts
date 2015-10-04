(ns ^:figwheel-always game.core
  (:require [cljs.nodejs :as nodejs]))

(nodejs/enable-util-print!)

(defonce express (nodejs/require "express"))
(defonce serve-static (nodejs/require "serve-static"))
(defonce http (nodejs/require "http"))
(defonce io-lib (nodejs/require "socket.io"))

;; app gets redefined on reload
(def app (express))

;; routes get redefined on each reload
(. app (get "/hello" 
  (fn [req res] (. res (send "Hello world")))))

(. app (use (serve-static "resources/public" #js {:index "index.html"})))

(defn io-connection
  [socket]
  (println "io-connection")
  (.emit socket "news" #js { :hello "world" })
  (.on socket "my other event" 
    (fn [data]
      (println data))))

(def -main 
  (fn []
    ;; This is the secret sauce. you want to capture a reference to 
    ;; the app function (don't use it directly) this allows it to be redefined on each reload
    ;; this allows you to change routes and have them hot loaded as you
    ;; code.
    (println "Hello world!")
    (let 
      [server (.createServer http #(app %1 %2))
       io (io-lib server)
       ]
      (-> server (.listen 3451))
      (-> io (.on "connection" #(io-connection %)))
      )))

(defn reload
  []
  (println "reload"))

(set! *main-cli-fn* -main)
