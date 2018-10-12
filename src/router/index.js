import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
import Login from '@/components/Login'
import HomePage from '@/components/HomePage'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/hello_world',
      name: 'HomePage',
      component: HomePage,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  // 一開始於Login寫入的Token
  const token = window.sessionStorage.getItem('token')
  // 有token又到登入頁，就導向HomePage
  if (to.name === 'Login' && token) {
    next({ name: 'HomePage' })
  }
  // 判斷有要求權限的頁面檢查token
  if (to.matched.some(res => res.meta.requiresAuth)) {
    if (token) {
      // 同步sessionStorage的token至vuex中
      store.dispatch('root/setToken', token)
      next()
    } else {
      next({ name: 'Login' })
    }
  } else {
    next()
  }
})
export default router
