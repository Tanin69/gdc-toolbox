/* 

  This is the main route index.
  Each endpoint delegates his code to a controller (with a few exceptions for very simple endpoints).

  Delegated code must be called like that :
  router.get|post|etc ("view", controllerName.controllerFunction).

*/

// External modules imports
const express = require("express");
const router = express.Router();

//Controllers imports
const missionListController = require("../controllers/missionListController");
const missionAddController = require("../controllers/missionAddController");
const missionCheckController = require("../controllers/missionCheckController");

// Home page
router.get ("/", function (req, res) {
  res.render("home");
});

// Missions page, 
router.get ("/missions", function (req, res, next) {
  res.render("listMissions", {subtitle: "Missions"});
});

// List of missions, contained in mission page, called by tabulator component (AJAX request) from client side
router.get ("/missions/list", missionListController.listMissions);

// Displays mission publication page
router.get ("/missions/add", function (req, res) {
  res.render("addMission");
});

// Mission check
router.post("/missions/add/check", missionCheckController.checkMission);

// Mission publication confirmated
router.post ("/missions/add/confirm",missionAddController.addMission);

module.exports = router;