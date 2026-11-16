<script>
import { ArrowRight, Calculator, ClipboardList, Scale } from 'lucide-vue'
import DietCalculator from '../components/DietCalculator.vue'
import FoodCompare from '../components/FoodCompare.vue'
import MealHistory from '../components/MealHistory.vue'
import TodayNutrition from '../components/TodayNutrition.vue'

export default {
  name: 'ToolsView',
  components: { ArrowRight, Calculator, ClipboardList, Scale, DietCalculator, FoodCompare, MealHistory, TodayNutrition },
  data() {
    return { tab: 'today' }
  },
  methods: {
    goSection(id) {
      this.$router.push('/')
      setTimeout(() => {
        const target = document.getElementById(id)
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 240)
    },
  },
}
</script>

<template>
  <main class="tools-view">
    <section class="tools-hero">
      <div class="page-width tools-hero-inner">
        <div class="tools-hero-copy">
          <span class="section-kicker">NUTRITION TOOLS</span>
          <h1>把参考值，<br>用在你今天的餐盘上。</h1>
          <p>记录每天吃下的食物与份量，查看可核验营养数据、参考差额和食物备选。数据不完整时如实提示，不把未知含量当成零。</p>
        </div>
        <div class="tools-hero-badges">
          <div class="tools-badge"><Calculator :size="18" /><span><strong>膳食计算器</strong><small>累加营养素 · 对比参考值</small></span></div>
          <div class="tools-badge"><Scale :size="18" /><span><strong>食物对比</strong><small>2–3 种食物并排看</small></span></div>
        </div>
      </div>
    </section>

    <section class="page-width tools-panel">
      <div class="tools-tabs" role="tablist" aria-label="工具切换">
        <button type="button" role="tab" :aria-selected="tab === 'today'" :class="{ active: tab === 'today' }" @click="tab = 'today'">
          <ClipboardList :size="16" /> 今日营养
        </button>
        <button type="button" role="tab" :aria-selected="tab === 'calculator'" :class="{ active: tab === 'calculator' }" @click="tab = 'calculator'">
          <Calculator :size="16" /> 膳食计算器
        </button>
        <button type="button" role="tab" :aria-selected="tab === 'compare'" :class="{ active: tab === 'compare' }" @click="tab = 'compare'">
          <Scale :size="16" /> 食物对比
        </button>
        <button type="button" role="tab" :aria-selected="tab === 'history'" :class="{ active: tab === 'history' }" @click="tab = 'history'">
          <ClipboardList :size="16" /> 饮食记录
        </button>
      </div>

      <TodayNutrition v-if="tab === 'today'" />
      <DietCalculator v-else-if="tab === 'calculator'" />
      <FoodCompare v-else-if="tab === 'compare'" />
      <MealHistory v-else />

      <div class="tools-back">
        <a href="#food-library" @click.prevent="goSection('food-library')">去食物库浏览全部食物 <ArrowRight :size="14" /></a>
        <span>旧膳食计算器、食物对比及食物库使用结构演示值，不应用于真实建议；今日营养仅使用其页面列明的已核验数据。</span>
      </div>
    </section>
  </main>
</template>
