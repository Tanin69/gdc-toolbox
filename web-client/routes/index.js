/**
 *
 * This is the main route index.
 *  
 */

 // External modules imports
const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const fetch = require("node-fetch");

//Reads environment variables
dotenv.config();

//Home page
router.get ("/", function (req, res) {
    res.render("home", {pageTitle: "GDC Toolbox (dev)"});
});

//Renders list of missions
//Be aware : API endpoint called from browser (tabulator component)
router.get ("/mission", function (req, res) {
    res.render("listMissions", {pageTitle: "Missions Grèce de canard"});
});

//Renders a briefing
router.get ("/mission/show/:missionPbo", function (req, res) {
    //Requests gdc-toolbox-api endpoint
    fetch(`${process.env.API_MISSION_ENDPOINT}/show/${req.params.missionPbo}`)
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

//Renders publication UI
//Be aware : API endpoint called from browser
router.get("/mission/publish", function (req, res) {
    res.render("publishMission", {pageTitle: "Publier une mission"});
});

/*

//Updates a mission
router.put ("/api/mission/update/:missionPbo", missionUpdateController.updateMission);
*/
module.exports = router;