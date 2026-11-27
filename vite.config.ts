/// <reference types="vitest" />
import path from 'node:path'
import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import ui from '@nuxt/ui/vite'
import Vue from '@vitejs/plugin-vue'
import VueMacros from 'unplugin-vue-macros/vite'
import { VitePWA } from 'vite-plugin-pwa'
import VueDevTools from 'vite-plugin-vue-devtools'
import Layouts from 'vite-plugin-vue-layouts'
import WebfontDownload from 'vite-plugin-webfont-dl'
import generateSitemap from 'vite-ssg-sitemap'
import { defineConfig } from 'vitest/config'
import { VueRouterAutoImports } from 'vue-router/unplugin'
import VueRouter from 'vue-router/vite'
import { managementPages } from './src/console/menu'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(import.meta.dirname, 'src')}/`,
    },
  },
  server: {
    open: true,
    port: 3333,
  },

  plugins: [
    VueMacros({
      betterDefine: false,
      plugins: {
        vue: Vue(),
      },
    }),

    VueRouter({
      dts: 'src/route-map.d.ts',
      beforeWriteFiles(root) {
        for (const page of managementPages)
          root.insert(page.path.slice(1), path.resolve(import.meta.dirname, 'src/console/Management.vue')).name = page.key
      },
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts({ defaultLayout: 'traffic' }),

    ui({
      colorMode: false, // Keep the starter's existing theme preference.
      theme: { defaultVariants: { color: 'neutral' } },
      ui: {
        button: { slots: { base: 'min-h-11 min-w-11 justify-center' } },
        input: { slots: { base: 'min-h-11' } },
      },
      autoImport: {
        imports: [
          'vue',
          'vue-i18n',
          '@vueuse/core',
          VueRouterAutoImports,
          { '@unhead/vue': ['useHead', 'useSeoMeta'], 'vue-router': ['useLink'] },
        ],
        dts: 'src/auto-imports.d.ts',
        dirs: ['src/composables'],
        vueTemplate: true,
      },
      components: {
        dts: 'src/components.d.ts',
      },
    }),

    // https://github.com/antfu/vite-plugin-pwa
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'safari-pinned-tab.svg'],
      workbox: {
        navigateFallback: null,
        globIgnores: ['assets/locales/**'],
        runtimeCaching: [{
          urlPattern: /\/assets\/locales\/.+\.js$/,
          handler: 'CacheFirst',
          options: { cacheName: 'vueforge-locales', expiration: { maxEntries: 24 } },
        }],
      },
      manifest: {
        name: 'Web Traffic Dashboard',
        short_name: 'Dashboard',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),

    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      fullInstall: true,
      include: [path.resolve(import.meta.dirname, 'locales/**')],
    }),

    // https://github.com/feat-agency/vite-plugin-webfont-dl
    WebfontDownload(),

    // https://github.com/webfansplz/vite-plugin-vue-devtools
    VueDevTools(),
  ],

  build: {
    rollupOptions: {
      output: {
        // Let the service worker cache translations when visited, not all on install.
        chunkFileNames: ({ facadeModuleId }) => facadeModuleId?.endsWith('.yml')
          ? `assets/locales/${path.basename(path.dirname(facadeModuleId))}/[name]-[hash].js`
          : 'assets/[name]-[hash].js',
      },
    },
  },

  // https://github.com/vitest-dev/vitest
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'jsdom',
  },

  // https://github.com/antfu/vite-ssg
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    includedRoutes: paths => [...paths.filter(p => !p.includes(':') && !p.includes('*')), '/404'],
    onFinished() {
      generateSitemap({ exclude: ['/404'] })
    },
  },

  ssr: {
    // TODO: workaround until they support native ESM
    noExternal: ['workbox-window', /vue-i18n/, '@nuxt/ui'],
  },
})
