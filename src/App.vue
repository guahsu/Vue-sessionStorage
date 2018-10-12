<template>
  <div id="App">
    <img src="./assets/logo.png">
    <router-view/>
    <a class="github" href="https://github.com/guahsu/Vue-sessionStorage" target="_blank">- GitHub -</a>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
#App {
  margin-top: 60px;
  color: #2c3e50;
  text-align: center;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  .github {
    display: inline-block;
    margin-top: 30px;
    color: #42b983;
    font-size: 20px;
  }
}
</style>
