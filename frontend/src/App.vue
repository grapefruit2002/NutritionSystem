<script>
import AppIcon from './components/AppIcon.vue'

export default {
  name: 'App',
  components: { AppIcon },
  data() {
    return { menuOpen: false }
  },
  methods: {
    closeMenu() {
      this.menuOpen = false
    },
    goSection(id) {
      this.closeMenu()
      const scroll = () => {
        const target = document.getElementById(id)
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      if (this.$route.path === '/') {
        scroll()
      } else {
        this.$router.push('/')
        setTimeout(scroll, 240)
      }
    },
  },
}
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <div class="header-inner page-width">
        <router-link class="brand" to="/" exact aria-label="营养地图首页" @click.native="closeMenu">
          <span class="brand-mark"><app-icon name="leaf" :size="19" /></span>
          <span class="brand-name">营养地图<span class="brand-period">.</span></span>
        </router-link>
        <button class="mobile-menu-toggle icon-button" type="button" :aria-label="menuOpen ? '关闭导航' : '打开导航'" :aria-expanded="String(menuOpen)" @click="menuOpen = !menuOpen">
          <app-icon :name="menuOpen ? 'close' : 'menu'" :size="21" />
        </button>
        <nav class="main-nav" :class="{ 'is-open': menuOpen }" aria-label="主导航">
          <a href="#nutrition-library" @click.prevent="goSection('nutrition-library')">营养素图鉴</a>
          <a href="#food-library" @click.prevent="goSection('food-library')">食物库</a>
          <a href="#absorption" @click.prevent="goSection('absorption')">吸收与搭配</a>
          <a href="#reference-notes" @click.prevent="goSection('reference-notes')">参考标准</a>
          <router-link to="/tools" @click.native="closeMenu">膳食工具</router-link>
          <a class="nav-mobile-cta" href="#daily-reference" @click.prevent="goSection('daily-reference')">查看我的参考量 <span>↗</span></a>
        </nav>
        <a class="header-cta" href="#daily-reference" @click.prevent="goSection('daily-reference')">按人群看参考量 <span>↗</span></a>
      </div>
    </header>
    <transition name="page" mode="out-in">
      <router-view :key="$route.fullPath" />
    </transition>
    <footer class="site-footer">
      <div class="page-width footer-inner">
        <div class="footer-brand"><span class="brand-mark"><app-icon name="leaf" :size="16" /></span><span>营养地图</span></div>
        <p>把每天吃进去的，变成看得懂的营养。</p>
        <span class="footer-note">科普参考 · 来源可查 · 版本可追</span>
      </div>
    </footer>
  </div>
</template>
