/**
 *
 * Adds a mission in the DB and copies the pbo to the missions directory 
 */

//External module imports
const fs = require("fs");
const dotenv = require('dotenv');

//App module imports
const checkM = require("../common/checkMission");
const grabM = require("../common/grabMissionInfos");
const addM = require("../common/addMission");

//DBG variable
const DBG_PREF = "DBG/missionAddController.js->";

//Read environment variables
dotenv.config();

exports.addMission = function(req, res) {
  
  const receivedPboNamePath = process.env.UPLOAD_DIR + req.body.missionPbo.val;
  const receivedPboName = req.body.missionPbo.val;
  console.log(`\n${DBG_PREF} ${receivedPboName} : ajout de mission débuté`);

  if (!fs.existsSync(receivedPboNamePath)) {
    console.log(`${DBG_PREF} pbo non trouvé dans le répertoire d'upload: ${receivedPboName}`);
    res.status(404).json({ message: "le pbo n'a pas été trouvé" });
    return;
  } else {
    //Build Json object with all attributes from checkMission and grabMissionInfos
    const jsRetCheck = checkM.checkMission(receivedPboNamePath);
    //console.log(`${DBG_PREF} ${path.basename(receivedPboName)} : retour du checkMission`);
    //console.log(jsRetCheck);
    if (!jsRetCheck.isMissionValid) {
      res.status(202);
      console.log(`${DBG_PREF} Mission non conforme: ${receivedPboName}`);
      return;
    } else {
      const jsRetGrab = grabM.grabMissionInfos(receivedPboNamePath);
      //Merge JSON results from check and grab to feed addMission with every needed information for database saving
      const jsResult = Object.assign({}, jsRetCheck, jsRetGrab);
      //console.log(`${DBG_PREF} ${receivedPboName} : JSON d'entrée généré...`);
      //console.log(jsResult);
      
      /*
      addM.addMission(jsResult, function (err,res){
        if (err) {
          console.log(`${DBG_PREF} ${receivedPboName} : erreur d'ajout à la base (${resAdd}). La mission n'a pas été publiée.`);
          res.status(400).json({ error });
        } else {
          console.log(`${DBG_PREF} ${receivedPboName} : mission publiée.`);
          res.status(201).json({res});
        }
      });

           
      /*
      if (resAdd !== true) {
        console.log(`${DBG_PREF} ${receivedPboName} : erreur d'ajout à la base (${resAdd}). La mission n'a pas été publiée.`);
        res.status(400).json({ error });
        return;
      } else {
        res.status(201).json({mission});
      }
      */

     addM.addMission(jsResult);
     res.status(201).json({jsResult});

      //In case the script has been called by addMission.js from the client, we move the uploaded pbo it to the missions directory
      //fs.renameSync(process.env.UPLOAD_DIR + req.body.missionPbo, process.env.MISSIONS_DIR + req.body.missionPbo);
      fs.rename(receivedPboNamePath, process.env.MISSIONS_DIR + receivedPboName, function (err) {
        if (err) {
          console.log(`${DBG_PREF} ${receivedPboName} : aucun pbo à déplacer !`);
          return err;
        } else {
          console.log(`${DBG_PREF} ${receivedPboName} déplacé dans ${process.env.MISSIONS_DIR}`);
          return true;
        }
      });
    }
  }
};