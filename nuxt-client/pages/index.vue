<template>
  <div class="gdc-display-flex w3-display-middle">
    <div class="gdc-flex">
      <NuxtLink to="/mission" style="text-decoration: none">
        <div
          class="gdc-height-full gdc-display-flex gdc-flexDirection-col gdc-alignItems-center w3-round-large w3-padding-16 gdc-color-tonic w3-hover-sepia"
          style="opacity: 0.9"
        >
          <img
            src="/assets/img/list_missions.png"
            alt="List missions"
            width="144"
            height="144"
          />
          <h3 class="w3-center">Liste des missions</h3>
        </div>
      </NuxtLink>
    </div>

    <div class="gdc-flex" v-if="isAuthenticated">
      <NuxtLink to="/mission/publish" style="text-decoration: none">
        <div
          class="gdc-height-full gdc-display-flex gdc-flexDirection-col gdc-alignItems-center w3-round-large w3-padding-16 gdc-color-tonic w3-hover-sepia"
          style="opacity: 0.9"
        >
          <img
            src="/assets/img/publish_mission.png"
            alt="Publish mission"
            width="144"
            height="144"
          />
          <h3 class="w3-center">Publier une mission</h3>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import background from '@/assets/img/backgrounds/home.jpg'
import { useAuth0 } from '@auth0/auth0-vue'

const { isAuthenticated } = useAuth0()

definePageMeta({
  title: '',
  background,
})
</script>
