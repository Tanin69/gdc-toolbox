/**
 *
 * Adds a mission in the DB and copies the pbo to the missions directory 
 */

// External module imports
const fs = require("fs");
const dotenv = require('dotenv');

// App module imports
const Mission = require("../models/mission");

//DBG variable
const DBG_PREF = "DBG/missionAddController.js-> ";

// Read environment variables
dotenv.config();

exports.addMission = function(req, res) {
    
    //console.log(DBG_PREF + missionBriefing received from the client");
    console.log(`${DBG_PREF}req.body reçu du client: `);
    console.log(req.body);
  
    //Adding json in the DB...
    Mission.find({missionPbo: req.body.missionPbo}, function(err, data){    
      if(err){
          console.log(err);
          return;
      }
      if(data.length > 0) {
        Mission.deleteMany({missionPbo: req.body.missionPbo}, function(err, result) {
            if (err) {
              console.log(err);
            } else {
              console.log(DBG_PREF + result.deletedCount + " mission supprimée de la base (already exists)");
            }
        });
      }
      
      const mission = new Mission({
        pboDoesntExist: req.body.pboDoesntExist,
        fileExtensionIsOk: req.body.fileExtensionIsOk,
        fileNameConventionIsOk: req.body.fileNameConventionIsOk,
        fileIsPbo: req.body.fileIsPbo,
        missionPbo: req.body.missionPbo,
        pboFileSize: req.body.pboFileSize,
        pboFileDateM: req.body.pboFileDateM,
        owner:  req.body.owner, 
        missionTitle: req.body.missionTitle,
        missionVersion: req.body.missionVersion,
        missionMap: req.body.missionMap,
        descriptionExtFound: req.body.descriptionExtFound,
        author: req.body.author,
        onLoadName: req.body.onLoadName,
        onLoadMission: req.body.onLoadMission,
        overviewText: req.body.overviewText,
        gameType: req.body.gameType,
        minPlayers: req.body.minPlayers,
        maxPlayers: req.body.maxPlayers,
        missionIsPlayable: req.body.missionIsPlayable,
        missionBriefing: req.body.missionBriefing,
        loadScreen: req.body.loadScreen,
      });
      mission.save()
        .then(() => res.status(201).json({mission}))
        .then(() => console.log(DBG_PREF + "la mission " + req.body.missionTitle + " a été ajoutée à la base"))
        .catch(error => res.status(400).json({ error }));
      
  });

  // In case the script has been called by addMission.js from the client, we move the uploaded pbo it to the missions directory
  //fs.renameSync(process.env.UPLOAD_DIR + req.body.missionPbo, process.env.MISSIONS_DIR + req.body.missionPbo);
  fs.rename(process.env.UPLOAD_DIR + req.body.missionPbo, process.env.MISSIONS_DIR + req.body.missionPbo, (err) => {
    if (err) {
      console.log (`${DBG_PREF}aucun pbo à déplacer !`);
    } else {
      console.log(`${DBG_PREF}${req.body.missionPbo} copié dans ${process.env.MISSIONS_DIR}`);
    }
    
  });
  
};