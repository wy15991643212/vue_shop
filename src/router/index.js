import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import Users from '@/components/user/Users'
import Rights from '@/components/power/Rights'
import Roles from '@/components/power/Roles'
import Cate from '@/components/goods/Cate'
import Params from '@/components/goods/Params'
import List from '@/components/goods/List'
import Add from '@/components/goods/Add'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        {path: '/welcome',component: Welcome},
        {path: '/users',component: Users},
        {path: '/rights',component: Rights},
        {path: '/roles',component: Roles},
        {path: '/categories',component: Cate},
        {path: '/params',component: Params},
        {path: '/goods',component: List},
        {path: '/goods/add',component: Add},
      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next();
  // 获取token
  let token = window.sessionStorage.getItem('token');
  // 没有token就强制跳转到登录页 
  if (!token) return next('/login')
  next()
})
export default router