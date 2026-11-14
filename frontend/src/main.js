import Vue from 'vue'
import VueRouter from 'vue-router'
import './style.css'
import App from './App.vue'

Vue.use(VueRouter)

// 使用 hash 路由：构建产物可直接以 file:// 打开，无需本地服务器。
// 页内锚点改由脚本滚动（见 App.vue / HomeView.vue），避免与 hash 路由冲突。
const router = new VueRouter({
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { x: 0, y: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: () => import(/* webpackChunkName: "home" */ './views/HomeView.vue') },
    { path: '/nutrients/:slug', name: 'nutrient-detail', component: () => import(/* webpackChunkName: "nutrient-detail" */ './views/NutrientDetailView.vue') },
    { path: '/tools', name: 'tools', component: () => import(/* webpackChunkName: "tools" */ './views/ToolsView.vue') },
    { path: '*', redirect: '/' },
  ],
})

new Vue({ router, render: (createElement) => createElement(App) }).$mount('#app')