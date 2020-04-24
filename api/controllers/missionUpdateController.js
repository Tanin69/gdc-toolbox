/**
 * Allows update on a very limited set of information about mission : missionIsPlayable and isMissionArchived 
 * 
 * @name /api/mission/update
 * 
 * @example <caption>Typical PUT request to obtain information about a published mission</caption>
 * 
  * //header\\
 * PUT /api/mission/update/exact-name-of-puvblished-pbo-file/?field-to-be-updated=new-value HTTP/1.1
 * content-type: text/html
 * 
 * //body\\
 * //Nothing
 * 
 * @path {PUT} /api/mission/update/
 * @header {String} Accept application/json
 * @params {String} missionPbo exact name of mission pbo file
 * @response {JSON} Success MissionPbo : new value for updateKey key is updateVal
 * @response {JSON} Failed error message
 * @response {JSON} Error error message
 * @code {200} Success: information about mission returned
 * @code {202} Fail: update failed 
 * @code {400} Error: bad request
 * @code {404} Error: pbo not found in database
 */

// App module imports
const Mission = require("../models/mission");
const path = require("path");

//LOG prefix
const moduleName = path.basename(__filename);
const LOG_PREF = `${moduleName}->`;

//Updates a data from client request. Data updating is controlled before execution
exports.updateMission = function (req, res) {
    const updMissionPbo = req.params.missionPbo;
    if (Object.keys(req.query).length === 0 || Object.keys(req.query).length > 1) {
        console.warn(`${LOG_PREF} ${updMissionPbo} : Pas de paramètre ou mauvais nombre de paramètres dans la requête PUT`);
        res.status(400).json({Error: `${updMissionPbo} : no parameter or wrong number of parameters in PUT query`});
        return;
    }
    for (const key in req.query) {
        const updateKey = key;
        const updateVal = req.query[key];
        console.log(`\n${LOG_PREF} ${updMissionPbo} : requête PUT reçue pour // ${updateKey} : ${updateVal} (type updateVal: ${typeof updateVal}) //`);
        switch (updateKey) {
            case "missionIsPlayable":
                if (updateVal === "true" || updateVal === "false") {
                    updateMission(updMissionPbo, updateVal, res, updateKey);
                } else {
                    console.warn(`${LOG_PREF} ${updMissionPbo} : valeur update illégale dans la requête PUT`);
                    res.status(202).json({Error: `${updMissionPbo} : illegal value in PUT request for ${updateKey} key`});
                }
                break;
            case "isMissionArchived":
                if (updateVal === "true" || updateVal === "false") {
                    updateMission(updMissionPbo, updateVal, res, updateKey);
                } else {
                    console.warn(`${LOG_PREF} ${updMissionPbo} : valeur update illégale dans la requête PUT`);
                    res.status(202).json({Error: `${updMissionPbo} : missing or illegal value in PUT request for ${updateKey} key`});
                }
                break;
            default:
                res.status(202).json({Error: `${updMissionPbo} : key update not allowed`});
        }
    }
};

function updateMission(updMissionPbo, updateVal, res, updateKey) {
    
    Mission.findOne({"missionPbo.val": updMissionPbo})
    .exec (function (err, mission) {
        if (err) {
            console.error(`${LOG_PREF} ${updMissionPbo} : ${err}`);
            res.status(202).json({ Error: `${updMissionPbo} : update failed in database` });
            return;
        }
        if (mission) {
            mission[updateKey].val = updateVal;
            mission.save(function (err, mission) {      
                if (err) {
                    console.error(`${LOG_PREF} ${updMissionPbo} : ${err}`);
                    res.status(202).json({ Error: `${updMissionPbo} : update failed in database` });
                    return;
                } else {
                    console.info(`${LOG_PREF} ${updMissionPbo} : nouvelle valeur de ${updateKey}: ${updateVal}`);
                    res.status(200).json({ Success: `${updMissionPbo} : new value for ${updateKey} key is ${updateVal}` });
                }
            });
        } else {
            console.info(`${LOG_PREF} ${updMissionPbo} : le pbo n'existe pas dans la base`);
            res.status(404).json({ Fail: `${updMissionPbo} : pbo not found in databse` });
        }
    });
    
    /* Why this one doesn't work ?!!!
    Mission.findOneAndUpdate({ "missionPbo.val": updMissionPbo }, { updateKey: {"val": updateVal }}, { new: true }, function (err, mission) {
        if (err) {
            console.error(`${LOG_PREF} ${updMissionPbo} : ${err}`);
            res.status(202).json({ Error: `${updMissionPbo} : update failed in database` });
            return;
        } else {
            if (mission) {
                console.info(`${LOG_PREF} ${updMissionPbo} : nouvelle valeur de ${updateKey}: ${updateVal}`);
                res.status(200).json({ Success: `${updMissionPbo} : new value for ${updateKey} key is ${updateVal}` });
            } else {
                console.info(`${LOG_PREF} ${updMissionPbo} : le pbo n'existe pas dans la base`);
                res.status(404).json({ Fail: `${updMissionPbo} : pbo not found in databse` });
            } 
        }
    });
    */
}