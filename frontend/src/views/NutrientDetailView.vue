<script>
import AppIcon from '../components/AppIcon.vue'
import {
  FOOD_STATES, baseUnitOf, demoNutrients, getAbsorptionEvidence, getCuratedFoodSources,
  getFoodsByNutrient, getReferencesByNutrient,
} from '../data/nutritionData'
import { getNutrient } from '../services/nutritionApi'

export default {
  name: 'NutrientDetailView',
  components: { AppIcon },
  data() {
    return { nutrient: null, loading: true, notFound: false, metricFilter: 'all' }
  },
  computed: {
    groupName() {
      if (!this.nutrient) return '营养素'
      const names = { macronutrient: '宏量营养素', vitamin: '维生素', mineral: '矿物质', other: '其他成分' }
      return names[this.nutrient.group] || names.other
    },
    localReferences() {
      return this.nutrient ? getReferencesByNutrient(this.nutrient.slug) : []
    },
    referenceRows() {
      const apiRows = this.nutrient && this.nutrient.references
      if (Array.isArray(apiRows) && apiRows.length) return apiRows
      return this.localReferences
    },
    referenceMetrics() {
      return Array.from(new Set(this.referenceRows.map((row) => row.type))).sort()
    },
    filteredReferences() {
      if (this.metricFilter === 'all') return this.referenceRows
      return this.referenceRows.filter((row) => row.type === this.metricFilter)
    },
    foodSources() {
      if (!this.nutrient) return []
      const slug = this.nutrient.slug
      // 优先使用按含量精选的前 5 位食物（不依赖数据库返回顺序）。
      const curated = getCuratedFoodSources(slug)
      if (curated && curated.length) return curated
      const list = getFoodsByNutrient(slug).filter((food) => (food.nutrients[slug] || 0) > 0)
      // 同一食物的生/熟记录只保留一条：优先熟制/加工，避免「生猪瘦肉 / 熟猪瘦肉」重复出现；
      // 只有生食记录的蔬果（如葡萄、草莓）仍保留，否则会没有来源。
      const baseName = (name) => String(name).replace(/（[^）]*）/g, '').trim()
      const byBase = new Map()
      list.forEach((food) => {
        const key = baseName(food.name)
        const current = byBase.get(key)
        if (!current) {
          byBase.set(key, food)
          return
        }
        const currentRaw = current.state === 'raw'
        const foodRaw = food.state === 'raw'
        if (currentRaw && !foodRaw) {
          byBase.set(key, food)
          return
        }
        if (currentRaw === foodRaw && (food.nutrients[slug] || 0) > (current.nutrients[slug] || 0)) {
          byBase.set(key, food)
        }
      })
      return Array.from(byBase.values())
        .sort((a, b) => (b.nutrients[slug] || 0) - (a.nutrients[slug] || 0))
        .slice(0, 5)
    },
    reviewedEvidence() {
      if (!this.nutrient) return []
      // 本地证据带有条件化数值块；API 证据缺少该结构时优先使用本地已审核内容。
      const local = getAbsorptionEvidence(this.nutrient.slug)
      if (local.length) return local
      return this.nutrient.absorptionEvidence || []
    },
    fatSolubleLabel() {
      if (!this.nutrient || this.nutrient.isFatSoluble === null || typeof this.nutrient.isFatSoluble === 'undefined') return '不适用'
      return this.nutrient.isFatSoluble ? '是' : '否'
    },
  },
  watch: {
    '$route.params.slug'() {
      this.metricFilter = 'all'
      this.loadNutrient()
    },
  },
  created() {
    this.loadNutrient()
  },
  methods: {
    async loadNutrient() {
      const slug = String(this.$route.params.slug || '')
      const local = demoNutrients.find((item) => item.slug === slug)
      this.loading = true
      this.notFound = false
      try {
        const data = await getNutrient(slug)
        // API 数据优先；正文或来源缺失时用本地审核过的内容补齐。
        this.nutrient = Object.assign({}, local, data, {
          description: data.description || (local ? local.description : null),
        })
      } catch (error) {
        if (!local) {
          this.nutrient = null
          this.notFound = true
        } else {
          this.nutrient = Object.assign({}, local, { references: null, absorptionEvidence: null })
        }
      } finally {
        this.loading = false
      }
    },
    directionLabel(direction) {
      const labels = { enhances: '促进因素', inhibits: '抑制因素', dependsOnContext: '依条件而定', unclear: '证据尚不明确' }
      return labels[direction] || '参考资料'
    },
    stateMeta(state) {
      return FOOD_STATES[state] || { label: state }
    },
    formatValue(value) {
      if (typeof value !== 'number') return '—'
      if (Number.isInteger(value)) return String(value)
      if (value < 1) return value.toFixed(2)
      if (value < 10) return value.toFixed(1)
      return String(Math.round(value))
    },
    nutrientUnit() {
      return this.nutrient ? baseUnitOf(this.nutrient) : ''
    },
    goHomeSection(id) {
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
  <main class="detail-view">
    <div v-if="loading" class="page-width detail-loading">正在整理营养资料…</div>
    <div v-else-if="notFound || !nutrient" class="page-width detail-error"><h1>暂时没有找到这个营养素</h1><router-link to="/">回到营养总览</router-link></div>
    <template v-else>
      <section class="detail-top">
        <div class="page-width">
          <div class="breadcrumbs"><router-link to="/">营养总览</router-link><span>/</span><a href="#nutrition-library" @click.prevent="goHomeSection('nutrition-library')">营养素图鉴</a><span>/</span><span>{{ nutrient.name }}</span></div>
          <div class="detail-hero">
            <div><span class="detail-kicker"><i></i>{{ groupName }}<span v-if="nutrient.subgroup"> · {{ nutrient.subgroup }}</span></span><h1>{{ nutrient.name }}</h1><p>{{ nutrient.summary }}</p></div>
            <div class="detail-hero-meta"><app-icon name="shield" :size="15" /><span>{{ nutrient.englishName || '营养素资料' }}</span></div>
          </div>
        </div>
      </section>

      <div class="page-width detail-layout">
        <div class="detail-main">
          <section class="detail-panel">
            <div class="detail-panel-heading"><span><app-icon name="book" :size="16" /></span><div><h2>认识{{ nutrient.name }}</h2><p>作用与基础说明</p></div></div>
            <p v-if="nutrient.description" class="detail-description">{{ nutrient.description }}</p>
            <div v-else class="detail-empty">这条目的科普正文、获取途径和适用说明需要由编辑人员补充并审核来源。当前页面先展示已维护的人群参考值与资料出处。</div>
            <div v-if="nutrient.sourceName" class="detail-source">
              <span class="detail-source-label">资料来源</span>
              <a :href="nutrient.sourceUrl" target="_blank" rel="noreferrer">{{ nutrient.sourceName }} <app-icon name="up" :size="11" /></a>
              <a v-if="nutrient.guidelineUrl" :href="nutrient.guidelineUrl" target="_blank" rel="noreferrer" class="detail-source-guide">膳食指南公开建议 <app-icon name="up" :size="11" /></a>
            </div>
          </section>

          <section class="detail-panel">
            <div class="detail-panel-heading"><span><app-icon name="chart" :size="16" /></span><div><h2>膳食参考摄入量</h2><p>按人群与指标类型列出已录入的标准数值</p></div></div>
            <div v-if="referenceRows.length" class="reference-controls">
              <span class="controls-label">指标类型</span>
              <button type="button" :class="{ active: metricFilter === 'all' }" @click="metricFilter = 'all'">全部</button>
              <button v-for="metric in referenceMetrics" :key="metric" type="button" :class="{ active: metricFilter === metric }" @click="metricFilter = metric">{{ metric }}</button>
              <span class="controls-count">{{ filteredReferences.length }} 条</span>
            </div>
            <div v-if="referenceRows.length" class="table-scroll">
              <table class="reference-table reference-table-wide">
                <thead><tr><th>参考人群</th><th>指标类型</th><th>参考值</th><th>单位</th><th>标准版本</th><th>来源</th></tr></thead>
                <tbody>
                  <tr v-for="(row, index) in filteredReferences" :key="row.populationCode + '-' + row.type + '-' + index">
                    <td>
                      <span class="pop-name">{{ row.populationName }}</span>
                      <small v-if="row.sexLabel" class="pop-meta">{{ row.sexLabel }}<template v-if="row.lifeStage"> · {{ row.lifeStage }}</template></small>
                    </td>
                    <td><span class="metric-pill" :class="'pill-' + row.type.toLowerCase()">{{ row.type }}</span></td>
                    <td>{{ row.amount }}</td>
                    <td>{{ row.unit }}</td>
                    <td>{{ row.standardVersion }}</td>
                    <td><a v-if="row.sourceUrl" :href="row.sourceUrl" target="_blank" rel="noreferrer">查看 <app-icon name="up" :size="12" /></a><span v-else>{{ row.sourceName }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="detail-empty">该营养素的人群参考值还未录入。系统不会根据其他营养素推算或用单一“成人值”代替分组数据。</div>
            <div v-if="referenceRows.length" class="detail-data-note">以上为结构演示数据，正式上线前需导入中国营养学会 DRIs 2023 官方完整数据，并保留标准版本与出处。</div>
          </section>

          <section class="detail-panel">
            <div class="detail-panel-heading"><span><app-icon name="fork" :size="16" /></span><div><h2>食物来源</h2><p>按每 100 克含量由高到低，取前 5 种</p></div></div>
            <div v-if="foodSources.length" class="food-source-list">
              <div v-for="food in foodSources" :key="food.id" class="food-source-item">
                <span class="food-source-emoji">{{ food.emoji }}</span>
                <div class="food-source-main">
                  <div class="food-source-title">
                    <strong>{{ food.name }}</strong>
                    <span class="food-state-badge" :class="stateMeta(food.state).label === '生' ? 'state-raw' : (stateMeta(food.state).label === '熟' ? 'state-cooked' : 'state-processed')">{{ stateMeta(food.state).label }}</span>
                  </div>
                  <span class="food-source-basis">{{ food.basis }} · {{ food.category }}</span>
                </div>
                <div class="food-source-value">
                  <b>{{ formatValue(food.nutrients[nutrient.slug]) }}</b>
                  <small>{{ nutrientUnit() }}</small>
                </div>
              </div>
            </div>
            <div v-else class="detail-empty">尚未录入含该营养素的食物记录。食物含量会区分生食、熟食与制品，避免不同计量基准混算。</div>
            <div v-if="foodSources.length" class="detail-data-note">同一食物的生重与熟重是两条独立记录，数值差异主要来自含水量变化，不能直接比较或相加。</div>
            <div v-if="foodSources.length" class="detail-data-note detail-source-note">数据来源：中国食物成分表（标准版第 6 版）；叶黄素、番茄红素、虾青素等参考 USDA FoodData Central。数值为每 100 克可食部，品种、产地与烹调方式会造成差异。</div>
          </section>

          <section class="detail-panel">
            <div class="detail-panel-heading"><span><app-icon name="sprout" :size="16" /></span><div><h2>吸收与膳食因素</h2><p>同时显示作用方向、适用条件和来源</p></div></div>
            <div v-if="reviewedEvidence.length" class="evidence-list">
              <article v-for="item in reviewedEvidence" :key="item.title + '-' + item.sourceUrl" class="evidence-item">
                <span class="evidence-direction" :class="{ inhibits: item.direction === 'inhibits' }">{{ directionLabel(item.direction) }}</span>
                <div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.summary }}</p>
                  <div v-if="item.figure" class="evidence-figure">
                    <b>{{ item.figure.display }}</b>
                    <span>{{ item.figure.label }} · 条件：{{ item.figure.condition }}</span>
                  </div>
                  <small v-if="item.applicability">适用范围：{{ item.applicability }}</small><br v-if="item.applicability">
                  <a :href="item.sourceUrl" target="_blank" rel="noreferrer">{{ item.sourceName }} <app-icon name="up" :size="12" /></a>
                </div>
              </article>
            </div>
            <div v-else class="detail-empty">影响因素资料需附研究来源及适用条件。具体吸收率不以一个脱离食物组合和人群的百分比呈现。</div>
          </section>
        </div>
      </div>
    </template>
  </main>
</template>
