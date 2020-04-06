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
const klawSync     = require("klaw-sync");
const path         = require("path");

// Read environment variables
dotenv.config();

//DBG variable
const DBG_PREF = "DBG/grabMissionInfos.js->";

exports.grabMissionInfos = function (fileName) {

    const l_fileName = fileName; //clean this variable !
    const baseName = path.basename(fileName);

    console.log(`${DBG_PREF} ${baseName} : début de l'analyse de la mission`);

    //Json object initialization : all values default to false. A value is changed to true or anything else only if grabbing is successfull
    jsonRetour = {
        "missionTitle": {"val": false, "label": "Titre de la mission"},
        "missionVersion": {"val": false, "label": "Version de la mission"},
        "missionMap": {"val": false, "label": "Carte de la mission"},
        "gameType": {"val": false, "label": "Type de jeu"},
        "author": {"val": false, "label": "Auteur de la mission"},
        "minPlayers": {"val": false, "label": "Nombre minimum de joueurs"},
        "maxPlayers": {"val": false, "label": "Nombre maximum de joueurs"},
        "onLoadName": {"val": false, "label": "Titre de l'écran de chargement"},
        "onLoadMission": {"val": false, "label": "Texte de l'écran de chargement"},
        "overviewText": {"val": false, "label": "Texte du lobby"},
        "missionPbo": {"val": false, "label": "Nom du fichier pbo"},
        "pboFileSize": {"val": false, "label": "Taille du fichier pbo"},
        "pboFileDateM": {"val": false, "label": "Date de publication de la mission"},
        //TODO: mission owner handling
        "owner": {"val": "admin", "label": "Propriétaire de la mission"},
        "missionIsPlayable": {"val": false, "label": "La mission est jouable"},
        "missionBriefing": {"val": false, "label": "Briefing de mission"},
        "loadScreen": {"val": false, "label": "Image de l'écran de chargement"},
        "IFA3mod": {"val": false, "label": "Mission IFA3"},
    };

    //-File size, modification date from .pbo file infos
    try {
        const stats = fs.statSync(fileName);
        jsonRetour.pboFileSize.val = stats.size;
        jsonRetour.pboFileDateM.val = stats.mtime;      
    } 
    catch (err) {
        //TODO: Améliorer la gestion de cette erreur (bon, OK et de toutes les autres)
        console.error(err);
    }

    //Splits mission name elements to grab infos
    const missionDir = baseName.replace(/(.+)(.pbo)/,"$1");
    regex = new RegExp(/(CPC-.*]-.*)-V(\d*)\.(.*)\.pbo/i);
    const matchMissionNameParts = regex.exec(fileName);
    if (matchMissionNameParts !== null) {
        jsonRetour.missionTitle.val = matchMissionNameParts[1];
        jsonRetour.missionVersion.val = parseInt(matchMissionNameParts[2],10);
        jsonRetour.missionMap.val = matchMissionNameParts[3];
        jsonRetour.missionPbo.val = baseName;
    }
    //Array of files used to grab mission info
    const infoFiles = ["description.ext","mission.sqm","briefing.sqf"];
    //Iterate over these files to find information
    for (let infoFile of infoFiles) {
      //const infoFilePath = process.env.TMP_DIR + missionDir + "/" + infoFile;
      const filterFn = item => path.basename(item.path).toLowerCase() === infoFile;
      try {
        const retPath = klawSync(process.env.TMP_DIR + missionDir, {traverseAll: true, filter: filterFn});
        if (retPath.length > 0) {
            const infoFilePath = retPath[0].path;
            //console.log(`${DBG_PREF} ****** infoFilePath: ${infoFilePath}`);
            const dataStr = String(fs.readFileSync(infoFilePath));
            switch (infoFile) {
                case "description.ext":
                    //console.log(`${DBG_PREF} Analyse de: ${infoFile}`);
                    //Finds all the information available in the description.ext
                    jsonRetour.author.val              = searchMissionInfo("author", dataStr);
                    jsonRetour.onLoadName.val          = searchMissionInfo("onLoadName", dataStr);
                    jsonRetour.onLoadMission.val       = searchMissionInfo("onLoadMission", dataStr);
                    jsonRetour.overviewText.val        = searchMissionInfo("overviewText", dataStr);
                    jsonRetour.gameType.val            = searchMissionInfo("gameType", dataStr);
                    jsonRetour.minPlayers.val          = parseInt(searchMissionInfo("minPlayers", dataStr),10);
                    jsonRetour.maxPlayers.val          = parseInt(searchMissionInfo("maxPlayers", dataStr),10);
                    //Copy image mission in output directory and rename the file based on mission name
                    missionImageFileName = searchMissionInfo("loadScreen", dataStr);
                    //console.log(`${DBG_PREF} Valeur de retour de missionImageFileName: ${missionImageFileName}`);
                    if (missionImageFileName) {
                        retCopyImg = copyMissionImage (missionImageFileName, missionDir);
                        //console.log(`${DBG_PREF} Valeur de retour de copyMissionImage: ${retCopyImg}`);
                        if (retCopyImg) {
                            //Image file name returned as a string by copyMissionImage function
                            if (typeof retCopyImg === "string") {
                                jsonRetour.loadScreen.val = retCopyImg;
                            //Image file not found in pbo (mission maker error)
                            } else if (retCopyImg === -4058) {
                                jsonRetour.loadScreen.val = `${missionImageFileName}: Image not found`;
                            }
                        } 
                        
                    } else {
                        jsonRetour.loadScreen.val = false;
                }
                break;
                case "mission.sqm":
                    //console.log(`${DBG_PREF} Analyse de: ${infoFile}`);
                    //We complete the information not found in the description.ext file by searching in the mission.sqm file, by iterating on each false value in missionMap
                    for (const key in jsonRetour) {
                        if (!jsonRetour[key].val) {
                            //console.log(`${DBG_PREF} Dans mission.sqm: recherche de ${key}`);
                            switch (key) {
                                //In missions.sqf file, there are many "author" strings : mods authors, etc.  
                                case "author":
                                    const regex = new RegExp(/class ScenarioData\s*{\s*author="(.*)"/gm);
                                    const match = regex.exec(dataStr);
                                    if (match !== null) {
                                        match[1] = match[1].replace(/\"/g,"");
                                        jsonRetour[key].val = match[1];
                                    }
                                    break;
                                case "loadScreen":
                                    missionImageFileName = searchMissionInfo("loadScreen", dataStr);
                                    if (missionImageFileName) {
                                        retCopyImg = copyMissionImage (missionImageFileName, missionDir);
                                        //console.log(`${DBG_PREF} Valeur de retour de copyMissionImage: ${retCopyImg}`);
                                        if (retCopyImg) {
                                            //Image file name returned as a string by copyMissionImage function
                                            if (typeof retCopyImg === "string") {
                                                jsonRetour.loadScreen.val = retCopyImg;
                                            //Image file not found in pbo (mission maker error)
                                            } else if (retCopyImg === -4058 || !retCopyImg) {
                                                jsonRetour.loadScreen.val = `${missionImageFileName}: Image not found`;
                                            }
                                        }
                                    }
                                    break;
                                case (("minPlayers" && !(jsonRetour.minPlayers.val)) || "maxPlayers" && !(jsonRetour.maxPlayers.val)):
                                    jsonRetour[key].val = parseInt(searchMissionInfo(key, dataStr),10);
                                    break;
                                case "IFA3mod":
                                    const regIFA = new RegExp(/WW2_Core/gm);
                                    const matchIFA = regIFA.exec(dataStr);
                                    if (matchIFA !== null) {
                                        jsonRetour.IFA3mod.val = true;
                                    }
                                    break;
                                default:
                                    jsonRetour[key].val = searchMissionInfo(key, dataStr);    
                            }
                        }
                    }
                    break;
                case "briefing.sqf":
                    //console.log(`${DBG_PREF} Analyse de: ${infoFile}`);
                    jsonRetour.missionBriefing = buildBriefing(infoFilePath);
                    break;
            }
        }
        
      } catch (e) {
            // One of the files was not found
            if (e.errno === -4058) {
                console.log(`${DBG_PREF} ${baseName} : ${infoFile} not found`);
            } else {
                console.error(e);
            }
        }
    }
    //WARNING : fs.rmdirSync experimental in node -> removes mission directory
    fs.rmdirSync(process.env.TMP_DIR + missionDir, {recursive: true});

    console.log(`${DBG_PREF} ${baseName} : fin de l'analyse de la mission`);
    //console.log(`${DBG_PREF} ${baseName} : détail du résultat...`);
    //console.log(jsonRetour);
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
        return false;
    } 
}

/** 
 *
 * Helper function to look for a mission info with a regex
 * @param {string} infoMission - which mission info to look for
 * @param {string} dataStr - file content as a string
 * @returns {(boolean|string)} - false if mission info is not found, mission info otherwise
 * @todo : if needed, pass regex as a param
 */
function searchMissionInfo (infoMission, dataStr) {
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
                 
    //Look for createDiaryRecord entries
    const regex = /player.*creatediaryrecord\s*\[\s*"\s*diary\s*"\s*,\s*\[\s*"([^"]*)"\s*,\s*"([^"]*)/gmi;
    let str = fs.readFileSync(sqfPath, {encoding: "UTF-8"} );
    let m;
    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
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
        brfElements.push([m[1],m[2]]);
    }
    // We have to reverse the array, thanks to Bohemia briefing format ;-)
    brfElements.reverse();

    return brfElements;

    //TODO: look for createSimpleTask and setSimpleTaskDescription
}