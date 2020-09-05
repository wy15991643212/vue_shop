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
// 导入 富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的样式
import 'quill/dist/quill.core.css' 
import 'quill/dist/quill.snow.css' 
import 'quill/dist/quill.bubble.css' 
// 导入字体图标
import './assets/fonts/iconfont.css'
// 全局的时间过滤函数
Vue.filter('dateFormat',function(originVal){
   const dt = new Date(originVal);
   const y = dt.getFullYear();
   const m = (dt.getMonth() + 1 + '').padStart(2,'0');
   const d = (dt.getDate() + '').padStart(2,'0');
   const hh =(dt.getHours() + '').padStart(2,'0');
   const mm =(dt.getMinutes() + '').padStart(2,'0');
   const ss =(dt.getSeconds() + '').padStart(2,'0');
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
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
// 将富文本编辑器注册为全局组件
Vue.use(VueQuillEditor)
Vue.config.productionTip = false
Vue.component('tree-table', treeTable)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

