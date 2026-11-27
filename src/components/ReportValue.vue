<script setup lang="ts">
defineProps<{ value?: string }>()
</script>

<template>
  <template v-if="value !== undefined">
    {{ value }}
  </template>
  <span v-else class="report-value-skeleton" aria-hidden="true" />
</template>
