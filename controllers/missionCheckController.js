// External module imports
const formidable  = require("formidable");
const fs          = require("fs");
const {spawnSync} = require("child_process");
const dotenv = require('dotenv');

// Read environment variables
dotenv.config();

//Check a mission PBO and extract all mission informations : event listeners
exports.checkMission = function (req,res) {

    new formidable.IncomingForm().parse(req)
    
    // Traps upload request to redirect it to the correct path
    .on("fileBegin", (name, file) => {
      file.path = "./uploads/" + file.name;
    })
    
    // Here is the magic
    .on("file", (name, file) => {
    
        const fileName = file.name;
        console.log("Début du check de mission: " + fileName);
        const mapRet = grabMissionInfos (fileName);
        for (const [key, value] of mapRet.entries()) {
            mapRet.set(key, value);
        }
        //@TODO: owner management
        mapRet.set("owner", "admin");
        if (!mapRet.get("fileExtensionIsOk") || !mapRet.get("fileNameConventionIsOk") || !mapRet.get("fileIsPbo") || !mapRet.get("missionSqmFound") || !mapRet.get("briefingSqfFound") || !mapRet.get("pboDoesntExist")){
            // Failure. HTTP status 202 ("The request has been accepted for processing, but the processing has not been completed")
            fs.unlinkSync(process.env.INPUT_DIR + file.name);
            res.status(202).json(Object.fromEntries(mapRet));
        } else {
            // Success. HTTP status 200
            res.status(200).json(Object.fromEntries(mapRet));
        }

    })

    //@TODO: error management
    .on("aborted", () => {
      console.error("Request aborted");
    })
    
    // Something went wrong (c'est parti en couille, faut le dire)
    .on("error", (err) => {
      console.error("Error", err);
      throw err;
    })
    
    //end management
    .on("end", () => {
      //Sends the result to dropzone client component
      //console.log (endStatusMsg);
      console.log("fin du check de mission");
    });

};

/**
 *
 * Grabs many mission informations by reading file name, file infos and different files in the pbo 
 * @TODO: check if HC_slot exists
 * @TODO: replace map with a JSON object
 * @param {string} filename - the mission filename to be checked
 * @returns {(Map)} - Map with return values
 */
function grabMissionInfos (fileName) {

    const logLevel = 2;
    l_fileName = process.env.INPUT_DIR + fileName;

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
    mapRetour.set("missionVersion", NaN);
    mapRetour.set("missionMap", false);
    mapRetour.set("author", false);
    mapRetour.set("onLoadName", false);
    mapRetour.set("onLoadMission", false);
    mapRetour.set("overviewText", false);
    mapRetour.set("gameType", false);
    mapRetour.set("minPlayers", NaN);
    mapRetour.set("maxPlayers", NaN);
    mapRetour.set("missionIsPlayable", false);
    //console.log(mapMission);

    //Informations from uploaded file
    //-File extension
    let regex = /.+\.pbo/ig;
    let match = regex.exec(l_fileName);
    if (match) {
        mapRetour.set ("fileExtensionIsOk", true);
    }
    //console.log(match);        
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
    } 
    catch (err) {
        //TODO: Améliorer la gestion de cette erreur
        console.error(err);
    }
    //-Wether file is really a pbo file
    const retDpbo = spawnSync(process.env.DEPBO_EXE_PATH, ["-P", l_fileName, process.env.TMP_DIR]);
    //console.log(process.env.DEPBO_EXE_PATH);
    if (retDpbo.status == 0) {
        mapRetour.set ("fileIsPbo", true);
    }
    //-Checks is pbo file already exists in missions directory
    if (fs.existsSync(process.env.MISSIONS_DIR + fileName)){
        //console.log(process.env.MISSIONS_DIR + fileName);
        mapRetour.set ("pboDoesntExist", false);
    } 

    //console.log(mapRetour);

    //Splits mission name elements to grab infos
    const missionDir = l_fileName.replace(/.*\\.*?(.+)(.pbo)/,"$1");
    //const matchMissionNameParts = regex.exec(missionDir);
    const matchMissionNameParts = regex.exec(fileName);
    if (matchMissionNameParts !== null) {
        mapRetour.set("missionTitle", matchMissionNameParts[1]);
        mapRetour.set("missionVersion", parseInt(matchMissionNameParts[2],10));
        mapRetour.set("missionMap", matchMissionNameParts[3]);
        mapRetour.set("missionPbo", fileName);
    }

  //Array of files used to grab mission info
  const infoFiles = ["description.ext","mission.sqm","briefing.sqf"];
  //const infoFiles = ["description.ext","mission.sqm"];   
  //Iterate over files to find information
  for (let infoFile of infoFiles) {
      const infoFilePath = process.env.TMP_DIR + missionDir + "\\" + infoFile; 
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
                      if (ret.errno === undefined) {
                          mapRetour.set("loadScreen", missionDir + "." + missionImageFileExt);
                      } else if (ret.errno === -4058) {
                          mapRetour.set("loadScreen", missionImageFileName + ": image file not found !"); 
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
                                  if (ret.errno === undefined) {
                                      mapRetour.set("loadScreen", missionDir + "." + missionImageFileExt);
                                  } else if (ret.errno === -4058) {
                                      mapRetour.set("loadScreen", missionImageFileName + ": image file not found !"); 
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

  return mapRetour;

}

/**
 *
 * Helper function to copy an image and rename it with the mission name
 * @param {string} missionImageFileName - a image filename referenced in onLoad field in description.ext or mission/sqm
 * @param {string} missionDir - mission directory after depbo
 * @returns {(object|boolean)} - error if failure or true if success
 */
function copyMissionImage (missionImageFileName,missionDir) {
  missionImageFileExt = missionImageFileName.replace(/.*\.(.*)/i,"$1");
  const sourceMissionImageFile = process.env.TMP_DIR + missionDir + "\\" + missionImageFileName;
  const destMissionImageFile = process.env.OUTPUT_DIR + missionDir + "." + missionImageFileExt;
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