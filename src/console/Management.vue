<script setup lang="ts">
import { readWorkspace, saveEdit } from './browser-workspace'
import { managementPage } from './menu'
import { editFromForm, readFilter, resultURL } from './workspace'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const page = computed(() => managementPage(route.path)!)
const state = shallowRef(readWorkspace())
const filter = computed(() => readFilter(route.query.q, route.query.status))
const common = (key: string) => t(`common.${key}`)
function save(fields: FormData) {
  const edit = editFromForm(page.value.key, fields)
  try {
    if (edit) {
      saveEdit(edit)
      state.value = readWorkspace()
    }
    void router.replace(resultURL(page.value.path, fields, Boolean(edit)))
  }
  catch {
    void router.replace(resultURL(page.value.path, fields, false))
  }
}
useHead(() => ({ title: common(page.value.key) }))
</script>

<template>
  <ManagementPanel
    :key="page.key" :page="page" :state="state" :filter="filter" :result="String(route.query.result ?? '')"
    :t="key => t(`${page.key}.${key}`)" :common="common" @save="save"
  />
</template>
