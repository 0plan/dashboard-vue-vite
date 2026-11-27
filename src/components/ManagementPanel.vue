<script setup lang="ts">
import type { MenuPage } from '~/console/menu'
import type { Filter, Text, Workspace } from '~/console/workspace'
import { registerFor, siteSettings } from '~/console/workspace'

const props = defineProps<{ page: MenuPage, state: Workspace, filter: Filter, result?: string, t: Text, common: Text }>()
const emit = defineEmits<{ save: [fields: FormData] }>()
const register = computed(() => registerFor(props.page.key, props.state, props.filter, props.t))
const site = computed(() => siteSettings(props.state))
const router = useRouter()
function submitEdit(event: SubmitEvent) {
  emit('save', new FormData(event.currentTarget as HTMLFormElement))
}
function applyFilter(event: SubmitEvent) {
  const fields = new FormData(event.target as HTMLFormElement)
  void router.push({ path: props.page.path, query: { q: String(fields.get('q')), status: String(fields.get('status')) } })
}
</script>

<template>
  <section class="console-page" aria-labelledby="console-title">
    <h1 id="console-title">
      {{ common(page.key) }}
    </h1>
    <p class="console-description">
      {{ t('description') }}
    </p>
    <p v-if="result === 'saved'" role="status" class="console-feedback">
      {{ common('saved') }}
    </p>
    <p v-if="result === 'invalid'" role="alert" class="console-feedback">
      {{ common('invalid') }}
    </p>
    <form v-if="page.key === 'settings'" class="console-settings" @submit.prevent="submitEdit">
      <label>{{ t('name') }}<UInput name="name" required :maxlength="60" :default-value="site.name" /></label>
      <label>{{ t('email') }}<UInput type="email" name="email" required :maxlength="254" :default-value="site.email" /></label>
      <UButton type="submit">
        {{ t('save') }}
      </UButton>
    </form>
    <template v-else>
      <dl v-if="register.metrics" class="console-counts">
        <div v-for="metric in register.metrics" :key="metric.label">
          <dt>{{ t(metric.label) }}</dt><dd>{{ metric.value }}</dd>
        </div>
      </dl>
      <form v-if="register.statuses" :key="`${page.key}-${filter.q}-${filter.status}`" class="console-filters" method="get" :action="page.path" @submit.prevent="applyFilter">
        <label>{{ common('search') }}<UInput type="search" name="q" :maxlength="80" :default-value="filter.q" /></label>
        <label>{{ common('status') }}
          <select name="status">
            <option value="" :selected="!filter.status">{{ common('all') }}</option>
            <option v-for="status in register.statuses" :key="status" :value="status" :selected="filter.status === status">{{ t(status) }}</option>
          </select>
        </label>
        <UButton type="submit">
          {{ common('filter') }}
        </UButton>
        <RouterLink v-if="filter.q || filter.status" :to="page.path">
          {{ common('reset') }}
        </RouterLink>
      </form>
      <div class="console-list">
        <table aria-labelledby="console-title">
          <thead>
            <tr>
              <th v-for="column in register.columns" :key="column" scope="col">
                {{ t(column) }}
              </th>
              <th v-if="register.statuses" scope="col">
                {{ common('action') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in register.rows" :key="row.id">
              <th scope="row">
                {{ row.cells[0] }}
              </th>
              <td v-for="(column, index) in register.columns.slice(1)" :key="column" :data-label="t(column)">
                <span v-if="column === 'status'" class="console-state">{{ row.cells[index + 1] }}</span>
                <template v-else>
                  {{ row.cells[index + 1] }}
                </template>
              </td>
              <td v-if="register.statuses" class="console-row-action">
                <form v-if="row.action" @submit.prevent="submitEdit">
                  <input type="hidden" name="id" :value="row.id">
                  <input type="hidden" name="value" :value="row.action.value">
                  <input type="hidden" name="q" :value="filter.q">
                  <input type="hidden" name="status" :value="filter.status">
                  <UButton type="submit" variant="outline">
                    {{ t(row.action.label) }}<span class="sr-only"> · {{ row.cells[0] }}</span>
                  </UButton>
                </form>
                <span v-else aria-hidden="true">—</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!register.rows.length" class="console-empty">
          {{ common('empty') }}
        </p>
      </div>
    </template>
    <p class="console-note">
      {{ common('demoNote') }}
    </p>
  </section>
</template>
