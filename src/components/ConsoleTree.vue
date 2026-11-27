<script setup lang="ts">
import { menu } from '~/console/menu'

defineProps<{ path: string, text: (key: string) => string }>()
</script>

<template>
  <nav class="console-tree" :aria-label="text('console')">
    <RouterLink to="/dashboard" class="console-home">
      <ConsoleIcon name="home" />{{ text('home') }}
    </RouterLink>
    <details v-for="group in menu" :key="`${group.key}-${group.pages.some(page => page.path === path)}`" class="console-group" open>
      <summary><ConsoleIcon :name="group.key" />{{ text(group.key) }}<i aria-hidden="true" /></summary>
      <ul>
        <li v-for="page in group.pages" :key="page.key">
          <RouterLink :to="page.path">
            {{ text(page.key) }}
          </RouterLink>
        </li>
      </ul>
    </details>
  </nav>
</template>
