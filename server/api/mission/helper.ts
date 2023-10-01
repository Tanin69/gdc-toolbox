import { Db, WithId } from 'mongodb'
import {
  readdir,
  stat,
  readFile,
  appendFile,
  rename,
  copyFile,
} from 'fs/promises'
import { resolve, basename } from 'path'
import sanitizeHtml from 'sanitize-html'

export default function finalizeMissionType(
  missionList: WithId<Mission> | WithId<Mission>[]
): Mission[] {
  const finalizedDatas: Mission[] = []

  if (Array.isArray(missionList)) {
    missionList.forEach((elem) => {
      elem.missionId = elem._id.toString()
      finalizedDatas.push(elem)
    })
  } else {
    missionList.missionId = missionList._id.toString()
    finalizedDatas.push(missionList)
  }

  return finalizedDatas
}

/**
 *
 * @param isOk
 * @param label
 * @param isBlocking
 * @returns
 */
export function initMissionFieldError(
  isOk: boolean,
  label: string,
  isBlocking: boolean = false
): MissionFieldError {
  return {
    isOK: isOk,
    label: label,
    isBlocking: isBlocking,
  }
}

export function checkReport(report: MissionError): MissionError {
  let isReportValid: boolean = true
  let blockingErrorCount: number = 0

  Object.values(report)
    .filter(
      (value) =>
        typeof value === 'object' &&
        instanceOfMisionFieldError(value as MissionFieldError)
    )
    .forEach((value) => {
      value = <MissionFieldError>value
      if (!value.isOK) {
        isReportValid = false
        blockingErrorCount++
      }
    })

  report.isMissionValid = isReportValid
  report.nbBlockingErr = blockingErrorCount

  return report
}

function instanceOfMisionFieldError(param: MissionFieldError): boolean {
  return 'isOK' in param && 'isBlocking' in param && 'label' in param
}

export async function getAllFiles(
  basePath: string,
  dirPath: string,
  arrayOfFiles: any[]
) {
  const files = await readdir(dirPath)
  arrayOfFiles = arrayOfFiles || []

  await Promise.all(
    files.map(async function (file) {
      if ((await stat(resolve(dirPath, file))).isDirectory()) {
        arrayOfFiles = await getAllFiles(
          basePath,
          resolve(dirPath, file),
          arrayOfFiles
        )
      } else {
        arrayOfFiles.push(resolve(basePath, dirPath, file))
      }
    })
  )
  return arrayOfFiles
}

export async function addMissionToPool(
  fileName: string,
  pboFilePath: string,
  extractedFilePath: string,
  databaseHandler: Db
): Promise<void> {
  const { MISSIONS_DIR, MONGO_COLLECTION } = useRuntimeConfig()
  const regex = /(CPC-.*]-.*)-V(\d*)\.(.*)\.pbo/i
  const parsedMissionName = regex.exec(fileName)

  if (!parsedMissionName) {
    return
  }

  const missionData: Mission = {
    missionId: '',
    missionTitle: { label: 'Titre de la mission', val: parsedMissionName[1] },
    missionVersion: {
      label: 'Version de la mission',
      val: +parsedMissionName[2],
    },
    missionMap: { label: 'Carte de la mission', val: parsedMissionName[3] },
    gameType: { label: 'Type de jeu', val: '' },
    author: { label: 'Auteur', val: '' },
    minPlayers: { label: 'Nombre minimum de joueurs', val: 0 },
    maxPlayers: { label: 'Nombre maximum de joueurs', val: 0 },
    onLoadName: { label: "Titre de l'écran de chargement", val: '' },
    onLoadMission: { label: "Texte de l'écran de chargement", val: '' },
    overviewText: { label: 'Texte du lobby', val: '' },
    missionPbo: { label: 'Nom du fichier pbo', val: '' },
    pboFileSize: { label: 'Taille du fichier pbo', val: '' },
    pboFileDateM: {
      label: 'Date de publication de la mission',
      val: new Date(),
    },
    owner: { label: 'Propriétaire de la mission', val: 'GDC-Toolbox' },
    missionIsPlayable: { label: 'La mission est jouable', val: false },
    missionBriefing: [],
    loadScreen: { label: "Image de l'écran de chargement", val: '' },
    IFA3mod: { label: 'Mission IFA3', val: false },
  }

  const allFiles = await getAllFiles(extractedFilePath, extractedFilePath, [])

  if (allFiles.map((item) => basename(item)).includes('description.ext')) {
    await grabInfoFromDescriptionExt(
      allFiles.find((item) => basename(item) == 'description.ext'),
      missionData
    )
  }

  if (allFiles.map((item) => basename(item)).includes('briefing.sqf')) {
    await buildBriefing(
      allFiles.find((item) => basename(item) == 'briefing.sqf'),
      missionData
    )
  }

  await getInfosFromMissionSqmFile(
    allFiles.find((item) => basename(item) == 'mission.sqm'),
    missionData
  )

  if (missionData.loadScreen.val != '') {
    await copyImageForPreview(
      missionData.loadScreen.val,
      extractedFilePath,
      parsedMissionName[1]
    )
  }

  await databaseHandler
    .collection<Mission>(MONGO_COLLECTION)
    .insertOne(missionData)
  await rename(pboFilePath, resolve(MISSIONS_DIR, fileName))
}

async function grabInfoFromDescriptionExt(
  filePath: string,
  report: Mission
): Promise<Mission> {
  const fileContent = (await readFile(filePath)).toString()

  report.author.val = searchMissionInfo('author', fileContent)
  report.onLoadName.val = searchMissionInfo('onLoadName', fileContent)
  report.onLoadMission.val = searchMissionInfo('onLoadMission', fileContent)
  report.overviewText.val = searchMissionInfo('overviewText', fileContent)
  report.gameType.val = searchMissionInfo('gameType', fileContent)
  report.minPlayers.val = +searchMissionInfo('minPlayers', fileContent)
  report.maxPlayers.val = +searchMissionInfo('maxPlayers', fileContent)

  return report
}

function searchMissionInfo(field: string, missionFileData: string) {
  const regex = new RegExp('\\s*' + field + '\\s*=\\s*(.*);', 'i')
  const match = regex.exec(missionFileData)
  if (match != null) {
    match[1] = match[1].replace(/\"/g, '')
    return match[1]
  } else {
    return 'Inconnu'
  }
}

async function buildBriefing(
  sqfPath: string,
  missionData: Mission
): Promise<Mission> {
  const regex =
    /player.*creatediaryrecord\s*\[\s*"\s*diary\s*"\s*,\s*\[\s*"([^"]*)"\s*,\s*"([^"]*)/gim
  //Look for createDiaryRecord entries
  let str = (await readFile(sqfPath)).toString()
  let m
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }
    //m[1] (capture group $1) is the tab title, m[2] ($2 the tab content). Add it all to array
    //Cleaning tab content : line end
    m[2] = m[2].replace(/\r?\n/gi, '')
    //Cleaning tab content : <marker... tags
    m[2] = m[2].replace(
      /(<\s*marker\s*name\s*='\S+'>)([^>]*)(<\/marker>)/gi,
      '$2'
    )
    //Cleaning tab content : <img... tags
    m[2] = m[2].replace(/(<\s*img[^>]*>)/gi, '')
    //Sanitizises html to prevent code injection
    m[1] = sanitizeHtml(m[1])
    m[2] = sanitizeHtml(m[2], {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['font']),
      allowedAttributes: {
        font: ['color'],
      },
    })
    missionData.missionBriefing.unshift([m[1], m[2]])
  }

  return missionData
}

async function getInfosFromMissionSqmFile(
  filePath: string,
  missionData: Mission
): Promise<Mission> {
  const fileContent = (await readFile(filePath)).toString()

  // Check for author key
  if (!missionData.author.val) {
    const regex = new RegExp(/class ScenarioData\s*{\s*author="(.*)"/gm)
    const match = regex.exec(fileContent)
    if (match !== null) {
      match[1] = match[1].replace(/\"/g, '')
      missionData.author.val = match[1]
    }
  }

  if (!missionData.loadScreen.val) {
    missionData.loadScreen.val = searchMissionInfo('loadScreen', fileContent)
  }

  // TODO: prepare image for preview

  if (!missionData.minPlayers.val) {
    missionData.minPlayers.val = +searchMissionInfo('minPlayers', fileContent)
  }

  if (!missionData.maxPlayers.val) {
    missionData.maxPlayers.val = +searchMissionInfo('maxPlayers', fileContent)
  }

  // Search for IFA
  const regIFA = new RegExp(/WW2_Core/gm)
  const matchIFA = regIFA.exec(fileContent)
  if (matchIFA !== null) {
    missionData.IFA3mod.val = true
  }

  return missionData
}

async function copyImageForPreview(
  imageFilePath: string,
  extractedFilePath: string,
  missionName: string
) {
  const { IMAGE_DIR } = useRuntimeConfig()
  const originalFilePath = resolve(extractedFilePath, imageFilePath)
  const copyFilePath = resolve(IMAGE_DIR, `${missionName}_preview`)
  try {
    await stat(originalFilePath)
    await copyFile(originalFilePath, copyFilePath)
  } catch (error) {
    if ((error as any).code !== 'ENOENT') {
      throw error
    }
  }  
}

async function copyCollectionToNewCollection(dbClient: Db) {
  const { MONGO_COLLECTION } = useRuntimeConfig()
  const initialDatas = await dbClient
    .collection<Mission>(MONGO_COLLECTION)
    .find({})
    .toArray()
  console.log(initialDatas.length)
  const allInsertedIds = []
  for await (const iterator of initialDatas) {
    const result = await dbClient
      .collection<Mission>(`${MONGO_COLLECTION}-copy`)
      .insertOne(iterator)
    allInsertedIds.push(result.insertedId)
    console.log('Inserted id ' + result.insertedId)
  }

  await appendFile(
    './temp.txt',
    allInsertedIds.map((item) => `${item.toString()}`).join('\n')
  )
  console.log('Done')
}
