import { spawnSync } from "child_process";
import dayjs from "dayjs";
import { writeFileSync, existsSync, unlinkSync, readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";
import { checkReport, initMissionFieldError } from "./helper";

export default defineEventHandler(async (event) => {
    
    const { PBO_MANAGER, UPLOAD_TEMP_DIR } = useRuntimeConfig();
    
    const body = await readMultipartFormData(event);
    
    // Just make sure nothing's wrong
    if (!body || !body[0].filename) {
        return createError("File not found");
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
        nbBlockingErr: 0
    };
    
    // Unpbo file
    const now = dayjs().unix();
    const tempFilePath = join(UPLOAD_TEMP_DIR, `${body[0].filename}.pbo`);
    const extractedFilePath = join(UPLOAD_TEMP_DIR, `${body[0].filename}_${now}`);
    
    writeFileSync(tempFilePath, body[0].data);
    const pboUnwrapped = spawnSync(PBO_MANAGER, ["-unpack", tempFilePath, extractedFilePath]);
    unlinkSync(tempFilePath);
    
    // Checking unpbo worked well
    if (pboUnwrapped.status != 0) {
        report.fileIsPbo = initMissionFieldError(false, "La mission n'est pas au format PBO", true);
    } else {
        report.fileIsPbo = initMissionFieldError(true, "La mission est au format PBO", false);
    };
    
    // Let's check missions data
    // Mission name
    report.filenameConvention = checkMissionName(body[0].filename);
    
    // mission.sqm
    report.missionSqmFound = checkForSqmFile(extractedFilePath);
    
    // description.ext
    report.descriptionExtFound = checkForDescriptionExtFile(extractedFilePath);
    
    // briefing.sqf
    report.briefingSqfFound = checkForBriefingFile(extractedFilePath);

    // Check if mission.sqm is binarized
    if (report.missionSqmFound.isOK) {
        report.missionSqmNotBinarized = checkForBinarizedMissionFile(extractedFilePath);
    } else {
        report.missionSqmNotBinarized = initMissionFieldError(false, 'Le fichier mission est binarisé', true);
    };

    // Check for HC
    if (report.missionSqmNotBinarized.isOK) {
        report.HCSlotFound = checkForHC(extractedFilePath);
    } else {
        report.HCSlotFound = initMissionFieldError(false, 'La mission ne contient pas de HC', true);
    };

    checkReport(report);
    
    return report;
});

function checkMissionName(name: string): MissionFieldError {
    let report: MissionFieldError;    
    const isMissionNameOk: boolean = new RegExp(/(CPC-.*]-.*)-V(\d*)\.(.*)(\.pbo)/i).test(name);
    
    if (!isMissionNameOk) {
        report = initMissionFieldError(false, "Le nom de la mission ne respecte pas le format", true);
    } else {
        report = initMissionFieldError(true, "Le nom de la mission respecte le format", false);
    }
    
    return report;
}

function checkForSqmFile(path: string): MissionFieldError {
    let report: MissionFieldError;
    
    if (!existsSync(join(path, 'mission.sqm'))) {
        report = initMissionFieldError(false, 'Le dossier ne contient pas de fichier "mission.sqm"', true);
    } else {
        report = initMissionFieldError(true, 'Le dossier contient un fichier "mission.sqm"', false);
    }
    
    return report;
}

function checkForDescriptionExtFile(path: string) {
    let report: MissionFieldError;
    
    if (!existsSync(join(path, 'description.ext'))) {
        report = initMissionFieldError(false, 'Le dossier ne contient pas de fichier "mission.sqm"', true);
    } else {
        report = initMissionFieldError(true, 'Le dossier contient un fichier "mission.sqm"', false);
    }
    
    return report;
}

function checkForBriefingFile(path: string) {
    let report: MissionFieldError;

    const basePath = path;
    
    const getAllFiles = function(dirPath: string, arrayOfFiles: any[]) {
        let files = readdirSync(dirPath);
        arrayOfFiles = arrayOfFiles || [];

        files.forEach(function(file) {
            if (statSync(dirPath + "/" + file).isDirectory()) {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            } else {
                arrayOfFiles.push(join(basePath, dirPath, "/", file));
            };
        });
        
        return arrayOfFiles;
    }
    
    const briefingRegex = new RegExp(/briefing\.sqf/i)
    const hasBriefing = getAllFiles(path, []).some((elem: string) => briefingRegex.test(elem));

    if (!hasBriefing) {
        report = initMissionFieldError(false, 'La mission ne contient pas de fichier briefing', false);
    } else {
        report = initMissionFieldError(true, 'La mission contient un fichier briefing', false);
    }
    
    return report;
}

function checkForBinarizedMissionFile(path: string): MissionFieldError {

    let report: MissionFieldError;

    const fileContent = `${readFileSync(join(path, 'mission.sqm'))}`;
    const regex = new RegExp(/^version/);
    
    if (regex.test(fileContent)) {
        report = initMissionFieldError(true, "Le fichier mission n'est pas binarisé", false);
    } else {
        report = initMissionFieldError(false, "Le fichier mission est binarisé", true);
    }

    return report;
}

function checkForHC(path: string) {
    let report: MissionFieldError;

    const fileContent = `${readFileSync(join(path, 'mission.sqm'))}`;
    const regex = new RegExp(/.*name="HC_Slot";\s*isPlayable=1;[^type="HeadlessClient_F";]/m);

    if (regex.test(fileContent)) {
        report = initMissionFieldError(true, "La mission a un HC", false);
    } else {
        report = initMissionFieldError(false, "La mission n'a pas de HC", true);
    }

    return report;
}