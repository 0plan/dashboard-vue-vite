<script setup lang="ts">
import { Globe, LogOut, Moon, Sun } from 'lucide-vue-next'
import { managementPage } from '~/console/menu'
import { demoSignedIn, signOutDemo } from '~/modules/demo-session'
import { preferredLanguage } from '~/modules/i18n'
import '~/styles/dashboard.css'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const consolePage = computed(() => route.name === 'dashboard' || managementPage(route.path))

function logout() {
  signOutDemo()
  return router.replace('/login')
}

useHead(() => ({
  meta: [{ name: 'theme-color', content: isDark.value ? '#191919' : '#f7f7f7' }],
}))
</script>

<template>
  <div class="traffic-shell">
    <header class="traffic-header">
      <nav class="traffic-width traffic-bar">
        <RouterLink class="traffic-brand" to="/">
          <img :src="isDark ? '/favicon-dark.svg' : '/favicon.svg'" alt="" width="28" height="28">
          {{ t('common.appName') }} <span>{{ t('common.workspace') }}</span>
        </RouterLink>
        <div class="traffic-actions">
          <UButton variant="ghost" square :aria-label="t('common.theme')" :title="t('common.theme')" @click="toggleDark()">
            <Sun v-if="isDark" />
            <Moon v-else />
          </UButton>
          <UButton variant="ghost" square :aria-label="t('common.language')" :title="t('common.language')" @click="preferredLanguage = preferredLanguage === 'en' ? 'ko' : 'en'">
            <Globe />
          </UButton>
          <UButton v-if="demoSignedIn" variant="ghost" :aria-label="t('common.signOut')" :title="t('common.signOut')" @click="logout">
            <LogOut /><span>{{ t('common.signOut') }}</span>
          </UButton>
        </div>
      </nav>
    </header>
    <main class="traffic-width traffic-main">
      <ConsoleLayout v-if="demoSignedIn && consolePage" :path="route.path" :text="key => t(`common.${key}`)">
        <RouterView />
      </ConsoleLayout>
      <RouterView v-else />
    </main>
    <footer class="traffic-width traffic-footer">
      <span>{{ t('common.appName') }}</span>
      <a href="https://github.com/0plan/dashboard-vue-vite" target="_blank" rel="noreferrer">GitHub</a>
    </footer>
  </div>
</template>

<style>
.traffic-shell {
  color-scheme: light;
  --background: #f7f7f7;
  --foreground: #242424;
  --card: #fff;
  --muted: #ededed;
  --muted-foreground: #555;
  --primary: #404040;
  --primary-foreground: #fafafa;
  --accent: #dedede;
  --destructive: #292929;
  --border: #d6d6d6;
  --input: #777;
  --ring: var(--primary);
  --ui-primary: var(--primary);
  --ui-bg: var(--card);
  --ui-bg-elevated: var(--accent);
  --ui-text: var(--foreground);
  --ui-text-muted: var(--muted-foreground);
  --ui-text-highlighted: var(--foreground);
  --ui-text-inverted: var(--primary-foreground);
  --ui-bg-inverted: var(--primary);
  --ui-border: var(--border);
  --ui-border-accented: var(--input);
}
.dark .traffic-shell {
  color-scheme: dark;
  --background: #191919;
  --foreground: #e8e8e8;
  --card: #242424;
  --muted: #303030;
  --muted-foreground: #b5b5b5;
  --primary: #ccc;
  --primary-foreground: #222;
  --accent: #404040;
  --destructive: #e2e2e2;
  --border: #494949;
  --input: #858585;
}
.traffic-actions button {
  gap: 8px;
}
.traffic-actions svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.traffic-actions button:hover,
.traffic-period button:not([aria-pressed='true']):hover {
  background: var(--accent);
}
.traffic-field label {
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
}
.traffic-field input {
  padding-inline: 0.75rem;
}
.traffic-shell h2 {
  line-height: 1.2;
}
.traffic-submit {
  background: var(--primary);
  color: var(--primary-foreground);
}
.traffic-submit:hover {
  background: color-mix(in srgb, var(--primary) 90%, var(--card));
}
</style>
