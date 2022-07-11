import { ActionContext } from "vuex";
import { IAppStore } from "..";

interface ITransactionRow {
  id: string;
  date: Date;
  amount: number;
  token: string;
  rateUsd: number | null;
}

interface ITransaction {
  id: string;
  rows: ITransactionRow[];
}

export interface IProjectStore {
  title: string;
  transactions: ITransaction[];
}

type TProjectContext = ActionContext<IProjectStore, IAppStore>;

const state: IProjectStore = {
  title: "",
  transactions: [],
};

const getters = {
  title: (state: IProjectStore) => state.title,
  transactions: (state: IProjectStore) => state.transactions,
};

const mutations = {
  setTitle(state: IProjectStore, title: string) {
    state.title = title;
  },
  setTransactions(state: IProjectStore, transactions: ITransaction[]) {
    state.transactions = transactions;
  },
};

const actions = {
  new(context: TProjectContext): void {
    context.commit("setTitle", "New Project");
    context.commit("setTransactions", []);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
