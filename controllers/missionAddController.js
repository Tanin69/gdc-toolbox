const Mission = require("../models/mission");

//Add a mission in a DB
exports.addMission = function(req, res) {
    const mission = new Mission({
      missionTitle: req.body.missionTitle,
      missionPbo: req.body.missionPbo,
      pboFileDateM: req.body.pboFileDateM,
      pboFileSize: req.body.pboFileSize,
      missionVersion: req.body.missionVersion,
      missionMap: req.body.missionMap,
      onLoadName: req.body.onLoadName,
      onLoadMission: req.body.onLoadMission,
      author: req.body.author,
      gameType: req.body.gameType,
      minPlayers: req.body.minPlayers,
      maxPlayers: req.body.maxPlayers,
    });
    console.log({mission});
    Mission.find({missionPbo: req.body.missionPbo}, function(err, data){
      
      if(err){
          console.log(err);
          return;
      }
  
      if(data.length > 0) {
        Mission.deleteOne({missionPbo: req.body.missionPbo})
          .then(() => res.status(201).json({mission}))
          .catch(error => res.status(400).json({ error }));
          console.log("Mission mise à jour");
          return;
      } 
      mission.save()
        .then(() => res.status(201).json({mission}))
        .catch(error => res.status(400).json({ error }));
      console.log("Mission ajoutée");
      return;
    
  });


};