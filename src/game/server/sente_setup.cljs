(ns ^:figwheel-always game.server.sente-setup
  (:require
    [cljs.nodejs :as nodejs]
    [com.stuartsierra.component :as component]
    [promesa.core :as p]
    [cats.core :as m]
    [cats.builtin]
    [taoensso.sente :as sente]
    )
  (:require-macros [game.shared.macros :as macros :refer [defcom]])
  )


(defcom
  new-sente-setup
  []
  []
  (fn [component]
    component)
  (fn [component]
    component)
  )
