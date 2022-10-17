import { createAuth0 } from '@auth0/auth0-vue'

/**
 * As auth0's nuxt module doesn't support nuxt3 yet
 * We're using the auth0-vue package and wrap it in a nuxt module
 *
 * As it'susing the vue version of auth0 sdk. It's available only in client
 */

export default defineNuxtPlugin((nuxtApp) => {
  const {
    public: { AUTH0_CLIENT_ID: client_id, AUTH0_DOMAIN: domain },
  } = useRuntimeConfig()

  nuxtApp.vueApp.use(
    createAuth0({
      domain,
      client_id,
      redirect_uri: window.location.origin + '/auth',
      audience: `https://${domain}/api/v2/`,
      ui_locales: 'fr',
    })
  )
})
