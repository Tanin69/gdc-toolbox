/**
 *
 * Checks a pbofile to control its conformity and integrity
 * Used by : missionCheckController
 * @param {String} filename - the mission path and filename (posix format, a .pbo file) to be checked
 * @param {Object} [config] - A JSON object that defines which controls should be blocking
 *      Each config value can be undefined or defined individually.
 * @returns {Object} - A Json object with return values
 */

const fs = require("fs");
const { spawnSync } = require("child_process");
const path = require("path");
const klawSync = require("klaw-sync");
const dotenv = require("dotenv");

//Read environment variables
dotenv.config();

//DBG variable
const DBG_PREF = "DBG/checkMission.js->";

exports.checkMission = function (fileName, config) {

    //Default configuration values
    const checkConfig = {
        "block_fileIsPbo": true,
        "block_filenameConvention": true,
        "block_descriptionExtFound": false,
        "block_missionSqmFound": true,
        "block_briefingSqfFound": true,
        "block_missionSqmNotBinarized": false,
        "block_HCSlotFound": false,
    };

    //Reads configuration parameter
    if (config) {
        if (config.block_fileIsPbo !== undefined) checkConfig.block_fileIsPbo = config.block_fileIsPbo;
        if (config.block_filenameConvention !== undefined) checkConfig.block_filenameConvention = config.block_filenameConvention;
        if (config.block_descriptionExtFound !== undefined) checkConfig.block_descriptionExtFound = config.block_descriptionExtFound;
        if (config.block_missionSqmFound !== undefined) checkConfig.block_missionSqmFound = config.block_missionSqmFound;
        if (config.block_briefingSqfFound !== undefined) checkConfig.block_briefingSqfFound = config.block_briefingSqfFound;
        if (config.block_missionSqmNotBinarized !== undefined) checkConfig.block_missionSqmNotBinarized = config.block_missionSqmNotBinarized;
        if (config.block_HCSlotFound !== undefined) checkConfig.block_HCSlotFound = config.block_HCSlotFound;
    }

    //    fileNamePath = process.env.UPLOAD_DIR + fileName;

    fileNamePath = fileName;
    baseName = path.basename(fileName);
    console.info(`${DBG_PREF} ${baseName} : début de check du pbo`);

    jsonR = {
        "fileIsPbo": { "isOK": false, "isBlocking": checkConfig.block_fileIsPbo, "label": "Le fichier est un pbo valide" },
        "filenameConvention": { "isOK": false, "isBlocking": checkConfig.block_filenameConvention, "label": "La convention de nommage est respectée" },
        "descriptionExtFound": { "isOK": false, "isBlocking": checkConfig.block_descriptionExtFound, "label": "Le fichier description.ext a été trouvé" },
        "missionSqmFound": { "isOK": false, "isBlocking": checkConfig.block_missionSqmFound, "label": "Le fichier mission.sqm a été trouvé" },
        "briefingSqfFound": { "isOK": false, "isBlocking": checkConfig.block_briefingSqfFound, "label": "Le fichier briefing.sqf a été trouvé" },
        "missionSqmNotBinarized": { "isOK": false, "isBlocking": checkConfig.block_missionSqmNotBinarized, "label": "Le mission.sqm n'est pas binarisé" },
        "HCSlotFound": { "isOK": false, "isBlocking": checkConfig.block_HCSlotFound, "label": "Le slot Headless Client (HC_Slot) est présent et conforme" },
        "isMissionValid": true,
        "nbBlockingErr": 0,
    };

    //-Wether file is really a pbo file
    try {
        const retDpbo = spawnSync(process.env.DEPBO_EXE_PATH, ["-P", fileNamePath, process.env.TMP_DIR]);
        switch (retDpbo.status) {
            //The file had been DPBO with success in the TMP_DIR
            case 0:
                jsonR.fileIsPbo.isOK = true;
                break;
            //The file already exists en TMP_DIR (when might this occur ?)
            case 56:
                console.warn(`${DBG_PREF} ${baseName} - Warn: file already exists in TMP_DIR`);
                break;
            //The DBPO has failed -> not a PBO or corrupted PBO -> Returns immediatly because the rest will fail
            case 1:
                if (checkConfig.block_fileIsPbo) {
                    console.warn(`${DBG_PREF} ${baseName} - Warn:Mikero's extractPBO failed`);
                    jsonR = {
                        "fileIsPbo": { "isOK": false, "isBlocking": true, "label": "Le fichier est un pbo valide" },
                        "isMissionValid": false,
                        "nbBlockingErr": 1,
                    };
                    return jsonR;
                }
        }
    }
    catch (err) {
        console.error(`${DBG_PREF} - Error: ${err}`);
        jsonR.isMissionValid = false;
        return jsonR;
    }

    regex = new RegExp(/(CPC-.*]-.*)-V(\d*)\.(.*)(\.pbo)/i);
    const match = regex.exec(baseName);
    //-Checks mission file naming convention
    if (match) {
        jsonR.filenameConvention.isOK = true;
    } else {
        if (checkConfig.block_filenameConvention) invalidMission(jsonR);
    }
    const missionDir = baseName.replace(/(.+).pbo/, "$1");
    //-Checks if the mission.sqm file exists
    if (fs.existsSync(process.env.TMP_DIR + missionDir + "/mission.sqm")) { // Vérifier la casse !
        jsonR.missionSqmFound.isOK = true;
    } else {
        if (checkConfig.block_missionSqmFound) invalidMission(jsonR);
    }
    //-Checks if the description.ext file exists
    if (fs.existsSync(process.env.TMP_DIR + missionDir + "/description.ext")) {
        jsonR.descriptionExtFound.isOK = true;
    } else {
        if (checkConfig.block_descriptionExtFound) invalidMission(jsonR);
    }
    //-Checks if the briefing.sqf file exists (recursive search with klaw-sync module)
    const filterFn = item => path.basename(item.path).toLowerCase() === "briefing.sqf";
    const retKlaw = klawSync(process.env.TMP_DIR + missionDir, { traverseAll: true, filter: filterFn });
    if (retKlaw[0]) {
        jsonR.briefingSqfFound.isOK = true;
    } else {
        if (checkConfig.block_briefingSqfFound) invalidMission(jsonR);
    }
    //-If a mission.sqm has benn found, checks if mission.sqm is binarized (weak checking !)
    if (jsonR.missionSqmFound) {
        const dataStr = String(fs.readFileSync(process.env.TMP_DIR + missionDir + "/mission.sqm"));
        regex = new RegExp(/^version/);
        const retBin = regex.exec(dataStr);
        if (retBin) {
            jsonR.missionSqmNotBinarized.isOK = true;
        } else {
            if (checkConfig.block_missionSqmNotBinarized) invalidMission(jsonR);
        }

        //-Checks if a HC Slot (named HC_Slot) exists in the mission.sqm file, if it is declared isPlayable=1 and if type="HeadlessClient_F".
        //-Warning : if mission.sqm is binarized, this control will always fail.
        //Open mission.sqm
        regex = new RegExp(/.*name="HC_Slot";\s*isPlayable=1;[^type="HeadlessClient_F";]/m);
        const retHCSearch = regex.exec(dataStr);
        if (retHCSearch) {
            jsonR.HCSlotFound.isOK = true;
        } else {
            if (checkConfig.block_HCSlotFound) invalidMission(jsonR);
        }
        if (jsonR.isMissionValid) {
            console.info(`${DBG_PREF} ${baseName} : résultat du check : le pbo est valide`);
        } else {
            console.warn(`${DBG_PREF} ${baseName} - Warn: mission non valide (${jsonR.nbBlockingErr} erreur(s) bloquante(s))`);
        }
    }
    return jsonR;
};

function invalidMission(json) {
    json.isMissionValid = false;
    json.nbBlockingErr++;
}