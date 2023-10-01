<template>
  <NuxtLayout name="default">
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts" setup>
import defaultBackground from '@/assets/img/backgrounds/transparent.png'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

const title = computed(() =>
  route.meta.title
    ? `${route.meta.title} | ${runtimeConfig.public.BASE_TITLE}`
    : runtimeConfig.public.BASE_TITLE
)

useHead(() => ({
  // Setting current title (it will follow template)
  title: title.value,
  // Setting background image (`unset` is a fix for client-side navigation)
  bodyAttrs: {
    style:
      'background-image:' +
      (route.meta.background
        ? `url('${route.meta.background}')`
        : `url('${defaultBackground}')`) +
      ';' +
      'background-size: cover; background-attachment: fixed;',
  },
  viewport: 'width=device-width, initial-scale=1',
  charset: 'utf-8',
  // Setting meta
  meta: [
    { name: 'theme-color', content: '#bd5734' },
    { name: 'description', content: 'An Arma 3 community toolbox.' },
    { property: 'og:title', content: title.value },
    {
      property: 'og:description',
      content: route.meta.description || 'An Arma 3 community toolbox.',
    },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'og:image', content: route.meta.image || '/favicon.ico' },
  ],
  link: [{ type: 'application/json+oembed', href: '/home.json' }],
}))
</script>
