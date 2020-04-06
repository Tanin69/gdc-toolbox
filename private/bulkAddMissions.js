
const fs = require("fs");
const {spawnSync} = require("child_process");
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const checkM = require("../common/checkMission");
const grabM = require("../common/grabMissionInfos");
const addM = require("../common/addMission");

//Read environment variables
dotenv.config();

/* Database connection */
console.log("Connecting to database. Please wait...");
mongoose.connect(process.env.DB_CONNECT,
    { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => console.log("MongoDB connection success"))
    .then(() => doBulk())
    .catch(() => console.log("MongoDB connection failed !"));


//DBG variable
const DBG_PREF = "DBG/bulkImport.js->";
const INPUT_DIR = "D:/Dev/Projets/GdC-Missions/missions_1/";

//Browse all files in a directory and start the analysis of each pbo

function doBulk() {
    //To control number of published missions
    let nbValidMissions = 0;
    let nbRejectedMissions = 0;
    let nbAlreadyPublishedMissions = 0;
    let filesMissionsDir = fs.readdirSync(process.env.MISSIONS_DIR);
    const nbFilesMissionsDirIn = filesMissionsDir.length;

    const missions = fs.readdirSync(INPUT_DIR);
    if (!missions) {
        console.error(err);
        return;
    } else {
        console.log(`\n*** \u001B[1mNombre de missions dans le répertoire d'import : ${missions.length}\u001B[0m ***\n`);
        for (const pboFileName of missions) {
            pboFilenamePath = INPUT_DIR + pboFileName;
            //We check if the mission was already published
            if (fs.existsSync(process.env.MISSIONS_DIR + pboFileName)){
                console.log(`${DBG_PREF} ${pboFileName} mission déjà publiée : pbo non traité`);
                nbAlreadyPublishedMissions ++;
            } else {
                checkResult = checkM.checkMission(pboFilenamePath, {
                    "block_fileIsPbo": true,
                    "block_fileNameConvention": true,
                    "block_descriptionExtFound": false,
                    "block_missionSqmFound": true,
                    "block_briefingSqfFound": false,
                    "block_missionSqmNotBinarized": false,
                    "block_HCSlotFound": false,
                });
                //If mission is not valid, stop
                if (checkResult.isMissionValid) {
                    nbValidMissions ++;
                    //Grabs informations about the mission
                    missionInfos = grabM.grabMissionInfos(pboFilenamePath);
                    //Merges check and grab JSON to feed database saving
                    const jsResult = Object.assign({}, checkResult, missionInfos);
                    //Saves to database
                    addM.addMission(jsResult);
                    //Publishes the pbo to the mission directory
                    fs.copyFileSync(pboFilenamePath, process.env.MISSIONS_DIR + pboFileName);
                    console.log(`${DBG_PREF} ${pboFileName} déplacé dans ${process.env.MISSIONS_DIR}`);
                    /*
                    fs.copyFile(pboFilenamePath, process.env.MISSIONS_DIR + pboFileName, function (err) {
                        if (err) {
                            console.log(`${DBG_PREF} ${pboFileName} : aucun pbo à déplacer (${err})!`);
                        } else {
                            console.log(`${DBG_PREF} ${pboFileName} déplacé dans ${process.env.MISSIONS_DIR}`);
                        }
                      });
                    */
                } else {
                    console.log(`${DBG_PREF} ${pboFileName} Erreurs bloquantes dans la mission : pbo non traité`);
                    nbRejectedMissions++;
                }

            }
        }
        let filesMissionsDir = fs.readdirSync(process.env.MISSIONS_DIR);
        const nbFilesMissionsDirOut = filesMissionsDir.length;
        nbPublishedMissions = nbFilesMissionsDirOut - nbFilesMissionsDirIn;

        console.log(`${DBG_PREF}
\u001B[1m
****
* ${missions.length} mission(s) dans le répertoire d'import
* ${nbValidMissions} mission(s) valide(s)
* ${nbRejectedMissions} mission(s) rejetée(s)
* ${nbAlreadyPublishedMissions} mission(s) déjà publiée(s) (non republiées)
* ${nbFilesMissionsDirIn} mission(s) dans le répertoire de publication avant import
* ${nbFilesMissionsDirOut} mission(s) dans le répertoire de publication après import
* soit ${nbPublishedMissions} mission(s) ajoutée(s) durant cet import
****
\u001B[0m
`); 

    }
}