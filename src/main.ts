import type { UserModule } from './types'
import ui from '@nuxt/ui/vue-plugin'
import { setupLayouts } from 'virtual:generated-layouts'

import { ViteSSG } from 'vite-ssg'
import { routes } from 'vue-router/auto-routes'
import App from './App.vue'

import './styles/index.css'

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  {
    routes: [{ path: '/', redirect: '/dashboard' }, ...setupLayouts([...routes])],
    base: import.meta.env.BASE_URL,
  },
  async (ctx) => {
    ctx.app.use(ui)
    // install all modules under `modules/`
    const modules = import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true })
    await Promise.all(Object.values(modules).map(module => module.install?.(ctx)))
  },
)
