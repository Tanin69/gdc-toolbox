/**
 *
 * Checks a pbofile to control its conformity and integrity
 * Used by : missionCheckController
 * @param {String} filename - the mission filename (a .pbo file) to be checked
 * @param {Object} [config] - A JSON object that defines which controls should be blocking
 *      Each config value can be undefined or defined individually.
 *      Default values are :
 *      {
 *       "block_fileIsPbo": true,
 *       "block_fileExtension": true,
 *       "block_fileNameConvention": true,
 *       "block_descriptionExtFound": false,
 *       "block_missionSqmFound": true,
 *       "block_briefingSqfFound": true,
 *       "block_isMissionValid": true,
 *      }
 * @returns {Object} - A Json object with return values
 */

const fs           = require("fs");
const {spawnSync}  = require("child_process");
const dotenv       = require("dotenv");

//Read environment variables
dotenv.config();

//DBG variable
const DBG_PREF = "DBG/checkMission.js->";

exports.checkMission = function (fileName, config) {

    //Default configuration values
    const checkConfig = {
        "block_fileIsPbo": true,
        "block_fileExtension": true,
        "block_fileNameConvention": true,
        "block_descriptionExtFound": false,
        "block_missionSqmFound": true,
        "block_briefingSqfFound": true,
        "block_isMissionValid": true,
    };

    //Reads configuration parameter
    if (config) {
        if (config.block_fileIsPbo !== undefined) checkConfig.block_fileIsPbo = config.block_fileIsPbo;
        if (config.block_fileExtension !== undefined) checkConfig.block_fileExtension = config.block_fileExtension;
        if (config.block_fileNameConvention !== undefined) checkConfig.block_fileNameConvention = config.block_fileNameConvention;
        if (config.block_descriptionExtFound !== undefined) checkConfig.block_descriptionExtFound = config.block_descriptionExtFound;
        if (config.block_missionSqmFound !== undefined) checkConfig.block_missionSqmFound = config.block_missionSqmFound;
        if (config.block_briefingSqfFound !== undefined) checkConfig.block_briefingSqfFound = config.block_briefingSqfFound;
        if (config.block_isMissionValid !== undefined) checkConfig.block_isMissionValid = config.block_isMissionValid;
    }

    const logLevel = 2;
    l_fileName = process.env.UPLOAD_DIR + fileName;
    console.log(`${DBG_PREF} Début de check du pbo: ${l_fileName}`);
    
    jsonR = {
        //"pboDoesntExist": true, -> not the responsability of this function ! 
        "fileIsPbo": {"isOK": false,"isBlocking": checkConfig.block_fileIsPbo, "label": "Le fichier est un pbo valide"},
        "fileExtension": {"isOK": false,"isBlocking": checkConfig.block_fileExtension, "label": "L'extension du fichier est .pbo"},
        "fileNameConvention": {"isOK": false,"isBlocking": checkConfig.block_fileNameConvention, "label": "La convention de nommage est respectée"},
        "descriptionExtFound": {"isOK": false,"isBlocking": checkConfig.block_descriptionExtFound, "label": "Le fichier description.ext a été trouvé"},
        "missionSqmFound": {"isOK": false,"isBlocking": checkConfig.block_missionSqmFound, "label": "Le fichier mission.sqm a été trouvé"},
        "briefingSqfFound": {"isOK": false,"isBlocking": checkConfig.block_briefingSqfFound, "label": "Le fichier briefing.sqf a été trouvé"},
        "isMissionValid": true,
        "nbBlockingErr": 0,
    };
    
    //-Wether file is really a pbo file
    try {
        //console.log(`${DBG_PREF} Variable ENV DPBO_PATH: ${process.env.DEPBO_EXE_PATH}`);
        const retDpbo = spawnSync(process.env.DEPBO_EXE_PATH, ["-P", l_fileName, process.env.TMP_DIR]);
        //console.log(`${DBG_PREF} Code retour ExtractPbo: ${retDpbo.status}`);
        switch (retDpbo.status) {
            //The file had been DPBO with success in the TMP_DIR
            case 0:
                jsonR.fileIsPbo.isOK = true;               
                //console.log(`${DBG_PREF} fileIsPbo: ${jsonR.fileIsPbo}`);
                break;
            //The file already exists en TMP_DIR (when might this occur ?)
            case 56:
                console.log (`${DBG_PREF} ERROR: file already exists in TMP_DIR`);
                break;
            //The DBPO has failed -> not a PBO or corrupted PBO -> Returns immediatly because the rest will fail
            case null:
                if (checkConfig.block_fileIsPbo) {
                    console.log (`${DBG_PREF} Mikero's extractPBO failed`);
                    jsonR.isMissionValid = false;
                    jsonR.nbBlockingErr ++;
                    return jsonR;    
                }
        }
    }
    catch (err) {
        console.log (`${DBG_PREF} UNEXPECTED ERROR: ${err}`);
        jsonR.isMissionValid = false;
        return jsonR;
    }
    //-Checks file extension : must be .pbo
    let regex = /.+\.pbo/ig;
    let match = regex.exec(l_fileName);
    if (match) {
        jsonR.fileExtension.isOK = true;
    } else {
        if (checkConfig.block_fileExtension) {
            jsonR.isMissionValid = false;
            jsonR.nbBlockingErr ++;
        }
    }    
    //-Checks mission file naming convention
    regex = new RegExp(/(CPC-.*]-.*)-V(\d*)\.(.*)\.pbo/i);
    match = regex.exec(l_fileName);
    if (match) {
        jsonR.fileNameConvention.isOK = true;
    } else {
        if (checkConfig.block_fileNameConvention) {
            jsonR.isMissionValid = false;
            jsonR.nbBlockingErr ++;
        }
    }
    const missionDir = l_fileName.replace(/.*\/.*?(.+)(.pbo)/,"$1");
    //-Checks if the mission.sqm file exists
    //console.log(`${DBG_PREF} Recherche de: ${process.env.TMP_DIR + missionDir + "/mission.sqm"}`);
    if (fs.existsSync(process.env.TMP_DIR + missionDir + "/mission.sqm")){ // Vérifier la casse !
        jsonR.missionSqmFound.isOK = true;
    } else {
        if (checkConfig.block_missionSqmFound) {
            jsonR.isMissionValid = false;
            jsonR.nbBlockingErr ++;
        }
    }
    //-Checks if the description.ext file exists
    if (fs.existsSync(process.env.TMP_DIR + missionDir + "/description.ext")){ // Vérifier la casse !
        jsonR.descriptionExtFound.isOK = true;
    } else {
        if (checkConfig.block_descriptionExtFound) {
            jsonR.isMissionValid = false;
            jsonR.nbBlockingErr ++;
        } 
        
    }
    //-Checks if the briefing.sqf file exists
    if (fs.existsSync(process.env.TMP_DIR + missionDir + "/briefing.sqf")){ // Vérifier la casse !
        jsonR.briefingSqfFound.isOK = true;
    } else {
        if (checkConfig.block_briefingSqfFound) {
            jsonR.isMissionValid = false;
            jsonR.nbBlockingErr ++;
        }
    }

    console.log(`${DBG_PREF} Résultat du checkMission:`);
    console.log(jsonR);
    return jsonR;

    //-Checks if pbo file already exists in destination missions directory
    /* Not this function responsability !
    if (fs.existsSync(process.env.MISSIONS_DIR + fileName)){
        jsonR.pboDoesntExist=false;
    }
    */
};