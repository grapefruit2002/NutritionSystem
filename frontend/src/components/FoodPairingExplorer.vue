<script>
import { ArrowUpRight, X } from 'lucide-vue'
import { PAIRING_RELATIONS, getFoodPairings } from '../data/nutritionData'

const FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'enhances', label: '促进吸收' },
  { value: 'inhibits', label: '影响吸收' },
  { value: 'complement', label: '蛋白互补' },
  { value: 'depends', label: '视条件而定' },
]

export default {
  name: 'FoodPairingExplorer',
  components: { ArrowUpRight, X },
  data() {
    return {
      pairings: getFoodPairings(),
      filters: FILTERS,
      active: 'all',
      expanded: false,
      modalItem: null,
    }
  },
  computed: {
    filtered() {
      if (this.active === 'all') return this.pairings
      return this.pairings.filter((item) => item.relation === this.active)
    },
    // 桌面 3 列时 2 行 = 6 条；可展开查看全部。
    displayPairings() {
      return this.expanded ? this.filtered : this.filtered.slice(0, 6)
    },
    hiddenCount() {
      return Math.max(0, this.filtered.length - 6)
    },
  },
  watch: {
    active() {
      this.expanded = false
    },
  },
  mounted() {
    document.addEventListener('keydown', this.onKeydown)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    relationMeta(relation) {
      return PAIRING_RELATIONS[relation] || { label: relation, tone: '' }
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
  },
}
</script>

<template>
  <div class="pairing-explorer">
    <div class="pairing-filters" role="tablist" aria-label="搭配类型">
      <button
        v-for="filter in filters"
        :key="filter.value"
        type="button"
        role="tab"
        :aria-selected="active === filter.value"
        :class="{ active: active === filter.value }"
        @click="active = filter.value"
      >{{ filter.label }}</button>
    </div>

    <div class="pairing-grid">
      <article
        v-for="item in displayPairings"
        :key="item.id"
        class="pairing-card"
        role="button"
        tabindex="0"
        @click="openItem(item)"
        @keydown.enter.prevent="openItem(item)"
        @keydown.space.prevent="openItem(item)"
      >
        <div class="pairing-foods">
          <span class="food-chip">{{ item.a.emoji }} {{ item.a.name }}</span>
          <span class="pairing-plus">+</span>
          <span class="food-chip">{{ item.b.emoji }} {{ item.b.name }}</span>
        </div>
        <span class="pairing-badge" :class="relationMeta(item.relation).tone">{{ relationMeta(item.relation).label }}</span>
        <h3>{{ item.title }}</h3>
        <p>{{ item.summary }}</p>
        <span class="pairing-more">查看搭配建议与来源 <ArrowUpRight :size="13" /></span>
      </article>
    </div>

    <div v-if="hiddenCount" class="nutrient-more">
      <button type="button" @click="expanded = !expanded">
        {{ expanded ? '收起（只看前 6 条）' : `显示更多（还有 ${hiddenCount} 条）` }}
      </button>
    </div>

    <transition name="fade">
      <div v-if="modalItem" class="absorption-modal-mask" @click.self="closeModal">
        <div class="absorption-modal" role="dialog" aria-modal="true" :aria-label="modalItem.title">
          <button type="button" class="absorption-modal-close" aria-label="关闭" @click="closeModal"><X :size="18" /></button>
          <div class="pairing-foods modal-pairing-foods">
            <span class="food-chip">{{ modalItem.a.emoji }} {{ modalItem.a.name }}</span>
            <span class="pairing-plus">+</span>
            <span class="food-chip">{{ modalItem.b.emoji }} {{ modalItem.b.name }}</span>
          </div>
          <span class="pairing-badge" :class="relationMeta(modalItem.relation).tone">{{ relationMeta(modalItem.relation).label }}</span>
          <h2>{{ modalItem.title }}</h2>
          <p class="absorption-modal-summary">{{ modalItem.summary }}</p>
          <div class="pairing-block">
            <h3>搭配建议</h3>
            <p>{{ modalItem.suggestion }}</p>
          </div>
          <a class="absorption-modal-source" :href="modalItem.sourceUrl" target="_blank" rel="noreferrer">{{ modalItem.sourceName }} <ArrowUpRight :size="13" /></a>
        </div>
      </div>
    </transition>
  </div>
</template>
