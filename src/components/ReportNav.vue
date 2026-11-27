<script setup lang="ts">
defineProps<{ label: string, overview: string, charts: string, daily: string }>()
</script>

<template>
  <nav class="report-nav" :aria-label="label">
    <p>{{ label }}</p>
    <a href="#overview"><span aria-hidden="true">01</span>{{ overview }}</a>
    <a href="#charts"><span aria-hidden="true">02</span>{{ charts }}</a>
    <a href="#daily"><span aria-hidden="true">03</span>{{ daily }}</a>
  </nav>
</template>
