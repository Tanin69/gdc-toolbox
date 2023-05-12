import { WithId } from "mongodb";
import { readdir, stat, readFile } from 'fs/promises'
import { resolve, basename } from "path";

export default function finalizeMissionType(missionList: WithId<Mission> | WithId<Mission>[]): Mission[] {
    const finalizedDatas: Mission[] = [];

    if (Array.isArray(missionList)) {
        missionList.forEach((elem) => {
            elem.missionId = elem._id.toString();
            finalizedDatas.push(elem);
        });
    } else {
        missionList.missionId = missionList._id.toString();
        finalizedDatas.push(missionList);
    }

    return finalizedDatas;
}

/**
 * 
 * @param isOk 
 * @param label 
 * @param isBlocking 
 * @returns 
 */
export function initMissionFieldError(isOk: boolean, label: string, isBlocking: boolean = false): MissionFieldError {
    return {
        isOK: isOk,
        label: label,
        isBlocking: isBlocking
    };
}

export function checkReport(report: MissionError): MissionError {
    
    let isReportValid: boolean = true;
    let blockingErrorCount: number = 0;

    Object.values(report).filter((value) => typeof value === 'object' && instanceOfMisionFieldError(value as MissionFieldError)).forEach((value) => {
        value = <MissionFieldError>value;
        if (!value.isOK) {
            isReportValid = false;
            blockingErrorCount++;
        }
    });

    report.isMissionValid = isReportValid;
    report.nbBlockingErr = blockingErrorCount;

    return report;
}

function instanceOfMisionFieldError(param: MissionFieldError): boolean {
    return 'isOK' in param && 'isBlocking' in param && 'label' in param;
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

export async function addMissionToPool(fileName: string, tempFilePath: string, extractedFilePath: string) {
    const { MISSIONS_DIR } = useRuntimeConfig()
    const regex = new RegExp(/(CPC-.*]-.*)-V(\d*)\.(.*)\.pbo/i)
    const parsedMissionName = regex.exec(fileName)

    if (!parsedMissionName) {
        return
    }

    const missionData: Mission = {
        missionId: "",
        missionTitle: { label: "Titre de la mission", val: parsedMissionName[1]},
        missionVersion: {label: 'Version de la mission', val: +parsedMissionName[2]},
        missionMap: {label: 'Carte de la mission', val: parsedMissionName[3]},
        gameType: {label: 'Type de jeu', val: ''},
        author: {label: '', val: ''},
        minPlayers: {label: '', val: 0},
        maxPlayers: {label: '', val: 0},
        onLoadName: {label: '', val: ''},
        onLoadMission: {label: '', val: ''},
        overviewText: {label: '', val: ''},
        missionPbo: {label: '', val: ''},
        pboFileSize: {label: '', val: ''},
        pboFileDateM: {label: '', val: new Date()},
        owner: {label: '', val: ''},
        missionIsPlayable: {label: '', val: false},
        missionBriefing: [],
        loadScreen: {label: '', val: ''},
        IFA3mod: {label: '', val: false},
    }

    const allFiles = await getAllFiles(extractedFilePath, extractedFilePath, []);

    if (allFiles.map(item => basename(item)).includes("description.ext")) {
        grabInfoFromDescriptionExt(allFiles.find(item => basename(item) == "description.ext"), missionData)
    }
}

async function grabInfoFromDescriptionExt(filePath: string, report: Mission): Promise<Mission> {
    const fileContent = await (await readFile(filePath)).toString()

    report.author.val = searchMissionInfo("author", fileContent)
    report.onLoadName.val = searchMissionInfo("onLoadName", fileContent)
    report.onLoadMission.val = searchMissionInfo("onLoadMission", fileContent)
    report.overviewText.val = searchMissionInfo("overviewText", fileContent)
    report.gameType.val = searchMissionInfo("gameType", fileContent)
    report.minPlayers.val = +searchMissionInfo("minPlayers", fileContent)
    report.maxPlayers.val = +searchMissionInfo("maxPlayers", fileContent)

    return report
}

function searchMissionInfo(field: string, missionFileData: string) {
    const regex = new RegExp("\\s*" + field + "\\s*=\\s*(.*);", "i");
    const match = regex.exec(missionFileData);
    if (match != null) {
        match[1] = match[1].replace(/\"/g, "");
        return match[1];
    } else {
        return "Inconnu"
    }
}