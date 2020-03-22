// External module imports
const fs = require("fs");
const dotenv = require('dotenv');

// App module imports
const Mission = require("../models/mission");

// Read environment variables
dotenv.config();

//Adds a mission in the DB and copies the pbo to the missions directory
exports.addMission = function(req, res) {
    
    //console.log("DBG/missionAddController.js/-> missionBriefing received from the client");
    //console.log(req.body);
  
    //Adding in the DB...
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
              console.log("DBG/missionAddController.js/-> " + result.deletedCount + " mission supprimée de la base (already exists)");
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
        .then(() => console.log("DBG/missionAddController.js/-> la mission " + req.body.missionTitle + " a été ajoutée à la base"))
        .catch(error => res.status(400).json({ error }));
      
  });

  //...and moves it to the missions directory
  fs.renameSync(process.env.INPUT_DIR + req.body.missionPbo, process.env.MISSIONS_DIR + req.body.missionPbo);
  
};