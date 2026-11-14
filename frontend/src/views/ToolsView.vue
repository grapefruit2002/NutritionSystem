<script>
import { ArrowRight, Calculator, ClipboardList, Scale } from 'lucide-vue'
import DietCalculator from '../components/DietCalculator.vue'
import FoodCompare from '../components/FoodCompare.vue'
import MealHistory from '../components/MealHistory.vue'

export default {
  name: 'ToolsView',
  components: { ArrowRight, Calculator, ClipboardList, Scale, DietCalculator, FoodCompare, MealHistory },
  data() {
    return { tab: 'calculator' }
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
          <p>选择食物和克数，估算这一餐的营养摄入并与人群参考值对比；也可以把几种食物并排比较，看看同样份量谁更划算。</p>
        </div>
        <div class="tools-hero-badges">
          <div class="tools-badge"><Calculator :size="18" /><span><strong>膳食计算器</strong><small>累加营养素 · 对比参考值</small></span></div>
          <div class="tools-badge"><Scale :size="18" /><span><strong>食物对比</strong><small>2–3 种食物并排看</small></span></div>
        </div>
      </div>
    </section>

    <section class="page-width tools-panel">
      <div class="tools-tabs" role="tablist" aria-label="工具切换">
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

      <DietCalculator v-if="tab === 'calculator'" />
      <FoodCompare v-else-if="tab === 'compare'" />
      <MealHistory v-else />

      <div class="tools-back">
        <a href="#food-library" @click.prevent="goSection('food-library')">去食物库浏览全部食物 <ArrowRight :size="14" /></a>
        <span>数据为结构演示值，正式上线前需按中国食物成分表核对。</span>
      </div>
    </section>
  </main>
</template>
