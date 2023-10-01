<template>
  <div style="opacity: 0.9">
    <div style="text-align: center">
      <img :src="ErrorImage" style="max-width: 20%; height: auto" />
      <h1>{{ error }}</h1>
      <p>
        C'est sûrement de la faute
        <span class="gdc-text-strike">d'OxyTom</span> de tanin...
      </p>
      <p>
        Mais comme disait Raoul (d'après Sparfell) : "Il n’y a pas de fautes, il
        n’y a que des erreurs, et les erreurs se corrigent."
      </p>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ErrorImage from '@/assets/img/err.png'

const { error } = defineProps<{
  error: string
}>()
</script>

<style>
.gdc-text-strike {
  text-decoration: line-through;
}
</style>
