<template>
  <Toolbar>
    <template #start>
      <Button
        icon="pi pi-home"
        class="p-button-text"
        title="Retour à l'acceuil"
        @click="navigateTo('/')"
      />
      <SplitButton
        label="Missions"
        :model="links"
        @click="navigateTo('/mission')"
        class="p-button-text"
      ></SplitButton>
      <Button
        class="p-button-text"
        label="A propos"
        @click="navigateTo('/about')"
      />
    </template>
    <template #end>
      <AuthBar />
    </template>
  </Toolbar>
</template>

<script lang="ts" setup>
import { useAuth0 } from '@auth0/auth0-vue'
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import SplitButton from 'primevue/splitbutton'
import type { MenuItem } from 'primevue/menuitem'

const { isAuthenticated } = useAuth0()

const links: MenuItem[] = [
  { label: 'Liste des missions', to: '/mission/' },
  {
    label: 'Publier une mission',
    to: '/mission/add/',
    visible: () => isAuthenticated.value,
  },
]
</script>

<style>
.p-toolbar {
  background: #ffffffcc;
}
</style>
