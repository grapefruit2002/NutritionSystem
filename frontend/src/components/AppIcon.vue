<script>
const icons = {
  leaf: '<path d="M20.8 3.2C13.7 3.2 7.2 4.4 4.2 8.6c-2 2.8-1.7 6.1.2 8 2 2 5.2 2.2 8 .2 4.2-3 5.4-9.5 5.4-16.6Z"/><path d="M3.3 21c3-5.2 6.8-8.8 12-12"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m18 6-12 12M6 6l12 12"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  up: '<path d="M7 17 17 7M8 7h9v9"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  sprout: '<path d="M7 20h10M12 20v-8"/><path d="M12 12C5 12 3 8 3 4c5 0 9 2 9 8ZM12 14c0-6 3-9 9-9 0 5-2 9-9 9Z"/>',
  atom: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  drop: '<path d="M12 22a7 7 0 0 0 7-7c0-4-7-13-7-13S5 11 5 15a7 7 0 0 0 7 7Z"/>',
  fork: '<path d="M6 3v6M3 3v4a3 3 0 0 0 6 0V3M6 10v11M18 3v18M18 3c-3 2-4 5-4 8h4"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 16a2.5 2.5 0 0 1 2.5-2.5H20"/>',
  chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-5 5"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3m.1 4h.01"/>',
}

export default {
  name: 'AppIcon',
  props: {
    name: { type: String, required: true },
    size: { type: Number, default: 18 },
    strokeWidth: { type: Number, default: 1.8 },
  },
  computed: {
    markup() {
      return icons[this.name] || icons.leaf
    },
  },
}
</script>

<template>
  <svg class="ui-icon" xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="markup" />
</template>
