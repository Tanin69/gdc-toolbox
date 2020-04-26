/**
 * Returns all published missions as JSON object.
 * 
 * @name /api/mission/list
 * 
 * @example <caption>Typical GET request to obtain the list of published missions</caption>
 * 
 * //header\\
 * GET /api/mission/list HTTP/1.1
 * content-type: text/html
 * 
 * //body\\
 * //Nothing
 *  
 * @path {GET} /api/mission/list
 * @header {String} Content-Type any value accepted in Content-type field (text/html for example)
 * @response {JSON} Success list of all published missions 
 * @response {JSON} Error error message from server
 * @code {200} Success: list of missions successfully returned 
 * @code {400} Error: bad request
 */

const Mission = require("../models/mission");

//Request the DB and return all missions in JSON format.
exports.listMissions = function (req, res) {

    Mission.find()
        .sort([["author", "ascending"]])
        .exec(function (err, missionsList) {
            if (err) {
                return next(err);
            } else {
                // Successful, so render.
                res.status(200).json(missionsList);
            }
        });
};