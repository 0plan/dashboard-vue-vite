<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <svg aria-hidden="true" class="console-icon"><use :href="`/console-icons.svg#${name}`" /></svg>
</template>
