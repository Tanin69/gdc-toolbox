const Mission = require("../models/mission");

//Request the DB and return all missions in JSON format.
exports.listMissions = function(req, res) {
    
    Mission.find()
        .sort([["author", "ascending"]])
        .exec(function (err, missionsList) {
            if (err) { return next(err); }
            // Successful, so render.
            res.status(200).json(missionsList);
    });
};