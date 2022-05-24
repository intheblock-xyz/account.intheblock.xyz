// initial state
const getDefaultState = () => ({
  locale: "en",
})

const state = getDefaultState()

// getters
const getters = {
  locale: (state) => state.locale,
}

// actions
const actions = {}

// mutations
const mutations = {
  setLocale(state, val) {
    state.locale = val
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
