<script setup lang="ts">
import type * as TrafficSource from '~/data/traffic'
import TrafficTrend from '~/components/TrafficTrend.vue'
import { readWorkspace } from '~/console/browser-workspace'

const { t, locale } = useI18n()
const periods = [7, 30] as const
const days = useSessionStorage<7 | 30>('vueforge:traffic-days', 7, {
  writeDefaults: false,
  serializer: { read: value => value === '30' ? 30 : 7, write: String },
})
const source = shallowRef<typeof TrafficSource>()
const failed = ref(false)
onMounted(async () => {
  try {
    source.value = await import('~/data/traffic')
  }
  catch {
    failed.value = true
  }
})
const report = computed(() => source.value?.getTrafficReport(days.value))
const number = computed(() => new Intl.NumberFormat(locale.value))
const percent = computed(() => new Intl.NumberFormat(locale.value, { style: 'percent', maximumFractionDigits: 1 }))
const shortDate = computed(() => new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric', timeZone: 'UTC' }))
function dateLabel(date: string) {
  return shortDate.value.format(new Date(date))
}
const dateRange = computed(() => {
  const rows = report.value?.daily
  if (!rows)
    return undefined
  const formatter = new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeZone: 'UTC' })
  return `${formatter.format(new Date(rows[0].date))} – ${formatter.format(new Date(rows.at(-1)!.date))}`
})
const chartDays = computed(() => report.value?.daily.map(row => ({
  label: dateLabel(row.date),
  visits: row.visits,
})))
const devices = [
  { key: 'mobile', fill: 'var(--primary)' },
  { key: 'desktop', fill: 'var(--input)' },
] as const
const mobileShare = computed(() => report.value ? report.value.mobile / report.value.total : 0)

function selectPeriod(event: SubmitEvent) {
  days.value = event.submitter?.getAttribute('value') === '30' ? 30 : 7
}

const state = readWorkspace()
useHead(() => ({ title: t('common.home') }))
</script>

<template>
  <AdminOverview :title="t('common.home')" :text="key => t(`dashboard.${key}`)" :state="state" />
  <section class="traffic-report" aria-labelledby="report-title">
    <ReportNav v-if="!failed" :label="t('dashboard.navigation')" :overview="t('dashboard.overview')" :charts="t('dashboard.charts')" :daily="t('dashboard.daily')" />
    <div class="report-content">
      <div id="overview" tabindex="-1" class="traffic-intro">
        <div>
          <h2 id="report-title">
            {{ t('dashboard.title') }}
          </h2>
          <div class="traffic-dateline">
            <span class="traffic-sample">{{ t('dashboard.sample') }}</span>
            <span v-if="!failed"><ReportValue :value="dateRange" /></span>
          </div>
        </div>
        <form aria-labelledby="period-title" @submit.prevent="selectPeriod">
          <span id="period-title" class="report-filter-label">{{ t('dashboard.period') }}</span>
          <div class="traffic-period">
            <UButton v-for="period in periods" :key="period" type="submit" :value="period" variant="ghost" :aria-pressed="period === days">
              {{ t('dashboard.days', { count: period }) }}
            </UButton>
          </div>
        </form>
      </div>
      <p v-if="failed" role="alert">
        {{ t('dashboard.loadError') }} <a class="inline-flex min-h-11 items-center underline" href="/dashboard">{{ t('dashboard.retry') }}</a>
      </p>
      <p v-else-if="!report" class="sr-only" role="status">
        {{ t('dashboard.loading') }}
      </p>
      <template v-if="!failed">
        <dl class="traffic-metrics" :aria-busy="!report">
          <div><dt>{{ t('dashboard.total') }}</dt><dd><ReportValue :value="report && number.format(report.total)" /></dd></div>
          <div><dt>{{ t('dashboard.average') }}</dt><dd><ReportValue :value="report && number.format(report.average)" /></dd></div>
          <div>
            <dt>{{ t('dashboard.peak') }}</dt>
            <dd><ReportValue :value="report && number.format(report.peak.visits)" /> <small><ReportValue :value="report && dateLabel(report.peak.date)" /></small></dd>
          </div>
        </dl>
        <div id="charts" tabindex="-1" class="traffic-charts" :aria-busy="!report">
          <section class="traffic-panel">
            <h2>{{ t('dashboard.trend') }}</h2>
            <p class="traffic-description">
              {{ t('dashboard.trendHint') }}
            </p>
            <TrafficTrend v-if="chartDays" :key="days" :daily="chartDays" :number="number" />
            <div v-else class="traffic-trend report-trend-skeleton" aria-hidden="true" />
          </section>
          <section class="traffic-panel">
            <h2>{{ t('dashboard.devices') }}</h2>
            <div class="traffic-ring">
              <svg v-if="report" class="traffic-donut" viewBox="0 0 172 172" aria-hidden="true">
                <g fill="none" stroke-width="13" transform="rotate(-90 86 86)">
                  <circle cx="86" cy="86" r="70" stroke="var(--input)" />
                  <circle cx="86" cy="86" r="70" stroke="var(--primary)" pathLength="100" :stroke-dasharray="`${mobileShare * 100} 100`" />
                  <path d="M 148 86 h 16" stroke="var(--card)" stroke-width="3" />
                  <path d="M 148 86 h 16" stroke="var(--card)" stroke-width="3" :transform="`rotate(${mobileShare * 360} 86 86)`" />
                </g>
              </svg>
              <div v-else class="traffic-donut report-ring-skeleton" aria-hidden="true" />
              <div class="traffic-ring-label" aria-hidden="true">
                <strong><ReportValue :value="report && percent.format(mobileShare)" /></strong><span>{{ t('dashboard.mobile') }}</span>
              </div>
            </div>
            <dl class="traffic-devices">
              <div v-for="device in devices" :key="device.key">
                <dt><i aria-hidden="true" :style="{ background: device.fill }" />{{ t(`dashboard.${device.key}`) }}</dt>
                <dd><ReportValue :value="report && number.format(report[device.key])" /> <span><ReportValue :value="report && percent.format(report[device.key] / report.total)" /></span></dd>
              </div>
            </dl>
          </section>
        </div>
        <DailyTable
          :title="t('dashboard.daily')" :columns="[t('dashboard.date'), t('dashboard.mobile'), t('dashboard.desktop'), t('dashboard.visits')]"
          :daily="report?.daily" :days="days" :format-date="dateLabel" :number="number"
        />
      </template>
    </div>
  </section>
</template>

<route lang="yaml">
name: dashboard
</route>
