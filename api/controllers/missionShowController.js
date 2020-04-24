/**
 * Returns all information about a published mission as a JSON object
 * 
 * @name /api/mission/show
 * 
 * @example <caption>Typical GET request to obtain information about a published mission</caption>
 * 
  * //header\\
 * GET /api/mission/show/exact-name-of-pbo-file-of-publisehd-mission.pbo HTTP/1.1
 * content-type: text/html
 * 
 * //body\\
 * //Nothing
 * 
 * @path {GET} /api/mission/show/:missionPbo
 * @header {String} Accept application/json
 * @params {String} missionPbo exact name of mission pbo file
 * @response {JSON} Success information about mission
 * @response {JSON} Failed result of the check
 * @response {JSON} Error error message from server
 * @code {200} Success: information about mission returned
 * @code {400} Error: bad request
 * @code {404} Error: non-existent pbo in database of published missions
 */

// External module imports
const dotenv = require('dotenv');
const path = require("path");

// App module imports
const Mission = require("../models/mission");

// Read environment variables
dotenv.config();

//LOG prefix
const moduleName = path.basename(__filename);
const LOG_PREF = `${moduleName}->`;

//Requests the DB and renders a page with the results
exports.showMission = function(req, res) {

    const brfMissionPbo = req.params.missionPbo;
     
    Mission.findOne({"missionPbo.val": brfMissionPbo})
        .exec(function (err, dataMission) {
            if (err) { return next(err); }
            if (dataMission) {
                // Successful, so render.
                //console.log(`${LOG_PREF} ${dataMission}`);
                res.status(200).json(dataMission);
                console.log(`\n${LOG_PREF} ${brfMissionPbo} : affichage du briefing`);
            } else {
                res.status(404).json({Error: `${brfMissionPbo} : mission not found`});
                console.log(`\n${LOG_PREF} ${brfMissionPbo} : mission non trouvée dans la BDD`);
            }
            
    });

};