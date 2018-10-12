<template>
  <div id="HomePage">
    <h1>Token：{{token}}</h1>
    <h3>開啟console檢視sessionStorage與vuex中的state</h3>
    <button @click="openNewTab">OPEN NEW TAB</button>
    <button @click="logout">LOGOUT</button>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  name: 'HomePage',
  computed: {
    ...mapState('root', ['token'])
  },
  methods: {
    ...mapActions('root', ['setToken']),
    openNewTab () {
      window.open(window.location.href, '_blank')
    },
    logout () {
      // 清空vuex與sessionStorage, 並發送logout事件使其他頁面的storage攔截
      this.setToken(null)
      window.sessionStorage.clear()
      window.localStorage.setItem('logout', new Date())
      this.$router.push({ name: 'Login' })
    }
  }
}
</script>

<style lang="scss">
button {
  margin: 5px;
  padding: 10px 15px;
  outline: none;
  border: 1px solid #42b983;
  border-radius: 5px;
  color: #42b983;
  font-size: 16px;
  transition: 0.2s;
  &:hover {
    background-color: #42b983;
    color: #ffffff;
  }
  &:active {
    box-shadow: 1px 1px 1px 1px #36a170 inset;
  }
}
</style>
