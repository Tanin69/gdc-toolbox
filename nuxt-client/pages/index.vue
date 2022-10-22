<template>
  <div class="container">
    <NuxtLink to="/mission" style="text-decoration: none">
      <Card>
        <template #header>
          <div class="img-container">
            <img
              :src="listImg"
              alt="Liste des missions"
              width="144"
              height="144"
            />
          </div>
        </template>
        <template #title> Liste des missions </template>
      </Card>
    </NuxtLink>
    <NuxtLink
      to="/mission/add"
      style="text-decoration: none"
      v-if="isAuthenticated"
    >
      <Card>
        <template #header>
          <div class="img-container">
            <img
              :src="publishImg"
              alt="Publier une mission"
              width="144"
              height="144"
            />
          </div>
        </template>
        <template #title> Publier une mission </template>
      </Card>
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup>
import Card from 'primevue/card'
import background from '@/assets/img/backgrounds/home.jpg'
import listImg from '@/assets/img/list_missions.png'
import publishImg from '@/assets/img/publish_mission.png'
import { useAuth0 } from '@auth0/auth0-vue'

const { isAuthenticated } = useAuth0()

definePageMeta({
  title: '',
  background,
})
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.container > * {
  margin: 0 1rem;
}

.img-container {
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.img-container img {
  width: auto;
}

.p-card {
  opacity: 0.9;
  transition: background-color 0.25s;
}

.p-card:hover {
  background-color: var(--surface-hover);
}

.p-card:deep(.p-card-content) {
  display: none;
}
</style>
