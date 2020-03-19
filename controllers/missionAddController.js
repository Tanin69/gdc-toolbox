// External module imports
const Mission = require("../models/mission");
const fs = require("fs");
const dotenv = require('dotenv');

// Read environment variables
dotenv.config();

//Adds a mission in the DB and copies the pbo to the missions directory
exports.addMission = function(req, res) {
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
        gameType: req.body.gameType.toUpperCase(),
        minPlayers: req.body.minPlayers,
        maxPlayers: req.body.maxPlayers,
        missionIsPlayable: req.body.missionIsPlayable,
      });
      mission.save()
        .then(() => res.status(201).json({mission}))
        .catch(error => res.status(400).json({ error }));
      console.log("DBG/missionAddController.js/-> la mission " + req.body.missionTitle + " a été ajoutée à la base");
  });

  //...and moves it to the missions directory
  fs.renameSync(process.env.INPUT_DIR + req.body.missionPbo, process.env.MISSIONS_DIR + req.body.missionPbo);
  
};