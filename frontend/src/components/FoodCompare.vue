<script>
import { X } from 'lucide-vue'
import {
  FOOD_COMPARE_SLUGS, demoFoods, foodEnergyPer100g, nutrientMeta,
} from '../data/nutritionData'

function createSlot(foodId, grams) {
  const food = demoFoods.find((item) => item.id === foodId)
  return { foodId: food ? food.id : '', grams, query: food ? food.name : '', open: false }
}

export default {
  name: 'FoodCompare',
  components: { X },
  data() {
    return {
      foods: demoFoods,
      slots: [
        createSlot('pork-lean-cooked', 100),
        createSlot('chicken-breast-cooked', 100),
        createSlot('grass-carp-cooked', 100),
      ],
    }
  },
  computed: {
    activeSlots() {
      return this.slots
        .filter((slot) => slot.foodId)
        .map((slot) => ({ grams: slot.grams, food: this.foods.find((food) => food.id === slot.foodId) }))
        .filter((slot) => slot.food)
    },
    rows() {
      const list = []
      const energyValues = this.activeSlots.map((slot) => foodEnergyPer100g(slot.food) * (slot.grams / 100))
      list.push({ slug: 'energy', name: '能量', unit: 'kcal', values: energyValues })

      FOOD_COMPARE_SLUGS.forEach((slug) => {
        const meta = nutrientMeta(slug)
        const values = this.activeSlots.map((slot) => {
          const amount = slot.food.nutrients[slug]
          return typeof amount === 'number' ? amount * (slot.grams / 100) : null
        })
        list.push({ slug, name: meta.name, unit: meta.unit, values })
      })

      list.forEach((row) => {
        let max = -Infinity
        let index = -1
        row.values.forEach((value, i) => {
          if (typeof value === 'number' && value > max) {
            max = value
            index = i
          }
        })
        row.maxIndex = index
      })

      return list.filter((row) => row.values.some((value) => typeof value === 'number'))
    },
  },
  mounted() {
    document.addEventListener('click', this.closeAll)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeAll)
  },
  methods: {
    openSlot(index) {
      this.slots.forEach((slot, i) => { slot.open = i === index })
    },
    closeAll() {
      this.slots.forEach((slot) => { slot.open = false })
    },
    onInput(index, value) {
      const slot = this.slots[index]
      slot.query = value
      slot.foodId = ''
      slot.open = true
    },
    listFor(index) {
      const slot = this.slots[index]
      const query = slot.query.trim().toLocaleLowerCase()
      const selected = slot.foodId ? this.foods.find((food) => food.id === slot.foodId) : null
      const keyword = selected && query === selected.name.toLocaleLowerCase() ? '' : query
      const list = this.foods.filter((food) => !keyword
        || [food.name, food.alias || '', food.category].join(' ').toLocaleLowerCase().includes(keyword))
      return list.slice(0, 12)
    },
    pick(index, food) {
      const slot = this.slots[index]
      slot.foodId = food.id
      slot.query = food.name
      slot.open = false
    },
    clearSlot(index) {
      const slot = this.slots[index]
      slot.foodId = ''
      slot.query = ''
      slot.open = true
    },
    setGrams(index, value) {
      const grams = Number(value)
      this.slots[index].grams = Number.isFinite(grams) && grams > 0 ? grams : 1
    },
    reset() {
      this.slots = [
        createSlot('pork-lean-cooked', 100),
        createSlot('chicken-breast-cooked', 100),
        createSlot('grass-carp-cooked', 100),
      ]
    },
    format(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
      if (value >= 100) return String(Math.round(value))
      if (value >= 10) return value.toFixed(0)
      return value.toFixed(1)
    },
  },
}
</script>

<template>
  <div class="food-compare">
    <div class="compare-slots">
      <div v-for="(slot, index) in slots" :key="index" class="compare-slot">
        <span class="compare-slot-index">{{ index + 1 }}</span>
        <div class="combo" @click.stop>
          <input
            class="combo-input"
            type="text"
            :value="slot.query"
            placeholder="搜索食物"
            aria-label="搜索并选择对比食物"
            @focus="openSlot(index)"
            @input="onInput(index, $event.target.value)"
            @keydown.esc="slot.open = false"
          >
          <button v-if="slot.foodId" type="button" class="combo-clear" aria-label="清除" @click="clearSlot(index)"><X :size="13" /></button>
          <ul v-if="slot.open" class="combo-list">
            <li v-if="!listFor(index).length" class="combo-none">没有找到，换个名称试试</li>
            <li v-for="food in listFor(index)" :key="food.id" @mousedown.prevent @click="pick(index, food)">
              <span class="combo-emoji">{{ food.emoji }}</span>
              <span class="combo-name">{{ food.name }}</span>
              <small>{{ food.category }}</small>
            </li>
          </ul>
        </div>
        <label class="compare-grams">
          <input type="number" min="1" max="2000" :value="slot.grams" @change="setGrams(index, $event.target.value)">
          <span>克</span>
        </label>
      </div>
    </div>

    <div v-if="activeSlots.length" class="compare-scroll">
      <table class="compare-table">
        <thead>
          <tr>
            <th>营养素</th>
            <th v-for="slot in activeSlots" :key="slot.food.id">
              <span class="compare-food-name">{{ slot.food.emoji }} {{ slot.food.name }}</span>
              <small>{{ slot.food.basis }}</small>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.slug">
            <td>{{ row.name }} <small>{{ row.unit }}</small></td>
            <td v-for="(value, i) in row.values" :key="i" :class="{ best: i === row.maxIndex && activeSlots.length > 1 }">
              {{ format(value) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="compare-empty">选择 2–3 种食物开始对比。</p>

    <div class="compare-foot">
      <span>共 {{ foods.length }} 种食物，输入名称即可搜索；数值按克数换算（每 100 克 × 克数 ÷ 100），绿色为每行最高值。</span>
      <button type="button" @click="reset">恢复默认对比</button>
    </div>
  </div>
</template>
