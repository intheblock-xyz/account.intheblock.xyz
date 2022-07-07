// initial state
const getDefaultState = () => ({
  locale: "en",
  isPaidAccount: false,
  savedTransfersPaid: {},
  savedTransfersFree: {},
})

const state = getDefaultState()

// getters
const getters = {
  locale: (state) => state.locale,
  isPaidAccount: (state) => state.isPaidAccount,
  savedTransfersPaid: (state) => state.savedTransfersPaid,
  savedTransfersFree: (state) => state.savedTransfersFree,
}

// actions
const actions = {}

// mutations
const mutations = {
  setLocale(state, val) {
    state.locale = val
  },
  setPaidAccount(state) {
    state.isPaidAccount = true
  },
  setFreeAccount(state) {
    state.isPaidAccount = false
  },
  setSavedTransfersPaid(state, val) {
    state.savedTransfersPaid = val
  },
  setSavedTransfersFree(state, val) {
    state.savedTransfersFree = val
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
