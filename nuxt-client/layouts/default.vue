<template>
  <div>
    <NavBar />
    <div
      class="w3-card-4 w3-padding w3-opacity w3-sand w3-hide-small w3-hide-medium"
      v-if="props.header"
    >
      <div style="text-align: center">
        <h2>{{ props.header }}</h2>
      </div>
    </div>
    <main>
      <slot />
    </main>
    <FooterBar />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  header: String,
})
</script>
