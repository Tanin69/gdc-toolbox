<template>
  <div style="height: 100%; display: flex; flex-direction: column">
    <Toast />
    <ConfirmPopup />
    <DynamicDialog />

    <NavBar />
    <main style="flex: 1">
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>
import Toast from 'primevue/toast'
import ConfirmPopup from 'primevue/confirmpopup'
import DynamicDialog from 'primevue/dynamicdialog'
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
