export type TAccountType = "free" | "paid";

export interface IUserStore {
  accountType: TAccountType;
}

const state: IUserStore = {
  accountType: "free",
};

const getters = {
  accountType: (state: IUserStore) => state.accountType,
  isFreeAccount: (state: IUserStore) => state.accountType === "free",
  isPaidAccount: (state: IUserStore) => state.accountType === "paid",
};

const mutations = {
  setFreeAccount(state: IUserStore) {
    state.accountType = "free";
  },
  setPaidAccount(state: IUserStore) {
    state.accountType = "paid";
  },
};

const actions = {};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
