<script>
import { ArrowUpRight, ChevronRight, Droplet, Utensils, X } from 'lucide-vue'
import { getAbsorptionEvidence } from '../data/nutritionData'

const TABS = [
  { slug: 'iron', name: '铁', symbol: 'Fe' },
  { slug: 'calcium', name: '钙', symbol: 'Ca' },
  { slug: 'zinc', name: '锌', symbol: 'Zn' },
  { slug: 'vitamin-c', name: '维生素 C', symbol: 'VC' },
]

export default {
  name: 'AbsorptionExplorer',
  components: { ArrowUpRight, ChevronRight, Droplet, Utensils, X },
  data() {
    return {
      tabs: TABS,
      selected: 'iron',
      modalItem: null,
    }
  },
  computed: {
    selectedTab() {
      return this.tabs.find((tab) => tab.slug === this.selected) || this.tabs[0]
    },
    evidence() {
      return getAbsorptionEvidence(this.selected)
    },
    feature() {
      return this.evidence[0] || null
    },
    factors() {
      return this.evidence.slice(1)
    },
    sourceName() {
      return this.evidence.length ? this.evidence[0].sourceName : ''
    },
    sourceUrl() {
      return this.evidence.length ? this.evidence[0].sourceUrl : ''
    },
  },
  mounted() {
    document.addEventListener('keydown', this.onKeydown)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    selectTab(slug) {
      this.selected = slug
      this.modalItem = null
    },
    openItem(item) {
      this.modalItem = item
    },
    closeModal() {
      this.modalItem = null
    },
    onKeydown(event) {
      if (event.key === 'Escape') this.modalItem = null
    },
    directionLabel(direction) {
      const labels = { enhances: '促进吸收', inhibits: '抑制吸收', dependsOnContext: '依条件而定', unclear: '证据尚不明确' }
      return labels[direction] || '参考资料'
    },
    directionIcon(direction) {
      return direction === 'inhibits' ? Droplet : Utensils
    },
    directionClass(direction) {
      return direction === 'inhibits' ? 'peach-icon' : ''
    },
  },
}
</script>

<template>
  <div class="absorption-explorer">
    <div class="absorption-tabs" role="tablist" aria-label="选择营养素">
      <button
        v-for="tab in tabs"
        :key="tab.slug"
        type="button"
        role="tab"
        :aria-selected="selected === tab.slug"
        :class="{ active: selected === tab.slug }"
        @click="selectTab(tab.slug)"
      >
        <b>{{ tab.symbol }}</b>{{ tab.name }}
      </button>
    </div>

    <div v-if="feature" class="absorption-grid">
      <article
        class="absorption-card absorption-feature"
        role="button"
        tabindex="0"
        @click="openItem(feature)"
        @keydown.enter.prevent="openItem(feature)"
        @keydown.space.prevent="openItem(feature)"
      >
        <div class="absorption-visual">
          <span class="visual-ring ring-outer"></span>
          <span class="visual-ring ring-inner"></span>
          <span class="visual-seed">{{ selectedTab.symbol }}</span>
          <span class="visual-orbit-dot"></span>
          <span class="visual-orbit-dot second"></span>
        </div>
        <div class="absorption-card-copy">
          <span class="card-eyebrow">CASE NOTE · {{ selectedTab.name }}</span>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.summary }}</p>
          <span class="absorption-open">查看搭配与来源 <ArrowUpRight :size="15" /></span>
        </div>
      </article>
    </div>

    <div v-if="factors.length" class="absorption-factors">
      <article
        v-for="item in factors"
        :key="item.title"
        class="factor-card"
        role="button"
        tabindex="0"
        @click="openItem(item)"
        @keydown.enter.prevent="openItem(item)"
        @keydown.space.prevent="openItem(item)"
      >
        <span class="factor-icon" :class="directionClass(item.direction)">
          <component :is="directionIcon(item.direction)" :size="19" />
        </span>
        <div>
          <span class="factor-label">{{ directionLabel(item.direction) }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.summary }}</p>
          <span v-if="item.figure" class="factor-tag">有条件 · {{ item.figure.display }}</span>
          <span v-else class="factor-tag">{{ item.applicability }}</span>
        </div>
        <ChevronRight :size="18" class="factor-arrow" />
      </article>
    </div>

    <div class="evidence-source">
      <span>示例资料</span>
      <a :href="sourceUrl" target="_blank" rel="noreferrer">{{ sourceName }} <ArrowUpRight :size="13" /></a>
      <span class="evidence-separator">·</span>
      <span>点击任意卡片查看具体搭配与来源；数值只在条件明确时给出。</span>
    </div>

    <transition name="fade">
      <div v-if="modalItem" class="absorption-modal-mask" @click.self="closeModal">
        <div class="absorption-modal" role="dialog" aria-modal="true" :aria-label="modalItem.title">
          <button type="button" class="absorption-modal-close" aria-label="关闭" @click="closeModal"><X :size="18" /></button>
          <span class="evidence-direction" :class="{ inhibits: modalItem.direction === 'inhibits' }">{{ directionLabel(modalItem.direction) }}</span>
          <h2>{{ modalItem.title }}</h2>
          <p class="absorption-modal-summary">{{ modalItem.summary }}</p>

          <div v-if="modalItem.pairings && modalItem.pairings.length" class="pairing-block">
            <h3>具体搭配</h3>
            <ul>
              <li v-for="pair in modalItem.pairings" :key="pair">{{ pair }}</li>
            </ul>
          </div>

          <div v-if="modalItem.figure" class="evidence-figure">
            <b>{{ modalItem.figure.display }}</b>
            <span>{{ modalItem.figure.label }} · 条件：{{ modalItem.figure.condition }}</span>
          </div>

          <p v-if="modalItem.applicability" class="absorption-modal-applicability">适用范围：{{ modalItem.applicability }}</p>
          <a class="absorption-modal-source" :href="modalItem.sourceUrl" target="_blank" rel="noreferrer">{{ modalItem.sourceName }} <ArrowUpRight :size="13" /></a>
        </div>
      </div>
    </transition>
  </div>
</template>
