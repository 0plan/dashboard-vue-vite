<script setup lang="ts">
import { en, ko } from '@nuxt/ui/locale'

const { t, locale } = useI18n()

useHead(() => ({
  htmlAttrs: { lang: locale.value },
  titleTemplate: title => title ? `${title} | ${t('common.appName')}` : t('common.appName'),
  meta: [{ name: 'description', content: t('common.workspace') }],
}))
</script>

<template>
  <UApp :locale="locale === 'en' ? en : ko" :toaster="null">
    <div class="relative min-h-screen bg-default text-default font-sans">
      <RouterView />
    </div>
  </UApp>
</template>
