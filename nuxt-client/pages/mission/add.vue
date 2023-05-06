<template>
  <div>
    <Card class="main-card">
      <template #content>
        <FileUpload
          name="files[]"
          customUpload
          @uploader="uploadFiles"
          multiple
          auto
          accept=".pbo"
          :showCancelButton="false"
          :showUploadButton="false"
          :maxFileSize="1000000"
          chooseLabel="Ajouter un .pbo"
          invalidFileSizeMessage="{0}: est trop lourd, le poids maximal est de : {1}."
        >
          <template #empty>
            <p>Déposez les <code>.pbo</code> ici</p>
          </template>
        </FileUpload>

        <div class="files-actions">
          <Button
            icon="pi pi-trash"
            :disabled="files.length <= 0"
            @click="abortAll"
            style="flex: 1; margin: 0 1rem"
            label="Tout supprimer"
            class="p-button-danger"
          />
        </div>
      </template>
    </Card>

    <div class="files">
      <Card v-for="(item, i) in filesToShow" :key="i">
        <template #header>
          <div
            class="image-container"
            v-tooltip.top="item.mission?.loadScreen.val"
          >
            <Skeleton v-if="item.loading" style="height: 100%" />
            <Image
              v-else
              :src="getImageURL(item)"
              alt="Mission image"
              preview
            ></Image>
          </div>
        </template>
        <template #title>
          <Skeleton v-if="!item.mission && item.loading" />
          <span
            v-else-if="item.mission"
            :class="[!item.mission.missionTitle?.val && 'data-undefined']"
          >
            {{ item.mission.missionTitle?.val ?? 'Non rensigné' }}
          </span>
          <span v-else> Quelque chose ne va pas avec le fichier </span>
        </template>
        <template #subtitle>
          {{ item.file.name }}
        </template>
        <template #content>
          <div>
            <Skeleton v-if="!item.mission && item.loading" />
            <div
              v-else-if="item.mission"
              :class="[
                !item.mission.overviewText?.val && 'data-undefined',
                'lobby-text',
              ]"
            >
              <b>Texte lobby :</b><br />
              {{ item.mission.overviewText?.val ?? 'Non rensigné' }}
            </div>
            <div v-else-if="item.error">
              Consultez le détail pour plus d'informations.
            </div>
          </div>
        </template>
        <template #footer>
          <Button
            :loading="item.loading"
            @click="openDetail(item)"
            icon="pi pi-info-circle"
            label="Détail"
            class="p-button-info"
            style="margin-left: 0.5em"
          />
          <Button
            :loading="item.loading"
            @click="abortFile(item, $event)"
            icon="pi pi-trash"
            label="Annuler"
            class="p-button-danger"
            style="margin-left: 0.5em"
          />
        </template>
      </Card>
    </div>
  </div>
</template>

<script lang="tsx" setup>
import background from '@/assets/img/backgrounds/addMission.jpg'
import placeholder from '@/assets/img/cpc_badge.png'
import errorImg from '@/assets/img/backgrounds/error.jpg'
import Card from 'primevue/card'
import Button from 'primevue/button'
import FileUpload from 'primevue/fileupload'
import Skeleton from 'primevue/skeleton'
import Image from 'primevue/image'
import { useAuth0 } from '@auth0/auth0-vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useDialog } from 'primevue/usedialog'
import type { ConfirmationOptions } from 'primevue/confirmationoptions'
import UploadResult from '~~/components/UploadResult.vue'

type CustomFile = {
  uploaded?: boolean
  file: File
  mission?: Mission
  error?: MissionError
  loading: boolean
}

const {
  public: { API_BASE, API_MISSION_ENDPOINT, API_MISSION_IMAGE },
} = useRuntimeConfig()
const { replace } = useRouter()
const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0()
const toast = useToast()
const confirm = useConfirm()
const dialog = useDialog()

const files = ref<CustomFile[]>([])

const filesToShow = computed(() => [...files.value].reverse())
const filesToUp = computed(() =>
  files.value.filter(({ uploaded, error }) => uploaded === false && !error)
)

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
 * Refresh Auth0 token silently
 */
const getAccessToken = async () => {
  let accessToken = undefined
  const authorizationParams = {
    scope: 'add:mission',
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
      detail: "Une erreur est survenue lors de l'authentification",
      life: 3000,
    })
    return
  }

  return accessToken
}

const uploadFiles = async ({ files: droppedFiles }: { files: File[] }) => {
  // allowing parallel processes
  const promises: Promise<void>[] = []

  const accessToken = await getAccessToken()
  if (!accessToken) {
    replace('/')
    return
  }

  for (const file of droppedFiles) {
    // Add files to UI
    const index = files.value.length
    files.value.push({ file, uploaded: false, loading: true })

    const formData = new FormData()
    formData.append('file', file)

    promises.push(
      $fetch<Mission | MissionError>('/api/mission/check', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((data) => {
          files.value[index] = {
            file,
            mission: 'nbBlockingErr' in data ? undefined : data,
            error: 'nbBlockingErr' in data ? data : undefined,
            uploaded: true,
            loading: false,
          }
          if (droppedFiles.length === 1) {
            openDetail(files.value[index])
          }
        })
        .catch((err: Error) => {
          files.value[index].loading = false
          toast.add({
            severity: 'error',
            summary: err.name ?? 'FileError',
            detail:
              'Une erreur est survenue lors de la vérification: ' + err.message,
          })
          console.error(err)
        })
    )
  }
  // Run all promises in parallel, whatever it returns
  return Promise.allSettled(promises)
}

const abortFile = async (checkResult: CustomFile, event: Event) => {
  const index = files.value.findIndex((m) => m === checkResult)
  if (index >= 0) {
    const otherFiles = [...files.value]
    const [file] = otherFiles.splice(index, 1)

    if (file.mission && !file.uploaded) {
      // Awaiting user confirmation if dangerous
      const userConfirm = await asyncConfirm({
        message: `Le fichier "${file.file.name}" n'a pas encore été publié. Voulez-vous vraiment l'annuler ?`,
        icon: 'pi pi-exclamation-triangle',
        target: (event.currentTarget as HTMLElement | null) ?? undefined,
      })
      if (!userConfirm) return
    }

    files.value = otherFiles

    if (file.mission && !file.uploaded) {
      toast.add({
        severity: 'success',
        summary: 'AbortOK',
        detail: `L'envoi du fichier "${file.file.name}" a été annulé.`,
        life: 3000,
      })
    }
  }
}

const abortAll = async () => {
  // Awaiting user confirmation
  const userConfirm = await asyncConfirm({
    message: `Voulez-vous vraiment annuler tout les fichiers ?`,
    icon: 'pi pi-exclamation-triangle',
  })
  if (!userConfirm) return

  files.value = []

  toast.add({
    severity: 'success',
    summary: 'ClearOK',
    detail: "Une erreur est survenue lors de l'authentification",
    life: 3000,
  })
}

const openDetail = (checkResult: CustomFile) => {
  const detail = checkResult.mission || checkResult.error
  if (detail) {
    const hasError = 'nbBlockingErr' in detail
    const dialogRef = dialog.open(UploadResult, {
      props: {
        header: `Mission ${hasError ? 'non ' : ''}conforme`,
        style: {
          width: '50vw',
          background: `var(--${hasError ? 'red' : 'green'}-300)`,
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
      },
      templates: {
        footer: () => (
          <Button
            icon="pi pi-times"
            onClick={() => dialogRef.close()}
            label="Fermer"
            class="p-button-secondary"
            style="margin-left: 0.5em"
          />
        ),
      },
      data: { detail },
    })
  }
}

const getImageURL = ({ mission, uploaded, error }: CustomFile) => {
  if (mission && uploaded && mission.loadScreen.val) {
    return `${API_MISSION_IMAGE}/${mission.loadScreen.val}`
  }
  if (error !== undefined) {
    return errorImg
  }
  return placeholder
}

definePageMeta({
  middleware: ['auth'],
  title: 'Publier une mission',
  background,
})
</script>

<style scoped>
.data-undefined {
  /* font-style: italic; */
  color: var(--red-500);
}

.files {
  padding: 1rem;
  padding-right: 0;
  display: flex;
  overflow: auto;
}

/* ! Responsive */
.files > * {
  margin-right: 1rem;
  flex: 0 0 370px;
  width: 370px;
  height: 475px;
}

.image-container {
  height: 13rem;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.image-container:deep(img) {
  width: 115%;
  margin-left: -7.5%;
}

.files-actions {
  margin-top: 1rem;
  display: flex;
}

.main-card {
  background: #ffffff88;
}

.files .p-card,
.files:deep(.p-card-body) {
  display: flex;
  flex-direction: column;
}

.files:deep(.p-card-body),
.files:deep(.p-card-content) {
  flex: 1;
}

.lobby-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
</style>
