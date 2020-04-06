/**
 *
 * Controller that updates a mission
 */

// App module imports
const Mission = require("../models/mission");

//DBG variable
const DBG_PREF = "DBG/missionUpdateController.js->";

//Updates a data from client request. Data updating is controlled before execution
exports.updateMission = function(req, res) {
  const updMissionPbo = req.params.missionPbo;
  console.log(`\n${DBG_PREF} ${updMissionPbo} : requête de mise à jour`);
  for (const key in req.query) {
    updateKey = key;
    updateVal = req.query[key];
    console.log(`${DBG_PREF} ${updMissionPbo} : mise à jour demandée pour |${updateKey} : ${updateVal} (type: ${typeof updateVal})|`);
    //Strictly controls the update request as it comes from the client
    switch (updateKey) {
      case "missionIsPlayable":
        if (updateVal === "true" || updateVal === "false") {
          //updateVal = Boolean(updateVal);
          Mission.findOneAndUpdate({"missionPbo.val": updMissionPbo}, {missionIsPlayable: {val: updateVal}}, {new: true}, function (err, mission) {
            if (err) {
              console.log(err);
            } else {
              console.log(`${DBG_PREF} ${updMissionPbo} : nouvelle valeur de mission.isPlayable: ${mission.missionIsPlayable.val}`);
            }
          });
        } else {
          console.log(`${DBG_PREF} ${updMissionPbo} : valeur update illégale`);
          res.render("error", {appErrMsg: "valeur update illégale"});
        }
        break;
    }       
  }
};