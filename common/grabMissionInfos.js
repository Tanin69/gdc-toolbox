const fs          = require("fs");
const {spawnSync} = require("child_process");
const dotenv      = require('dotenv');

// Read environment variables
dotenv.config();

/**
 *
 * Grabs many mission informations by reading file name, file infos and different files in the pbo 
 * @TODO: check if HC_slot exists
 * @TODO: replace map with a JSON object
 * @TODO: code a real error handling :-)
 * @param {string} filename - the mission filename to be checked
 * @returns {(Map)} - Map with return values
 */
exports.grabMissionInfos = function (fileName) {

    const logLevel = 2;
    l_fileName = process.env.UPLOAD_DIR + fileName;
    console.log(`DBG/missionCheckController.js/-> Début de check du fichier: ${l_fileName}`);

    //Initializes a map to store all mission infos, initializing all fields at their default value
    const mapRetour = new Map();
    mapRetour.set("pboDoesntExist", true);
    mapRetour.set("fileExtensionIsOk", false);     
    mapRetour.set("fileNameConventionIsOk", false);
    mapRetour.set("fileIsPbo", false);
    mapRetour.set("missionPbo", false);
    mapRetour.set("pboFileSize", NaN);
    mapRetour.set("pboFileDateM", false);
    mapRetour.set("owner", false);
    mapRetour.set("missionTitle", false);
    mapRetour.set("missionIsPlayable", false);
    mapRetour.set("missionVersion", NaN);
    mapRetour.set("missionMap", false);
    mapRetour.set("author", false);
    mapRetour.set("onLoadName", false);
    mapRetour.set("onLoadMission", false);
    mapRetour.set("overviewText", false);
    mapRetour.set("gameType", false);
    mapRetour.set("minPlayers", NaN);
    mapRetour.set("maxPlayers", NaN);
    mapRetour.set("missionBriefing", "");
    mapRetour.set("loadScreen", false);

    //Informations from uploaded file
    //-File extension
    let regex = /.+\.pbo/ig;
    let match = regex.exec(l_fileName);
    if (match) {
        mapRetour.set ("fileExtensionIsOk", true);
    }     
    //-Mission file naming convention
    regex = new RegExp(/(CPC-.*]-.*)-V(\d*)\.(.*)\.pbo/i);
    match = regex.exec(l_fileName);
    if (match) {
        mapRetour.set ("fileNameConventionIsOk", true);
    }
    //-File size, modification date from .pbo file infos
    try {
        const stats = fs.statSync(l_fileName);
        mapRetour.set ("pboFileSize", stats.size);
        mapRetour.set ("pboFileDateM", stats.mtime);
        console.log(`DBG/missionCheckController.js/-> taille du fichier sur le disque:${stats.size}`);
    } 
    catch (err) {
        //TODO: Améliorer la gestion de cette erreur (bon, OK et de toutes les autres)
        console.error(err);
    }
    //-Wether file is really a pbo file
    try {
        console.log(`DBG/missionCheckController.js/-> Variable ENV DPBO_PATH: ${process.env.DEPBO_EXE_PATH}`);
        const retDpbo = spawnSync(process.env.DEPBO_EXE_PATH, ["-P", l_fileName, process.env.TMP_DIR]);
        console.log("DBG/missionCheckController.js/-> Code retour ExtractPbo: " + retDpbo.status);
        switch (retDpbo.status) {
            case 0:
                mapRetour.set ("fileIsPbo", true);
                console.log(`DBG/missionCheckController.js/-> fileIsPbo: ${mapRetour.get("fileIsPbo")}`);
                break;
            case 56:
                console.log ("ERR: filealready exists on tmp dir");
                break;
            case null:
                console.log ("ERR: Mikero's extractPBO failed");
        }
    }
    catch (err) {
        console.log (err);
    }
    //-Checks is pbo file already exists in missions directory
    if (fs.existsSync(process.env.MISSIONS_DIR + fileName)){
        mapRetour.set ("pboDoesntExist", false);
    }

    //Splits mission name elements to grab infos
    const missionDir = l_fileName.replace(/.*\/.*?(.+)(.pbo)/,"$1");
    const matchMissionNameParts = regex.exec(fileName);
    if (matchMissionNameParts !== null) {
        mapRetour.set("missionTitle", matchMissionNameParts[1]);
        mapRetour.set("missionVersion", parseInt(matchMissionNameParts[2],10));
        mapRetour.set("missionMap", matchMissionNameParts[3]);
        mapRetour.set("missionPbo", fileName);
    }

  //Array of files used to grab mission info
  const infoFiles = ["description.ext","mission.sqm","briefing.sqf"];
  //Iterate over files to find information
  for (let infoFile of infoFiles) {
      //const infoFilePath = process.env.TMP_DIR + missionDir + "\\" + infoFile;
      const infoFilePath = process.env.TMP_DIR + missionDir + "/" + infoFile;
      console.log(`DBG/missionCheckController.js/-> infoFilePath: ${infoFilePath}`);
      try {
          const dataStr = String(fs.readFileSync(infoFilePath));
          switch (infoFile) {
              case "description.ext":
                  //Finds all the information available in the description.ext
                  mapRetour.set("descriptionExtFound", true);
                  mapRetour.set("author", searchMissionInfo("author", dataStr, logLevel));
                  mapRetour.set("onLoadName", searchMissionInfo("onLoadName", dataStr, logLevel));
                  mapRetour.set("onLoadMission", searchMissionInfo("onLoadMission", dataStr, logLevel));
                  mapRetour.set("overviewText", searchMissionInfo("overviewText", dataStr, logLevel));
                  mapRetour.set("gameType", searchMissionInfo("gameType", dataStr, logLevel));
                  mapRetour.set("minPlayers", parseInt(searchMissionInfo("minPlayers", dataStr, logLevel),10));
                  mapRetour.set("maxPlayers", parseInt(searchMissionInfo("maxPlayers", dataStr, logLevel),10));
                  //Copy image mission in output directory and rename the file based on mission name
                  missionImageFileName = searchMissionInfo("loadScreen", dataStr, logLevel);
                  if (missionImageFileName != false) {
                      ret = copyMissionImage (missionImageFileName, missionDir);
                      console.log(`DBG/missionCheckController.js/-> valeur de retour de copuMissionImage: ${ret}`);
                      if (ret === undefined) {
                          mapRetour.set("loadScreen", `${missionDir}.${missionImageFileExt}`);
                      } else if (ret.errno === -4058) {
                          mapRetour.set("loadScreen", `${missionImageFileName}: image referenced in loadScreen, but image file not found in the pbo !`); 
                      } else {
                          mapRetour.set("loadScreen", ret); 
                      }
                  }
                  else {
                      mapRetour.set("loadScreen", false);
                  }
                  break;
              case "mission.sqm":
                  //We complete the information not found in the description.ext by searching in the mission.sqm, by iterating on each false value in missionMap
                  mapRetour.set("missionSqmFound", true);
                  for (const [key, value] of mapRetour.entries()) {
                      if (value === false) {
                        //In missions.sqf file, there are many "author" strings : mods authors, etc.  
                        if (key === "author") {
                              const regex = new RegExp(/class ScenarioData\s*{\s*author="(.*)"/gm);
                              const match = regex.exec(dataStr);
                              if (match !== null) {
                                match[1] = match[1].replace(/\"/g,"");
                                mapRetour.set(key, match[1]);
                              }
                          }
                          else if (key === "loadScreen") {
                              missionImageFileName = searchMissionInfo("loadScreen", dataStr, logLevel);
                              if (missionImageFileName != false) {
                                  ret = copyMissionImage (missionImageFileName, missionDir);
                                  console.log(`DBG/missionCheckController.js/-> valeur de retour de copyMissionImage: ${ret}`); 
                                  if (ret === undefined) {
                                      mapRetour.set("loadScreen", `${missionDir}.${missionImageFileExt}`);
                                  } else if (ret.errno === -4058) {
                                      mapRetour.set("loadScreen", `${missionImageFileName}: image referenced in loadScreen, but image file not found in the pbo !`); 
                                  } else {
                                      mapRetour.set("loadScreen", ret);
                                  }
                              }
                          }
                          else {
                              mapRetour.set(key, searchMissionInfo(key, dataStr, logLevel));
                          }
                      }
                      else {
                          if ((key === "minPlayers" && isNaN(value)) || (key === "maxPlayers" && isNaN(value))) {
                              //console.log ("Recherche de: " + key);
                              mapRetour.set(key, parseInt(searchMissionInfo(key, dataStr, logLevel),10));
                          }
                      }
                  }
                  break;
              case "briefing.sqf":
                mapRetour.set("briefingSqfFound", true);
                ret = buildBriefing(infoFilePath);
                mapRetour.set("missionBriefing",ret);
                break;
          }
      } catch (e) {
          // One of the files had not benn found
          if (e.errno === -4058) {
              //If the description.ext file is not found, the map data is created with "empty" values (false, etc.)
            console.log(infoFile + " not found");
          } else {
              console.error(e);
          }
      }
  }
  //WARNING : fs.rmdirSync experimental in node -> removes mission directory
  fs.rmdirSync(process.env.TMP_DIR+missionDir, {recursive: true});

  return mapRetour;

};

/**
 *
 * Helper function to copy an image and rename it with the mission name
 * @param {string} missionImageFileName - a image filename referenced in onLoad field in description.ext or mission/sqm
 * @param {string} missionDir - mission directory after depbo
 * @returns {(object|boolean)} - error if failure or true if success
 */
function copyMissionImage (missionImageFileName,missionDir) {
  //Be careful ! regex must match with directory separator
  missionImageFileExt = missionImageFileName.replace(/.*\.(.*)/i,"$1");
  const sourceMissionImageFile = process.env.TMP_DIR + missionDir + "/" + missionImageFileName;
  const destMissionImageFile = process.env.OUTPUT_DIR + missionDir + "." + missionImageFileExt;
  try {
      fs.copyFileSync(sourceMissionImageFile, destMissionImageFile);
      //return true;
  }
  catch(e) {
      //console.log(e);
      return e;
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
    
    console.log (`DBG/missionCheckController.js/-> construction du briefing: ${sqfPath}`);
                
    //Look for createDiaryRecord entries
    const regex = /player.*creatediaryrecord\s*\[\s*"\s*diary\s*"\s*,\s*\[\s*"([^"]*)"\s*,\s*"([^"]*)/gmi;
    let str = fs.readFileSync(sqfPath, {encoding: "UTF-8"} );
    //console.log("DBG/missionCheckController.js/-> contenu du fichier briefing.sqf: " + str);
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
        //Store tab title and cleaned tab content in the output array
        brfElements.push([m[1],m[2]]);
    }
    // We have to reverse the array, thanks to Bohemia briefing format ;-)
    brfElements.reverse();
    //console.log("DBG/missionCheckController.js/-> contenu du tableau de sortie brfElements: ");
    //console.log(brfElements);

    return brfElements;

    //TODO: look for createSimpleTask and setSimpleTaskDescription
}