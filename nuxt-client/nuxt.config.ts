// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr: false, // Fixing Auth0... At what cost... ?

  css: [
    'primevue/resources/primevue.css',
    'primeicons/primeicons.css',
    '@/assets/css/theme.css',
  ],

  typescript: {
    shim: false,
  },

  runtimeConfig: {
    MONGO_URL: process.env.MONGO_URL,
    MONGO_NAME: process.env.MONGO_DB_NAME,
    MONGO_COLLECTION: process.env.MONGO_COLLECTION_NAME,

    public: {
      BASE_TITLE: 'GDC Toolbox',
      /**
       * @deprecated Use `/api/...` once migrated
       */
      API_BASE: process.env.API_BASE,
      /**
       * @deprecated Use `/api/mission` once migrated
       */
      API_MISSION_ENDPOINT: process.env.API_BASE + '/api/mission',
      /**
       * @deprecated Use `/api/...` once migrated
       */
      API_MISSION_IMAGE: process.env.API_BASE + '/img/brf',
      AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    },
  },
})
