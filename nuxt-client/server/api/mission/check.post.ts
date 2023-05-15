import { spawnSync } from 'child_process'
import dayjs from 'dayjs'
import { writeFile, unlink, rm, stat, readFile, mkdir } from 'fs/promises'
import { resolve, basename } from 'path'
import { addMissionToPool, checkReport, getAllFiles, initMissionFieldError } from './helper'

type DefaultCheckConfiguration = {
  isBlocking: boolean,
  key: keyof MissionError
}

const defaultErrorConfig: DefaultCheckConfiguration[] = [
  { key:'fileIsPbo', isBlocking: true },
  { key:'filenameConvention', isBlocking: true },
  { key:'descriptionExtFound', isBlocking: false },
  { key:'missionSqmFound', isBlocking: true },
  { key:'briefingSqfFound', isBlocking: true },
  { key:'missionSqmNotBinarized', isBlocking: false },
  { key:'HCSlotFound', isBlocking: false },
]

export default defineEventHandler(async (event) => {
  const { PBO_MANAGER, UPLOAD_TEMP_DIR } = useRuntimeConfig()

  const body = await readMultipartFormData(event)

  // Just make sure nothing's wrong
  if (!body || !body[0].filename) {
    return createError('File not found')
  }

  if (!(await asyncFileExist(UPLOAD_TEMP_DIR))) {
    await mkdir(UPLOAD_TEMP_DIR)
  }

  const report: MissionError = {
    fileIsPbo: { isOK: true, label: '' },
    filenameConvention: { isOK: true, label: '' },
    descriptionExtFound: { isOK: true, label: '' },
    missionSqmFound: { isOK: true, label: '' },
    briefingSqfFound: { isOK: true, label: '' },
    missionSqmNotBinarized: { isOK: true, label: '' },
    HCSlotFound: { isOK: true, label: '' },
    isMissionValid: false,
    isMissionArchived: false,
    nbBlockingErr: 0,
  }

  // Unpbo file
  const now = dayjs().unix()
  const filenameWithoutExt = body[0].filename.replace(/^(.*)\..*$/, '$1')
  const tempFilePath = resolve(UPLOAD_TEMP_DIR, `${filenameWithoutExt}.pbo`)
  const extractedFilePath = resolve(
    UPLOAD_TEMP_DIR,
    `${filenameWithoutExt}_${now}`
  )

  // For devs that doesn't use Windows or doesn't want to install PBO_MANAGER
  if (!PBO_MANAGER && process.env.NODE_ENV !== 'production') {
    return generateDummyReport(Math.random() > 0.5)
  }

  await writeFile(tempFilePath, body[0].data)
  const pboUnwrapped = spawnSync(PBO_MANAGER, [
    '-unpack',
    tempFilePath,
    extractedFilePath,
  ])

  // Checking unpbo worked well
  if (pboUnwrapped.status != 0) {
    report.fileIsPbo = initMissionFieldError(
      false,
      "La mission n'est pas au format PBO",
      true
    )
  } else {
    report.fileIsPbo = initMissionFieldError(
      true,
      'La mission est au format PBO',
      false
    )
  }

  // Let's check missions data
  // Mission name
  report.filenameConvention = checkMissionName(body[0].filename)

  // mission.sqm
  report.missionSqmFound = await checkForSqmFile(extractedFilePath)

  // description.ext
  report.descriptionExtFound = await checkForDescriptionExtFile(
    extractedFilePath
  )

  // briefing.sqf
  report.briefingSqfFound = await checkForBriefingFile(extractedFilePath)

  // Check if mission.sqm is binarized
  if (report.missionSqmFound.isOK) {
    report.missionSqmNotBinarized = await checkForBinarizedMissionFile(
      extractedFilePath
    )
  } else {
    report.missionSqmNotBinarized = initMissionFieldError(
      false,
      'Le fichier mission est binarisé',
      true
    )
  }

  // Check for HC
  if (report.missionSqmNotBinarized.isOK) {
    report.HCSlotFound = await checkForHC(extractedFilePath)
  } else {
    report.HCSlotFound = initMissionFieldError(
      false,
      'La mission ne contient pas de HC',
      true
    )
  }

  checkReport(report)

  if (report.isMissionValid) {
    await addMissionToPool(body[0].filename, extractedFilePath)
  }

  // Need to be done after mission was added to pool
  await unlink(tempFilePath)
  await rm(extractedFilePath, { recursive: true })

  return report
})

const asyncFileExist = async (path: string) => {
  let fileExist = true
  try {
    await stat(path)
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      fileExist = false
    } else {
      throw error
    }
  }
  return fileExist
}

function checkMissionName(name: string): MissionFieldError {
  let report: MissionFieldError
  const isMissionNameOk: boolean = /^(CPC-(CO|COM|TVT|GM).*]-.*)-V(\d*)\.(.*)(\.pbo)$/i.test(name)

  if (!isMissionNameOk) {
    report = checkIfErrorIsBlocking(
      'filenameConvention', 
      'Le nom de la mission ne respecte pas le format'
    )
  } else {
    report = initMissionFieldError(
      true,
      'Le nom de la mission respecte le format',
      false
    )
  }

  return report
}

async function checkForSqmFile(path: string): Promise<MissionFieldError> {
  let report: MissionFieldError

  if (!(await asyncFileExist(resolve(path, 'mission.sqm')))) {
    report = checkIfErrorIsBlocking(
      'missionSqmFound', 
      'Le dossier ne contient pas de fichier "mission.sqm"'
    )
  } else {
    report = initMissionFieldError(
      true,
      'Le dossier contient un fichier "mission.sqm"',
      false
    )
  }

  return report
}

async function checkForDescriptionExtFile(path: string) {
  let report: MissionFieldError

  if (!(await asyncFileExist(resolve(path, 'description.ext')))) {
    report = checkIfErrorIsBlocking(
      'descriptionExtFound', 
      'Le dossier ne contient pas de fichier "description.ext"'
    )
  } else {
    report = initMissionFieldError(
      true,
      'Le dossier contient un fichier "description.ext"',
      false
    )
  }

  return report
}

async function checkForBriefingFile(path: string) {
  let report: MissionFieldError

  const briefingRegex = new RegExp(/^.*briefing.*\.sqf$/i)
  const hasBriefing = (await getAllFiles(path, path, [])).some(
    (elem: string) => briefingRegex.test(elem)
  )

  if (!hasBriefing) {
    report = checkIfErrorIsBlocking(
      'briefingSqfFound', 
      'La mission ne contient pas de fichier briefing'
    )
  } else {
    report = initMissionFieldError(
      true,
      'La mission contient un fichier briefing',
      false
    )
  }

  return report
}

async function checkForBinarizedMissionFile(
  path: string
): Promise<MissionFieldError> {
  let report: MissionFieldError

  const fileContent = `${await readFile(resolve(path, 'mission.sqm'))}`
  const regex = new RegExp(/^version/)

  if (regex.test(fileContent)) {
    report = initMissionFieldError(
      true,
      "Le fichier mission n'est pas binarisé",
      false
    )
  } else {
    report = checkIfErrorIsBlocking(
      "missionSqmNotBinarized",
      'Le fichier mission est binarisé'
    )
  }

  return report
}

async function checkForHC(path: string) {
  let report: MissionFieldError

  const fileContent = `${await readFile(resolve(path, 'mission.sqm'))}`
  const regex = new RegExp(
    /.*name="HC_Slot";\s*isPlayable=1;[^type="HeadlessClient_F";]/m
  )

  if (regex.test(fileContent)) {
    report = initMissionFieldError(true, 'La mission a un HC', false)
  } else {
    report = checkIfErrorIsBlocking(
      "HCSlotFound",
      "La mission n'a pas de HC"
    )
  }

  return report
}

const checkIfErrorIsBlocking:(field: keyof MissionError, reason: string) => MissionFieldError = (field: keyof MissionError, reason: string) => {
  const isBlocking = defaultErrorConfig.find(item => item.key === field)?.isBlocking || false;
  return initMissionFieldError(false, reason, isBlocking);
}

const generateDummyReport = (isErr: boolean): MissionError | Mission => {
  if (isErr) {
    return {
      fileIsPbo: {
        isOK: false,
        label: "La mission n'est pas au format PBO (dummy)",
        isBlocking: isErr,
      },
      filenameConvention: {
        isOK: false,
        label: 'Le nom de la mission ne respecte pas le format (dummy)',
        isBlocking: true,
      },
      descriptionExtFound: {
        isOK: false,
        // TODO
        label: true ? '(dummy)' : '(dummy)',
      },
      missionSqmFound: {
        isOK: false,
        label: 'Le dossier ne contient pas de fichier "mission.sqm" (dummy)',
        isBlocking: true,
      },
      briefingSqfFound: {
        isOK: false,
        label: 'La mission ne contient pas de fichier briefing (dummy)',
      },
      missionSqmNotBinarized: {
        isOK: false,
        label: "Le fichier mission n'est pas binarisé (dummy)",
        isBlocking: true,
      },
      HCSlotFound: {
        isOK: false,
        label: "La mission n'a pas de HC (dummy)",
      },
      isMissionValid: false,
      isMissionArchived: false,
      nbBlockingErr: 4,
    } satisfies MissionError
  }
  return {
    missionId: 'dummy-mission-id',
    missionTitle: {
      label: 'Titre de la mission',
      val: 'CPC-CO[999]-Dummy_Mission_Name',
    },
    missionVersion: {
      label: 'Version de la mission',
      val: 1,
    },
    missionMap: {
      label: 'Carte de la mission',
      val: 'DummyMap',
    },
    gameType: {
      label: 'Type de jeu',
      val: 'Coop',
    },
    author: {
      label: 'Auteur de la mission',
      val: 'DummyAuthor',
    },
    minPlayers: {
      label: 'Nombre minimum de joueurs',
      val: 0,
    },
    maxPlayers: {
      label: 'Nombre maximum de joueurs',
      val: 999,
    },
    onLoadName: {
      label: "Titre de l'écran de chargement",
      val: 'Je suis une mission Dummy',
    },
    onLoadMission: {
      label: "Texte de l'écran de chargement",
      val: 'Je charge mission Dummy',
    },
    overviewText: {
      label: 'Texte du lobby',
      val: 'Je présente la mission Dummy',
    },
    missionPbo: {
      label: 'Nom du fichier pbo',
      val: 'CPC-CO[999]-Dummy.pbo',
    },
    pboFileSize: {
      label: 'Taille du fichier pbo',
      val: '0',
    },
    pboFileDateM: {
      label: 'Date de publication de la mission',
      val: new Date(),
    },
    owner: {
      label: 'Propriétaire de la mission',
      val: 'Dummy',
    },
    missionIsPlayable: {
      label: 'La mission est jouable',
      val: false,
    },
    loadScreen: {
      label: "Image de l'écran de chargement",
      val: '',
    },
    missionBriefing: [['Title', 'Dummy Briefing']],
    IFA3mod: {
      label: 'Mission IFA3',
      val: false,
    },
  } satisfies Mission
}
