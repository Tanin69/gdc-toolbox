<template>
  <div style="margin-left: auto">
    <div v-if="isAuthenticated" class="gdc-display-flex">
      <div class="gdc-display-flex gdc-alignItems-center">
        {{ user.name }}
      </div>
      <button class="w3-bar-item w3-button" @click="logout">
        Se déconnecter
      </button>
    </div>
    <button v-else class="w3-bar-item w3-button" @click="login">
      Se connecter
    </button>
  </div>
</template>

<script setup>
import { useAuth0 } from '@auth0/auth0-vue'

const {
  loginWithRedirect,
  logout: logoutWithRedirect,
  isAuthenticated,
  user,
} = useAuth0()

const login = () => {
  loginWithRedirect()
}
const logout = () => {
  logoutWithRedirect({ returnTo: window.location.origin })
}
</script>
