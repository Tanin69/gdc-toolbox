<template>
  <Card class="main-card">
    <template #content>
      <DataTable
        v-model:filters="filters"
        :value="missionsTable"
        :loading="pending"
        :rows="rowsPerPage"
        :expandedRows="missionsTable"
        :sort-order="-1"
        :class="[compacted && 'compacted']"
        paginator
        responsive-layout="scroll"
        sort-field="pboFileDateM.val"
        filterDisplay="menu"
        rowHover
        stripedRows
        show-gridlines
      >
        <template #header>
          <div style="display: flex; align-items: center">
            <h3 style="margin-right: 0.5rem">Liste des missions</h3>
            <Badge :value="missions?.length ?? '???'"></Badge>

            <div style="display: flex; align-items: center; margin-left: auto">
              <span style="margin-right: 0.5rem; font-weight: 400"
                >Mode compact</span
              >
              <InputSwitch v-model="compacted" />
            </div>

            <Button
              icon="pi pi-sync"
              title="Rafraichir"
              style="margin-left: 1rem"
              @click="retryFetch"
            />
          </div>
        </template>

        <!-- #region Data -->
        <Column header="Type" sortable field="gameType.val">
          <template #body="{ data }">
            <Skeleton v-if="!data" style="margin: 0.75rem 0" />
            <span
              v-else-if="data?.gameType?.val && data.gameType.val !== 'false'"
              class="data"
            >
              {{ data.gameType.val.toString().toUpperCase() }}
            </span>
            <span v-else class="data-undefined"> Non renseigné </span>
          </template>
        </Column>

        <Column header="IFA3" sortable field="IFA3mod.val">
          <template #body="{ data }">
            <Skeleton v-if="!data" />
            <i
              v-else-if="data?.IFA3mod?.val || data?.IFA3mod?.val === 'true'"
              class="pi pi-check boolval-ok"
            />
            <i v-else class="pi pi-times boolval-ko" />
          </template>
        </Column>

        <Column header="Jouable" sortable field="missionIsPlayable.val">
          <template #body="{ data }">
            <Skeleton v-if="!data" />
            <Button
              v-else
              class="p-button-text"
              :icon="
                data?.missionIsPlayable?.val ||
                data?.missionIsPlayable?.val === 'true'
                  ? 'pi pi-check'
                  : 'pi pi-times'
              "
              :icon-class="
                data?.missionIsPlayable?.val ||
                data?.missionIsPlayable?.val === 'true'
                  ? ' boolval-ok'
                  : 'boolval-ko'
              "
              :disabled="!isAuthenticated"
              :loading="playableLoading"
              @click="updatePlayable($event, data)"
            />
          </template>
        </Column>

        <Column header="Titre" sortable field="missionTitle.val">
          <!-- TODO: Can filter -->
          <!--
        <template #filter="{ filterModel }">
          <InputText
            type="text"
            v-model="filterModel.value"
            class="p-column-filter"
            placeholder="Search by name"
          />
        </template>
        -->
          <template #body="{ data }">
            <Skeleton v-if="!data" width="20rem" />
            <span v-else-if="data?.missionTitle?.val" class="data">
              {{ data.missionTitle.val }}
            </span>
            <span v-else class="data-undefined"> Non renseigné </span>
          </template>
        </Column>

        <Column header="Briefing" sortable field="briefingSqfFound.isOK">
          <template #body="{ data }">
            <Skeleton v-if="!data" />
            <span
              v-else-if="data?.briefingSqfFound?.isOK || data?.missionBriefing"
              class="data"
            >
              <Button
                icon="pi pi-eye"
                class="p-button-text"
                @click="callShowMission(data?.missionId)"
              />
            </span>
            <span v-else class="data-undefined"> Non renseigné </span>
          </template>
        </Column>

        <Column header="Date de publication" sortable field="pboFileDateM.val">
          <template #body="{ data }">
            <Skeleton v-if="!data" />
            <span v-else-if="data?.pboFileDateM?.val" class="data">
              {{ dayjs(data.pboFileDateM.val).format('DD/MM/YYYY') }}
            </span>
            <span v-else class="data-undefined"> Non renseigné </span>
          </template>
        </Column>

        <Column header="Version" sortable field="missionVersion.val">
          <template #body="{ data }">
            <Skeleton v-if="!data" />
            <span v-else-if="data?.missionVersion?.val" class="data">
              {{ data.missionVersion.val }}
            </span>
            <span v-else class="data-undefined"> Non renseigné </span>
          </template>
        </Column>

        <Column header="Carte" sortable field="missionMap.val">
          <!-- TODO: Can filter -->
          <template #body="{ data }">
            <Skeleton v-if="!data" />
            <span v-else-if="data?.missionMap?.val" class="data">
              {{ data.missionMap.val }}
            </span>
            <span v-else class="data-undefined"> Non renseigné </span>
          </template>
        </Column>

        <Column header="Auteur" sortable field="author.val">
          <!-- TODO: Can filter -->
          <template #body="{ data }">
            <Skeleton v-if="!data" />
            <span v-else-if="data?.author?.val" class="data">
              {{ data.author.val }}
            </span>
            <span v-else class="data-undefined"> Non renseigné </span>
          </template>
        </Column>

        <Column header="Nombre de joueurs" sortable field="minPlayers.val">
          <template #body="{ data }">
            <Skeleton v-if="!data" />
            <div v-else>
              <span v-if="data?.minPlayers?.val" class="data">
                {{ data.minPlayers.val }}
              </span>
              <span v-else class="data-undefined"> ??? </span>
              -
              <span v-if="data?.maxPlayers?.val" class="data">
                {{ data.maxPlayers.val }}
              </span>
              <span v-else class="data-undefined"> ??? </span>
            </div>
          </template>
        </Column>

        <template v-if="!compacted" #expansion="{ data }">
          <span class="bold-text" style="margin-right: 0.25rem">
            Texte lobby :
          </span>
          <Skeleton v-if="!data" />
          <span
            v-else-if="
              data?.overviewText?.val && data?.overviewText?.val !== 'false'
            "
          >
            {{ data.overviewText.val }}
          </span>
          <span v-else class="data-undefined"> Non renseigné </span>
        </template>
        <!-- #endregion -->
      </DataTable>
    </template>
  </Card>
</template>

<script lang="ts" setup>
import background from '@/assets/img/backgrounds/listMissions.jpg'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import InputSwitch from 'primevue/inputswitch'
import Skeleton from 'primevue/skeleton'
import Badge from 'primevue/badge'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { FilterMatchMode, FilterOperator } from 'primevue/api'
import type { ToastMessageOptions } from 'primevue/toast'
import type { ConfirmationOptions } from 'primevue/confirmationoptions'
import dayjs from '@/ts/dayjs'
import { useAuth0 } from '@auth0/auth0-vue'

const {
  public: { API_MISSION_ENDPOINT, API_BASE },
} = useRuntimeConfig()
const toast = useToast()
const confirm = useConfirm()
const { isAuthenticated, getAccessTokenSilently, getAccessTokenWithPopup } =
  useAuth0()

const playableLoading = ref(false)
const compacted = ref(false)
const filters = ref({
  'missionTitle.val': {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
})

const {
  data: missions,
  error,
  pending,
  refresh,
} = useLazyFetch('/api/mission/list')

const missionsTable = computed(() => {
  if (missions.value) {
    return missions.value
  }
  if (error.value) {
    return []
  }
  return Array.from({ length: 20 })
})
const rowsPerPage = computed(() => (compacted.value ? 21 : 7))

/**
 * Wrapper of PrimeVUE's Confirm to make it async
 *
 * @param options Options to pass to PrimeVUE
 */
const asyncConfirm = (
  options: Omit<ConfirmationOptions, 'accept' | 'reject'>
) =>
  new Promise<boolean>((resolve) => {
    confirm.require({
      ...options,
      accept: () => resolve(true),
      reject: () => resolve(false),
    })
  })

/**
 * Navigate to mission's detail
 *
 * @param data The mission
 */
const callShowMission = (missionId: string) => {
  navigateTo(`/mission/show/${missionId}`)
}

/**
 * Refresh Auth0 token silently
 */
const getAccessToken = async () => {
  let accessToken = undefined
  const authorizationParams = {
    scope: 'update:mission',
    audience: API_BASE,
  }
  // Trying to get auth token without user interaction
  try {
    accessToken = await getAccessTokenSilently({ authorizationParams })
  } catch (error) {
    console.error(error)
  }
  // Trying to get auth token with user interaction if previous attempts failed
  if (!accessToken) {
    try {
      accessToken = await getAccessTokenWithPopup({ authorizationParams })
    } catch (error) {
      console.error(error)
    }
  }
  // If previous attempts failed
  if (!accessToken) {
    toast.add({
      severity: 'error',
      summary: 'AuthError',
      detail:
        "Une erreur est survenue lors de l'authentification\nVérifiez que vous autorisez les popup pour ce site",
      life: 3000,
    })
    return
  }

  return accessToken
}

/**
 * Update the playable state
 *
 * @param data The mission
 */
const updatePlayable = async (event: Event, data: Mission) => {
  const state: [string, string] = ['non ', '']
  if (data.missionIsPlayable.val) state.reverse()

  // Awaiting user confirmation
  const userConfirm = await asyncConfirm({
    message: `La mission est actuellement: ${state[0]}jouable.\nVoulez-vous la faire passer en: ${state[1]}jouable ?`,
    icon: 'pi pi-exclamation-triangle',
    target: event.currentTarget as HTMLElement,
  })
  if (!userConfirm) return

  playableLoading.value = true

  const accessToken = await getAccessToken()
  if (!accessToken) {
    playableLoading.value = false
    return
  }

  try {
    const pbo = data.missionPbo.val
    const isCurrPlayable = data.missionIsPlayable.val

    // Updating status in DB
    const response = await fetch(
      `${API_MISSION_ENDPOINT}/update/${pbo}?missionIsPlayable=${!isCurrPlayable}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    if (!response.ok) {
      throw response
    }

    data.missionIsPlayable.val = !isCurrPlayable
    // Showing toast if success
    toast.add({
      severity: 'success',
      summary: 'UpdateOK',
      detail: `La mission ${data.missionTitle.val} est maintenant ${state[1]}jouable !`,
      life: 3000,
    })
  } catch (e) {
    // Showing toast if error
    const msg: ToastMessageOptions = {
      severity: 'error',
      summary: 'UpdateError',
      detail: "Une erreur est survenue lors de l'action",
      life: 3000,
    }
    if (e instanceof Response) {
      msg.detail += ': ' + e.statusText
    }
    toast.add(msg)
  }
  playableLoading.value = false
}

/**
 * Retry fetch data
 */
const retryFetch = async () => {
  missions.value = null
  error.value = null
  await refresh()
}

// Awaiting an error while fetching
watch(error, (err) => {
  if (err) {
    const msg: ToastMessageOptions = {
      severity: 'error',
      summary: 'LoadingError',
      detail: 'Une erreur est survenue au chargement des données',
      life: 3000,
    }
    if (typeof err === 'object') {
      msg.summary = err.name
      msg.detail += ': ' + err.message
    }
    toast.add(msg)
  }
})

definePageMeta({
  title: 'Missions',
  background,
  keepalive: true,
})
</script>

<style>
.data-undefined {
  /* font-style: italic; */
  color: var(--red-500);
}

.boolval-ok {
  color: var(--green-500);
}

.boolval-ko {
  color: var(--red-500);
}

.bold-text {
  font-weight: bold;
}

h3 {
  font-weight: bold;
  color: var(--primary-color);
}

.data,
.p-column-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.p-datatable {
  font-size: 0.9em;
}

.p-datatable .p-datatable-header,
.p-datatable .p-datatable-thead > tr > th {
  background: #f8f9fae5;
}

.p-paginator,
.p-datatable .p-sortable-column.p-highlight {
  background: #f8f9fae5;
}

.p-datatable.p-datatable-striped .p-datatable-tbody > tr:nth-child(even) {
  background: #fcfcfce5;
}

.p-datatable .p-datatable-tbody > tr {
  background: #fffffae5;
}

.p-datatable.compacted .p-datatable-tbody > tr > td {
  padding: 0rem 1rem;
}

.main-card {
  background: #ffffff88;
}
</style>
