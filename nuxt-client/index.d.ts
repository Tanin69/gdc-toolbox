declare module '*.jpg' {
  const value: string
  export default value
}
declare module '*.png' {
  const value: string
  export default value
}

type Mission = {
  missionTitle: {
    val: string
    label: string
  }
  missionVersion: {
    val: number
    label: string
  }
  missionMap: {
    val: string
    label: string
  }
  gameType: {
    val: string
    label: string
  }
  author: {
    val: string
    label: string
  }
  minPlayers: {
    val: number
    label: string
  }
  maxPlayers: {
    val: number
    label: string
  }
  onLoadName: {
    val: string
    label: string
  }
  onLoadMission: {
    val: string
    label: string
  }
  overviewText: {
    val: string
    label: string
  }
  missionPbo: {
    val: string
    label: string
  }
  pboFileSize: {
    val: string
    label: string
  }
  pboFileDateM: {
    val: Date
    label: string
  }
  owner: {
    val: string
    label: string
  }
  missionIsPlayable: {
    val: boolean
    label: string
  }
  missionBriefing: [title: string, content: string][]
  loadScreen: {
    val: string
    label: string
  }
  IFA3mod: {
    val: boolean
    label: string
  }
}

type MissionError = {
  fileIsPbo: {
    isOK: boolean
    isBlocking?: boolean
    label: string
  }
  filenameConvention: {
    isOK: boolean
    isBlocking?: boolean
    label: string
  }
  descriptionExtFound: {
    isOK: boolean
    isBlocking?: boolean
    label: string
  }
  missionSqmFound: {
    isOK: boolean
    isBlocking?: boolean
    label: string
  }
  briefingSqfFound: {
    isOK: boolean
    isBlocking?: boolean
    label: string
  }
  missionSqmNotBinarized: {
    isOK: boolean
    isBlocking?: boolean
    label: string
  }
  HCSlotFound: {
    isOK: boolean
    isBlocking?: boolean
    label: string
  }
  isMissionValid: boolean
  isMissionArchived: boolean
  nbBlockingErr: number
}
