// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import axios from 'axios'
import 'element-ui/lib/theme-chalk/index.css'
// 导入全局样式表
import './assets/css/global.css'
import treeTable from 'vue-table-with-tree-grid'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
// 配置请求拦截器
axios.interceptors.request.use(config => {
  // 给请求头中添加token
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config
})
Vue.prototype.$http = axios;
Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.component('tree-table', treeTable)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

