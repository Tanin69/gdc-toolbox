// External module imports
const formidable  = require("formidable");
const fs          = require("fs");
const {spawnSync} = require("child_process");

//@TODO: make these variables global configuration variables (to look with /www/bin)
const DEPBO_EXE_PATH = "C:\\Program\ Files\ (x86)\\Mikero\\DePboTools\\bin\\Extractpbo.exe";
const TMP_DIR        = "D:\\Dev\\Projets\\GdC-Missions\\tmp\\";
const INPUT_DIR      = "D:\\Dev\\Projets\\gdc-server-dev\\uploads\\";
const OUTPUT_DIR     = "D:\\Dev\\Projets\\GdC-Missions\\output\\";

endStatus = 0;
endStatusMsg = "";

//Check a mission PBO and extract all mission informations : event listeners
exports.checkMission = function (req,res) {

  new formidable.IncomingForm().parse(req)
    
    //trap upload request to redirect it to the correct path
    .on("fileBegin", (name, file) => {
      file.path = "./uploads/" + file.name;
    })
    
    //here is the magic
    .on("file", (name, file) => {
      const fileName = file.name;
      let ret = checkFile (fileName);
      console.log("valeur de retour: " + ret);
      if (ret) {
        endStatus = 400;
        endStatusMsg = ret;
      }
      else {
        ret = grabMissionInfos (fileName);
        endStatus = 200;
        endStatusMsg = ret;
      }
    })

    //@TODO: end management
    .on("aborted", () => {
      console.error("Request aborted");
    })
    
    //Something has getting wrong (c'est parti en couille, faut le dire)
    .on("error", (err) => {
      console.error("Error", err);
      throw err;
    })
    
    //@TODO: end management (delete files uploaded, etc.)
    .on("end", () => {
      //Sends the result to dropzone client component
      console.log("fin de la transaction");
      res.status(endStatus).json(endStatusMsg);
    });


};


//Server side controls, better safe than sorry (ceinture et bretelles)
function checkFile (fileName) {
  
  const logLevel = 2;

  //-file extension
  let regex = /.+\.pbo/ig;
  let match = regex.exec(fileName);
  if (!match) {
    if (logLevel > 0 ) console.err("\x1b[31mERR: " + fileName + " - Extension de fichier de mission incorrecte -> mission non traitée\x1b[0m");
    return ('{"Erreur serveur : extension de fichier non conforme"}');
  }
  //-mission file naming convention
  regex = new RegExp(/(CPC-.*]-.*)-V(.*)\.(.*)/i);
  match = regex.exec(fileName);
  if (!match) {
      if (logLevel > 0 ) console.err("\x1b[31mERR: " + missionDir + " - Nom de mission non conforme -> mission non traitée\x1b[0m");
      return('{""Erreur serveur : nom de mission non conforme"}');
  }
  console.log ("OK: nom de mission conforme");
  //-Wether file is really a pbo file
  const retDpbo = spawnSync(DEPBO_EXE_PATH, ["-P", INPUT_DIR + fileName, TMP_DIR]);
  if (retDpbo.status != 0) {
    if (logLevel > 0 ) console.log("\x1b[31mERR: " + fileName + " - Le fichier de mission n'est pas un pbo ou est corrompu -> mission non traitée\x1b[0m");
    return('{"Erreur serveur : le fichier n\'est pas un pbo ou est corrompu"}');
  }
  return(false);
}

function grabMissionInfos (fileName) {

  const logLevel = 2;
  fileName = INPUT_DIR + fileName;

  //Split mission name elements to grab infos
  const missionDir = fileName.replace(/.*\\.*?(.+)(.pbo)/,"$1");
  const regex = new RegExp(/(CPC-.*]-.*)-V(.*)\.(.*)/i);
  const matchMissionNameParts = regex.exec(missionDir);

  //Initialize a map (and store previously acquired mission informations)
  const mapMission = new Map();
  mapMission.set("missionTitle",matchMissionNameParts[1]);
  mapMission.set("missionVersion",matchMissionNameParts[2]);
  mapMission.set("missionMap",matchMissionNameParts[3]);
  mapMission.set("missionPbo",missionDir + ".pbo");
  //Grab some informations by reading .pbo file infos
  try {
      const stats = fs.statSync(fileName);
      const missionFileSize = stats.size;
      mapMission.set("pboFileSize", missionFileSize);
      mapMission.set("pboFileDateM", stats.mtime);
  } 
  catch (err) {
      //TODO: Améliorer la gestion de cette erreur
      console.error(err);
  }
  //Array of files used to grab mission info
  //const infoFiles = ["description.ext","mission.sqm","briefing.sqf"];
  const infoFiles = ["description.ext","mission.sqm"];   
  //Iterate over files to find information
  for (let infoFile of infoFiles) {
      if (logLevel > 2 ) console.log("INF: Recherche du fichier " + infoFile);
      const infoFilePath = TMP_DIR + missionDir + "\\" + infoFile; 
      try {
          const dataStr = String(fs.readFileSync(infoFilePath));
          if (logLevel > 2 ) console.log("INF: " + infoFile + " trouvé dans " + fileName);
          switch (infoFile) {
              case "description.ext":
                  //Finds all the information available in the description.ext
                  if (logLevel > 2 ) console.log ("\x1b[34mINF: analyse du fichier " + infoFile + "\x1b[0m");
                  mapMission.set("author", searchMissionInfo("author", dataStr, logLevel));
                  mapMission.set("onLoadName", searchMissionInfo("onLoadName", dataStr, logLevel));
                  mapMission.set("onLoadMission", searchMissionInfo("onLoadMission", dataStr, logLevel));
                  mapMission.set("gameType", searchMissionInfo("gameType", dataStr, logLevel));
                  mapMission.set("minPlayers", parseInt(searchMissionInfo("minPlayers", dataStr, logLevel),10));
                  mapMission.set("maxPlayers", parseInt(searchMissionInfo("maxPlayers", dataStr, logLevel),10));
                  //Copy image mission in output directory and rename the file based on mission name
                  missionImageFileName = searchMissionInfo("loadScreen", dataStr, logLevel);
                  if (missionImageFileName != false) {
                      ret = copyMissionImage (missionImageFileName, missionDir);
                      if (ret.errno === undefined) {
                          mapMission.set("loadScreen", missionDir + "." + missionImageFileExt);
                      } else if (ret.errno === -4058) {
                          if (logLevel > 1 ) console.log("\x1b[33mWARN: " + missionImageFileName + " non trouvé dans le pbo !");
                          mapMission.set("loadScreen", missionImageFileName + ": image file not found !"); 
                      } else {
                          console.log(ret);
                          mapMission.set("loadScreen", ret); 
                      }
                  }
                  else {
                      mapMission.set("loadScreen", false);
                  }
                  break;
              case "mission.sqm":
                  if (logLevel > 2 ) console.log ("\x1b[34mINF: analyse du fichier " + infoFile + "\x1b[0m");
                  //We complete the information not found in the description.ext by searching in the mission.sqm, by iterating on each false value in missionMap
                  for (const [key, value] of mapMission.entries()) {
                      if (value === false) {
                          if (key === "author") {
                              const regex = new RegExp(/class ScenarioData\s*{\s*author="(.*)"/gm);
                              const match = regex.exec(dataStr);
                              if (match === null) {
                                  if (logLevel > 1 ) console.log("\x1b[33mWARN: " + key + " non trouvé\x1b[0m");
                              } else {
                                  if (logLevel > 2 ) console.log(`\x1b[32mINF: ` + key + ` trouvé: ${match[1]}\x1b[0m`);
                                  match[1] = match[1].replace(/\"/g,"");
                                  mapMission.set(key, match[1]);
                              } 
                          }
                          else if (key === "loadScreen") {
                              missionImageFileName = searchMissionInfo("loadScreen", dataStr, logLevel);
                              if (missionImageFileName != false) {
                                  ret = copyMissionImage (missionImageFileName, missionDir);
                                  if (ret.errno === undefined) {
                                      mapMission.set("loadScreen", missionDir + "." + missionImageFileExt);
                                  } else if (ret.errno === -4058) {
                                      if (logLevel > 1 ) console.log("\x1b[33mWARN: " + missionImageFileName + " non trouvé dans le pbo !");
                                      mapMission.set("loadScreen", missionImageFileName + ": image file not found !"); 
                                  } else {
                                      console.log(ret);
                                      mapMission.set("loadScreen", ret); 
                                  }
                              }
                          }
                          else {
                              mapMission.set(key, searchMissionInfo(key, dataStr, logLevel));
                          }
                      }
                      else {
                          if ((key === "minPlayers" && isNaN(value)) || (key === "maxPlayers" && isNaN(value))) {
                              //console.log ("Recherche de: " + key);
                              mapMission.set(key, parseInt(searchMissionInfo(key, dataStr, logLevel),10));
                          }
                      }
                  }
                  break;
              case "briefing.sqf":
                  if (logLevel > 2 ) console.log ("\x1b[34mINF: traitement du " + infoFile + "\x1b[0m");
                  break;
          }
      } catch (e) {
          if (e.errno === -4058) {
              //If the description.ext file is not found, the map data is created with "empty" values (false, etc.)
              if (infoFile === "description.ext") {
                  mapMission.set("author", false);
                  mapMission.set("onLoadName", false);
                  mapMission.set("onLoadMission", false);
                  mapMission.set("gameType", false);
                  mapMission.set("minPlayers", NaN);
                  mapMission.set("maxPlayers", NaN);
                  mapMission.set("loadScreen", false);

              }
              if (logLevel > 1 ) console.log ("\x1b[33mWARN: Fichier " + infoFile + " non trouvé.\x1b[0m");
          } else {
              console.error(e);
          }
      }
  }
  if (logLevel > 2 ) console.table(mapMission);
  //We convert the map into an object to facilitate the conversion to json
  const objMapMission = Object.fromEntries(mapMission);
  jsonData = JSON.stringify(objMapMission);
  console.log (jsonData);
  return jsonData;
  /*
  //We save the json file
  fs.writeFileSync(OUTPUT_DIR + missionDir +".json", jsonData, 'utf8', function (err) {
      if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return [0,"ERROR_WRITING_JSON"];
      }
      if (logLevel > 2 ) console.log("\x1b[32mINF: " + missionDir + ".json\x1b[0m" + " enregistré dans " + OUTPUT_DIR); 
  });
  return [1, OUTPUT_DIR + missionDir + ".json"];
  */
}

/**
 *
 * Helper function to copy an image and rename it with the mission name
 * @param {string} missionImageFileName - a image filename referenced in onLoad field in description.ext or mission/sqm
 * @param {string} missionDir - mission directory after depbo
 * @returns {(object|boolean)} - error if failure or true if success
 */
function copyMissionImage(missionImageFileName,missionDir) {
  missionImageFileExt = missionImageFileName.replace(/.*\.(.*)/i,"$1");
  const sourceMissionImageFile = TMP_DIR + missionDir + "\\" + missionImageFileName;
  const destMissionImageFile = OUTPUT_DIR + missionDir + "." + missionImageFileExt;
  try {
      fs.copyFileSync(sourceMissionImageFile, destMissionImageFile);
      return true;
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
function searchMissionInfo(infoMission, dataStr, logLevel) {
  const regex = new RegExp("\\s*" + infoMission + "\\s*=\\s*(.*);","i");
  const match = regex.exec(dataStr);
  if (match === null) {
      if (logLevel > 1 ) console.log("\x1b[33mWARN: " + infoMission + " non trouvé\x1b[0m");
      return false;
  } else {
      if (logLevel > 2 ) console.log(`\x1b[32mINF: ` + infoMission + ` trouvé: ${match[1]}\x1b[0m`);
      match[1] = match[1].replace(/\"/g,"");
      return match[1];
  }                    
}