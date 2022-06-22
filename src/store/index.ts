import Vue from "vue";
import Vuex from "vuex";
import { isDev } from "../lib/utils/isDev";
import userStore from "./modules/user";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: { user: userStore },
  strict: isDev(),
});
