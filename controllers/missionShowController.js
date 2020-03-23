/**
 *
 * Controller that render a mission briefing
 * @TODO: catch error on image not found in template rendering to make it a 404, not this hugly message
 */

// External module imports
const dotenv = require('dotenv');

// App module imports
const Mission = require("../models/mission");

// Read environment variables
dotenv.config();

//DBG variable
const DBG_PREF = "DBG/missionShowController.js-> ";

//Requests the DB and renders a page with the results
exports.showMission = function(req, res) {

    Mission.findOne({missionPbo: req.params.missionPbo})
        .exec(function (err, dataMission) {
            if (err) { return next(err); }
            // Successful, so render.
            try {
                //console.log(DBG_PREF + dataMission.onLoadMission);
                res.status(200);   
                //We construct the destination directory for images from .env variable
                const imgPath = process.env.OUTPUT_DIR.replace(/.*\/public(\/.*)/i,"$1");
                //console.log(DBG_PREF + " imgPath: " + imgPath);
                res.render("showMission", {               
                    titreMission: dataMission.missionTitle,
                    onLoadMission: dataMission.onLoadMission,
                    missionVersion: dataMission.missionVersion,
                    missionMap: dataMission.missionMap,
                    gameType: dataMission.gameType,
                    author: dataMission.author,
                    overviewText: dataMission.overviewText,
                    minPlayers: dataMission.minPlayers,
                    maxPlayers: dataMission.maxPlayers,
                    missionBriefing: dataMission.missionBriefing,
                    loadScreenSrc: imgPath + dataMission.loadScreen,    
                });
            } catch (e) {
                console.log (DBG_PREF + e);
                res.render("error", {appErrMsg: e.status +": " + e.message});
            }
            
    });

};