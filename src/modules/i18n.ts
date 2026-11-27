import type { ViteSSGContext } from 'vite-ssg'
import { useLocalStorage } from '@vueuse/core'
import { watch } from 'vue'
import { createI18n } from 'vue-i18n'

const resources = import.meta.glob('../../locales/*/*.yml', { import: 'default' })
export const preferredLanguage = useLocalStorage('vueforge:locale', 'ko', { writeDefaults: false })

export function install({ app, router, isClient }: Pick<ViteSSGContext, 'app' | 'router' | 'isClient'>) {
  const i18n = createI18n({ legacy: false, locale: 'ko', fallbackLocale: false, messages: {} })
  app.use(i18n)

  // Auth redirects run in beforeEach; only load messages for the page that opens.
  router.beforeResolve(async (to) => {
    const language = isClient && preferredLanguage.value === 'en' ? 'en' : 'ko'
    await Promise.all(['common', String(to.name)].map(async (namespace) => {
      if (Object.hasOwn(i18n.global.getLocaleMessage(language), namespace))
        return
      const messages = await resources[`../../locales/${language}/${namespace}.yml`]()
      i18n.global.mergeLocaleMessage(language, { [namespace]: messages })
    }))
    to.meta.language = language
  })
  router.afterEach((to, _from, failure) => {
    if (!failure)
      i18n.global.locale.value = to.meta.language === 'en' ? 'en' : 'ko'
  })

  if (isClient) {
    const stop = watch(preferredLanguage, async (language) => {
      // Reuse the same guard without remounting the page or adding a history entry.
      const { path, query, hash } = router.currentRoute.value
      try {
        await router.replace({ path, query, hash, force: true })
      }
      catch {
        // A missing/offline chunk must not leave refresh pointing at an unusable language.
        if (preferredLanguage.value === language)
          preferredLanguage.value = i18n.global.locale.value
      }
    })
    app.onUnmount(stop)
  }
}
