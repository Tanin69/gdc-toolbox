<template>
  <Card class="main-card">
    <template #content>
      <!--Titre briefing-->
      <h1 class="gdc-briefing-title">
        {{ mission ? mission.missionTitle.val : route.params.pbo }}
      </h1>

      <!--layout fluide + responsive-->
      <div style="padding-bottom: 2rem">
        <!--colonne gauche-->
        <Splitter :layout="isSplitVertical ? 'vertical' : undefined">
          <SplitterPanel :size="100 / 3" class="gdc-mission-side">
            <div class="gdc-mission-image">
              <img :src="imageURL" alt="Image illustrative du briefing" />
            </div>

            <i>
              {{ mission ? mission.onLoadMission.val : '...' }}
            </i>

            <Divider />

            <h4 style="margin: 0; color: var(--primary-color)">
              Infos sur la mission&nbsp;
            </h4>

            <div class="gdc-mission-info">
              <ul>
                <li>
                  <span style="color: var(--primary-color)">
                    Carte :&nbsp;
                  </span>
                  {{ mission ? mission.missionMap.val : '...' }}
                </li>

                <li>
                  <span style="color: var(--primary-color)">
                    Version :&nbsp;
                  </span>
                  {{ mission ? mission.missionVersion.val : '...' }}
                </li>

                <li>
                  <span style="color: var(--primary-color)">
                    Type de jeu :&nbsp;
                  </span>
                  {{ mission ? mission.gameType.val : '...' }}
                </li>

                <li>
                  <span style="color: var(--primary-color)">
                    Texte lobby :&nbsp;
                  </span>
                  {{ mission ? mission.overviewText.val : '...' }}
                </li>

                <li>
                  <span style="color: var(--primary-color)">
                    Auteur :&nbsp;
                  </span>
                  {{ mission ? mission.author.val : '...' }}
                </li>

                <li>
                  <span style="color: var(--primary-color)">
                    Nombre de joueurs :&nbsp;
                  </span>
                  {{ mission ? mission.minPlayers.val : '...' }}
                  &nbsp;-&nbsp;
                  {{ mission ? mission.maxPlayers.val : '...' }}
                </li>
              </ul>
            </div>
          </SplitterPanel>

          <!--colonne droite-->
          <SplitterPanel :size="2 * (100 / 3)" style="padding: 1rem">
            <Transition name="page">
              <ErrorBox
                v-if="error"
                :error="`Une erreur est survenue (${error.name})`"
              >
                <Button @click="back"> Revenir en arrière </Button>
              </ErrorBox>
            </Transition>

            <template v-if="mission">
              <div v-for="item in mission.missionBriefing">
                <h4 style="color: var(--primary-color)">
                  {{ item[0] }}
                </h4>
                <!-- WARN: XSS ?! -->
                <p v-html="item[1]"></p>
              </div>
            </template>
          </SplitterPanel>
        </Splitter>
      </div>
    </template>
  </Card>
</template>

<script lang="ts" setup>
import background from '@/assets/img/backgrounds/listMissions.jpg'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Card from 'primevue/card'
import placeholder from '@/assets/img/cpc_badge.png'

const {
  currentRoute: { value: route },
  back,
} = useRouter()
const { public: runtimeConfig } = useRuntimeConfig()

const isSplitVertical = ref(false)

const { data: mission, error } = useLazyFetch<Mission | null>(
  `/api/mission/${route.params.pbo}`
)
const imageURL = computed(() => {
  // if (mission.value && mission.value.loadScreen.val) {
  //   return `${runtimeConfig.API_MISSION_IMAGE}/${mission.value.loadScreen.val}`
  // }
  return placeholder
})

const onResize = () => {
  isSplitVertical.value = window.innerWidth < 601
}

onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

const showInfos = ref(true)
definePageMeta({
  title: 'Briefing de mission',
  background,
})
</script>

<style scoped>
@media (min-width: 601px) {
  .gdc-mission-image img {
    max-height: 35vh;
  }
}

.gdc-mission-image {
  border-radius: 1rem;
  overflow: hidden;
}

.main-card {
  background: #ffffff88;
}

.main-card:deep(.p-card-content) {
  padding: 0;
}

.gdc-briefing-title {
  font-family: 'Bangers', serif;
  letter-spacing: 0.1em;
  font-size: 4vw;
  margin: 0;
  margin-bottom: 1rem;
}

.gdc-mission-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1rem;
  /* border-top: 1px solid #c1bba8; */
  /* box-shadow: 0 10px 10px 0 rgb(0 0 0 / 20%); */
}

.gdc-mission-info {
  width: 90%;
}

.gdc-mission-info ul {
  list-style-type: none;
  padding: 0;
}

.gdc-mission-info ul li {
  margin-top: 1rem;
}
</style>
