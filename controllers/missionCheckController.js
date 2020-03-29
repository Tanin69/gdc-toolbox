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

const checkMission = require("../common/checkMission");
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
        
        const pboFileName = file.name;
        console.log("DBG/missionCheckController.js/-> Taille du fichier reçu: " + file.size);
        //Verifies if the mission pbo was previously published. If yes, we launch a 202 http code and return a well formed JSON.
        if (fs.existsSync(process.env.MISSIONS_DIR + pboFileName)){
          res.status(202).json({
            "missionNotPublished": {"isOK": false, "isBlocking": true, "label": "Cette mission n'a pas encore été publiée"},
            "isMissionValid": false,
            "nbBlockingErr": 1,
          });
        } else {
          //checkResult = checkMission.checkMission(pboFileName, {"block_briefingSqfFound": false});// <- example to pass an option : no briefing.sqf is not a blocking error 
          checkResult = checkMission.checkMission(pboFileName);
          // If mission is not valid, returns a 202 to the client with resulting JSON
          if (!checkResult.isMissionValid) {
            console.log("DBG/missionCheckController.js/-> Fin de check du fichier code 202 : " + pboFileName); 
            fs.unlinkSync(process.env.UPLOAD_DIR + file.name);
            res.status(202).json(checkResult);
          } else {
            // No blocking error, success. HTTP status 200
            jsonRes = grabMissionInfos.grabMissionInfos(pboFileName);
            console.log("DBG/missionCheckController.js/-> Fin de check du fichier code 200 : " + pboFileName); 
            //console.log("DBG/missionCheckController.js/-> JSON final :");
            //console.log(jsonRes);
            res.status(200).json(jsonRes);
          }
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
