const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MissionSchema = new Schema({
    pboDoesntExist: {type: Boolean},
    fileExtensionIsOk: {type: Boolean},
    fileNameConventionIsOk: {type: Boolean},
    fileIsPbo: {type: Boolean},
    missionPbo: {type: String},
    pboFileSize: {type: Number},
    pboFileDateM: {type: String},
    owner:  {type: String},
    missionTitle: {type: String, required: true},
    missionVersion: {type: Number},
    missionMap: {type: String},
    author: {type: String},
    onLoadName: {type: String},
    onLoadMission: {type: String},
    overviewText: {type: String}, 
    gameType: {type: String},
    minPlayers: {type: Number},
    maxPlayers: {type: Number},
    missionIsPlayable: {type: Boolean},
});

module.exports = mongoose.model("Mission", MissionSchema);