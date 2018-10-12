const types = {
  SET_TOKEN: 'root/SET_TOKEN'
}

const state = {
  token: null
}

const actions = {
  setToken ({ commit }, data) {
    commit(types.SET_TOKEN, data)
  }
}

const mutations = {
  [types.SET_TOKEN] (state, data) {
    state.token = data
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
