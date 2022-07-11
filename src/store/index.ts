import Vue from "vue";
import Vuex from "vuex";
import { isDev } from "../lib/utils/isDev";
import projectStore, { IProjectStore } from "./modules/project";
import uiStore, { IUiStore } from "./modules/ui";
import userStore, { IUserStore } from "./modules/user";

Vue.use(Vuex);

export interface IAppStore {
  user: IUserStore;
  project: IProjectStore;
  ui: IUiStore;
}

export default new Vuex.Store<IAppStore>({
  modules: {
    user: userStore,
    project: projectStore,
    ui: uiStore,
  },
  strict: isDev(),
});
