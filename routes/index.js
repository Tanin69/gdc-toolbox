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

//Controllers imports
const missionListController = require("../controllers/missionListController");
const missionAddController = require("../controllers/missionAddController");
const missionCheckController = require("../controllers/missionCheckController");
const missionShowController = require("../controllers/missionShowController");
const missionUpdateController = require("../controllers/missionUpdateController");

//Home page
router.get ("/", function (req, res) {
  res.render("home");
});

//Renders the page that contains the list of missions. The list handling (display, sort, filter, etc.) is delagated to tabulator client component (cf. /mission/list route), 
router.get ("/mission", function (req, res, next) {
  res.render("listMissions", {subtitle: "Missions"});
});

//Renders list of missions in listMission view. Called by Ajax request from tabulator client component (delegated to controller)
router.get ("/mission/list", missionListController.listMissions);

//Renders mission publication page
router.get ("/mission/add", function (req, res) {
  res.render("addMission");
});

//Renders mission infos and briefing (delegated to controller)
router.get ("/mission/show/:missionPbo", missionShowController.showMission);

//Checks a mission (delegated to controller)
router.post("/mission/add/check", missionCheckController.checkMission);

//Confirms the publication of a mission (delegated to controller)
router.post ("/mission/add/confirm", missionAddController.addMission);

//Updates a mission (delegated to controller)
router.put ("/mission/update/:missionPbo", missionUpdateController.updateMission);

module.exports = router;