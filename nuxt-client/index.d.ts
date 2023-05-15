declare module '*.jpg' {
  const value: string
  export default value
}
declare module '*.png' {
  const value: string
  export default value
}

type MissionField<T> = {
  val: T
  label: string
}

type Mission = {
  missionId: string
  missionTitle: MissionField<string>
  missionVersion: MissionField<number>
  missionMap: MissionField<string>
  gameType: MissionField<string>
  author: MissionField<string>
  minPlayers: MissionField<number>
  maxPlayers: MissionField<number>
  onLoadName: MissionField<string>
  onLoadMission: MissionField<string>
  overviewText: MissionField<string>
  missionPbo: MissionField<string>
  pboFileSize: MissionField<string>
  pboFileDateM: MissionField<Date>
  owner: MissionField<string>
  missionIsPlayable: MissionField<boolean>
  missionBriefing: [title: string, content: string][]
  loadScreen: MissionField<string>
  IFA3mod: MissionField<boolean>
}

type MissionFieldError = {
  isOK: boolean
  isBlocking?: boolean
  label: string
}

type MissionUploadResult = {
  
}

type MissionError = {
  fileIsPbo: MissionFieldError
  filenameConvention: MissionFieldError
  descriptionExtFound: MissionFieldError
  missionSqmFound: MissionFieldError
  briefingSqfFound: MissionFieldError
  missionSqmNotBinarized: MissionFieldError
  HCSlotFound: MissionFieldError
  versionAlreadyExist: MissionFieldError
  isMissionValid: boolean
  isMissionArchived: boolean
  nbBlockingErr: number
}
