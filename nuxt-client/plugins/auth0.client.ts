import { createAuth0 } from '@auth0/auth0-vue'

/**
 * As auth0's nuxt module doesn't support nuxt3 yet
 * We're using the auth0-vue package and wrap it in a nuxt module
 *
 * As it's using the vue version of auth0 sdk. It's available only in client
 */

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()
  const domain = runtimeConfig.public.AUTH0_DOMAIN

  nuxtApp.vueApp.use(
    createAuth0({
      domain,
      clientId: runtimeConfig.public.AUTH0_CLIENT_ID,
      authorizationParams: {
        redirect_uri: window.location.origin + '/auth',
        ui_locales: 'fr',
        audience: `https://${domain}/api/v2/`,
      },
    })
  )
})
