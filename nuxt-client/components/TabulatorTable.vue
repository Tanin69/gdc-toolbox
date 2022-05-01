<template>
  <div ref="table" :class="cssClass" :style="style" />
</template>

<script lang="ts" setup>
import { TabulatorFull, Tabulator } from 'tabulator-tables'
import type { Ref, StyleValue } from 'vue'
import 'tabulator-tables/dist/css/tabulator.min.css'

const {
  props,
  class: css, // Class is actually a reserved word for JS
  style,
} = defineProps<{
  props: Tabulator.Options
  class?: any
  style?: StyleValue
}>()
// If I don't do that, the cssClass property is accessed before render 🧐
const cssClass = css

let instance: TabulatorFull | null = null
const table: Ref<HTMLElement> = ref(null)

onMounted(() => {
  instance = new TabulatorFull(table.value, {
    reactiveData: true,
    ...props,
  })
})
</script>
