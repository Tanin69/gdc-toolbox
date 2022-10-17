<template>
  <div>
    <Transition name="page">
      <div v-if="error" class="error-container">
        <ErrorBox :error="`Une erreur est survenue (${error.name})`">
          <button class="w3-button gdc-color-tonic" @click="back">
            Revenir en arrière
          </button>
        </ErrorBox>
      </div>
    </Transition>
    <div>
      <!--Titre briefing-->
      <div class="w3-container">
        <div class="gdc-briefing-title">
          {{ mission ? mission.missionTitle.val : route.params.pbo }}
        </div>
      </div>

      <!--layout fluide + responsive-->
      <div class="w3-row" style="padding-bottom: 2rem">
        <!--colonne gauche-->
        <div class="w3-container w3-third w3-padding gdc-mission-panel">
          <div class="w3-margin-top w3-center">
            <div class="w3-center">
              <img
                :src="imageURL"
                class="w3-round w3-image w3-card-4"
                alt="Image illustrative du briefing"
              />
            </div>
            <div
              class="w3-panel w3-leftbar w3-text"
              style="font-style: italic; text-align: left"
            >
              <i class="w3-small gdc-color-dark">
                {{ mission ? mission.onLoadMission.val : '...' }}
              </i>
            </div>
          </div>

          <div
            class="w3-card-4 w3-padding w3-margin-top gdc-color-light"
            @click="showInfos = !showInfos"
          >
            <div class="gdc-display-flex gdc-alignItems-center">
              Infos sur la mission&nbsp;
              <i
                class="fa fa-caret-down gdc-transform-transition"
                :style="[
                  showInfos && 'transform: rotateZ(-180deg)',
                  'margin-left: auto',
                ]"
              ></i>
            </div>
          </div>
          <Transition name="slide-up">
            <div class="gdc-color-light gdc-mission-info" v-if="showInfos">
              <ul class="w3-ul">
                <li class="w3-bar">
                  <div class="w3-bar-item">
                    <span>Carte&nbsp;:&nbsp;</span>
                    <span>{{ mission ? mission.missionMap.val : '...' }}</span>
                  </div>
                </li>
                <li class="w3-bar">
                  <div class="w3-bar-item">
                    <span>Version&nbsp;:&nbsp;</span>
                    <span>{{
                      mission ? mission.missionVersion.val : '...'
                    }}</span>
                  </div>
                </li>
                <li class="w3-bar">
                  <div class="w3-bar-item">
                    <span>Type de jeu&nbsp;:&nbsp;</span>
                    <span>{{ mission ? mission.gameType.val : '...' }}</span>
                  </div>
                </li>
                <li class="w3-bar">
                  <div class="w3-bar-item">
                    <span>Texte lobby&nbsp;:&nbsp;</span
                    ><span>{{
                      mission ? mission.overviewText.val : '...'
                    }}</span>
                  </div>
                </li>
                <li class="w3-bar">
                  <div class="w3-bar-item">
                    <span>Auteur&nbsp;:&nbsp;</span>
                    <span>{{ mission ? mission.author.val : '...' }}</span>
                  </div>
                </li>
                <li class="w3-bar">
                  <div class="w3-bar-item">
                    <span>Nombre de joueurs&nbsp;:</span><br />
                    <span>
                      Minimum : {{ mission ? mission.minPlayers.val : '...' }},
                      maximum : {{ mission ? mission.maxPlayers.val : '...' }}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </Transition>
        </div>

        <!--colonne droite-->
        <div class="w3-container w3-twothird w3-padding" v-if="mission">
          <div v-for="item in mission.missionBriefing">
            <h4
              class="w3-tag w3-xlarge w3-padding gdc-color-tonic"
              style="transform: rotate(-5deg)"
            >
              {{ item[0] }}
            </h4>
            <!-- WARN: XSS ?! -->
            <p class="gdc-color-dark" v-html="item[1]"></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import placeholder from '@/assets/img/cpc_badge.png'

const {
  currentRoute: { value: route },
  back,
} = useRouter()
const { public: runtimeConfig } = useRuntimeConfig()

const { data: mission, error } = useLazyFetch<Mission | null>(
  `${runtimeConfig.API_MISSION_ENDPOINT}/show/${route.params.pbo}`
)
const imageURL = computed(() => {
  if (mission.value && mission.value.loadScreen.val) {
    return `${runtimeConfig.API_MISSION_IMAGE}/${mission.value.loadScreen.val}`
  }
  return placeholder
})

const showInfos = ref(true)
definePageMeta({
  title: 'Briefing de mission',
})
</script>

<style scoped>
@media (min-width: 601px) {
  .gdc-mission-panel {
    position: sticky;
    top: 0;
  }
  .gdc-mission-panel img {
    max-height: 35vh;
  }
}

.gdc-briefing-title {
  font-family: 'Bangers', serif;
  letter-spacing: 0.1em;
  font-size: 4vw;
  color: rgb(200, 200, 200);
}

.gdc-mission-info {
  border-top: 1px solid #c1bba8;
  box-shadow: 0 10px 10px 0 rgb(0 0 0 / 20%);
}

.error-container > * {
  transform: translate(-25%, -50%);
}
</style>
