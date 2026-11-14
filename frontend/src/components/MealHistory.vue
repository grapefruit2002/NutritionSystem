<script>
import { Flame, RefreshCw, Trash2, Utensils } from 'lucide-vue'
import { deleteMealLog, getMealLogs } from '../services/nutritionApi'

const MEAL_LABELS = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default {
  name: 'MealHistory',
  components: { Flame, RefreshCw, Trash2, Utensils },
  data() {
    return {
      logs: [],
      loading: false,
      error: '',
      deletingId: null,
    }
  },
  computed: {
    // 按日期分组，并汇总当天能量与总克数。
    groups() {
      const map = new Map()
      this.logs.forEach((log) => {
        if (!map.has(log.logDate)) {
          map.set(log.logDate, { date: log.logDate, logs: [], energy: 0, grams: 0 })
        }
        const group = map.get(log.logDate)
        group.logs.push(log)
        group.energy += log.totalEnergyKcal || 0
        group.grams += log.totalGrams || 0
      })
      return Array.from(map.values())
    },
    isEmpty() {
      return !this.loading && !this.error && this.logs.length === 0
    },
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      this.error = ''
      try {
        const rows = await getMealLogs(this.shiftIso(29), this.todayIso())
        this.logs = Array.isArray(rows) ? rows : []
      } catch (error) {
        this.error = '无法读取饮食记录：' + error.message
      } finally {
        this.loading = false
      }
    },
    todayIso() {
      return this.toIso(new Date())
    },
    shiftIso(days) {
      const date = new Date()
      date.setDate(date.getDate() - days)
      return this.toIso(date)
    },
    toIso(date) {
      const pad = (value) => String(value).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    },
    mealLabel(type) {
      return MEAL_LABELS[type] || type
    },
    weekday(date) {
      if (!date) return ''
      const parsed = new Date(date + 'T00:00:00')
      return WEEKDAYS[parsed.getDay()] || ''
    },
    formatNumber(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
      if (value >= 100) return String(Math.round(value))
      if (value >= 10) return value.toFixed(0)
      return value.toFixed(1)
    },
    async remove(log) {
      if (this.deletingId === log.id) return
      this.deletingId = log.id
      try {
        await deleteMealLog(log.id)
        this.logs = this.logs.filter((item) => item.id !== log.id)
      } catch (error) {
        this.error = '删除失败：' + error.message
      } finally {
        this.deletingId = null
      }
    },
  },
}
</script>

<template>
  <div class="meal-history">
    <div class="meal-history-head">
      <div>
        <strong>饮食记录</strong>
        <span>最近 30 天保存的每一餐，数据来自后端数据库。</span>
      </div>
      <button type="button" class="meal-history-refresh" :disabled="loading" @click="load">
        <RefreshCw :size="14" /> {{ loading ? '刷新中…' : '刷新' }}
      </button>
    </div>

    <p v-if="error" class="meal-history-error">{{ error }}</p>

    <div v-if="loading && !logs.length" class="meal-history-empty">正在读取记录…</div>

    <template v-else-if="groups.length">
      <section v-for="group in groups" :key="group.date" class="meal-day">
        <header class="meal-day-head">
          <span class="meal-day-date">{{ group.date }}<em>{{ weekday(group.date) }}</em></span>
          <span class="meal-day-total">
            <Flame :size="13" /> 合计 {{ formatNumber(group.energy) }} kcal · {{ formatNumber(group.grams) }} 克
          </span>
        </header>

        <article v-for="log in group.logs" :key="log.id" class="meal-card">
          <div class="meal-card-head">
            <span class="meal-type-badge">{{ mealLabel(log.mealType) }}</span>
            <span class="meal-card-energy">{{ formatNumber(log.totalEnergyKcal) }} kcal · {{ formatNumber(log.totalGrams) }} 克</span>
            <button
              type="button"
              class="meal-card-delete"
              :disabled="deletingId === log.id"
              aria-label="删除这条记录"
              @click="remove(log)"
            >
              <Trash2 :size="14" />
            </button>
          </div>
          <ul class="meal-card-items">
            <li v-for="item in log.items" :key="item.id">
              <span class="meal-item-name">{{ item.foodName }}</span>
              <span class="meal-item-grams">{{ formatNumber(item.grams) }} 克</span>
              <span class="meal-item-energy">{{ formatNumber(item.energyKcal) }} kcal</span>
            </li>
          </ul>
        </article>
      </section>
    </template>

    <div v-else class="meal-history-empty">
      <Utensils :size="22" />
      <strong>还没有饮食记录</strong>
      <p>到「膳食计算器」配好一餐后，点「保存这一餐」就会出现在这里。</p>
    </div>
  </div>
</template>
