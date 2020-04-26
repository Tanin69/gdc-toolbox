/**
 *
 * This is the main route index.
 * Each endpoint delegates his code to a controller (with a few exceptions for very simple endpoints).
 * render delegated to a controller code must be called like that :
 * router.get|post|etc ("/api/.../...", controllerName.controllerFunction). 
 * 
 */

// External modules imports
const express = require("express");

const router = express.Router();

//Controllers imports
const missionListController = require("../controllers/missionListController");
const missionAddController = require("../controllers/missionAddController");
const missionCheckController = require("../controllers/missionCheckController");
const missionShowController = require("../controllers/missionShowController");
const missionUpdateController = require("../controllers/missionUpdateController");

//Returns list of missions in listMission view.
router.get("/api/mission/list", missionListController.listMissions);

//Returns complete mission json
router.get("/api/mission/show/:missionPbo", missionShowController.showMission);

//Checks a mission
router.post("/api/mission/check/", missionCheckController.checkMission);

//Publishes a mission
router.post("/api/mission/add/", missionAddController.addMission);

//Updates a mission
router.put("/api/mission/update/:missionPbo", missionUpdateController.updateMission);

module.exports = router;