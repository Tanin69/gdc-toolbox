<template>
  <div>
    <SplitButton
      v-if="isAuthenticated"
      icon="pi pi-user"
      :label="user.name"
      :model="[
        { label: 'Se déconnecter', icon: 'pi pi-sign-out', command: logout },
      ]"
    ></SplitButton>
    <Button label="Se connecter" icon="pi pi-sign-in" v-else @click="login" />
  </div>
</template>

<script setup>
import { useAuth0 } from '@auth0/auth0-vue'
import Button from 'primevue/button'
import SplitButton from 'primevue/splitbutton'

const {
  loginWithRedirect,
  logout: logoutWithRedirect,
  isAuthenticated,
  user,
} = useAuth0()

const login = () => {
  localStorage.setItem('ROUTE_BEFORE_REDIRECT', window.location.pathname)
  loginWithRedirect()
}
const logout = () => {
  localStorage.setItem('ROUTE_BEFORE_REDIRECT', window.location.pathname)
  logoutWithRedirect({ returnTo: window.location.origin + '/auth' })
}
</script>
