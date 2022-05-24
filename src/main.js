import Vue from "vue"
import Buefy from "buefy"
import JsonCSV from "vue-json-csv"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import {i18n} from "./plugins/i18n"
import "./plugins/axios"
import "./plugins/buefy"

Vue.config.productionTip = false
Vue.component("downloadCsv", JsonCSV)
Vue.use(Buefy)

new Vue({
  router,
  i18n,
  store,
  render: (h) => h(App),
}).$mount("#app")

Vue.config.productionTip = false
