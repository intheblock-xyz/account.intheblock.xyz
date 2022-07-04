// initial state
const getDefaultState = () => ({
  locale: "en",
  isPaidAccount: false,
  savedTransfers: {},
})

const state = getDefaultState()

// getters
const getters = {
  locale: (state) => state.locale,
  isPaidAccount: (state) => state.isPaidAccount,
  savedTransfers: (state) => state.savedTransfers,
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
  setSavedTransfers(state, val) {
    state.savedTransfers = val
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
