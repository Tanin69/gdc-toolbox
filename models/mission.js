const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MissionSchema = new Schema({
    fileIsPbo: {
        isOK: {type: Boolean},
        label: {type: String}
    },
    filenameConvention: {
        isOK: {type: Boolean},
        label: {type: String}
    },
    descriptionExtFound: {
        isOK: {type: Boolean},
        label: {type: String}
    },
    missionSqmFound: {
        isOK: {type: Boolean},
        label: {type: String}
    },
    briefingSqfFound: {
        isOK: {type: Boolean},
        label: {type: String}
    },
    missionSqmNotBinarized: {
        isOK: {type: Boolean},
        label: {type: String}
    },
    HCSlotFound: {
        isOK: {type: Boolean},
         label: {type: String}
    },
    isMissionValid: {type: Boolean},
    nbBlockingErr: {type: Number},
    missionTitle: {
        val: {type: String},
        label: {type: String}
    },
    missionVersion: {
        val: {type: Number},
        label: {type: String}
    },
    missionMap: {
        val: {type: String},
        label: {type: String}
    },
    gameType: {
        val: {type: String},
        label: {type: String}
    },
    author: {
        val: {type: String},
        label: {type: String}
    },
    minPlayers: {
        val: {type: Number},
        label: {type: String}
    },
    maxPlayers: {
        val: {type: Number},
        label: {type: String}
    },
    onLoadName: {
        val: {type: String},
        label: {type: String}
    },
    onLoadMission: {
        val: {type: String},
        label: {type: String}
    },
    overviewText: {
        val: {type: String},
        label: {type: String}
    },
    missionPbo: {
        val: {type: String},
        label: {type: String}
    },
    pboFileSize: {
        val: {type: String},
        label: {type: String}
    },
    pboFileDateM: {
        val: {type: String},
        label: {type: String}
    },
    owner: {
        val: {type: String},
        label: {type: String}
    },
    missionIsPlayable: {
        val: {type: Boolean},
        label: {type: String}
    },
    missionBriefing: {type: Array , "default" : []},
    loadScreen: {
        val: {type: String},
        label: {type: String}
    },
});

module.exports = mongoose.model("Mission", MissionSchema);