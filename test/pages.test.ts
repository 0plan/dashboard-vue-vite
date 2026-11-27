import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import ui from '@nuxt/ui/vue-plugin'
import { createHead } from '@unhead/vue/client'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { parse } from 'yaml'
import { demoPassword, install as installSession, signOutDemo } from '../src/modules/demo-session'
import { install as installI18n, preferredLanguage } from '../src/modules/i18n'

function messageKeys(language: string) {
  const directory = join(import.meta.dirname, '../locales', language)
  return Object.fromEntries(readdirSync(directory).filter(file => file.endsWith('.yml')).map((file) => {
    const messages: Record<string, string> = parse(readFileSync(join(directory, file), 'utf8'))
    const keys = Object.entries(messages).map(([key, value]) => {
      expect(value.trim(), `${language}/${file}: ${key}`).not.toBe('')
      return [key, [...new Set(value.match(/\{[\w$-]+\}/g))].sort()]
    })
    return [file.slice(0, -4), Object.fromEntries(keys)]
  }))
}

describe('page translations', () => {
  it('has matching files, keys and interpolation parameters for every page', () => {
    const ko = messageKeys('ko')
    const router = createRouter({ history: createMemoryHistory(), routes })
    const pages = router.getRoutes().filter(route => route.name && route.components?.default)
    expect(messageKeys('en')).toEqual(ko)
    expect(new Set(Object.keys(ko))).toEqual(new Set(['common', ...pages.map(route => route.name)]))
  })

  it('loads common and the destination after auth redirects, including on a language change', async () => {
    const history = createMemoryHistory()
    history.replace('/dashboard')
    const router = createRouter({ history, routes })
    installSession({ router, isClient: true })
    const page = mount(RouterView, {
      global: { plugins: [ui, createHead(), app => installI18n({ app, router, isClient: true }), router] },
    })
    const { $t, $te } = page.vm

    await router.isReady()
    expect(router.currentRoute.value.name).toBe('login')
    expect($t('login.title')).toBe('로그인')
    expect($te('common.workspace')).toBe(true)
    expect($te('dashboard.title')).toBe(false)
    expect($te('login.title', 'en')).toBe(false)

    await page.get('#password').setValue('wrong')
    await page.get('form').trigger('submit')
    expect(page.get('[role=alert]').text()).toBe($t('login.invalid'))
    await page.get('#password').setValue(demoPassword)
    await page.get('form').trigger('submit')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('dashboard'))
    await router.replace('/dashboard?view=trend#chart')
    await vi.waitFor(() => expect(page.findAll('tbody time')).toHaveLength(7))
    await page.get('form[aria-labelledby=period-title]').trigger('submit', { submitter: page.get('[aria-pressed=false]').element })
    expect(page.findAll('tbody time')).toHaveLength(30)
    expect(page.get('tbody time').attributes('datetime')).toBe('2026-09-30')
    expect($t('dashboard.days', { count: 30 })).toBe('30일')
    preferredLanguage.value = 'en'
    await vi.waitFor(() => expect($t('common.workspace')).toBe('Admin workspace'))
    expect(router.currentRoute.value.fullPath).toBe('/dashboard?view=trend#chart')
    expect($t('dashboard.days', { count: 7 })).toBe('7 days')
    expect(page.get('[aria-pressed=true]').text()).toBe('30 days')
    expect($te('login.title')).toBe(false)
    expect($te('not-found.title')).toBe(false)

    await router.push('/manage/sales/orders?status=pending')
    await vi.waitFor(() => expect(page.findAll('tbody tr')).toHaveLength(2))
    await page.get('tbody tr:first-child form').trigger('submit')
    await vi.waitFor(() => expect(page.findAll('tbody tr')).toHaveLength(1))
    await router.push('/manage/sales/summary')
    await vi.waitFor(() => expect(page.get('.console-counts dd').text()).toBe('₩294,000'))

    for (const path of ['/examples', '/README', '/about', '/hi/a', '/projects/a', '/users/a', '/no/such/page'])
      expect(router.resolve(path).name, path).toBe('not-found')
    await router.push('/no/such/page')
    expect($t('not-found.title')).toBe('Page not found')
    signOutDemo()
    await router.push('/dashboard')
    expect(router.currentRoute.value.name).toBe('login')
    expect($t('login.title')).toBe('Sign In')
    page.unmount()
  })
})
