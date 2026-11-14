<script>
import {
  ArrowRight, ArrowUpRight, Atom, ChevronRight, CircleHelp, Droplet,
  Leaf, Search, ShieldCheck, Sprout, Sun, Utensils,
} from 'lucide-vue'
import {
  STANDARD_META, demoNutrients, demoPopulations, demoReferenceIntakes,
  getAbsorptionEvidence, getReferenceCardItem, matchesKeyword, referenceCardItems,
} from '../data/nutritionData'
import { getNutrients } from '../services/nutritionApi'
import FoodLibrary from '../components/FoodLibrary.vue'
import FoodPairingExplorer from '../components/FoodPairingExplorer.vue'

const GUIDE_URL = 'http://dg.cnsoc.org/'

// 图鉴展示顺序：宏量营养素 → 维生素（A、B1、B2、B3、B5、B6、B12、C、D、E、K）→ 矿物质 → 其他成分。
const NUTRIENT_ORDER = [
  'protein', 'fat', 'carbohydrate', 'sugar', 'dietary-fiber',
  'vitamin-a', 'vitamin-b1', 'vitamin-b2', 'vitamin-b3', 'vitamin-b5', 'vitamin-b6', 'vitamin-b12',
  'vitamin-c', 'vitamin-d', 'vitamin-e', 'vitamin-k',
  'calcium', 'magnesium', 'iron', 'zinc', 'iodine', 'selenium', 'sodium', 'potassium', 'phosphorus', 'copper',
  'anthocyanin', 'lutein', 'lycopene', 'beta-carotene', 'astaxanthin',
]
const nutrientRank = (slug) => {
  const index = NUTRIENT_ORDER.indexOf(slug)
  return index === -1 ? 999 : index
}

export default {
  name: 'HomeView',
  components: {
    ArrowRight, ArrowUpRight, Atom, ChevronRight, CircleHelp, Droplet,
    Leaf, Search, ShieldCheck, Sprout, Sun, Utensils, FoodLibrary, FoodPairingExplorer,
  },
  data() {
    return {
      nutrients: demoNutrients,
      populations: demoPopulations,
      referenceCardItems,
      selectedNutrient: 'energy',
      selectedPopulation: 'adult',
      selectedGroup: 'all',
      nutrientExpanded: false,
      searchInput: '',
      submittedQuery: '',
      standardMeta: STANDARD_META,
      groupTabs: [
        { value: 'all', label: '全部' },
        { value: 'macronutrient', label: '宏量营养素' },
        { value: 'vitamin', label: '维生素' },
        { value: 'mineral', label: '矿物质' },
        { value: 'other', label: '其他成分' },
      ],
      activeType: '',
      referenceTypes: [
        {
          kind: 'metric', code: 'EAR', name: '平均需要量', tone: '',
          short: '用于描述特定人群需要量的平均水平。',
          detail: 'EAR 是满足某一特定人群 50% 个体需要的摄入水平，是制定 RNI 的基础，不适合直接作为个人摄入目标。',
          emptyHint: 'EAR 是推导 RNI 的中间值，本平台以 RNI 作为推荐量展示，暂不单列 EAR 数值。',
        },
        {
          kind: 'metric', code: 'RNI', name: '推荐摄入量', tone: 'type-rni',
          short: '轻体力活动成年人，一天大致这样吃。',
          detail: '按《中国居民膳食营养素参考摄入量（2023 版）》和《中国居民膳食指南（2022）》，轻体力活动的健康成年人，一天的食物推荐量如下。',
          sourceName: '中国营养学会 · 中国居民膳食指南（2022）',
          sourceUrl: GUIDE_URL,
          guidelineRows: [
            { category: '能量', amount: '男性约 2150 千卡，女性约 1700 千卡', note: '活动量大的人需要更多' },
            { category: '谷薯类', amount: '200–300 克', note: '其中全谷物和杂豆 50–150 克，薯类 50–100 克' },
            { category: '蔬菜', amount: '≥300 克', note: '深色蔬菜最好占一半' },
            { category: '水果', amount: '200–350 克', note: '不要完全用果汁代替水果' },
            { category: '畜禽肉、鱼、蛋', amount: '120–200 克', note: '鱼、禽、瘦肉、蛋类轮换搭配' },
            { category: '大豆及坚果', amount: '25–35 克', note: '豆制品可替代部分动物蛋白' },
            { category: '乳制品', amount: '300–500 克', note: '约相当于 300 毫升液态奶' },
            { category: '烹调油', amount: '25–30 克', note: '少油炸、少重油炒菜' },
            { category: '食盐', amount: '<5 克', note: '包括酱油、咸菜、调味品中的盐' },
            { category: '添加糖', amount: '≤25 克', note: '最好不超过 25 克，最高不超过 50 克' },
          ],
        },
        {
          kind: 'guideline', code: '多样', name: '食物多样，合理搭配', tone: 'type-ai',
          short: '平均每天摄入 12 种以上食物，每周 25 种以上。',
          detail: '《中国居民膳食指南（2022）》核心准则之一：以谷类为主，食物多样，合理搭配。',
          points: [
            '每天的膳食应包括谷薯类、蔬菜水果、畜禽鱼蛋奶和豆类食物。',
            '平均每天摄入 12 种以上食物，每周 25 种以上。',
            '每天摄入谷类 200～300 克，其中全谷物和杂豆 50～150 克。',
            '每天摄入薯类 50～100 克。',
            '餐餐有蔬菜，天天吃水果。',
          ],
          sourceName: '中国营养学会 · 中国居民膳食指南（2022）',
          sourceUrl: GUIDE_URL,
        },
        {
          kind: 'guideline', code: '少盐', name: '少盐少油，控糖限酒', tone: 'type-ul',
          short: '成年人每天食盐不超过 5 克，烹调油 25～30 克。',
          detail: '《中国居民膳食指南（2022）》核心准则之一：培养清淡饮食习惯，少吃高盐和油炸食品。',
          points: [
            '成年人每天食盐摄入不超过 5 克。',
            '烹调油每天 25～30 克。',
            '添加糖每天不超过 50 克，最好控制在 25 克以下。',
            '儿童青少年、孕妇、乳母不应饮酒。',
            '足量饮水，成年人每天 1500～1700 毫升。',
          ],
          sourceName: '中国营养学会 · 中国居民膳食指南（2022）',
          sourceUrl: GUIDE_URL,
        },
      ],
    }
  },
  computed: {
    featuredNutrients() {
      const grouped = this.nutrients.filter((nutrient) => this.selectedGroup === 'all' || nutrient.group === this.selectedGroup)
      let result = grouped
      if (this.submittedQuery.trim()) {
        // 先按名称/英文名精确收窄；没有命中时再退到简介等字段。
        const byName = grouped.filter((nutrient) => matchesKeyword(this.submittedQuery, [
          nutrient.name, nutrient.englishName, nutrient.slug,
        ]))
        result = byName.length ? byName : grouped.filter((nutrient) => matchesKeyword(this.submittedQuery, [
          nutrient.name, nutrient.englishName, nutrient.subgroup, nutrient.summary, nutrient.slug,
        ]))
      }
      // 固定顺序：维生素按 A、B1、B2、B3、B5、B6、B12、C、D、E、K 排列。
      return result.slice().sort((a, b) => nutrientRank(a.slug) - nutrientRank(b.slug))
    },
    // 默认只显示 2 行（桌面 4 列 = 8 个）；搜索时展示全部命中。
    displayNutrients() {
      if (this.submittedQuery.trim()) return this.featuredNutrients
      return this.nutrientExpanded ? this.featuredNutrients : this.featuredNutrients.slice(0, 8)
    },
    nutrientHiddenCount() {
      if (this.submittedQuery.trim()) return 0
      return Math.max(0, this.featuredNutrients.length - 8)
    },
    suggestTerms() {
      return ['蛋白质', '维生素C', '维生素D', '铁', '钙', '锌']
        .filter((term) => this.nutrients.some((nutrient) => matchesKeyword(term, [
          nutrient.name, nutrient.englishName, nutrient.slug,
        ])))
        .slice(0, 4)
    },
    referenceNutrientOptions() {
      return this.referenceCardItems
    },
    selectedCardItem() {
      return getReferenceCardItem(this.selectedNutrient)
    },
    isGroupItem() {
      return !!(this.selectedCardItem && this.selectedCardItem.group)
    },
    // 非分组指标：取出当前人群的数值；分组指标（维生素）返回 null，改由 groupMembers 展示。
    primaryMetric() {
      const item = this.selectedCardItem
      if (!item || item.group) return null
      const amount = item.values ? item.values[this.selectedPopulation] : null
      if (typeof amount !== 'number') return null
      return { type: item.type, typeLabel: item.typeLabel, amount, unit: item.unit }
    },
    groupMembers() {
      const item = this.selectedCardItem
      if (!item || !item.group || !Array.isArray(item.members)) return []
      return item.members
        .map((member) => ({ name: member.name, unit: member.unit, amount: member.values[this.selectedPopulation] }))
        .filter((member) => typeof member.amount === 'number')
    },
    itemNote() {
      return this.selectedCardItem ? this.selectedCardItem.note || '' : ''
    },
    standardVersion() {
      return this.standardMeta.version
    },
    sourceName() {
      return this.standardMeta.sourceName
    },
    sourceUrl() {
      return this.standardMeta.sourceUrl
    },
    selectedNutrientName() {
      return this.selectedCardItem ? this.selectedCardItem.name : '营养素'
    },
    selectedPopulationLabel() {
      const population = this.populations.find((item) => item.code === this.selectedPopulation)
      return population ? population.displayName : '请选择参考人群'
    },
    selectedPopulationMeta() {
      const population = this.populations.find((item) => item.code === this.selectedPopulation)
      if (!population) return ''
      const sexLabel = population.sexLabel
        || { female: '女性', male: '男性', notSpecified: '不分性别' }[population.sex]
        || ''
      return [population.lifeStage, population.ageLabel, sexLabel].filter(Boolean).join(' · ')
    },
    mainNutrientCount() {
      return this.nutrients.length
    },
    ironEvidence() {
      return getAbsorptionEvidence('iron')
    },
    featureEvidence() {
      return this.ironEvidence[0] || null
    },
    enhanceEvidence() {
      return this.ironEvidence.find((item) => item.direction === 'enhances') || null
    },
    inhibitEvidence() {
      return this.ironEvidence.find((item) => item.direction === 'inhibits') || null
    },
    activeTypeMeta() {
      return this.referenceTypes.find((item) => item.code === this.activeType) || null
    },
    isGuidelineType() {
      return !!(this.activeTypeMeta && this.activeTypeMeta.kind === 'guideline')
    },
    activeTypeRows() {
      if (!this.activeType) return []
      const bySlug = new Map()
      demoReferenceIntakes
        .filter((row) => row.type === this.activeType)
        .forEach((row) => {
          if (!bySlug.has(row.nutrientSlug)) {
            bySlug.set(row.nutrientSlug, {
              slug: row.nutrientSlug,
              name: row.nutrientName,
              unit: row.unit,
              child: '—',
              adult: '—',
              older: '—',
            })
          }
          const target = bySlug.get(row.nutrientSlug)
          if (Object.prototype.hasOwnProperty.call(target, row.populationCode)) {
            target[row.populationCode] = row.amount
          }
        })
      return Array.from(bySlug.values())
        .sort((a, b) => String(a.name).localeCompare(String(b.name), 'zh'))
        .slice(0, 6)
    },
  },
  watch: {
    selectedGroup() {
      this.nutrientExpanded = false
    },
    submittedQuery() {
      this.nutrientExpanded = false
    },
  },
  mounted() {
    this.loadHomeData()
  },
  methods: {
    groupLabel(group) {
      const labels = { macronutrient: '宏量营养素', vitamin: '维生素', mineral: '矿物质', other: '其他成分' }
      return labels[group] || labels.other
    },
    groupIcon(group) {
      if (group === 'macronutrient') return Atom
      if (group === 'vitamin') return Sun
      if (group === 'mineral') return Sprout
      return Leaf
    },
    submitSearch() {
      this.submittedQuery = this.searchInput.trim()
      this.selectedGroup = 'all'
      this.$nextTick(() => {
        const section = document.querySelector('#nutrition-library')
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    },
    useSearchTerm(term) {
      this.searchInput = term
      this.submitSearch()
    },
    scrollToSection(id) {
      const target = document.getElementById(id)
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    clearSearch() {
      this.submittedQuery = ''
      this.searchInput = ''
      this.selectedGroup = 'all'
    },
    toggleType(code) {
      this.activeType = this.activeType === code ? '' : code
    },
    async loadHomeData() {
      const results = await Promise.allSettled([getNutrients()])

      // 与本地目录按 slug 合并：本地已审核的正文和分类优先，
      // 后端旧版本返回的空壳或通用简介不会覆盖它们。
      // 以数据库接口为准：库里有几条就展示几条；本地数据只填补缺失字段，
      // 这样新增/调整营养素先在库里生效，而不是被前端硬编码覆盖。
      if (results[0].status === 'fulfilled' && results[0].value.length) {
        const bySlug = new Map(this.nutrients.map((item) => [item.slug, item]))
        this.nutrients = results[0].value.map((item) => {
          const local = bySlug.get(item.slug) || {}
          return Object.assign({}, local, item, {
            description: item.description || local.description || null,
          })
        })
      }

      // 参考人群固定使用本地的「儿童 / 成人 / 老人」三档，
      // 不随后端旧版本的细分数据变动，保证参考卡选择器与参考值表一致。
    },
  },
}
</script>

<template>
  <main class="home-view">
    <section class="hero-section page-width">
      <div class="hero-copy">
        <div class="eyebrow"><span class="eyebrow-line"></span>营养知识 · 有据可查</div>
        <h1>把每天吃进去的，<br><span>变成看得懂的营养。</span></h1>
        <p class="hero-intro">从蛋白质到微量元素，查需求、找来源、看懂吸收影响因素。让每个营养数字，都有清楚的来处。</p>

        <form class="hero-search" role="search" @submit.prevent="submitSearch">
          <Search class="search-symbol" :size="19" :stroke-width="1.8" />
          <input v-model="searchInput" type="search" aria-label="搜索营养素或食物" placeholder="试试搜索「维生素 D」「铁」或「黄豆」">
          <button type="submit">开始查找 <ArrowRight :size="16" /></button>
        </form>
        <div class="quick-searches"><span>热门：</span><button type="button" @click="useSearchTerm('蛋白质')">蛋白质</button><button type="button" @click="useSearchTerm('维生素')">维生素</button><button type="button" @click="useSearchTerm('铁')">铁与吸收</button><button type="button" @click="useSearchTerm('铁')">铁</button></div>

        <div class="hero-proof"><span class="proof-icon"><ShieldCheck :size="16" /></span><span>人群参考量 · 标准版本 · 资料来源，一起呈现。</span></div>
      </div>

      <div class="hero-art" aria-label="营养地图主题插画">
        <div class="art-halo"></div>
        <div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div>
        <div class="plate-shadow"></div>
        <div class="nutrition-plate">
          <div class="plate-center"><span>FOOD</span><strong>×</strong><span>NUTRIENTS</span></div>
          <i class="plate-dot dot-one"></i><i class="plate-dot dot-two"></i><i class="plate-dot dot-three"></i>
        </div>
        <div class="float-note note-top"><span class="note-mark mark-lime"><Sprout :size="16" /></span><span><strong>从食物出发</strong><small>来源 · 份量 · 状态</small></span></div>
        <div class="float-note note-bottom"><span class="note-mark mark-peach"><Droplet :size="16" /></span><span><strong>读懂吸收</strong><small>搭配 · 加工 · 证据</small></span></div>
        <div class="art-caption">NUTRITION, MADE CLEAR</div>
      </div>
    </section>

    <section class="reference-band page-width" id="daily-reference">
      <div class="reference-intro">
        <span class="section-kicker">DAILY REFERENCE</span>
        <h2>每日参考摄入，<br>先选适用人群。</h2>
        <p>参考量按儿童、成人、老人三档呈现，不同指标类型不能混读。性别差异已合并为单一代表值。</p>
        <a href="#reference-notes" class="text-link" @click.prevent="scrollToSection('reference-notes')">读懂 RNI / AI / UL <ArrowUpRight :size="15" /></a>
      </div>

      <div class="reference-card">
        <div class="reference-card-top">
          <div><span class="reference-eyebrow">当前参考对象</span><strong>{{ selectedPopulationLabel }}</strong></div>
          <span class="standard-pill">{{ standardVersion }}</span>
        </div>
        <span class="reference-submeta">{{ selectedPopulationMeta }}</span>

        <div class="reference-selects">
          <label class="ref-field">
            <span>营养素</span>
            <div class="select-wrap">
              <select v-model="selectedNutrient" aria-label="选择营养素">
                <option v-for="nutrient in referenceNutrientOptions" :key="nutrient.slug" :value="nutrient.slug">{{ nutrient.name }}</option>
              </select>
              <ChevronRight :size="16" />
            </div>
          </label>
          <label class="ref-field">
            <span>参考人群</span>
            <div class="select-wrap">
              <select v-model="selectedPopulation" aria-label="选择参考人群">
                <option v-for="population in populations" :key="population.code" :value="population.code">{{ population.displayName }}</option>
              </select>
              <ChevronRight :size="16" />
            </div>
          </label>
        </div>

        <div v-if="isGroupItem" class="reference-highlight reference-group">
          <div>
            <span class="value-label">{{ selectedNutrientName }} · 分项参考</span>
            <strong class="value-title">按 A、B 族、C、D 等分别管理</strong>
          </div>
        </div>
        <div v-else-if="primaryMetric" class="reference-highlight">
          <div>
            <span class="value-label">{{ selectedNutrientName }} · {{ primaryMetric.type }}</span>
            <strong class="value-title">{{ primaryMetric.typeLabel }}</strong>
          </div>
          <div class="value-number"><span>{{ primaryMetric.amount }}</span><small>{{ primaryMetric.unit }}</small></div>
        </div>
        <div v-else class="reference-empty">该指标在此人群下暂无录入值。</div>

        <div v-if="isGroupItem && groupMembers.length" class="metric-chip-row">
          <span v-for="member in groupMembers" :key="member.name" class="metric-chip">
            {{ member.name }} · {{ member.amount }} {{ member.unit }}
          </span>
        </div>

        <p v-if="itemNote" class="reference-item-note">{{ itemNote }}</p>

        <div class="reference-footnote"><span class="footnote-dot"></span><span>简化示例：成人=18–49 岁、儿童=4–10 岁、老人=65–79 岁，性别差异已合并；正式上线需按 DRIs 2023 分性别完整数据。</span></div>
        <a class="source-link" :href="sourceUrl" target="_blank" rel="noreferrer">{{ sourceName }} <ArrowUpRight :size="14" /></a>
      </div>
    </section>

    <section class="content-section page-width" id="nutrition-library">
      <div class="section-heading">
        <div><span class="section-kicker">EXPLORE NUTRIENTS</span><h2>{{ submittedQuery ? (featuredNutrients.length ? `「${submittedQuery}」的营养索引` : `未找到「${submittedQuery}」`) : '从营养素图鉴开始' }}</h2><p>把复杂的营养知识，按身体需要和食物来源整理清楚。</p></div>
        <a class="text-link desktop-link" href="#food-library" @click.prevent="scrollToSection('food-library')">从食物开始探索 <ArrowRight :size="15" /></a>
      </div>

      <div class="library-toolbar">
        <div class="filter-tabs" role="group" aria-label="营养素分类">
          <button v-for="tab in groupTabs" :key="tab.value" type="button" :class="{ active: selectedGroup === tab.value }" @click="selectedGroup = tab.value">{{ tab.label }}</button>
        </div>
        <span class="result-count">{{ featuredNutrients.length }} 项营养素</span>
      </div>

      <div v-if="featuredNutrients.length" class="nutrient-grid">
        <RouterLink v-for="(nutrient, index) in displayNutrients" :key="nutrient.slug" class="nutrient-card" :class="[`tone-${nutrient.group}`, { 'featured-card': index === 0 && !submittedQuery }]" :to="`/nutrients/${nutrient.slug}`">
          <div class="nutrient-card-top"><span class="nutrient-icon"><component :is="groupIcon(nutrient.group)" :size="19" :stroke-width="1.8" /></span><span class="nutrient-group-label">{{ groupLabel(nutrient.group) }}</span><ArrowUpRight class="card-open" :size="17" /></div>
          <h3>{{ nutrient.name }}</h3>
          <p>{{ nutrient.summary }}</p>
          <div class="nutrient-card-bottom"><span>{{ nutrient.subgroup ?? nutrient.englishName ?? '查看营养素详情' }}</span><span class="unit-label">{{ nutrient.canonicalUnit }}</span></div>
        </RouterLink>
      </div>
      <div v-else class="empty-search">
        <span class="empty-icon"><CircleHelp :size="24" /></span>
        <strong class="empty-title">{{ submittedQuery ? `没有找到「${submittedQuery}」这个营养素` : '当前分类下暂时没有条目' }}</strong>
        <p class="empty-desc">可能是名称有误，或该名词尚未收录。系统不会用相近名称替代，也不会用估算值填充。</p>
        <div v-if="suggestTerms.length" class="empty-suggest">
          <span>可以试试：</span>
          <button v-for="term in suggestTerms" :key="term" type="button" @click="useSearchTerm(term)">{{ term }}</button>
        </div>
        <div class="empty-actions">
          <button type="button" class="empty-clear" @click="clearSearch">清除搜索</button>
          <a href="#food-library" @click.prevent="scrollToSection('food-library')">去食物库查找</a>
        </div>
      </div>
      <div v-if="nutrientHiddenCount" class="nutrient-more">
        <button type="button" @click="nutrientExpanded = !nutrientExpanded">
          {{ nutrientExpanded ? '收起（只看前 8 个）' : `显示更多（还有 ${nutrientHiddenCount} 个）` }}
        </button>
      </div>
      <div class="library-foot"><span>先按分类查，也可以直接搜索。</span><span>营养素资料逐步扩充。<span class="foot-arrow">→</span></span></div>
    </section>

    <section class="content-section page-width" id="absorption">
      <div class="section-heading absorption-heading">
        <div><span class="section-kicker">FOOD PAIRINGS</span><h2>食物和食物之间，<br class="mobile-break">也有搭配讲究。</h2><p>两种食物同吃，可能促进、影响或互补；把搭配讲清楚，比记住一个数字更有用。</p></div>
      </div>
      <FoodPairingExplorer />
    </section>

    <section class="food-section" id="food-library">
      <div class="page-width food-inner">
        <div class="section-heading">
          <div><span class="section-kicker">FROM FOOD TO NUTRIENTS</span><h2>营养知识，回到一日三餐。</h2><p>食物库按计量基准与食物状态组织，生食、熟食、制品分开记录，并标明数据出处。</p></div>
        </div>
        <FoodLibrary />
      </div>
    </section>

    <section class="reference-notes page-width" id="reference-notes">
      <div class="section-heading"><div><span class="section-kicker">READ THE LABEL</span><h2>参考值有不同的含义。</h2><p>指标类型、人群、单位和标准版本一起看，才知道该怎么理解一个数字。</p></div><a class="text-link" href="https://www.cnsoc.org/drpostand/" target="_blank" rel="noreferrer">中国营养学会 · DRIs 2023 <ArrowUpRight :size="15" /></a></div>
      <div class="reference-type-grid">
        <article
          v-for="type in referenceTypes"
          :key="type.code"
          class="reference-type-item"
          :class="{ active: activeType === type.code }"
          role="button"
          tabindex="0"
          :aria-pressed="activeType === type.code ? 'true' : 'false'"
          @click="toggleType(type.code)"
          @keydown.enter.prevent="toggleType(type.code)"
          @keydown.space.prevent="toggleType(type.code)"
        >
          <span class="type-code" :class="type.tone">{{ type.code }}</span>
          <div>
            <strong>{{ type.name }}</strong>
            <p>{{ type.short }}</p>
          </div>
          <ChevronRight :size="15" class="type-item-arrow" :class="{ open: activeType === type.code }" />
        </article>
      </div>

      <transition name="fade">
        <div v-if="activeTypeMeta" class="type-detail-panel">
          <div class="type-detail-head">
            <span class="type-code" :class="activeTypeMeta.tone">{{ activeTypeMeta.code }}</span>
            <div class="type-detail-copy">
              <strong>{{ activeTypeMeta.name }}</strong>
              <p>{{ activeTypeMeta.detail }}</p>
            </div>
            <button type="button" class="type-detail-close" @click="activeType = ''">收起</button>
          </div>
          <template v-if="isGuidelineType">
            <ul class="type-guideline-list">
              <li v-for="point in activeTypeMeta.points" :key="point">{{ point }}</li>
            </ul>
            <a :href="activeTypeMeta.sourceUrl" target="_blank" rel="noreferrer" class="type-detail-link">来源：{{ activeTypeMeta.sourceName }} <ArrowUpRight :size="13" /></a>
          </template>
          <template v-else-if="activeTypeMeta.guidelineRows">
            <div class="table-scroll">
              <table class="type-detail-table type-intake-table">
                <thead><tr><th>类别</th><th>每日推荐量</th><th>说明</th></tr></thead>
                <tbody>
                  <tr v-for="row in activeTypeMeta.guidelineRows" :key="row.category">
                    <td>{{ row.category }}</td>
                    <td>{{ row.amount }}</td>
                    <td>{{ row.note }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <a :href="activeTypeMeta.sourceUrl" target="_blank" rel="noreferrer" class="type-detail-link">来源：{{ activeTypeMeta.sourceName }} <ArrowUpRight :size="13" /></a>
          </template>
          <template v-else>
            <div v-if="activeTypeRows.length" class="table-scroll">
              <table class="type-detail-table">
                <thead><tr><th>指标</th><th>儿童</th><th>成人</th><th>老人</th><th>单位</th></tr></thead>
                <tbody>
                  <tr v-for="row in activeTypeRows" :key="row.slug">
                    <td>{{ row.name }}</td>
                    <td>{{ row.child }}</td>
                    <td>{{ row.adult }}</td>
                    <td>{{ row.older }}</td>
                    <td>{{ row.unit }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="type-detail-empty">{{ activeTypeMeta.emptyHint }}</p>
            <a href="#daily-reference" class="type-detail-link" @click.prevent="scrollToSection('daily-reference')">去每日参考量按人群查看 <ArrowRight :size="14" /></a>
          </template>
        </div>
      </transition>

      <div class="health-note"><ShieldCheck :size="17" /><span>本平台用于营养知识查询与膳食参考，不用于诊断或替代个体化医疗建议。当前参考值与食物含量为结构演示数据，正式上线前需导入官方完整数据。</span><a href="#daily-reference" @click.prevent="scrollToSection('daily-reference')">返回人群参考量 <ArrowRight :size="14" /></a></div>
    </section>
  </main>
</template>
