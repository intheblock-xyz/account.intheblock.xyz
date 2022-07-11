import { ActionContext } from "vuex";
import { IAppStore } from "..";

export interface IUiStore {
  isPreferencesModalActive: boolean;
}

type TUiContext = ActionContext<IUiStore, IAppStore>;

const state: IUiStore = {
  isPreferencesModalActive: false,
};

const getters = {
  isPreferencesModalActive: (state: IUiStore) => state.isPreferencesModalActive,
};

const mutations = {
  setIsPreferencesModalActive: (
    state: IUiStore,
    isPreferencesModalActive: boolean,
  ) => {
    state.isPreferencesModalActive = isPreferencesModalActive;
  },
};

const actions = {
  showPreferencesModal(context: TUiContext) {
    context.commit("setIsPreferencesModalActive", true);
  },
  hidePreferencesModal(context: TUiContext) {
    context.commit("setIsPreferencesModalActive", false);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
