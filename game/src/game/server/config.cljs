(ns ^:figwheel-always game.server.config
  )

(def config
  { 
   :db {
        :url "mongodb://localhost:27017/rts"
        }
   }
  )
