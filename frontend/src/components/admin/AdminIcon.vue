<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <component
      :is="shape[0]"
      v-for="(shape, index) in shapes"
      :key="index"
      v-bind="shape[1]"
    />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
})

const icons = {
  dashboard: [
    ['rect', { x: 3, y: 3, width: 7, height: 9, rx: 1 }],
    ['rect', { x: 14, y: 3, width: 7, height: 5, rx: 1 }],
    ['rect', { x: 14, y: 12, width: 7, height: 9, rx: 1 }],
    ['rect', { x: 3, y: 16, width: 7, height: 5, rx: 1 }],
  ],
  package: [
    ['path', { d: 'm7.5 4.27 9 5.15' }],
    ['path', { d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' }],
    ['path', { d: 'm3.3 7 8.7 5 8.7-5' }],
    ['path', { d: 'M12 22V12' }],
  ],
  tags: [
    ['path', { d: 'M9.5 5H5a2 2 0 0 0-2 2v4.5a2 2 0 0 0 .59 1.41l7.5 7.5a2 2 0 0 0 2.82 0l6.5-6.5a2 2 0 0 0 0-2.82l-7.5-7.5A2 2 0 0 0 11.5 3Z' }],
    ['circle', { cx: 7.5, cy: 7.5, r: 1 }],
  ],
  image: [
    ['rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 }],
    ['circle', { cx: 8.5, cy: 8.5, r: 1.5 }],
    ['path', { d: 'm21 15-5-5L5 21' }],
  ],
  sparkles: [
    ['path', { d: 'm12 3-1.4 3.6L7 8l3.6 1.4L12 13l1.4-3.6L17 8l-3.6-1.4Z' }],
    ['path', { d: 'm5 15-.8 2.2L2 18l2.2.8L5 21l.8-2.2L8 18l-2.2-.8Z' }],
    ['path', { d: 'm19 14-.8 2.2-2.2.8 2.2.8L19 20l.8-2.2L22 17l-2.2-.8Z' }],
  ],
  promotion: [
    ['path', { d: 'M20 12v9H4v-9' }],
    ['path', { d: 'M2 7h20v5H2z' }],
    ['path', { d: 'M12 22V7' }],
    ['path', { d: 'M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Z' }],
    ['path', { d: 'M12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z' }],
  ],
  orders: [
    ['path', { d: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z' }],
    ['path', { d: 'M3 6h18' }],
    ['path', { d: 'M16 10a4 4 0 0 1-8 0' }],
  ],
  users: [
    ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
    ['circle', { cx: 9, cy: 7, r: 4 }],
    ['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }],
    ['path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }],
  ],
  logout: [
    ['path', { d: 'M10 17l5-5-5-5' }],
    ['path', { d: 'M15 12H3' }],
    ['path', { d: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4' }],
  ],
  store: [
    ['path', { d: 'm2 7 2.4-4h15.2L22 7' }],
    ['path', { d: 'M5 13v8h14v-8' }],
    ['path', { d: 'M9 21v-6h6v6' }],
    ['path', { d: 'M2 7a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0' }],
  ],
  menu: [
    ['path', { d: 'M4 6h16M4 12h16M4 18h16' }],
  ],
  close: [
    ['path', { d: 'm18 6-12 12M6 6l12 12' }],
  ],
  alert: [
    ['path', { d: 'M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z' }],
    ['path', { d: 'M12 9v4M12 17h.01' }],
  ],
  dollar: [
    ['circle', { cx: 12, cy: 12, r: 9 }],
    ['path', { d: 'M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 6v12' }],
  ],
  clipboard: [
    ['rect', { x: 5, y: 4, width: 14, height: 17, rx: 2 }],
    ['path', { d: 'M9 4V2h6v2M9 10h6M9 14h6M9 18h4' }],
  ],
  check: [
    ['circle', { cx: 12, cy: 12, r: 9 }],
    ['path', { d: 'm8 12 2.5 2.5L16 9' }],
  ],
  'user-plus': [
    ['path', { d: 'M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }],
    ['circle', { cx: 8, cy: 7, r: 4 }],
    ['path', { d: 'M19 8v6M16 11h6' }],
  ],
  arrow: [
    ['path', { d: 'M5 12h14M13 6l6 6-6 6' }],
  ],
  refresh: [
    ['path', { d: 'M20 11a8 8 0 0 0-14.9-4M4 4v5h5' }],
    ['path', { d: 'M4 13a8 8 0 0 0 14.9 4M20 20v-5h-5' }],
  ],
  calendar: [
    ['rect', { x: 3, y: 5, width: 18, height: 16, rx: 2 }],
    ['path', { d: 'M16 3v4M8 3v4M3 11h18' }],
  ],
}

const shapes = computed(() => icons[props.name] || icons.dashboard)
</script>

<style scoped>
svg {
  display: block;
  width: 1em;
  height: 1em;
}
</style>
