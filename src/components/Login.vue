<template>
  <div id="Login">
    <div class="form">
      <input v-model="username" class="form-username" type="text" placeholder="username">
      <input v-model="password" class="form-password" type="password" placeholder="password">
      <button class="form-submit" @click="login">LOGIN</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    login () {
      if (this.username && this.password) {
        // 寫入token到sessionStorage中，這裡範例隨便寫入當前timeStamp當token :D
        window.sessionStorage.setItem('token', (new Date()).getTime())
        this.$router.push({ name: 'HomePage' })
      }
    }
  }
}
</script>

<style lang="scss">
#Login {
  .form {
    display: flex;
    align-items: center;
    justify-content: center;
    &-username, &-password, &-submit  {
      margin: 5px;
      padding: 10px 15px;
      outline: none;
      border: 1px solid #dfdfdf;
      border-radius: 5px;
      font-size: 16px;
      &::placeholder {
        color: #bebebe;
      }
      &:focus {
        border: 1px solid #42b983;
      }
    }
    &-submit {
      border: 1px solid #42b983;
      color: #42b983;
      transition: 0.2s;
      &:hover {
        background-color: #42b983;
        color: #ffffff;
      }
      &:active {
        box-shadow: 1px 1px 1px 1px #36a170 inset
      }
    }
  }
}
</style>
