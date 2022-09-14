<template>
  <div id="modalSuccess" class="w3-modal" style="display: block; z-index: 1500">
    <div class="w3-modal-content w3-card-4 w3-animate-zoom w3-khaki">
      <header :class="['w3-container', hasError ? 'w3-red' : 'w3-green']">
        <h3>
          {{ hasError ? 'Mission non conforme' : 'Mission prête' }}
        </h3>
        <span
          class="w3-button w3-xlarge w3-display-topright"
          @click="emit('close')"
          >&times;</span
        >
      </header>
      <ul id="msgSuccessContent" class="w3-ul">
        <li
          v-for="([key, data], i) in detailEntries"
          :key="i"
          :class="{
            missing: !hasError && data.val === false,
            blocking: hasError && data.val === false && data.isBlocking,
            error: hasError && data.val === false,
          }"
          :title="key"
          v-html="data.label ?? key + ' : ' + formatValue(data.val)"
        ></li>
      </ul>
      <footer class="w3-container w3-padding w3-khaki">
        <button
          class="w3-button w3-left w3-round w3-white w3-border"
          @click="emit('close')"
        >
          Annuler
        </button>
        <button
          v-if="!hasError"
          class="w3-button w3-right w3-round w3-white w3-border"
          @click="emit('publish')"
        >
          Publier la mission&nbsp;<i class="fas fa-check"></i>
        </button>
      </footer>
    </div>
  </div>

  <!-- <div
      id="modalFailure"
      class="w3-modal"
      style="display: block; z-index: 1500"
    >
      <div class="w3-modal-content w3-card-4 w3-animate-zoom">
        <header class="w3-container w3-red">
          <h3 id="msgHead">Oh non, c'est un échec</h3>
          <span
            onclick="document.getElementById('modalFailure').style.display='none'"
            class="w3-button w3-xlarge w3-display-topright"
            >&times;</span
          >
        </header>
        <ul id="msgFailContent" class="w3-ul"></ul>
        <footer class="w3-container w3-light-grey w3-padding">
          <button
            class="w3-button w3-block w3-round w3-white w3-border"
            onclick="document.getElementById('modalFailure').style.display='none';resetPage('msgFailContent')"
          >
            Annuler
          </button>
        </footer>
      </div>
    </div> -->
</template>

<script setup lang="ts">
const { detail } = defineProps<{
  detail: Mission | MissionError
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'publish'): void
}>()

type Entries<T extends Object> = [keyof T, T[keyof T]][]

const hasError = computed(() => 'nbBlockingErr' in detail)
const detailEntries = computed(() => {
  const data = {} as Record<
    keyof Mission | keyof MissionError,
    {
      label: string
      val: string | number | boolean | Date
      isBlocking: boolean
    }
  >
  if (detail) {
  }
  for (const [key, field] of Object.entries(detail) as
    | Entries<Mission>
    | Entries<MissionError>) {
    if (
      // If key is not skipped
      !['missionIsPlayable', 'IFA3mod'].includes(key) &&
      // And value is an object
      typeof field === 'object' &&
      // And value is not an array (ty JS...)
      !Array.isArray(field)
    ) {
      const obj = {
        label: field.label,
        isBlocking: false,
      }
      if ('isOK' in field) {
        data[key] = {
          ...obj,
          val: field.isOK,
          isBlocking: field.isBlocking,
        }
      } else if ('val' in field) {
        data[key] = { ...obj, val: field.val }
      }
    }
  }

  return Object.entries(data)
})

const formatValue = (val: string | number | boolean | Date) => {
  switch (typeof val) {
    case 'object':
      // val is a Date
      return val.toLocaleDateString()
    case 'string':
      return val
    case 'boolean':
      if (hasError) {
        return val
          ? '<i class="fa-solid fa-check"></i>'
          : '<i class="fa-solid fa-triangle-exclamation"></i>'
      }
      return val ? '<i class="fa-solid fa-check"></i>' : 'Non renseigné'
    case 'number':
      return val.toLocaleString()
    default:
      // Fallback on default behaviour
      return 'Non renseigné'
  }
}
</script>

<style scoped>
.missing {
  color: orangered;
}
.error {
  color: red;
}
.blocking {
  background-color: red;
  color: white;
}
</style>
