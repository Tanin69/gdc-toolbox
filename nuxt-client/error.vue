<template>
  <NuxtLayout name="default">
    <ErrorBox :error="`${error.statusCode}: ${error.message}`">
      <button class="w3-button gdc-color-tonic" @click="handleError">
        Retourner au menu principal
      </button>
    </ErrorBox>
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
