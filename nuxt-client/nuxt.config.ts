import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr: false, // Fixing Auth0... At what cost... ?

  css: [
    '@/assets/css/w3.css',
    '@/assets/css/style.css',
    '@fortawesome/fontawesome-free/css/all.min.css', // Maybe a better way
  ],

  typescript: {
    shim: false,
  },

  runtimeConfig: {
    public: {
      BASE_TITLE: 'GDC Toolbox',
      API_MISSION_ENDPOINT: process.env.API_BASE + 'api/mission',
      API_MISSION_IMAGE: process.env.API_BASE + 'img/brf',
      AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    },
  },
})
