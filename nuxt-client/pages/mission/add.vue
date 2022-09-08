<template>
  <div class="w3-display-middle">
    <form class="dropzone">
      <div v-bind="getRootProps()">
        <input v-bind="(getInputProps() as any)" />
        <div class="dropzone-message" v-if="!files.length">
          <i class="fas fa-file-upload" style="font-size: 100px"></i>
          <br />
          <div v-if="isDragActive" class="w3-large">
            Déposez les <code>.pbo</code> ici
          </div>
          <span v-else class="w3-large">
            Cliquez ou déposez les <code>.pbo</code> ici
          </span>
        </div>
        <div class="dropzone-files">
          <div
            v-for="({ file, errors, uploaded }, i) in files"
            :class="{
              'mission-file': true,
              'mission-file-pending': uploaded === false,
              'mission-file-success': uploaded === true,
              'mission-file-error': errors?.length > 0,
            }"
            :title="file.name"
          >
            <span class="mission-file-size">
              <strong>{{ fileSizeToMB(file.size) }}</strong> MB
            </span>

            <span class="mission-file-name">
              {{ file.name }}
            </span>
          </div>
        </div>
        <div class="dropzone-actions">
          <button
            class="w3-btn w3-round w3-block gdc-color-tonic"
            @click="clearDropzone"
            :disabled="!files.length"
          >
            Tout supprimer
          </button>

          <button
            class="w3-btn w3-round w3-block gdc-color-tonic"
            :disabled="filesToUp.length <= 0"
            @click="handleSubmit"
          >
            Tout envoyer
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import background from '@/assets/img/backgrounds/addMission.jpg'
import { useDropzone } from 'vue3-dropzone'
import type { FileWithPath } from 'file-selector'
import { useAuth0 } from '@auth0/auth0-vue'

type CustomInputFile = FileWithPath & {
  size?: number
}

type CustomFileErrorCode =
  | 'file-invalid-type'
  | 'file-too-large'
  | 'file-too-small'
  | 'too-many-files'
  | string

type FileError = {
  code?: CustomFileErrorCode
  type?: string
  errors?: string[]
  message: string
}

type CustomFile = {
  uploaded?: boolean
  file: CustomInputFile
  errors?: FileError[]
}

const { public: runtimeConfig } = useRuntimeConfig()
const { replace } = useRouter()
const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0()

const files = ref<CustomFile[]>([])
const filesToUp = computed(() =>
  files.value.filter(
    ({ uploaded, errors }) => uploaded === false && (errors?.length ?? 0) <= 0
  )
)

const {
  getRootProps,
  getInputProps,
  isDragActive,
  acceptedFiles,
  fileRejections,
  ...rest
} = useDropzone({
  accept: '.pbo',
  maxSize: 1000000,
  onDrop: (acceptations, rejections) => {
    const tmpFiles: CustomFile[] = [...files.value]
    // Add accepted files
    for (const file of acceptations) {
      if ('name' in file) {
        tmpFiles.push({ file })
      }
    }
    // Add rejected files
    for (const reason of rejections) {
      if (reason.file && 'name' in reason.file) {
        const obj: CustomFile = { file: reason.file, errors: [] }
        for (const error of reason.errors) {
          if (typeof error === 'object') {
            obj.errors.push(error)
          }
        }
      }
    }
    // Add files to UI
    files.value = tmpFiles

    // allowing parallel processes
    const promises: Promise<any>[] = []

    for (const file of acceptations) {
      // find file in UI. It will used to update the status
      const index = files.value.findIndex(({ file: fi }) => fi == file)

      const formData = new FormData()
      formData.append('file', file as File)

      promises.push(
        $fetch<Mission | MissionError>(
          // 'http://localhost:8082/check',
          `${runtimeConfig.API_MISSION_ENDPOINT}/check`,
          {
            method: 'POST',
            body: formData,
          }
        )
          .then((data) => {
            // Handling errors
            if ('nbBlockingErr' in data && data.nbBlockingErr > 0) {
              const warns: string[] = []
              const errors: string[] = []
              // For every entry in response...
              for (const key in data) {
                const errorType = data[key as keyof MissionError]
                // ... that is an object and is actually an error
                if (typeof errorType === 'object' && !errorType.isOK) {
                  // Check blocing state of error
                  if ('isBlocking' in errorType && !errorType.isBlocking) {
                    warns.push(errorType.label)
                  } else {
                    errors.push(errorType.label)
                  }
                }
              }
              // Throw error
              // TODO: Match dropzone error type
              throw {
                type: errors.length ? 'error' : 'warn',
                errors: errors.length ? errors : warns,
                message: `Une ou plusieurs erreurs ont étées détéctées dans votre fichier`,
              }
            } else {
              // PBO is good to go !
              const f = files.value[index]
              f.uploaded = false
            }
          })
          .catch((error) => {
            const err = error as Error | FileError
            // PBO is a no go
            const f = files.value[index]
            if (index >= 0) {
              f.errors = [err]
            }
            console.error(error)
          })
      )
    }
    // Run all promises in parallel, whatever it returns
    return Promise.allSettled(promises)
  },
})

const clearDropzone = (e: Event) => {
  e.stopPropagation()
  e.preventDefault()
  files.value = []
}

const uploadMission = async ({ file }: CustomFile) => {
  let accessToken = ''
  try {
    accessToken = await getAccessTokenSilently()
  } catch (error) {
    accessToken = await getAccessTokenWithPopup()
  }
  if (!accessToken) {
    replace('/')
    return
  }
  console.log(accessToken)

  const formData = new FormData()
  formData.set('file', file)
  try {
    await $fetch(`${runtimeConfig.API_MISSION_ENDPOINT}/add`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    // TODO: Show OK
  } catch (error) {
    // TODO: Show error
  }
}

const handleSubmit = (e: Event) => {
  e.stopPropagation()
  e.preventDefault()
  // allowing parallel processes
  const promises: Promise<any>[] = []

  for (const file of filesToUp.value) {
    promises.push(uploadMission(file))
  }

  // Run all promises in parallel, whatever it returns
  return Promise.allSettled(promises)
}

const fileSizeToMB = (fileSize: number) =>
  (fileSize / (1024 * 1024)).toLocaleString('fr', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

// TODO: Show modal on click


definePageMeta({
  middleware: ['auth'],
  title: 'Publier une mission',
  background,
})
</script>

<style scoped>
.dropzone {
  position: relative;
  height: 400px;
  width: 400px;
}
.dropzone > div {
  height: 100%;
}
.dropzone-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: bold;
  color: #bd5734;
  text-align: center;
}

.dropzone-files {
  height: 100%;
  width: 100%;
  border: 3px dashed #bd5734bf;
  background-color: #a79e84bf;
  border-radius: 30px;
  padding: 1rem;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 120px;
  gap: 8px;
}

.dropzone-actions {
  margin-top: 1rem;
  display: flex;
}

.dropzone-actions > button {
  margin: 0 0.5rem;
}

.mission-file {
  display: flex;
  flex-direction: column;
  text-align: center;
  overflow: hidden;

  background-color: #d2dbe265;
  padding: 0.5rem;
  border-radius: 1rem;
}

.mission-file-size {
  margin-bottom: 1rem;
}

.mission-file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mission-file-pending {
  background-color: #d2dbe2;
}
.mission-file-error {
  background-color: #e09090;
}
.mission-file-success {
  background-color: #90e0ab;
}
</style>
