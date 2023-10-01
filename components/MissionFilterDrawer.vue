<template>
  <Sidebar
    :visible="show"
    position="right"
    style="width: 550px"
    @update:visible="$emit('update:show', $event)"
  >
    <template #header>
      <Button
        icon="pi pi-filter-slash"
        v-tooltip="'Retirer les filtres'"
        text
        rounded
        @click="$emit('update:modelValue', {})"
      />
    </template>

    <h2>Filtres</h2>

    <div class="row">
      <div>
        <span class="label"> Type de mission </span>
        <Dropdown
          :model-value="modelValue.gameType"
          :options="availableOptions.types"
          placeholder="Type de mission"
          showClear
          style="width: 100%"
          @update:model-value="onFilter('gameType', $event)"
        />
      </div>

      <div>
        <span class="label"> Est une mission IFA3 ? </span>
        <SelectButton
          :model-value="modelValue.IFA3mod"
          :options="selectButtonOptions"
          option-label="label"
          option-value="value"
          @update:model-value="onFilter('IFA3mod', $event)"
        />
      </div>
    </div>
    <div class="row">
      <div>
        <span class="label"> Est jouable ? </span>
        <SelectButton
          :model-value="modelValue.missionIsPlayable"
          :options="selectButtonOptions"
          option-label="label"
          option-value="value"
          @update:model-value="onFilter('missionIsPlayable', $event)"
        />
      </div>

      <div>
        <span class="label"> Auteur </span>
        <AutoComplete
          :model-value="modelValue.author"
          :suggestions="authorSuggestions"
          placeholder="Auteur de la mission"
          style="width: 100%"
          dropdown
          @complete="onSearchAuthors"
          @update:model-value="onFilter('author', $event)"
        />
      </div>
    </div>
    <div class="row">
      <div>
        <span class="label"> Titre </span>
        <InputText
          :model-value="modelValue.missionTitle"
          placeholder="Titre de la mission"
          style="width: 100%"
          @update:model-value="onFilter('missionTitle', $event)"
        />
      </div>
    </div>
    <div class="row">
      <div>
        <span class="label"> Joueurs min. </span>
        <InputNumber
          :model-value="modelValue.minPlayers"
          :useGrouping="false"
          :min="0"
          placeholder="Nombre minimum"
          showButtons
          style="width: 100%"
          @update:model-value="onFilter('minPlayers', $event)"
        />
      </div>

      <div>
        <span class="label"> Joueurs max. </span>
        <InputNumber
          :model-value="modelValue.maxPlayers"
          :useGrouping="false"
          :min="0"
          placeholder="Nombre maximum"
          showButtons
          style="width: 100%"
          @update:model-value="onFilter('maxPlayers', $event)"
        />
      </div>
    </div>
  </Sidebar>
</template>

<script setup lang="ts">
import Sidebar from 'primevue/sidebar'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import SelectButton from 'primevue/selectbutton'
import AutoComplete, {
  type AutoCompleteCompleteEvent,
} from 'primevue/autocomplete'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Fuse from 'fuse.js'

type FilterKeys =
  | 'missionTitle'
  | 'missionMap'
  | 'gameType'
  | 'author'
  | 'minPlayers'
  | 'maxPlayers'
  | 'missionIsPlayable'
  | 'IFA3mod'
export type MissionFilters = {
  [P in FilterKeys]?: Mission[P]['val']
}

const $props = defineProps<{
  modelValue: MissionFilters
  show: boolean
  availableValues?: {
    authors: Set<string>
    types: Set<string>
    maps: Set<string>
  }
}>()

const $emit = defineEmits<{
  (e: 'update:modelValue', val: MissionFilters): void
  (e: 'update:show', val: boolean): void
}>()

const selectButtonOptions = [
  { label: 'Oui', value: true },
  { label: 'Non', value: false },
]

const searchedAuthors = ref<string[] | null>(null)

const availableOptions = computed(() => {
  if (!$props.availableValues) {
    return {
      authors: [],
      types: [],
      maps: [],
    }
  }

  return {
    authors: [...$props.availableValues.authors].sort(),
    types: [...$props.availableValues.types].sort(),
    maps: [...$props.availableValues.maps].sort(),
  }
})
const authorSuggestions = computed(
  () => searchedAuthors.value ?? availableOptions.value.authors
)

const fzfAuthors = new Fuse<string>([], {})
watch(availableOptions, ({ authors }) => {
  fzfAuthors.setCollection(authors)
})

const onFilter = <P extends FilterKeys>(
  property: P,
  value: MissionFilters[P]
) => {
  const v = { ...$props.modelValue }
  v[property] = value !== '' ? value : undefined
  $emit('update:modelValue', v)
}

const onSearchAuthors = (e: AutoCompleteCompleteEvent) => {
  if (e.query) {
    searchedAuthors.value = fzfAuthors
      .search(e.query.trim())
      .map((res) => res.item)
  } else {
    searchedAuthors.value = null
  }
}
</script>

<style scoped>
.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.row > div {
  flex: 1;
  padding: 0.25rem;
  overflow: hidden;
}

.label {
  display: block;
  margin-bottom: 0.25rem;
}
</style>
