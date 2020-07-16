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
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const jwtAuthz = require('express-jwt-authz');
//Controllers imports
const missionListController = require("../controllers/missionListController");
const missionAddController = require("../controllers/missionAddController");
const missionCheckController = require("../controllers/missionCheckController");
const missionShowController = require("../controllers/missionShowController");
const missionUpdateController = require("../controllers/missionUpdateController");

/* Authentication */
//Create middleware for checking the JWT
const checkJwt = jwt({
    // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://gdc-toolbox-api.eu.auth0.com/.well-known/jwks.json`
    }),
    //Validate the audience and the issuer
    audience: process.env.AUTH0_API_AUDIENCE,
    issuer: process.env.AUTH0_DOMAIN,
    algorithms: ['RS256']
});

const router = express.Router();

//Returns list of missions in listMission view.
router.get("/api/mission/list", missionListController.listMissions);

//Returns complete mission json
router.get("/api/mission/show/:missionPbo", missionShowController.showMission);

//Checks a mission
router.post("/api/mission/check/", missionCheckController.checkMission);

//Publishes a mission
router.post("/api/mission/add/", checkJwt, jwtAuthz(['add:mission']), missionAddController.addMission);

//Updates a mission
router.put("/api/mission/update/:missionPbo", checkJwt,  jwtAuthz(['update:mission']), missionUpdateController.updateMission);

module.exports = router;