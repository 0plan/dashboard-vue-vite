<script setup lang="ts">
import { menu } from '~/console/menu'

const props = defineProps<{ path: string, text: (key: string) => string }>()
const rail = ref<HTMLDetailsElement>()
const drawer = ref<HTMLElement>()
const group = computed(() => menu.find(item => item.pages.some(page => page.path === props.path)))
onMounted(() => {
  try {
    if (rail.value)
      rail.value.open = localStorage.getItem('console.sidebar') !== 'closed'
  }
  catch { /* Native disclosure still works without storage. */ }
})
function setRail(open: boolean) {
  if (rail.value)
    rail.value.open = open
  try {
    localStorage.setItem('console.sidebar', open ? 'open' : 'closed')
  }
  catch { /* Optional preference. */ }
}
function followLink(event: MouseEvent) {
  if ((event.target as Element).closest('a'))
    drawer.value?.hidePopover()
}
</script>

<template>
  <div class="console-layout">
    <aside class="console-rail">
      <div class="console-sticky">
        <details ref="rail" class="rail-toggle" open>
          <summary @click.prevent="setRail(!rail?.open)">
            <strong aria-hidden="true">{{ text('console') }}</strong><ConsoleIcon name="panel" />
            <span class="rail-close-label sr-only">{{ text('collapse') }}</span>
            <span class="rail-open-label sr-only">{{ text('expand') }}</span>
          </summary>
          <ConsoleTree :path="path" :text="text" />
        </details>
        <nav class="console-shortcuts" :aria-label="text('console')">
          <RouterLink to="/dashboard" :title="text('home')" :aria-label="text('home')">
            <ConsoleIcon name="home" />
          </RouterLink>
          <RouterLink
            v-for="item in menu" :key="item.key" :to="item.pages[0].path" :title="text(item.key)"
            :aria-label="text(item.key)" :data-selected="group?.key === item.key" @click="setRail(true)"
          >
            <ConsoleIcon :name="item.key" />
          </RouterLink>
        </nav>
      </div>
    </aside>
    <div class="console-body">
      <div class="console-trail">
        <button type="button" class="console-mobile-toggle" popovertarget="console-drawer" :aria-label="text('openMenu')">
          <ConsoleIcon name="menu" />
        </button>
        <span>{{ text('console') }}</span><span aria-hidden="true">/</span><strong>{{ text(group?.key ?? 'home') }}</strong>
      </div>
      <slot />
    </div>
    <aside id="console-drawer" ref="drawer" popover="auto" :aria-label="text('console')" class="console-drawer" @click="followLink">
      <div class="drawer-title">
        <strong>{{ text('console') }}</strong>
        <button type="button" popovertarget="console-drawer" popovertargetaction="hide" :aria-label="text('closeMenu')">
          <ConsoleIcon name="close" />
        </button>
      </div>
      <ConsoleTree :path="path" :text="text" />
    </aside>
  </div>
</template>
