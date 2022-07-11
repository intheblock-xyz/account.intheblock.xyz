export interface IProjectStore {
  title: string;
}

const state: IProjectStore = {
  title: "",
};

const getters = {
  title: (state: IProjectStore) => state.title,
};

const actions = {};

const mutations = {
  setTitle(state: IProjectStore, title: string) {
    state.title = title;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
