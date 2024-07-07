// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: false,

  app: {
    baseURL: '/webcodec-recorder/', // baseURL: '/<repository>/'
    buildAssetsDir: 'assets', // don't use "_" at the begining of the folder name to avoids nojkill conflict
  },

  modules: ['@vite-pwa/nuxt'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'WebCodec Recorder',
      short_name: 'WCR',
      theme_color: '#000000',
      "background_color": "black",

      "display": "standalone",
      "categories": ["entertainment", "movies"],
      "display_override": ["fullscreen", "window-controls-overlay"],
      "launch_handler": {
        "client_mode": "focus-existing"
    },
    "description": "A PWA using Video Frames and WebCodecs",

      icons: [
        {
          src: '/webcodec-recorder/hacker.svg',
          sizes: '512x512',
          type: 'image/svg',
          purpose: 'any maskable',
        },
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      // you don't need to include this: only for testing purposes
      // if enabling periodic sync for update use 1 hour or so (periodicSyncForUpdates: 3600)
      periodicSyncForUpdates: 20,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  }
})