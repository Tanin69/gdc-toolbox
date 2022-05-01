<template>
  <div>
    <TabulatorTable :props="options" style="opacity: 0.9; height: 100%" />
    <Script
      src="https://cdn.jsdelivr.net/npm/luxon@2.3.2/build/global/luxon.min.js"
    ></Script>
  </div>
</template>

<script lang="ts" setup>
import background from '@/assets/img/backgrounds/listMissions.jpg'
import type { Tabulator } from 'tabulator-tables'

const { public: runtimeConfig } = useRuntimeConfig()

//#region Custom formatters

const customFalseFmt: Tabulator.ColumnDefinition['formatter'] = (cell) => {
  const cellValue = cell.getValue()
  if (cellValue === 'false' || cellValue === '') {
    return "<span style='font-style: italic'>Non renseigné</span>"
  } else {
    return cell.getValue()
  }
}

const customBrfFmt: Tabulator.ColumnDefinition['formatter'] = (cell) => {
  const cellData = (cell.getData() as any).briefingSqfFound.isOK
  if (cellData === false) {
    return ''
  }
  return "<i class='far fa-eye'></i>"
}

const customUpcaseFmt: Tabulator.ColumnDefinition['formatter'] = (cell) =>
  cell.getValue().toUpperCase()

//#endregion

//#region Actions

const callShowMission: Tabulator.ColumnDefinition['cellClick'] = (_e, cell) => {
  const pbo = (cell.getData() as any).missionPbo.val
  navigateTo(`/mission/show/${pbo}`)
}

/* Updates data and synchronizes database */
const updateCol: Tabulator.ColumnDefinition['cellClick'] = async (_e, cell) => {
  if (
    confirm(
      'La mission est jouable: ' +
        cell.getValue() +
        "\n\n\nVoulez-vous changer l'état de la mission ?"
    )
  ) {
    if (cell.getValue()) {
      cell.setValue(false)
    } else {
      cell.setValue(true)
    }
  }
  const pbo = (cell.getData() as any).missionPbo.val

  try {
    const response = await fetch(
      `${
        runtimeConfig.API_MISSION_ENDPOINT
      }/update/${pbo}?missionIsPlayable=${cell.getValue()}`,
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(cell.getRow().getData()),
      }
    )
    if (!response.ok) {
      throw response
    }
  } catch (e) {
    alert(
      `Huho... Somethin' went wrong. Server responded :\n${
        (e as any).status
      } (${(e as any).message})`
    )
    cell.setValue(cell.getOldValue())
  }
}

//#endregion

//#region Tabulator setup

const options: Tabulator.Options = {
  ajaxURL: `${runtimeConfig.API_MISSION_ENDPOINT}/list`,
  placeholder: 'No Data Available',
  layout: 'fitColumns',
  responsiveLayout: 'collapse',
  movableColumns: true,
  persistence: {
    sort: true,
    filter: true,
    columns: true,
  },
  columns: [
    {
      title: 'Type de jeu',
      field: 'gameType.val',
      width: 90,
      headerFilter: true,
      formatter: customUpcaseFmt,
    },
    {
      title: 'IFA3',
      field: 'IFA3mod.val',
      headerFilter: true,
      formatter: 'tickCross',
    },
    {
      title: 'Jouable',
      field: 'missionIsPlayable.val',
      headerFilter: true,
      formatter: 'tickCross',
      cellClick: updateCol,
    },
    {
      title: 'Titre',
      field: 'missionTitle.val',
      headerFilter: true,
    },
    {
      title: 'Briefing',
      field: 'briefingSqfFound.isOK',
      formatter: customBrfFmt,
      cellClick: callShowMission,
    },
    {
      title: 'Date de publication',
      field: 'pboFileDateM.val',
      responsive: 3,
      formatter: 'datetime',
      formatterParams: { outputFormat: 'DD/MM/YYYY' },
    },
    {
      title: 'Version',
      field: 'missionVersion.val',
    },
    {
      title: 'Carte',
      field: 'missionMap.val',
      headerFilter: true,
    },
    {
      title: 'Auteur',
      field: 'author.val',
      headerFilter: true,
      formatter: customFalseFmt,
    },
    {
      title: 'Minimum de joueurs',
      field: 'minPlayers.val',
      formatter: customFalseFmt,
    },
    {
      title: 'Maximum de joueurs',
      field: 'maxPlayers.val',
      formatter: customFalseFmt,
    },
    {
      title: 'Texte lobby',
      field: 'overviewText.val',
      tooltip: true,
      formatter: customFalseFmt,
    },
  ],
}

//#endregion

definePageMeta({
  title: 'Missions',
  background,
  keepalive: true,
})
</script>
