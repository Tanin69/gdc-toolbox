<template></template>

<script lang="ts" setup>
const { replace, getRoutes } = useRouter()
replace('/')

// FIXME: Kind of useless because somthing (Auth0 ?) keeps redirecting to /

// const item = localStorage.getItem('ROUTE_BEFORE_REDIRECT')
// const routes = getRoutes()
// if (item && routes.find(({ path }) => path === item)) {
//   console.log('Redirecting to', item)

//   replace(item)
// } else {
//   console.log('Redirecting to', '/')
//   replace('/')
// }
</script>
