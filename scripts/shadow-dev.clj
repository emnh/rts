(require '[shadow.cljs.devtools.embedded :as cljs])

(cljs/start! {:verbose true})
(cljs/start-worker :client)
(cljs/start-worker :server)

(clojure.main/repl)
