const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MissionSchema = new Schema({
    missionTitle: {type: String, required: true},
    missionVersion: {type: Number},
    missionMap: {type: String},
    missionPbo: {type: String},
    pboFileSize: {type: Number},
    pboFileDateM: {type: String},
    author: {type: String},
    onLoadName: {type: String},
    onLoadMission: {type: String},
    gameType: {type: String},
    minPlayers: {type: Number},
    maxPlayers: {type: Number}
});

module.exports = mongoose.model("Mission", MissionSchema);