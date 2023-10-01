import { authGuard } from '@auth0/auth0-vue'

export default defineNuxtRouteMiddleware(authGuard)
