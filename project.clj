(defproject game "0.1.0-SNAPSHOT"
  :description "A real time strategy game"
  :url "http://github.com/emnh/rts"

  :dependencies [[org.clojure/clojure "1.9.0-alpha15"]
                 [org.clojure/clojurescript "1.9.521"]
                 [org.clojure/core.async "0.3.442"]
                 [bidi "2.0.17"]
                 [com.stuartsierra/component "0.3.2"]
                 [com.taoensso/encore "2.91.0"]
                 [com.taoensso/sente "1.11.0"]
                 [funcool/cats "1.2.1"]
                 [funcool/promesa "1.1.1"]
                 [hiccups "0.3.0"]
                 [jayq/jayq "2.5.4"]
                 [prismatic/schema "1.1.5"]
                 [rm-hull/infix "0.2.11"]
                 [rum "0.8.2"]
                 [sablono "0.7.0"]
                 [hendekagon/gamma "0.1.3"]
                 [thheller/shadow-devtools "1.0.20170429"]]

  :plugins
    [
      [lein-cljsbuild "1.1.6"]
      [lein-figwheel "0.5.10"]]

  :source-paths
    ["src"
     "src.client"
     "src.dev"
     "src.dev.client"
     "src.scripts"
     "src.shared"
     "src.worker"]

  :clean-targets ["out.dev"
                  "out.dev.client"
                  "out.prod"
                  "out.prod.client"]


  :cljsbuild {
              :builds [{:id "dev"
                        :source-paths ["src" "src.shared" "src.dev"]
                        :figwheel true
                        :compiler {
                                   :output-to "out.dev/game.js"
                                   :output-dir "out.dev"
                                   :target :nodejs
                                   :main game.server.dev
                                   :optimizations :none
                                   :source-map true}}
                       {:id "dev-client"
                        :source-paths ["src.client" "src.shared" "src.dev.client" "src.worker"]
                        :figwheel true
                        :compiler {
                                   :output-to "out.dev.client/game.js"
                                   :output-dir "out.dev.client"
                                   :optimizations :none
                                   :source-map true
                                   :source-map-timestamp true}}
                       {:id "scripts"
                        :source-paths ["src.client" "src.shared" "src.worker" "src.scripts"]
                        :compiler {
                                   :output-to "out.scripts/game.js"
                                   :output-dir "out.scripts"
                                   :target :nodejs
                                   :optimizations :none}}
                       {:id "prod"
                        :source-paths ["src" "src.shared"]
                        :compiler {
                                   :output-to "out.prod/game.js"
                                   :output-dir "out.prod"
                                   :target :nodejs
                ; compiling with optimizations takes too much memory
                ;:optimizations :simple}}]}
                                   :optimizations :none}}
                       {:id "prod-client"
                        :source-paths ["src.client" "src.shared" "src.worker"]
                        :compiler {
                                   :output-to "out.prod.client/game.js"
                                   :output-dir "out.prod.client"
                                   :optimizations :advanced
                ;:pretty-print true
                ;:pseudo-names true
                                   :source-map "out.prod.client/game.js.map"
                ;:verbose true
                ;:compiler-stats true
                                   :externs [
                                             "externs/three.ext.js"
                                             "externs/jquery.ext.js"
                                             "externs/key-event.ext.js"
                                             "externs/msgpack-js-browser.ext.js"
                                             "externs/pako.ext.js"
                                             "externs/stats.ext.js"
                                             "externs/goog.ext.js"
                                             "externs/simplex.ext.js"
                                             "externs/pixi.ext.js"]}}]}


  :figwheel {
             :server-port 3450
             :css-dirs ["resources/public/css"]}) ;; watch and update CSS
