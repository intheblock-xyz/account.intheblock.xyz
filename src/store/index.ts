import Vue from "vue";
import Vuex from "vuex";
import { isDev } from "../lib/utils/isDev";
import uiStore, { IUiStore } from "./modules/ui";
import userStore, { IUserStore } from "./modules/user";

Vue.use(Vuex);

export interface IAppStore {
  user: IUserStore;
  ui: IUiStore;
}

export default new Vuex.Store<IAppStore>({
  modules: {
    user: userStore,
    ui: uiStore,
  },
  strict: isDev(),
});
