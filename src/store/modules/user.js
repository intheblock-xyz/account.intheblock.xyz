// initial state
const getDefaultState = () => ({
  locale: "en",
  isPaidAccount: false,
})

const state = getDefaultState()

// getters
const getters = {
  locale: (state) => state.locale,
  isPaidAccount: (state) => state.isPaidAccount,
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
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
