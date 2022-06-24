<template>
  <div class="w3-display-middle">
    <form @submit="handleSubmit" method="POST" class="dropzone">
      <div v-bind="getRootProps()">
        <input v-bind="(getInputProps() as any)" />
        <!-- action: http://localhost:3000/api/mission/check -->
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
            v-for="({ file, errors, checked }, i) in files"
            :class="{
              'mission-file': true,
              'mission-file-pending': checked === false,
              'mission-file-success': checked === true,
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
      </div>
      <button
        class="dropzone-reset w3-btn w3-round w3-block gdc-color-tonic"
        @click="clearDropzone"
        :disabled="!files.length"
      >
        Clear Dropzone
      </button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import background from '@/assets/img/backgrounds/addMission.jpg'
import { useDropzone } from 'vue3-dropzone'

const { public: runtimeConfig } = useRuntimeConfig()

const files = ref<any[]>([])

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
    // Add files to UI
    files.value = [
      ...files.value,
      ...acceptations.map((file) => ({ file })),
      ...rejections,
    ]

    // alowwing parallel processes
    const promises = []

    for (const file of acceptations) {
      // find file in UI. It will used to update the status
      const index = files.value.findIndex(({ file: fi }) => fi == file)

      const formData = new FormData()
      formData.append('file', file as File)

      promises.push(
        $fetch<Mission | MissionError>(
          // 'http://localhost:8080/check',
          `${runtimeConfig.API_MISSION_ENDPOINT}/check`,
          {
            method: 'POST',
            body: formData,
          }
        )
          .then((data) => {
            // Handling errors
            if ('nbBlockingErr' in data && data.nbBlockingErr > 0) {
              const warns = []
              const errors = []
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
              f.checked = false
            }
          })
          .catch((error) => {
            // PBO is a no go
            const f = files.value[index]
            if (index >= 0) {
              f.errors = [{ error }]
            }
            console.error(error)
          })
      )
    }
    return Promise.allSettled(promises)
  },
})

const clearDropzone = (e: Event) => {
  e.preventDefault()
  files.value = []
}

const handleSubmit = () => {}

const fileSizeToMB = (fileSize: number) => {
  return (fileSize / (1024 * 1024)).toLocaleString('fr', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

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

.dropzone-reset {
  margin-top: 1rem;
}

.mission-file {
  display: flex;
  flex-direction: column;
  text-align: center;
  overflow: hidden;

  background-color: #d2dbe2;
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

.mission-file-error {
  background-color: #e09090;
}
</style>
