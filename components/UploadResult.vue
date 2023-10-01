<template>
  <div>
    <ul class="detail-list">
      <li
        v-for="([key, data], i) in detailEntries"
        :key="i"
        :class="{
          missing: data.val === false && !data.isBlocking,
          blocking: data.val === false && data.isBlocking,
        }"
      >
        <i
          :class="{
            'status pi': true,
            'pi-question-circle': data.val === false && !data.isBlocking,
            'pi-exclamation-circle': data.val === false && data.isBlocking,
            'pi-check-circle': data.val !== false,
          }"
        />
        <span class="label" v-tooltip.top="key"
          >{{ data.label ?? key }} :
        </span>
        <component :is="formatValue(data.val, key)" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="tsx">
import type { Ref } from 'vue'
import type { DynamicDialogCloseOptions } from 'primevue/dynamicdialogoptions'
import bytes from 'bytes'
import dayjs from '~/ts/dayjs'

const dialogRef = inject<
  Ref<{
    data: { detail: Mission | MissionError }
    close: (params?: DynamicDialogCloseOptions['data']) => void
  }>
>('dialogRef')
const { detail } = dialogRef?.value.data ?? { detail: null }

type Entries<T extends Object> = [keyof T, T[keyof T]][]
type DetailField = {
  label: string
  val: string | number | boolean | Date
  isBlocking: boolean
}

const hasError = computed(() => detail && 'nbBlockingErr' in detail)
const detailEntries = computed(() => {
  const data = {} as Record<keyof Mission | keyof MissionError, DetailField>
  if (detail) {
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
        let obj = {
          label: field.label,
          isBlocking: false,
        }
        if ('isOK' in field) {
          data[key] = {
            ...obj,
            val: field.isOK,
            isBlocking: field.isBlocking ?? false,
          }
        } else if ('val' in field) {
          data[key] = {
            ...obj,
            val: field.val,
          }
        }
      }
    }
  }

  return Object.entries(data) as Entries<typeof data>
})

const formatValue = (
  val: string | number | boolean | Date,
  key: keyof Mission | keyof MissionError
): JSX.Element => {
  let result: string | JSX.Element = ''
  switch (typeof val) {
    case 'object':
      const dateObject = dayjs(val)
      if (dateObject.isValid()) {
        result = dateObject.format('DD/MM/YYYY HH:mm')
      }
      break
    case 'string':
      // Trying to parse Date
      const dateString = dayjs(val, 'YYYY-MM-DDTHH:mm:ss.SSZ')
      if (dateString.isValid()) {
        result = dateString.format('DD/MM/YYYY HH:mm')
      }

      // Trying to parse image
      if (key === 'loadScreen') {
        result = (
          <a href={imageURL.value ?? ''} target="_blank">
            {val}
          </a>
        )
      }

      if (!result) {
        result = val.toLocaleString()
      }
      break
    case 'boolean':
      if (val) {
        result = <i class="pi pi-check"></i>
      } else {
        // if expected a boolean
        if (hasError.value || ['IFA3mod', 'missionIsPlayable'].includes(key)) {
          result = <i class="pi pi-times"></i>
        } else {
          result = <span class="missing-value">Non renseigné</span>
        }
      }
      break
    case 'number':
      if (key === 'pboFileSize') {
        result = bytes(val)
      } else {
        result = val.toLocaleString()
      }
      break
    default:
      // Fallback on default behaviour
      result = <span class="missing-value">Non renseigné</span>
      break
  }
  return <span class="value">{result}</span>
}

const imageURL = computed(() => {
  if (!(detail && 'nbBlockingErr' in detail) && detail?.loadScreen.val) {
    // TODO: update once endpoint is available
    return `/${detail.loadScreen.val}`
  }
  return null
})
</script>

<style scoped>
.pi-check {
  color: var(--green-500);
}
.pi-times {
  color: var(--red-500);
}

.label {
  font-weight: bold;
}

.detail-list {
  list-style: none;
}

.detail-list li {
  position: relative;
  padding-left: 0.75rem;
  margin: 0.25rem 0;
}

.status {
  position: absolute;
  display: block;
  left: -1em;
  padding: 0.25em;
  height: 100%;
  border-radius: 0.5rem 0 0 0.5rem;
  color: var(--green-500);
}

.blocking {
  background-color: var(--red-500);
  color: white;
  border-radius: 0 0.5rem 0.5rem 0;
}

.blocking .status,
.blocking .value,
.blocking .value .pi {
  color: inherit;
}

.blocking .status {
  background-color: var(--red-500);
}

.missing-value,
.missing .value .pi,
.missing .status {
  color: var(--orange-500);
}
</style>
