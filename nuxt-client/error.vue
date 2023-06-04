<template>
  <NuxtLayout name="default">
    <Card style="background-color: #ffffff88">
      <template #content>
        <ErrorBox
          :error="`${error?.statusCode ?? '500'}: ${
            error?.message ?? 'Unknown Error'
          }`"
        >
          <Button class="w3-button gdc-color-tonic" @click="handleError">
            Retourner au menu principal
          </Button>
        </ErrorBox>
      </template>
    </Card>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import background from '@/assets/img/backgrounds/error.jpg'
import Card from 'primevue/card'
import Button from 'primevue/button'

const runtimeConfig = useRuntimeConfig()

const { error } = defineProps({
  error: Object,
})

const handleError = () => clearError({ redirect: '/' })

// Defining meta tags
useHead(() => ({
  title: `${error?.statusCode ?? '500'} | ${runtimeConfig.public.BASE_TITLE}`,
  bodyAttrs: {
    style: `background-image: url('${background}');`,
  },
}))
</script>
