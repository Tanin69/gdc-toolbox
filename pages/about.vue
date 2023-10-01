<template>
  <div>
    <Card>
      <template #title> Remerciements </template>
      <template #content>
        <div v-for="(user, key) in thanks" :key="key">
          <Avatar
            shape="circle"
            v-tooltip.top="user.name"
            :image="user.avatar"
            @click="() => openLink(user.link)"
          />
          {{ user.desc }}
        </div>
      </template>
    </Card>
    <Card>
      <template #title> Equipe de développement </template>
      <template #content>
        <div style="display: flex">
          <Avatar
            style="margin-right: 1rem"
            size="xlarge"
            shape="circle"
            v-tooltip.top="org.name"
            :image="org.avatar"
            @click="() => openLink(org.link)"
          />
          <AvatarGroup>
            <Avatar
              v-for="(dev, key) in devs"
              :key="key"
              size="xlarge"
              shape="circle"
              v-tooltip.top="dev.name"
              :image="dev.avatar"
              @click="() => openLink(dev.link)"
            />
          </AvatarGroup>
        </div>
        <h4 v-if="!error">Autres contributeurs</h4>
        <AvatarGroup>
          <Avatar
            v-for="(contrib, key) in contributorsList"
            :key="key"
            shape="circle"
            :icon="pending ? 'pi pi-spin pi-spinner' : undefined"
            v-tooltip.top="contrib?.login ?? '...'"
            @click="() => openLink(`https://github.com/${contrib?.login}`)"
            :image="contrib?.avatar_url"
          />
          <Avatar
            v-if="contribCount > 5"
            shape="circle"
            :label="`+${contribCount - 5}`"
            @click="
              () =>
                openLink(
                  'https://github.com/gie-gdc-dev/gdc-toolbox/contributors'
                )
            "
          />
        </AvatarGroup>
      </template>
    </Card>
    <Card>
      <template #title> Liens utiles </template>
      <template #content>
        <div class="button-list">
          <div v-for="(link, key) in otherLinks" :key="key">
            <a :href="link.url">
              <Button
                :label="link.name"
                :icon="`pi ${link.icon}`"
                :class="link.class"
              />
            </a>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import background from '@/assets/img/backgrounds/about.jpg'
import Avatar from 'primevue/avatar'
import AvatarGroup from 'primevue/avatargroup'
import Card from 'primevue/card'
import Button from 'primevue/button'

type User = {
  name: string
  avatar: string
  link: string
}

const thanks = ref<(User & { desc: string })[]>([
  {
    name: 'Sparfell',
    avatar: 'https://avatars.githubusercontent.com/u/8149972?v=4',
    link: 'https://github.com/Sparfell',
    desc: 'Pour les screenshots',
  },
  {
    name: 'Migoyan',
    avatar: 'https://avatars.githubusercontent.com/u/64397268?v=4',
    link: 'https://github.com/Migoyan',
    desc: 'Pour les idées',
  },
  {
    name: 'tanin69',
    avatar: 'https://avatars.githubusercontent.com/u/12481096?v=4',
    link: 'https://github.com/Tanin69',
    desc: 'Pour le projet de base',
  },
  {
    name: 'Grèce de Canards',
    avatar: 'https://avatars.githubusercontent.com/u/13717513?v=4',
    link: 'https://grecedecanards.fr/',
    desc: 'Pour le soutien',
  },
])
const org = ref<User>({
  name: 'GIE GDC Dev',
  avatar: 'https://avatars.githubusercontent.com/u/84591103?v=4',
  link: 'https://github.com/gie-gdc-dev',
})
const devs = ref<User[]>([
  {
    name: 'Morbakos',
    avatar: 'https://avatars.githubusercontent.com/u/45514843?v=4',
    link: 'https://github.com/Morbakos',
  },
  {
    name: 'oxypomme',
    avatar: 'https://avatars.githubusercontent.com/u/34627360?v=4',
    link: 'https://github.com/oxypomme',
  },
])

const otherLinks = ref<
  { url: string; name: string; icon: string; class?: string }[]
>([
  {
    name: 'GitHub',
    icon: 'pi-github',
    class: 'p-button-secondary',
    url: 'https://github.com/GdC-Framework/gdc-toolbox/',
  },
  {
    name: 'Roadmap',
    icon: 'pi-map',
    class: 'p-button-info',
    url: 'https://github.com/orgs/GdC-Framework/projects/2',
  },
  {
    name: 'Grèce de Canard',
    icon: 'pi-globe',
    url: 'https://grecedecanards.fr/',
  },
  {
    name: 'Discord',
    icon: 'pi-discord',
    class: 'p-button-secondary',
    url: 'https://discord.com/invite/0e8ZrNIUVAuEwoUe',
  },
])

const contribCount = ref(0)
const {
  data: contributors,
  error,
  pending,
} = useLazyFetch<any[]>(
  `https://api.github.com/repos/GdC-Framework/gdc-toolbox/contributors`
)

const openLink = (url: string) => {
  window.open(url)
}

const contributorsList = computed((): any[] => {
  if (contributors.value) {
    const list = contributors.value.filter(
      (c) => !['Morbakos', 'oxypomme'].includes(c.login)
    )
    contribCount.value = [...list].length
    if (list.length > 5) {
      list.length = 5
    }
    return list
  }
  return error ? [] : Array.from({ length: 5 })
})

definePageMeta({
  title: 'A propos',
  background,
  keepalive: true,
})
</script>

<style scoped>
.p-card {
  background: #ffffffaa;
  margin-bottom: 1rem;
}

.p-avatar {
  cursor: pointer;
}

.button-list {
  display: flex;
}
.button-list > * {
  margin-right: 1rem;
}
.button-list a {
  text-decoration: none;
}
</style>
