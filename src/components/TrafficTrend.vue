<script setup lang="ts">
import { useElementSize } from '@vueuse/core'

const props = defineProps<{
  daily: { label: string, visits: number }[]
  number: Intl.NumberFormat
}>()
const { t } = useI18n()
const container = ref<HTMLElement>()
const { width, height } = useElementSize(container)
const left = 42
const top = 12
const plotWidth = computed(() => Math.max(1, width.value - left - 12))
const bottom = computed(() => height.value - 30)
const step = computed(() => Math.ceil(Math.max(...props.daily.map(row => row.visits)) / 4 / 50) * 50)
const last = computed(() => props.daily.length - 1)
const active = ref<number>()

function x(index: number) {
  return left + index * plotWidth.value / last.value
}
function y(visits: number) {
  return bottom.value - visits / (step.value * 4) * (bottom.value - top)
}
const line = computed(() => props.daily.map((row, index) => `${x(index)},${y(row.visits)}`).join(' '))
const labels = computed(() => {
  const count = Math.min(props.daily.length, Math.max(2, Math.floor(plotWidth.value / 68)))
  return Array.from({ length: count }, (_, i) => Math.round(i * last.value / (count - 1)))
})

function select(index: number) {
  active.value = Math.max(0, Math.min(last.value, index))
}
function point(event: PointerEvent) {
  const offset = event.clientX - (event.currentTarget as SVGSVGElement).getBoundingClientRect().left
  select(Math.round((offset - left) * last.value / plotWidth.value))
}
const selected = computed(() => props.daily[active.value ?? last.value])
</script>

<template>
  <div ref="container" class="traffic-trend">
    <svg
      v-if="width && height" width="100%" height="100%" role="slider" tabindex="0"
      :aria-label="t('dashboard.trend')" :aria-valuemin="1" :aria-valuemax="daily.length"
      :aria-valuenow="(active ?? last) + 1" :aria-valuetext="`${selected.label}: ${number.format(selected.visits)}`"
      @focus="active ??= last" @blur="active = undefined"
      @pointerdown="point" @pointermove="point" @pointerleave="active = undefined"
      @keydown.left.prevent="select((active ?? last) - 1)" @keydown.right.prevent="select((active ?? last) + 1)"
      @keydown.home.prevent="select(0)" @keydown.end.prevent="select(last)" @keydown.esc="active = undefined"
    >
      <g v-for="i in 5" :key="i">
        <line :x1="left" :x2="x(last)" :y1="y((i - 1) * step)" :y2="y((i - 1) * step)" stroke="var(--border)" stroke-dasharray="3 5" />
        <text :x="left - 8" :y="y((i - 1) * step)" dy=".35em" text-anchor="end">{{ number.format((i - 1) * step) }}</text>
      </g>
      <polygon :points="`${left},${bottom} ${line} ${x(last)},${bottom}`" fill="var(--muted)" />
      <polyline :points="line" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linejoin="round" />
      <text v-for="i in labels" :key="i" :x="x(i)" :y="bottom + 20" :text-anchor="i === last ? 'end' : 'middle'">{{ daily[i].label }}</text>
      <g v-if="active !== undefined">
        <line :x1="x(active)" :x2="x(active)" :y1="top" :y2="bottom" stroke="var(--input)" stroke-dasharray="3 4" />
        <circle :cx="x(active)" :cy="y(selected.visits)" r="4" fill="var(--primary)" stroke="var(--card)" stroke-width="2" />
      </g>
    </svg>
    <div v-if="active !== undefined" class="trend-tooltip" aria-hidden="true" :style="{ '--point': `${x(active)}px` }">
      {{ selected.label }}<br>{{ t('dashboard.visits') }}: <strong>{{ number.format(selected.visits) }}</strong>
    </div>
  </div>
</template>

<style scoped>
.traffic-trend {
  position: relative;
}
text {
  fill: var(--muted-foreground);
  font-size: 12px;
}
.trend-tooltip {
  position: absolute;
  top: 20px;
  translate: -50% 0;
  left: clamp(64px, var(--point), calc(100% - 64px));
  padding: 6px 10px;
  background: var(--card);
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: 6px;
  pointer-events: none;
  white-space: nowrap;
  font-size: 13px;
}
</style>
