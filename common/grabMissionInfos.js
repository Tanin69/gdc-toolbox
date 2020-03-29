/**
 *
 * Grabs many mission informations by reading file name, file infos and different files in the pbo
 * Used by : missionCheckCOntroller
 * @TODO: code a real error handling :-)
 * @param {String} filename - the mission filename (a .pbo file) to be analyzed
 * @returns {Object} - A Json object with return values
 */

const fs           = require("fs");
const dotenv       = require("dotenv");
const sanitizeHtml = require("sanitize-html");

// Read environment variables
dotenv.config();

//DBG variable
const DBG_PREF = "DBG/grabMissionInfos.js->";

exports.grabMissionInfos = function (fileName) {

    console.log(`${DBG_PREF} Début de l'analyse de la mission: ${fileName}`);

    //Json object initialization : all values default to false. A value is changed to true or anything else only if grabbing is successfull
    jsonRetour = {
        "missionPbo": false,
        "pboFileSize": false,
        "pboFileDateM": false,
        //TODO: mission owner handling
        "owner": "admin",
        "missionTitle": false,
        "missionIsPlayable": false,
        "missionVersion": false,
        "missionMap": false,
        "author": false,
        "onLoadName": false,
        "onLoadMission": false,
        "overviewText": false,
        "gameType": false,
        "minPlayers": false,
        "maxPlayers": false,
        "missionBriefing": false,
        "loadScreen": false,
    };

    const l_fileName = process.env.UPLOAD_DIR + fileName;
    const logLevel = 2;

    //-File size, modification date from .pbo file infos
    try {
        const stats = fs.statSync(l_fileName);
        jsonRetour.pboFileSize = stats.size;
        jsonRetour.pboFileDateM = stats.mtime;      
        //console.log(`${DBG_PREF} Taille du fichier sur le disque:${stats.size}`);
    } 
    catch (err) {
        //TODO: Améliorer la gestion de cette erreur (bon, OK et de toutes les autres)
        console.error(err);
    }

    //Splits mission name elements to grab infos
    const missionDir = l_fileName.replace(/.*\/.*?(.+)(.pbo)/,"$1");
    regex = new RegExp(/(CPC-.*]-.*)-V(\d*)\.(.*)\.pbo/i);
    const matchMissionNameParts = regex.exec(fileName);
    if (matchMissionNameParts !== null) {
        jsonRetour.missionTitle = matchMissionNameParts[1];
        jsonRetour.missionVersion = parseInt(matchMissionNameParts[2],10);
        jsonRetour.missionMap = matchMissionNameParts[3];
        jsonRetour.missionPbo = fileName;
    }
    //Array of files used to grab mission info
    const infoFiles = ["description.ext","mission.sqm","briefing.sqf"];
    //Iterate over files to find information
    for (let infoFile of infoFiles) {
      const infoFilePath = process.env.TMP_DIR + missionDir + "/" + infoFile;
      try {
          const dataStr = String(fs.readFileSync(infoFilePath));
          switch (infoFile) {
            case "description.ext":
                //console.log(`${DBG_PREF} Analyse de: ${infoFile}`);
                //Finds all the information available in the description.ext
                jsonRetour.author              = searchMissionInfo("author", dataStr, logLevel);
                jsonRetour.onLoadName          = searchMissionInfo("onLoadName", dataStr, logLevel);
                jsonRetour.onLoadMission       = searchMissionInfo("onLoadMission", dataStr, logLevel);
                jsonRetour.overviewText        = searchMissionInfo("overviewText", dataStr, logLevel);
                jsonRetour.gameType            = searchMissionInfo("gameType", dataStr, logLevel);
                jsonRetour.minPlayers          = parseInt(searchMissionInfo("minPlayers", dataStr, logLevel),10);
                jsonRetour.maxPlayers          = parseInt(searchMissionInfo("maxPlayers", dataStr, logLevel),10);
                //Copy image mission in output directory and rename the file based on mission name
                missionImageFileName = searchMissionInfo("loadScreen", dataStr, logLevel);
                //console.log(`${DBG_PREF} Valeur de retour de missionImageFileName: ${missionImageFileName}`);
                if (missionImageFileName) {
                    retCopyImg = copyMissionImage (missionImageFileName, missionDir);
                    //console.log(`${DBG_PREF} Valeur de retour de copyMissionImage: ${retCopyImg}`);
                    if (retCopyImg) {
                        //Image file name returned as a string by copyMissionImage function
                        if (typeof retCopyImg === "string") {
                            jsonRetour.loadScreen = retCopyImg;
                        //Image file not found in pbo (mission maker error)
                        } else if (retCopyImg === -4058) {
                            jsonRetour.loadScreen = `${missionImageFileName}: image referenced in loadScreen, but image file not found in the pbo !`;
                        }
                    } 
                    
                } else {
                    jsonRetour.loadScreen = false;
            }
            break;
            case "mission.sqm":
                //console.log(`${DBG_PREF} Analyse de: ${infoFile}`);
                jsonRetour.missionSqmFound = true;
                //We complete the information not found in the description.ext file by searching in the mission.sqm file, by iterating on each false value in missionMap
                for (const key in jsonRetour) {
                    if (!jsonRetour[key]) {
                        //console.log(`${DBG_PREF} Dans mission.sqm: recherche de ${key}`);
                        switch (key) {
                            //In missions.sqf file, there are many "author" strings : mods authors, etc.  
                            case "author":
                                const regex = new RegExp(/class ScenarioData\s*{\s*author="(.*)"/gm);
                                const match = regex.exec(dataStr);
                                if (match !== null) {
                                    match[1] = match[1].replace(/\"/g,"");
                                    jsonRetour[key] = match[1];
                                }
                                break;
                            case "loadScreen":
                                missionImageFileName = searchMissionInfo("loadScreen", dataStr, logLevel);
                                if (missionImageFileName) {
                                    retCopyImg = copyMissionImage (missionImageFileName, missionDir);
                                    //console.log(`${DBG_PREF} Valeur de retour de copyMissionImage: ${retCopyImg}`);
                                    if (retCopyImg) {
                                        //Image file name returned as a string by copyMissionImage function
                                        if (typeof retCopyImg === "string") {
                                            jsonRetour.loadScreen = retCopyImg;
                                        //Image file not found in pbo (mission maker error)
                                        } else if (retCopyImg === -4058) {
                                            jsonRetour.loadScreen = `${missionImageFileName}: image referenced in loadScreen, but image file not found in the pbo !`;
                                        }
                                    
                                    }
                                }
                                break;
                            case (("minPlayers" && !(jsonRetour[key])) || (key === "maxPlayers" && isNaN(jsonRetour[key]))):
                                jsonRetour[key] = parseInt(searchMissionInfo(key, dataStr, logLevel),10);
                                break;
                            default:
                                jsonRetour[key] = searchMissionInfo(key, dataStr, logLevel);    
                        }
                    }
                }
                break;
            case "briefing.sqf":
                //console.log(`${DBG_PREF} Analyse de: ${infoFile}`);
                jsonRetour.briefingSqfFound = true;
                ret = buildBriefing(infoFilePath);
                jsonRetour.missionBriefing = ret;
                break;
            }
        } catch (e) {
            // One of the files was not found
            if (e.errno === -4058) {
                console.log(`${DBG_PREF} ${infoFile} not found`);
            } else {
                console.error(e);
            }
        }
    }
    //WARNING : fs.rmdirSync experimental in node -> removes mission directory
    fs.rmdirSync(process.env.TMP_DIR+missionDir, {recursive: true});

    console.log(`${DBG_PREF} Fin d'analyse du fichier`);
    return jsonRetour;

};

/**
 *
 * Helper function to copy an image and rename it with the mission name
 * @param {String} missionImageFileName - a image filename referenced in onLoad field in description.ext or mission/sqm
 * @param {String} missionDir - mission directory after depbo
 * @returns {(String|Number)} - image destination filename if success or false if failure 
 */
function copyMissionImage (missionImageFileName,missionDir) {
    //Be careful ! regex must match with directory separator
    missionImageFileExt = missionImageFileName.replace(/.*\.(.*)/i,"$1");
    const sourceMissionImageFile = process.env.TMP_DIR + missionDir + "/" + missionImageFileName;
    const destMissionImageFile = process.env.OUTPUT_DIR + missionDir + "." + missionImageFileExt;
    try {
        fs.copyFileSync(sourceMissionImageFile, destMissionImageFile);
        return missionDir + "." + missionImageFileExt;
    }
    catch(e) {
        console.log (`${DBG_PREF} UNEXPECTED ERROR in CopyImageFile: ${retCopyImg}`);
        return false;
    } 
}

/** 
 *
 * Helper function to look for a mission info with a regex
 * @param {string} infoMission - which mission info to look for
 * @param {string} dataStr - file content as a string
 * @param {number} logLevel - log level, as passed to readMissionInfo function
 * @returns {(boolean|string)} - false if mission info is not found, mission info otherwise
 * @todo : if needed, pass regex as a param
 */
function searchMissionInfo (infoMission, dataStr, logLevel) {
  const regex = new RegExp("\\s*" + infoMission + "\\s*=\\s*(.*);","i");
  const match = regex.exec(dataStr);
  if (match === null) {
      return false;
  } else {
      match[1] = match[1].replace(/\"/g,"");
      return match[1];
  }                    
}

/** 
 *
 * Build an array containing appropriate briefing elements by reading a briefing.sqf file
 * @param {String} sqfPath - path to briefing.sqf file
 * @returns {(Boolean|Array)} - false in case of failure, 2D array of strings otherwise : [["tabTitle_1","tabContent_1"],...,["tabTitle_n","tabContent_n"]]
 */
function buildBriefing(sqfPath) {
    //Array that stores the briefing elements. Returned to calling function.
    const brfElements = [];
    
    console.log (`${DBG_PREF} Construction du briefing: ${sqfPath}`);
                
    //Look for createDiaryRecord entries
    const regex = /player.*creatediaryrecord\s*\[\s*"\s*diary\s*"\s*,\s*\[\s*"([^"]*)"\s*,\s*"([^"]*)/gmi;
    let str = fs.readFileSync(sqfPath, {encoding: "UTF-8"} );
    //console.log(`${DBG_PREF} Contenu du fichier briefing.sqf: ${str}`);
    let m;
    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        //console.log("DBG/missionCheckController.js/-> Extraction du briefing :\n\n***" + m[1] + "\n" + m[2]);
        //m[1] (capture group $1) is the tab title, m[2] ($2 the tab content). Add it all to array
        //Cleaning tab content : line end
        m[2] = m[2].replace(/\r?\n/gi,"");
        //Cleaning tab content : <marker... tags
        m[2] = m[2].replace(/(<\s*marker\s*name\s*='\S+'>)([^>]*)(<\/marker>)/gi,"$2");
        //Cleaning tab content : <img... tags
        m[2] = m[2].replace(/(<\s*img[^>]*>)/gi,"");
        //Sanitizises html to prevent code injection
        m[1]=sanitizeHtml(m[1]);
        m[2]=sanitizeHtml(m[2], {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'font' ]),
            allowedAttributes: {
                font: ['color']
            },
        });
        //console.log(`${DBG_PREF}tabContent sanitized: ${m[2]}`);
        //Store tab title and cleaned tab content in the output array
        brfElements.push([m[1],m[2]]);
    }
    // We have to reverse the array, thanks to Bohemia briefing format ;-)
    brfElements.reverse();
    //console.log(`${DBG_PREF} Contenu du tableau de sortie brfElements: `);
    //console.log(brfElements);

    return brfElements;

    //TODO: look for createSimpleTask and setSimpleTaskDescription
}