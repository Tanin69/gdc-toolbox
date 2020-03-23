/**
 *
 * Controller that checks a mission pbo before it can be published (with addMissionController)
 * @TODO: clean debug code
 * @TODO: clean error handling
 * @TODO: check file size because it's only checked on client side at the moment
 * @TODO: mission owner management
 */

// External module imports
const formidable  = require("formidable");
const fs          = require("fs");
const dotenv      = require('dotenv');

const grabMissionInfos = require("../common/grabMissionInfos");

// Read environment variables
dotenv.config();

//Check a mission PBO and extract all mission informations : event listeners
exports.checkMission = function (req,res) {

    new formidable.IncomingForm().parse(req)
    
    // Traps upload request to redirect it to the correct path
    .on("fileBegin", (name, file) => {
        console.log("DBG/missionCheckController.js/-> Début de réception du fichier " + file.name);
        const filePath = process.env.UPLOAD_DIR.replace(/.*(\/.*\/)/i,"."+"$1");
        file.path = filePath + file.name;
    })
    
    // Here is the magic
    // TODO : check file size because it's only checked on client side at the moment
    .on("file", (name, file) => {
        
        const fileName = file.name;
        console.log("DBG/missionCheckController.js/-> Taille du fichier reçu: " + file.size);
        const mapRet = grabMissionInfos.grabMissionInfos (fileName);
        for (const [key, value] of mapRet.entries()) {
            mapRet.set(key, value);
        }
        // TODO: owner management
        mapRet.set("owner", "admin");
        if (!mapRet.get("fileExtensionIsOk") || !mapRet.get("fileNameConventionIsOk") || !mapRet.get("fileIsPbo") || !mapRet.get("missionSqmFound") || !mapRet.get("briefingSqfFound") || !mapRet.get("pboDoesntExist")){
            // Check found some blocking errors. HTTP status 202 ("The request has been accepted for processing, but the processing has not been completed")
            console.log("DBG/missionCheckController.js/-> Fin de check du fichier code 202 : " + fileName); 
            fs.unlinkSync(process.env.UPLOAD_DIR + file.name);
            res.status(202).json(Object.fromEntries(mapRet));
        } else {
            // No blocking error, success. HTTP status 200
            console.log("DBG/missionCheckController.js/-> Fin de check du fichier code 200 : " + fileName); 
            //console.log("DBG/missionCheckController.js/-> map finale :");
            //console.log(mapRet);
            res.status(200).json(Object.fromEntries(mapRet));
        }

    })

    //@TODO: error handling
    .on("aborted", () => {
      console.error("Request aborted");
    })
    
    // Something went wrong (c'est parti en couille, faut le dire)
    .on("error", (err) => {
      console.error("Error", err);
      throw err;
    })
    
    //end management
    .on("end", (files) => {
      //Sends the result to dropzone client component
      //console.log(files);
 
    });
    
};
