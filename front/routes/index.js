/**
 *
 * This is the main route index.
 * Each endpoint delegates his code to a controller (with a few exceptions for very simple endpoints).
 * render delegated to a controller code must be called like that :
 * router.get|post|etc ("view", controllerName.controllerFunction). 
 * 
 */

// External modules imports
const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

//Home page
router.get ("/", function (req, res) {
    res.render("home", {pageTitle: "GDC Toolbox (dev)"});
});

//List of missions
router.get ("/mission", function (req, res) {
    res.render("listMissions", {pageTitle: "Missions Grèce de canard"});
});

//Renders a briefing
router.get ("/mission/show/:missionPbo", function (req, res) {
    //Requests gdc-toolbox-api endpoint
    //TODO: .env for API endpoint
    fetch(`http://localhost:3000/api/mission/show/${req.params.missionPbo}`)
        .then(res => res.json())
        .then(json => {
            //We construct the destination directory for images from .env variable
            const imgPath = process.env.OUTPUT_DIR.replace(/.*\/public(\/.*)/i,"$1");
            //If no image found, replace with a default one
            if (json.loadScreen.val !== "false" && json.loadScreen.val && !(/.*\.paa/.test(json.loadScreen.val))) {
                loadScr = imgPath + json.loadScreen.val;
            } else {
                loadScr = "/img/cpc_badge.png";
            }
            //Idem for onLoadMission text (used as a citation under loadScreen) 
            if (json.onLoadMission.val !== "false" && json.onLoadMission.val) {
                onloadM = json.onLoadMission.val;
            } else {
                onloadM = "";
            }
            res.render("showMission", {
                pageTitle: "Briefing",
                embed_missionTitle: json.missionTitle.val,
                embed_onLoadMission: onloadM,
                embed_image: loadScr,
                titreMission: json.missionTitle.val,
                onLoadMission: onloadM,
                missionVersion: json.missionVersion.val,
                missionMap: json.missionMap.val,
                gameType: json.gameType.val,
                author: json.author.val,
                overviewText: json.overviewText.val,
                minPlayers: json.minPlayers.val,
                maxPlayers: json.maxPlayers.val,
                missionBriefing: json.missionBriefing,
                loadScreenSrc: loadScr, 
            });
        }   
    );
});
/*
//Checks a mission
router.post("/api/mission/check/", missionCheckController.checkMission);

//Publishes a mission
router.post ("/api/mission/add/", missionAddController.addMission);

//Updates a mission
router.put ("/api/mission/update/:missionPbo", missionUpdateController.updateMission);
*/
module.exports = router;