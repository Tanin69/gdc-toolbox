<template>
  <NuxtLayout name="default">
    <div
      class="w3-card-4 w3-padding w3-sand w3-display-middle"
      style="opacity: 0.9"
    >
      <div style="text-align: center">
        <img src="/assets/img/err.png" style="max-width: 20%; height: auto" />
        <h1>{{ error.statusCode }}: {{ error.message }}</h1>
        <p>
          C'est sûrement de la faute
          <spna class="gdc-text-strike">d'OxyTom</spna> de tanin...
        </p>
        <p>
          Mais comme disait Raoul (d'après Sparfell) : "Il n’y a pas de fautes,
          il n’y a que des erreurs, et les erreurs se corrigent."
        </p>
        <button class="w3-button gdc-color-tonic" @click="handleError">
          Retourner au menu principal
        </button>
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import background from '@/assets/img/backgrounds/error.jpg'

const runtimeConfig = useRuntimeConfig()

const { error } = defineProps({
  error: Object,
})

console.log({ ...error })

const handleError = () => clearError({ redirect: '/' })

// Defining meta tags
useHead(() => ({
  title: `${error.statusCode} | ${runtimeConfig.public.BASE_TITLE}`,
  bodyAttrs: {
    style: `background-image: url('${background}');`,
  },
}))
</script>
