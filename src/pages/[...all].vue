<script setup lang="ts">
const { t } = useI18n()
useHead(() => ({ title: t('not-found.title') }))
</script>

<template>
  <section class="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center" aria-labelledby="not-found-title">
    <p class="text-7xl font-extrabold sm:text-8xl">
      404
    </p>
    <h1 id="not-found-title" class="mt-4 text-2xl font-semibold">
      {{ t('not-found.title') }}
    </h1>
    <p class="mt-2 text-muted">
      {{ t('not-found.description') }}
    </p>
    <UButton to="/" class="mt-6">
      {{ t('not-found.home') }}
    </UButton>
  </section>
</template>

<route lang="yaml">
name: not-found
</route>
