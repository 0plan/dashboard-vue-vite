import type { ViteSSGContext } from 'vite-ssg'
import type { RouteLocationNormalized } from 'vue-router'
import { shallowRef } from 'vue'
import { clearWorkspace } from '~/console/browser-workspace'
import { managementPage } from '~/console/menu'

export const demoEmail = 'demo@example.com'
export const demoPassword = 'traffic-demo'
const sessionKey = 'vueforge:traffic-demo'
export const demoSignedIn = shallowRef(false)

export function signInDemo(email: string, password: string) {
  if (email.trim().toLowerCase() !== demoEmail || password !== demoPassword)
    return false

  window.sessionStorage.setItem(sessionKey, 'active')
  return true
}

export function signOutDemo() {
  clearWorkspace()
  window.sessionStorage.removeItem(sessionKey)
}

export function install({ router, isClient }: Pick<ViteSSGContext, 'router' | 'isClient'>) {
  function redirect(to: RouteLocationNormalized) {
    try {
      demoSignedIn.value = isClient && window.sessionStorage.getItem(sessionKey) === 'active'
    }
    catch {
      demoSignedIn.value = false
    }
    if ((to.name === 'dashboard' || managementPage(to.path)) && !demoSignedIn.value)
      return { path: '/login', replace: true }
    if (to.name === 'login' && demoSignedIn.value)
      return { path: '/dashboard', replace: true }
  }
  router.beforeEach(redirect)
  if (isClient) {
    window.addEventListener('pageshow', (event) => {
      // A document restored from the browser's back/forward cache skips router guards.
      if (event.persisted) {
        const target = redirect(router.currentRoute.value)
        if (target)
          void router.replace(target)
      }
    })
  }
}
