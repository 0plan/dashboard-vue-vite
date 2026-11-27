<script setup lang="ts">
interface DailyRow { date: string, mobile: number, desktop: number, visits: number }
const props = defineProps<{
  title: string
  columns: string[]
  daily?: DailyRow[]
  days: 7 | 30
  formatDate: (date: string) => string
  number: Intl.NumberFormat
}>()
const rows = computed(() => props.daily ? props.daily.slice().reverse() : Array.from<undefined>({ length: props.days }))
const devices = ['mobile', 'desktop', 'visits'] as const
</script>

<template>
  <section id="daily" tabindex="-1" class="report-ledger" aria-labelledby="daily-title">
    <h2 id="daily-title">
      {{ title }}
    </h2>
    <table aria-labelledby="daily-title" :aria-busy="!daily">
      <thead>
        <tr>
          <th v-for="label in columns" :key="label" scope="col">
            {{ label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="row?.date ?? index" :aria-hidden="row ? undefined : true">
          <th scope="row">
            <time v-if="row" :datetime="row.date">{{ formatDate(row.date) }}</time>
            <ReportValue v-else />
          </th>
          <td v-for="key in devices" :key="key">
            <ReportValue :value="row && number.format(row[key])" />
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
