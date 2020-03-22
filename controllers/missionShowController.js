// External module imports
const dotenv = require('dotenv');

// App module imports
const Mission = require("../models/mission");

// Read environment variables
dotenv.config();

//Requests the DB and renders a page with the results
exports.showMission = function(req, res) {

    Mission.findOne({missionPbo: req.params.missionPbo})
        .exec(function (err, dataMission) {
            if (err) { return next(err); }
            // Successful, so render.
            try {
                console.log(process.env.OUTPUT_DIR + dataMission.loadScreen);
                res.status(200);   
                res.render("showMission", {               
                    titreMission: dataMission.missionTitle,
                    onLoadText: dataMission.onLoadText,
                    missionVersion: dataMission.missionVersion,
                    missionMap: dataMission.missionMap,
                    gameType: dataMission.gameType,
                    author: dataMission.author,
                    overviewText: dataMission.overviewText,
                    minPlayers: dataMission.minPlayers,
                    maxPlayers: dataMission.maxPlayers,
                    missionBriefing: dataMission.missionBriefing,
                    loadScreenSrc: "/img/brf/" + dataMission.loadScreen,    
                });
            } catch (e) {
                console.log (e);
                res.render("error", {appErrMsg: e.status +": " + e.message});
            }
            
    });

};