<script setup lang="ts">
import type { Text, Workspace } from '~/console/workspace'
import { siteSettings, workQueue } from '~/console/workspace'

defineProps<{ title: string, text: Text, state: Workspace }>()
</script>

<template>
  <section class="console-overview" aria-labelledby="console-title">
    <h1 id="console-title">
      {{ title }}
    </h1>
    <p class="console-site">
      {{ siteSettings(state).name }}
    </p>
    <div class="console-queue">
      <RouterLink v-for="task in workQueue(state)" :key="task.key" :to="task.path">
        <span>{{ text(task.key) }}</span><strong>{{ task.count }}</strong><i aria-hidden="true">›</i>
      </RouterLink>
    </div>
  </section>
</template>
