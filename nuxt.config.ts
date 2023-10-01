import { resolve } from 'path'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  // Fixing Auth0... At what cost... ?
  ssr: false,

  css: [
    'primevue/resources/primevue.css',
    'primeicons/primeicons.css',
    '@/assets/css/theme.css',
  ],

  typescript: {
    shim: false,
  },

  runtimeConfig: {
    MONGO_URL: '',
    MONGO_NAME: 'gdc',
    MONGO_COLLECTION: 'missions',
    PBO_MANAGER: '',
    UPLOAD_TEMP_DIR: resolve(process.env.TEMP_DIR!),
    MISSIONS_DIR: resolve(process.env.MISSIONS_DIR!),
    IMAGE_DIR: resolve(process.env.IMAGES_DIR!),

    public: {
      BASE_TITLE: 'GDC Toolbox',
      AUTH0_DOMAIN: 'gdc.eu.auth0.com',
      AUTH0_CLIENT_ID: '',
    },
  },

  devtools: {
    enabled: true,
  },
})
